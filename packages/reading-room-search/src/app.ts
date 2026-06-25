import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from '@koa/bodyparser'
import cors from '@koa/cors'
import jwt from 'koa-jwt'

import api from './api'
import { routes as authRoutes } from './services/authenticationService'
import config from './common/config'
import { populateUserState } from './services/middleware/authMiddleware'

const app = new Koa()

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
)

app.use(bodyParser())

const publicRouter = new KoaRouter()
authRoutes(publicRouter)
app.use(publicRouter.routes())

app.use(jwt({ secret: config.auth.secret, cookie: 'readingroom' }))

app.use(populateUserState)

app.use(api.routes())

export default app
