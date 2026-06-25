import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import koaJwt from 'koa-jwt'
import jwt from 'jsonwebtoken'

import { populateUserState } from '../authMiddleware'
import * as userService from '../../userService'

jest.mock('../../userService', () => ({
  fetchUserData: jest.fn(),
}))

const mockedFetchUserData = userService.fetchUserData as jest.Mock

const secret = 'test-secret'

const app = new Koa()
app.use(koaJwt({ secret, cookie: 'readingroom' }))
app.use(populateUserState)

const router = new KoaRouter()
router.get('/whoami', async (ctx) => {
  ctx.body = ctx.state.user
})
app.use(router.routes())

const createToken = () =>
  jwt.sign({ sub: '1', username: 'foo', role: 'User' }, secret, {
    expiresIn: '1h',
  })

describe('populateUserState', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('populerar ctx.state.user från databasen utan att sätta någon sessionscookie', async () => {
    const manyDepositors = Array.from(
      { length: 100 },
      (_, i) => `Deponent med ett ganska långt namn nummer ${i}`
    )
    mockedFetchUserData.mockResolvedValue({
      firstName: 'Test',
      lastName: 'User',
      organization: 'Test Org',
      depositors: manyDepositors,
      archiveInitiators: [],
      series: [],
      volumes: [],
      documentIds: [],
      fileNames: [],
      locked: false,
      disabled: false,
    })

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(mockedFetchUserData).toBeCalledWith('foo')
    expect(res.status).toBe(200)
    expect(res.body.username).toBe('foo')
    expect(res.body.depositors).toEqual(manyDepositors)
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  it('svarar 401 om användaren är låst', async () => {
    mockedFetchUserData.mockResolvedValue({ locked: true, disabled: false })

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'User is locked' })
  })

  it('svarar 401 om användaren är inaktiverad', async () => {
    mockedFetchUserData.mockResolvedValue({ locked: false, disabled: true })

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'User is disabled' })
  })

  it('svarar 500 vid oväntat fel under hämtning av användardata', async () => {
    mockedFetchUserData.mockRejectedValue(new Error('DB connection failed'))

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Internal server error' })
  })

  it('svarar 401 om användaren inte finns i databasen', async () => {
    mockedFetchUserData.mockResolvedValue(null)

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(res.status).toBe(401)
  })

  it('når inte next() vid oväntat DB-fel', async () => {
    mockedFetchUserData.mockRejectedValue(new Error('DB connection failed'))

    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + createToken())

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Internal server error' })
    expect(res.body.username).toBeUndefined()
  })
})
