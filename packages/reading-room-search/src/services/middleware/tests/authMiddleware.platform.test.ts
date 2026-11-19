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

jest.mock('../../../common/config', () => ({
  __esModule: true,
  default: { auth: { requirePlatformAccess: true } },
}))

const mockedFetchUserData = userService.fetchUserData as jest.Mock
const secret = 'test-secret'

const app = new Koa()
app.use(koaJwt({ secret, cookie: 'readingroom' }))
app.use(populateUserState)
const router = new KoaRouter()
router.get('/whoami', async (ctx) => {
  ctx.body = { username: ctx.state.user.username }
})
app.use(router.routes())

const token = () => jwt.sign({ sub: '1', username: 'foo' }, secret)
const user = (platforms: string[]) => ({
  locked: false,
  disabled: false,
  depositors: [],
  platforms,
})

describe('populateUserState with the platform check turned on', () => {
  afterEach(() => jest.clearAllMocks())

  it('lets in users with the reading room', async () => {
    mockedFetchUserData.mockResolvedValue(user(['readingroom']))
    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + token())
    expect(res.status).toBe(200)
  })

  it('lets in users with both platforms', async () => {
    mockedFetchUserData.mockResolvedValue(
      user(['foretagskallan', 'readingroom'])
    )
    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + token())
    expect(res.status).toBe(200)
  })

  it('denies users who only have Företagskällan', async () => {
    mockedFetchUserData.mockResolvedValue(user(['foretagskallan']))
    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + token())
    expect(res.status).toBe(403)
  })

  it('denies users without platforms', async () => {
    mockedFetchUserData.mockResolvedValue(user([]))
    const res = await request(app.callback())
      .get('/whoami')
      .set('Authorization', 'Bearer ' + token())
    expect(res.status).toBe(403)
  })
})
