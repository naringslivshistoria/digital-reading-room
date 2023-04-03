import KoaRouter from '@koa/router'
import { routes as ocrRoutes } from './services/ocrService'

const router = new KoaRouter()

ocrRoutes(router)

export default router
