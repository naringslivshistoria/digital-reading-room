import { getUserData } from '../../common/adapters/userAdapter'

export const fetchUserData = async (username: string) => {
  try {
    const userData = await getUserData(username)

    const parsedUserData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      organization: userData.organization,
      depositors: userData.depositors
        ? userData.depositors.replace(/;$/, '').split(';')
        : [],
      archiveInitiators: userData.archiveInitiators
        ? userData.archiveInitiators.replace(/;$/, '').split(';')
        : [],
      series: userData.series
        ? userData.series.replace(/;$/, '').split(';')
        : [],
      volumes: userData.volumes
        ? userData.volumes.replace(/;$/, '').split(';')
        : [],
      documentIds: userData.documentIds
        ? userData.documentIds.replace(/;$/, '').split(';')
        : [],
      fileNames: userData.fileNames
        ? userData.fileNames.replace(/;$/, '').split(';')
        : [],
    }

    return parsedUserData
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
