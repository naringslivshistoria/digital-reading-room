import KoaRouter from '@koa/router'
import createHttpError from 'http-errors'

import { createToken } from './jwt'
import config from '../../common/config'

const cookieOptions = {
  httpOnly: true,
  overwrite: true,
  sameSite: 'lax' as const,
  secure: config.auth.cookieSecure,
  domain: config.auth.cookieDomain,
  path: '/',
}

export const routes = (router: KoaRouter) => {
  router.post('/auth/login', async (ctx) => {
    const body = ctx.request.body as
      | { username?: string; password?: string }
      | undefined
    const username = body?.username?.toLowerCase()
    const password = body?.password

    if (!username || !password) {
      ctx.status = 400
      ctx.body = { message: 'Missing parameter(s): username, password' }
      return
    }

    try {
      const token = await createToken(username, password)
      ctx.cookies.set(config.auth.cookieName, token, {
        ...cookieOptions,
        maxAge: config.auth.expiresIn * 1000,
      })
      ctx.body = { message: 'Login successful' }
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        ctx.status = error.statusCode
        ctx.body = { message: error.message }
      } else {
        console.error(error)
        ctx.status = 500
        ctx.body = { message: 'Internal server error' }
      }
    }
  })

  router.post('/auth/logout', async (ctx) => {
    ctx.cookies.set(config.auth.cookieName, null, cookieOptions)
    ctx.status = 204
  })
}
