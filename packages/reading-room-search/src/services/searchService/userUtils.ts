import { Context } from 'koa'
import { getUserData } from '../../common/adapters/userAdapter'

export const fetchAndUpdateUserData = async (ctx: Context) => {
  if (ctx.state?.user?.username) {
    try {
      const userData = await getUserData(ctx.state.user.username)
      ctx.state.user = {
        ...ctx.state.user,
        ...userData,
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
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  }
}
