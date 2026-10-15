import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from '@koa/bodyparser'
import cors from '@koa/cors'
import jwt from 'koa-jwt'

import config from './common/config'
import { ping } from './common/adapters/userAdapter'
import { populateUserState } from './middleware/authMiddleware'
import { routes as authRoutes } from './services/authService'
import { routes as chatRoutes } from './services/chatService'

const app = new Koa()

app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(bodyParser())

const publicRouter = new KoaRouter()
publicRouter.get('/health', async (ctx) => {
  try {
    await ping()
    ctx.body = { status: 'ok' }
  } catch {
    ctx.status = 503
    ctx.body = { status: 'database unavailable' }
  }
})
authRoutes(publicRouter)
app.use(publicRouter.routes())
app.use(publicRouter.allowedMethods())

app.use(jwt({ secret: config.auth.secret, cookie: config.auth.cookieName }))
app.use(populateUserState)

const privateRouter = new KoaRouter()
privateRouter.get('/auth/me', async (ctx) => {
  const user = ctx.state.user
  ctx.body = {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    depositors: user.depositors,
  }
})
chatRoutes(privateRouter)
app.use(privateRouter.routes())
app.use(privateRouter.allowedMethods())

export default app
