import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { Client } from '@elastic/elasticsearch'
import { routes } from '../index'
import searchResultMock from './searchResultMock'

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
    },
  }
})

describe('searchService', () => {
  describe('GET /search?freeTextQuery', () => {
    it('searches in elastic search', async () => {
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback()).get('/search?query=searchQuery')

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query: 'searchQuery',
                },
              },
            ],
            filter: undefined,
          },
        },
        from: 0,
        size: 20,
        sort: [
          {
            'fields.undefined.value.keyword': undefined,
          },
          '_score',
        ],
        track_total_hits: true,
      })
    })

    it('returns documents', async () => {
      jest.spyOn(Client.prototype, 'search').mockResolvedValue(searchResultMock)

      const res = await request(app.callback()).get('/search?query=searchQuery')

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        query: 'searchQuery',
        results: [searchResultMock.hits.hits[0]._source],
        hits: 20,
      })
    })
  })
})
