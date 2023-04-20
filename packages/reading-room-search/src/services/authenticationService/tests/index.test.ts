import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { routes } from '../index'
import hash from '../hash'
import * as jwt from '../jwt'

const app = new Koa()
const router = new KoaRouter()
routes(router)
app.use(bodyParser())
app.use(router.routes())

jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      postgres: {
        host: 'postgreshost',
        user: 'foo',
        password: 'bar',
        database: 'xyzdb',
        port: 6666
      },
    }
  }
})

describe('authenticationService', () => {
  describe('GET /auth/generatehash', () => {
    it('requires a password query parameter', async () => {
      const res = await request(app.callback()).get('/auth/generatehash')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe('Missing parameter: password')
    })

    it('generates a salt and hash', async () => {
      const mockResolve = {
        salt: 'salt1234',
        password: 'hash5678',
      }
      const hashSpy = jest.spyOn(hash, 'createSaltAndHash').mockResolvedValue(mockResolve)
      await request(app.callback()).get('/auth/generatehash?password=abc1337')
      expect(hashSpy).toBeCalledWith('abc1337')
    })

    it('returns a salt and hash', async () => {
      const mockResolve = {
        salt: 'salt1234',
        password: 'hash5678',
      }
      jest.spyOn(hash, 'createSaltAndHash').mockResolvedValue(mockResolve)
      const res = await request(app.callback()).get('/auth/generatehash?password=abc1337')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        salt: mockResolve.salt,
        password: mockResolve.password,
      })
    })
  })

  describe('POST /auth/generate-token', () => {
    it('requires username and password', async () => {
      const res = await request(app.callback()).post('/auth/generate-token')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe('Missing parameter(s): username, password')
    })

    it('calls create token with username and password', async () => {
      const token = 'abc123'
      const jwtSpy = jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })

      await (await request(app.callback()).post('/auth/generate-token').send({
        username: 'foo',
        password: 'bar',
      }))
      expect(jwtSpy).toBeCalledWith('foo', 'bar')
    })

    it('calls create token with username and password', async () => {
      const token = 'abc123'
      jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })

      const res = await (await request(app.callback()).post('/auth/generate-token').send({
        username: 'foo',
        password: 'bar',
      }))
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ token })
    })
  })
})
