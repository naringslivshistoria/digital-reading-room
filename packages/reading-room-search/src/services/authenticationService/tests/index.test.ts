import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { routes } from '../index'
import hash from '../hash'
import * as jwt from '../jwt'
import * as userAdapter from '../../../common/adapters/userAdapter'
import * as smtpAdapter from '../../../common/adapters/smtpAdapter'

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
        port: 6666,
      },
      smtp: {},
      createAccount: {
        resetPasswordUrl: 'https://reset',
        notificationEmailRecipient: 'foo bar',
      },
    },
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
      const hashSpy = jest
        .spyOn(hash, 'createSaltAndHash')
        .mockResolvedValue(mockResolve)
      await request(app.callback()).get('/auth/generatehash?password=abc1337')
      expect(hashSpy).toBeCalledWith('abc1337')
    })

    it('returns a salt and hash', async () => {
      const mockResolve = {
        salt: 'salt1234',
        password: 'hash5678',
      }
      jest.spyOn(hash, 'createSaltAndHash').mockResolvedValue(mockResolve)
      const res = await request(app.callback()).get(
        '/auth/generatehash?password=abc1337'
      )
      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        salt: mockResolve.salt,
        password: mockResolve.password,
      })
    })
  })

  describe('POST /auth/login', () => {
    it('requires username and password', async () => {
      const res = await request(app.callback()).post('/auth/login')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe(
        'Missing parameter(s): username, password'
      )
    })

    it('calls create token with username and password', async () => {
      const token = 'abc123'
      const jwtSpy = jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })

      await await request(app.callback()).post('/auth/login').send({
        username: 'foo',
        password: 'bar',
      })
      expect(jwtSpy).toBeCalledWith('foo', 'bar')
    })

    it('calls create token with username and password', async () => {
      const token = 'abc123'
      jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })

      const res = await await request(app.callback()).post('/auth/login').send({
        username: 'foo',
        password: 'bar',
      })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ token })
    })
  })
  describe('POST /auth/create-account', () => {
    it('requires username, firstname and lastname', async () => {
      const res = await request(app.callback()).post('/auth/create-account')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe(
        'Missing parameter(s): username, firstName, lastName'
      )
    })
    it('calls createUser with the correct parameters', async () => {
      const createAccountSpy = jest
        .spyOn(userAdapter, 'createUser')
        .mockImplementation(() => Promise.resolve())

      await await request(app.callback()).post('/auth/create-account').send({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        organization: 'FooBar AB',
      })
      expect(createAccountSpy).toBeCalledWith({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        depositors: 'Centrum för Näringslivshistoria',
        organization: 'FooBar AB',
      })
    })
    it('calls the right dependencies', async () => {
      const createAccountSpy = jest
        .spyOn(userAdapter, 'createUser')
        .mockImplementation(() => Promise.resolve())

      const jwtSpy = jest
        .spyOn(jwt, 'createResetToken')
        .mockImplementation(() => Promise.resolve('123'))

      const sendMailSpy = jest
        .spyOn(smtpAdapter, 'sendEmail')
        .mockImplementation(() => Promise.resolve())

      await request(app.callback()).post('/auth/create-account').send({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        organization: 'FooBar AB',
      })

      expect(createAccountSpy).toHaveBeenCalled()
      expect(jwtSpy).toHaveBeenCalled()
      expect(sendMailSpy).toBeCalledTimes(2)
    })
  })
})
