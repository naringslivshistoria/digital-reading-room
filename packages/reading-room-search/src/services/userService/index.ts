import { getUserData } from '../../common/adapters/userAdapter'
import { User } from '../../common/types'

const userCache = new Map<string, { data: Partial<User>; expiresAt: number }>()
const CACHE_TTL_MS = 60 * 1000;

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

  const parseField = (field: string | null | undefined): string[] => {
    return field ? field.replace(/;$/, '').split(';') : []
  }

  const parsedUserData: Partial<User> = {
    ...userData,
    depositors: parseField(userData.depositors as string | null | undefined),
    archiveInitiators: parseField(
      userData.archiveInitiators as string | null | undefined
    ),
    series: parseField(userData.series as string | null | undefined),
    volumes: parseField(userData.volumes as string | null | undefined),
    documentIds: parseField(userData.documentIds as string | null | undefined),
    fileNames: parseField(userData.fileNames as string | null | undefined),
  }

  userCache.set(username, {
    data: parsedUserData,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return parsedUserData
}
