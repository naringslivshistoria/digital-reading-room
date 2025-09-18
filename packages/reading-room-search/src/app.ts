import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from '@koa/bodyparser'
import cors from '@koa/cors'
import jwt from 'koa-jwt'
import session from 'koa-session'

import api from './api'
import { routes as authRoutes } from './services/authenticationService'
import config from './common/config'
import { populateUserStateFromSession } from './services/middleware/authMiddleware'

const app = new Koa()

app.keys = [process.env.SESSION_SECRET || 'dev-session-secret']

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
)

app.use(bodyParser())

app.use(
  session(
    {
      key: 'koa.sess',
      maxAge: 86400000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
    app
  )
)

const publicRouter = new KoaRouter()
authRoutes(publicRouter)
app.use(publicRouter.routes())

app.use(jwt({ secret: config.auth.secret, cookie: 'readingroom' }))

app.use(populateUserStateFromSession)

app.use(api.routes())

export default app
