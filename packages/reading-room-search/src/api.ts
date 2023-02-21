import KoaRouter from '@koa/router';
import { routes as searchRoutes } from './services/searchService'
import { routes as thumbnailRoutes } from './services/thumbnailService'
import { routes as authRoutes } from './services/authenticationService'

const router = new KoaRouter();

searchRoutes(router)
thumbnailRoutes(router)
authRoutes(router)

export default router;
