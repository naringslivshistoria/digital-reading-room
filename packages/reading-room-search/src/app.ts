import Koa from 'koa'
import KoaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser'
import pinoLogger from 'koa-pino-logger'
import cors from '@koa/cors'
import jwt from 'koa-jwt'

import api from './api'
import { routes as authRoutes } from './services/authenticationService'
import config from './common/config'

const app = new Koa()

app.use(cors())

const logger = pinoLogger()
app.use(logger)

app.on('error', (err) => {
  console.log('on:error')
  logger.logger.error(err)
});

// TODO: Remove me. koa-pino-logger uses standard log levels
app.use(async (ctx, next) => {
  ctx.log.warn('Hello')
  await next()
})

app.use(bodyParser())

const publicRouter = new KoaRouter()

authRoutes(publicRouter)
app.use(publicRouter.routes())

// Unprotected routes above this line, protected by login below
app.use(jwt({ secret: config.auth.secret, cookie: 'readingroom' }))

app.use(api.routes())

export default app
