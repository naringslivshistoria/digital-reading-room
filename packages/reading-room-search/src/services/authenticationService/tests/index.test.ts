import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import session from 'koa-session'
import { routes } from '../index'
import hash from '../hash'
import * as jwt from '../jwt'
import * as userService from '../../userService'
import * as userAdapter from '../../../common/adapters/userAdapter'
import * as smtpAdapter from '../../../common/adapters/smtpAdapter'
import dotenv from 'dotenv'

dotenv.config()

const app = new Koa()
app.keys = [process.env.SESSION_SECRET || 'dev-session-secret']

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

app.use(bodyParser())

const router = new KoaRouter()
routes(router)
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
      auth: {
        secret: 'test-secret',
        expiresIn: '1h',
        maxFailedLoginAttempts: 5,
      },
      createAccount: {
        resetPasswordUrl: 'https://reset',
        notificationEmailRecipient: 'foo bar',
      },
    },
  }
})

describe('authenticationService', () => {
  describe('GET /auth/generatehash', () => {
    it('kräver en query-parameter för lösenord', async () => {
      const res = await request(app.callback()).get('/auth/generatehash')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe('Missing parameter: password')
    })

    it('genererar en salt och hash', async () => {
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

    it('returnerar en salt och hash', async () => {
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
    it('kräver användarnamn och lösenord', async () => {
      const res = await request(app.callback()).post('/auth/login')
      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe(
        'Missing parameter(s): username, password'
      )
    })

    it('anropar createToken med användarnamn och lösenord', async () => {
      const token = 'abc123'
      const jwtSpy = jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })
      const userDataSpy = jest
        .spyOn(userService, 'fetchUserData')
        .mockResolvedValue({
          firstName: 'Test',
          lastName: 'User',
          organization: 'Test Org',
          depositors: ['Dep1', 'Dep2'],
          archiveInitiators: [],
          series: [],
          volumes: [],
          documentIds: [],
          fileNames: [],
        })

      const res = await request(app.callback()).post('/auth/login').send({
        username: 'foo',
        password: 'bar',
      })

      expect(jwtSpy).toBeCalledWith('foo', 'bar')
      expect(userDataSpy).toBeCalledWith('foo')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Login successful' })
    })

    it('sätter sessionen och cookie vid lyckad inloggning', async () => {
      const token = 'abc123'
      jest.spyOn(jwt, 'createToken').mockResolvedValue({ token })
      jest.spyOn(userService, 'fetchUserData').mockResolvedValue({
        firstName: 'Test',
        lastName: 'User',
        organization: 'Test Org',
        depositors: ['Dep1', 'Dep2'],
        archiveInitiators: [],
        series: [],
        volumes: [],
        documentIds: [],
        fileNames: [],
      })

      const res = await request(app.callback()).post('/auth/login').send({
        username: 'foo',
        password: 'bar',
      })

      expect(res.headers['set-cookie']).toBeDefined()
      expect(res.headers['set-cookie'][0]).toContain('readingroom')
    })
  })

  describe('POST /auth/create-account', () => {
    it('requires username, firstname, lastname and password', async () => {
      const res = await request(app.callback()).post('/auth/create-account')

      expect(res.status).toBe(400)
      expect(res.body.errorMessage).toBe(
        'Missing parameter(s): username, firstName, lastName, password'
      )
    })
    it('calls createUser with the correct parameters', async () => {
      const mockHash = {
        password: 'hashedPassword123',
        salt: 'salt123',
      }

      const createAccountSpy = jest
        .spyOn(userAdapter, 'createUser')
        .mockImplementation(async () => {
          return Promise.resolve()
        })

      const hashSpy = jest
        .spyOn(hash, 'createSaltAndHash')
        .mockResolvedValue(mockHash)

      await request(app.callback()).post('/auth/create-account').send({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        organization: 'FooBar AB',
        password: 'securePassword123',
      })

      expect(createAccountSpy).toBeCalledWith({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        depositors:
          'Centrum för Näringslivshistoria;Föreningen Stockholms Företagsminnen',
        organization: 'FooBar AB',
        role: 'User',
        password_hash: mockHash.password,
        salt: mockHash.salt,
      })

      expect(hashSpy).toHaveBeenCalledWith('securePassword123')
    })

    it('anropar rätt beroenden', async () => {
      const createAccountSpy = jest
        .spyOn(userAdapter, 'createUser')
        .mockImplementation(async () => {
          return Promise.resolve()
        })

      const hashSpy = jest
        .spyOn(hash, 'createSaltAndHash')
        .mockResolvedValue({ password: 'hash', salt: 'salt' })

      const sendMailSpy = jest
        .spyOn(smtpAdapter, 'sendEmail')
        .mockImplementation(() => Promise.resolve())

      await request(app.callback()).post('/auth/create-account').send({
        username: 'foo',
        firstName: 'bar',
        lastName: 'barsson',
        organization: 'FooBar AB',
        password: 'securePassword123',
      })

      expect(createAccountSpy).toHaveBeenCalled()
      expect(hashSpy).toHaveBeenCalled()
      expect(sendMailSpy).toBeCalledTimes(2)
    })
  })
})
