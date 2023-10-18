import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/auth/is-logged-in', async (ctx) => {
  if (ctx.state?.user) {
    ctx.body = {
      username: ctx.state?.user?.username,
      depositors: ctx.state?.user?.depositors,
      archiveInitiators: ctx.state?.user?.archiveInitiators,
    }
  } else {
    ctx.status = 401
  }
})

export default router
