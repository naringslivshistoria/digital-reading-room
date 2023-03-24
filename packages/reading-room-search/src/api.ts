import KoaRouter from '@koa/router';
import { routes as searchRoutes } from './services/searchService'
import { routes as thumbnailRoutes } from './services/thumbnailService'

const router = new KoaRouter();

searchRoutes(router)
thumbnailRoutes(router)

export default router
