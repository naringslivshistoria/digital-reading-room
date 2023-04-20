import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { Client } from '@elastic/elasticsearch'
import axios from 'axios'
import { routes } from '../index'
import documentResultMock from './documentResultMock'
import config from '../../../common/config'

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
      },
      comprimaAdapter: {
        url: 'http://comprima:123'
      }
    }
  }
})

jest.mock('axios')
const mockedAxios = jest.mocked(axios, true)

describe('documentService', () => {
  describe('GET /document/:id', () => {
    it('requires a document id parameter', async () => {
      const res = await request(app.callback()).get('/document')
      expect(res.status).toBe(404)
    })

    it('gets the doucment from elastic search', async () => {
      const elasticSpy = jest.spyOn(Client.prototype, 'get')
      const id = "1337"

      await request(app.callback()).get('/document/' + id)

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        id
      })
    })

    it('returns a document', async () => {
      jest.spyOn(Client.prototype, 'get').mockResolvedValue(documentResultMock)

      const res = await request(app.callback()).get('/document/1337')

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        results: documentResultMock._source
      })
    })
  })

  describe('GET /document/:id/attachment/:filename', () => {
    it('calls comprima-adapter', async () => {
      const id = "1337"
      mockedAxios.mockReturnValue(Promise.resolve('SUCCESS') as Promise<unknown>)

      await request(app.callback()).get(`/document/${id}/attachment/filename.jpg`)

      expect(mockedAxios).toBeCalledWith({
        method: 'get',
        responseType: 'stream',
        url: `${config.comprimaAdapter.url}/document/${id}/attachment`
      })
    })
  })
})
