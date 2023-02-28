import KoaRouter from '@koa/router'

import hash from './hash'
import { createToken } from './jwt'

export const routes = (router: KoaRouter) => {
  /**
   * @swagger
   * /auth/generate-password-hash:
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
  router.get('/auth/generatehash', async (ctx) => {
    const { query } = ctx

    if (!query.password) {
      ctx.status = 400
      ctx.body = { message: 'Needs password query parameter' }
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
  router.post('/auth/generate-token', async (ctx) => {
    const username = ctx.request.body?.username as string
    const password = ctx.request.body?.password as string

    if (!username || !password) {
      ctx.status = 400
      ctx.body = { message: 'username and password must be provided' }
      return
    }

    const token = await createToken(username, password)
    ctx.body = token
  })

  /**
   * @swagger
   * /auth/refresh-token:
   *  get:
   *    summary: Renews a jwt token
   *    description: Creates a new token based on a previous one.
   *    parameters:
   *      - in: header
   *        name: authorization
   *        schema:
   *          type: string
   *        required: true
   *    security:
   *      type: http
   *      scheme: bearer
   *      bearerFormat: JWT
   *    responses:
   *      '200':
   *        description: 'A valid token'
   *        schema:
   *            type: object
   *            properties:
   *              token:
   *                type: string
   *      '401':
   *        description: 'Unauthorized'
   */
  router.get(
    '/auth/refresh-token',
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) {
        res.status(401).send('Unauthorized, token missing')
      } else {
        res.json(await refreshToken(req.auth))
      }
    }),
    errorHandler
  )
}
