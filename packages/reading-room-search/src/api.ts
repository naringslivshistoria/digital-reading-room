import KoaRouter from '@koa/router'
import { routes as searchRoutes } from './services/searchService'
import { routes as thumbnailRoutes } from './services/thumbnailService'
import { routes as documentRoutes } from './services/documentService'

const router = new KoaRouter()

searchRoutes(router)
thumbnailRoutes(router)
documentRoutes(router)

export default router
