import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/auth/is-logged-in', async (ctx) => {
  if (ctx.state?.user?.username) {
    const user = ctx.state.user

    ctx.body = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      depositors: user.depositors,
      archiveInitiators: user.archiveInitiators,
      documentIds: user.documentIds,
      series: user.series,
      volumes: user.volumes,
      fileNames: user.fileNames,
    }
  } else {
    ctx.status = 401
  }
})

export default router
