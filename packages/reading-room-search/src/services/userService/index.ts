import { getUserData } from '../../common/adapters/userAdapter'
import { User } from '../../common/types'

export const fetchUserData = async (
  username: string
): Promise<Partial<User>> => {
  try {
    const userData = await getUserData(username)

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
      documentIds: parseField(
        userData.documentIds as string | null | undefined
      ),
      fileNames: parseField(userData.fileNames as string | null | undefined),
    }

    return parsedUserData
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
