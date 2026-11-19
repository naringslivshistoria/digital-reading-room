// Same logic as reading-room-search/src/services/userService.
import { getUserData } from '../../common/adapters/userAdapter'
import { User } from '../../common/types'

const userCache = new Map<string, { data: Partial<User>; expiresAt: number }>()
const CACHE_TTL_MS = 60 * 1000

const parseField = (field: unknown): string[] =>
  typeof field === 'string' && field ? field.replace(/;$/, '').split(';') : []

export const fetchUserData = async (
  username: string
): Promise<Partial<User> | null> => {
  const cached = userCache.get(username)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const userData = await getUserData(username)
  if (!userData) {
    return null
  }

  const parsedUserData: Partial<User> = {
    firstName: userData.firstName as string | null,
    lastName: userData.lastName as string | null,
    organization: userData.organization as string | null,
    locked: userData.locked === true,
    disabled: userData.disabled === true,
    depositors: parseField(userData.depositors),
    archiveInitiators: parseField(userData.archiveInitiators),
    series: parseField(userData.series),
    volumes: parseField(userData.volumes),
    documentIds: parseField(userData.documentIds),
    fileNames: parseField(userData.fileNames),
    platforms: Array.isArray(userData.platforms) ? userData.platforms : [],
  }

  userCache.set(username, {
    data: parsedUserData,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return parsedUserData
}
