import KoaRouter from '@koa/router'

import hash from './hash'
import { createToken, createResetToken, setPassword } from './jwt'
import createHttpError from 'http-errors'
import { sendEmail } from '../../common/adapters/smtpAdapter'
import { createUser } from '../../common/adapters/userAdapter'
import { User } from '../../common/types'
import config from '../../common/config'

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
    const referer = ctx.query.referer ?? ctx.headers['referer']

    let subject = 'Nollställ ditt lösenord'
    let body =
      `En begäran om att nollställa lösenordet för kontot ${ctx.request.body.email} i den Digitala läsesalen har mottagits.\n\n` +
      `Nollställ ditt lösenord här: ${referer}/nollstall?email=${encodeURIComponent(
        ctx.request.body.email as string
      )}&token=${token}\n\n` +
      `Om du inte har begärt att ditt lösenord ska återställas kan du bortse från detta mail. Lämna aldrig ut länken till någon annan.`

    if (ctx.query.new) {
      subject = 'Välkommen till den Digitala läsesalen'
      body = `Kontot ${
        ctx.request.body.email
      } har skapats för dig i den Digitala läsesalen.\n\nAnvänd denna länk för att välja ett lösenord: ${referer}/nollstall?email=${encodeURIComponent(
        ctx.request.body.email as string
      )}&token=${token}`
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

  router.post('(.*)/auth/create-account', async (ctx) => {
    if (
      !ctx.request.body ||
      !ctx.request.body.username ||
      !ctx.request.body.firstName ||
      !ctx.request.body.lastName ||
      !ctx.request.body.password
    ) {
      ctx.status = 400
      ctx.body = {
        errorMessage:
          'Missing parameter(s): username, firstName, lastName, password',
      }
      return
    }

    try {
      const { password, salt } = await hash.createSaltAndHash(
        ctx.request.body.password as string
      )

      const newUser = {
        username: ctx.request.body.username as string,
        firstName: ctx.request.body.firstName as string,
        lastName: ctx.request.body.lastName as string,
        password_hash: password,
        salt,
        depositors:
          'Centrum för Näringslivshistoria;Föreningen Stockholms Företagsminnen',
        organization: ctx.request.body.organization as string,
        role: 'User',
      }

      await createUser(newUser as unknown as User)
    } catch (error: unknown) {
      ctx.status = 400
      if (error instanceof Error) {
        ctx.body = {
          error: error.message,
        }
      }
      return
    }

    try {
      const subject = 'Välkommen till digitala läsesalen'
      const body = `Hej,\n\nNu har kontot ${ctx.request.body.username} skapats för dig i Centrum för Näringslivshistorias digitala läsesal.\n
Lite mer beskrivning om vad digitala läsesalen är, med svar på de vanligaste frågorna, finns här: https://arkivet.naringslivshistoria.se/om-oss\n
Har du några andra frågor, hör av dig till info@naringslivshistoria.se.\n
Välkommen att börja söka!\n
Centrum för Näringslivshistoria
www.naringslivshistoria.se`

      await sendEmail(ctx.request.body.username as string, subject, body)
    } catch (error: unknown) {
      ctx.status = 400
      const errorMessage = error instanceof Error ? error.message : ''

      ctx.body = {
        error: `Epost för nytt konto kunde inte skickas. ${errorMessage}`,
      }
      return
    }

    try {
      await sendEmail(
        config.createAccount.notificationEmailRecipient,
        'Nytt konto har skapats i den digitala läsesalen',
        `Kontot ${ctx.request.body.username} har skapats i den Digitala läsesalen. Om du vill lägga till deponenter görs det genom administrationsgränssnittet`
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `Create account e-mail could not be sent to admin. ${error.message}`
        )
      }
    }

    ctx.body = {
      message: 'A new account has been created',
    }
  })
}
