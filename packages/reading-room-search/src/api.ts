import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as documentRoutes } from './services/documentService'

const router = new KoaRouter()

searchRoutes(router)
documentRoutes(router)

router.get('(.*)/isloggedin', async (ctx) => {
  ctx.body = 'true'
})

export default router
