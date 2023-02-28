import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { routes } from '../index'
import fs, { ReadStream } from 'fs'
import { Readable } from 'stream'

const app = new Koa()
const router = new KoaRouter()
routes(router)
app.use(bodyParser())
app.use(router.routes())

jest.mock('../../../common/config', () => {
  return {
    __esModule: true,
    default: {
      elasticSearch: {
        url: 'http://fakehost:123',
        indexName: 'svejs',
      }
    }
  }
})

const mockedImageBuffer = Buffer.from('image-data', 'utf8')

const getMockedStream = () => {
  const newStream = new Readable()
  newStream.push(mockedImageBuffer)
  newStream.push(null)
  return newStream
}

describe('app', () => {
  describe('GET /thumbnail/:documentId', () => {
    it('reads a file from disk', async () => {
      const fsSpy = jest.spyOn(fs, 'createReadStream').mockReturnValue(getMockedStream() as ReadStream)

      const res = await request(app.callback()).get('/thumbnail/123')

      expect(fsSpy).toBeCalled()
    })

    it('returns', async () => {
      const fsSpy = jest.spyOn(fs, 'createReadStream').mockReturnValue(getMockedStream() as ReadStream)

      const res = await request(app.callback()).get('/thumbnail/123')

      expect(res.status).toEqual(200)
      expect(res.body).toEqual(mockedImageBuffer)
    })
  })
})
