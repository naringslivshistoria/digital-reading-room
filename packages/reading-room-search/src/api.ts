// api.ts
import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'
import { fetchAndUpdateUserData } from './services/searchService/userUtils'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/auth/is-logged-in', async (ctx) => {
  if (ctx.state?.user?.username) {
    try {
      await fetchAndUpdateUserData(ctx)
      ctx.body = {
        username: ctx.state.user.username,
        firstName: ctx.state.user.firstName,
        lastName: ctx.state.user.lastName,
        organization: ctx.state.user.organization,
        depositors: ctx.state.user.depositors,
        archiveInitiators: ctx.state.user.archiveInitiators,
        documentIds: ctx.state.user.documentIds,
        series: ctx.state.user.series,
        volumes: ctx.state.user.volumes,
        fileNames: ctx.state.user.fileNames,
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
