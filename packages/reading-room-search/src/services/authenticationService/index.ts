import KoaRouter from '@koa/router'

import hash from './hash'
import { createToken, createResetToken, setPassword } from './jwt'
import createHttpError from 'http-errors'
import { sendEmail } from './adapters/smtpAdapter'

const cookieOptions = {
  httpOnly: true,
  overwrite: true,
  sameSite: false,
  secure: false,
  domain: process.env.COOKIE_DOMAIN ?? 'dev.cfn.iteam.se',
}

export const routes = (router: KoaRouter) => {
  /**
   * @swagger
   * /auth/generatehash:
   *  get:
   *    summary: Generates a salt and hashes the given password using that salt.
   *    description: Generates a salt and hashes the given password using that salt. Pass cleartext password as query parameter.
   *    parameters:
   *      - in: query
   *        name: password
   *        required: true
   *        type: string
   *        description: The cleartext password that should be hashed
   *    responses:
   *      '200':
   *        description: 'Hashed password and salt'
   *        schema:
   *            type: object
   *            properties:
   *              passwordHash:
   *                type: string
   *              salt:
   *                type: string
   */
  router.get('(.*)/auth/generatehash', async (ctx) => {
    const { query } = ctx

    if (!query.password) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: password' }
      return
    }

    const saltAndHash = await hash.createSaltAndHash(query.password as string)
    ctx.body = saltAndHash
  })

  /**
   * @swagger
   * /auth/generate-token:
   *  post:
   *    summary: Generates a jwt
   *    description: Validates username + password and returns a valid token to be used in authorization header.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      '200':
   *        description: 'A valid token'
   *        schema:
   *            type: object
   *            properties:
   *              token:
   *                type: string
   */
  router.post('(.*)/auth/login', async (ctx) => {
    const username = ctx.request.body?.username as string
    const password = ctx.request.body?.password as string

    if (!username || !password) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter(s): username, password' }
      return
    }

    try {
      const token = await createToken(username, password)

      ctx.cookies.set('readingroom', token.token, cookieOptions)
      ctx.body = token
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        ctx.status = (error as createHttpError.HttpError).statusCode
        ctx.body = { message: (error as createHttpError.HttpError).message }
      } else {
        ctx.status = 500
        ctx.body = { message: (error as Error).message }
      }
    }
  })

  router.get('(.*)/auth/logout', async (ctx) => {
    ctx.cookies.set('readingroom', null, cookieOptions)

    ctx.redirect('/login')
  })

  router.post('(.*)/auth/send-reset-password-link', async (ctx) => {
    if (!ctx.request.body?.email) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: email' }
      return
    }

    const token = await createResetToken(ctx.request.body.email as string)

    let subject = 'Nollställ ditt lösenord'
    let body =
      `En begäran om att nollställa lösenordet för kontot ${ctx.request.body.email} i den Digitala läsesalen har mottagits.\n\n` +
      `Nollställ ditt lösenord här: ${ctx.headers['referer']}/nollstall?email=${ctx.request.body.email}&token=${token}\n\n` +
      `Om du inte har begärt att ditt lösenord ska återställas kan du bortse från detta mail. Lämna aldrig ut länken till någon annan.`

    if (ctx.query.new) {
      subject = 'Välkommen till den Digitala läsesalen'
      body = `Kontot ${ctx.request.body.email} har skapats för dig i den Digitala läsesalen. Använd denna länk för att välja ett lösenord: ${ctx.headers['referer']}/nollstall?email=${ctx.request.body.email}&token=${token}`
    }

    await sendEmail(ctx.request.body.email as string, subject, body)

    ctx.body = {
      token: token,
    }
  })

  router.post('(.*)/auth/reset-password', async (ctx) => {
    if (!ctx.request.body) {
      return
    }

    if (!ctx.request.body.token) {
      ctx.status = 400
      ctx.request.body = {
        errorMessage: 'Missing parameter: password reset token',
      }
      return
    }

    if (!ctx.request.body.email) {
      ctx.status = 400
      ctx.request.body = { errorMessage: 'Missing parameter: user email' }
      return
    }

    if (!ctx.request.body.password) {
      ctx.status = 400
      ctx.request.body = { errorMessage: 'Missing parameter: new password' }
      return
    }

    const saltAndHash = await hash.createSaltAndHash(
      ctx.request.body.password as string
    )

    try {
      await setPassword(
        ctx.request.body.email as string,
        ctx.request.body.token as string,
        saltAndHash.salt,
        saltAndHash.password
      )

      ctx.body = {
        message: 'Password has been set',
      }
    } catch (error) {
      console.error(error)
      ctx.status = 400
      ctx.body = {
        message:
          'Error resetting password. User does not exist, password reset has not been initiated or has expired, or password reset token is wrong.',
      }
    }
  })
}
