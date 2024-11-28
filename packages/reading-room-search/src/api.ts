import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'
import { fetchUserData } from './services/userService'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/auth/is-logged-in', async (ctx) => {
  console.log('Is logged in')
  if (ctx.state?.user?.username) {
    try {
      const userData = await fetchUserData(ctx.state.user.username)

      if (ctx.session) {
        ctx.session.user = {
          ...ctx.session.user,
          ...userData,
        }
      }

      ctx.body = {
        username: ctx.state.user.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organization: userData.organization,
        depositors: userData.depositors,
        archiveInitiators: userData.archiveInitiators,
        documentIds: userData.documentIds,
        series: userData.series,
        volumes: userData.volumes,
        fileNames: userData.fileNames,
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      ctx.status = 500
      ctx.body = { error: 'Failed to fetch user data' }
    }
  } else {
    ctx.status = 401
  }
})

export default router
