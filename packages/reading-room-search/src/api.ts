import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'
import { getDepositors } from './common/adapters/userAdapter'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/auth/is-logged-in', async (ctx) => {
  const depositors = await getDepositors(ctx.state?.user?.username)
  if (ctx.state?.user) {
    ctx.body = {
      username: ctx.state?.user?.username,
      depositors:
        depositors && depositors != ''
          ? depositors?.replace(/;$/, '').split(';')
          : [],
      archiveInitiators: ctx.state?.user?.archiveInitiators,
      documentIds: ctx.state?.user?.documentIds,
      series: ctx.state?.user?.series,
      volumes: ctx.state?.user?.volumes,
      firstName: ctx.state?.user?.firstName,
      lastName: ctx.state?.user?.lastName,
      organization: ctx.state?.user?.organization,
    }
  } else {
    ctx.status = 401
  }
})

export default router
