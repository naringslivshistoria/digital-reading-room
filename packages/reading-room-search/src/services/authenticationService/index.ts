import KoaRouter from '@koa/router'

import hash from './hash'

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
    } else {
      const saltAndHash = await hash.createSaltAndHash(query.password as string)
      console.log('sending stuff', saltAndHash)
      ctx.body = saltAndHash
    }
  })
}
