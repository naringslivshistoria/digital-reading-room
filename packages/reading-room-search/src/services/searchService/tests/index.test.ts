import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { Client } from '@elastic/elasticsearch'
import koaJwt from 'koa-jwt'
import jwt from 'jsonwebtoken'

import { routes } from '../index'
import searchResultMock from './searchResultMock'

const app = new Koa()
const router = new KoaRouter()
routes(router)

app.use(bodyParser())

app.use(
  koaJwt({
    secret:
      'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
    cookie: 'readingroom',
  })
)
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

const authorizedToken = jwt.sign(
  {
    sub: 'foo',
    username: 'bar',
    depositors: undefined,
    archiveInitiators: ['Svenska Arbetsgivareföreningen (SAF)'],
  },
  'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
  {
    expiresIn: '3h',
  }
)
const authorizedWithFileNameToken = jwt.sign(
  {
    sub: 'foo',
    username: 'bar',
    depositors: undefined,
    archiveInitiators: undefined,
    fileNames: ['DA-2016-040576-SAF_Arbetsgivaren_14_1966_21.pdf'],
  },
  'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
  {
    expiresIn: '3h',
  }
)
const unAuthorizedToken = jwt.sign(
  {
    sub: 'foo',
    username: 'bar',
    depositors: [''],
    archiveInitiators: [''],
    fileNames: [''],
  },
  'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
  {
    expiresIn: '3h',
  }
)

describe('searchService', () => {
  describe('GET /search?freeTextQuery', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('searches in elastic search with correct access filter for archiveInitiator', async () => {
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + authorizedToken)

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
            filter: {
              bool: {
                should: [
                  {
                    terms: {
                      'fields.archiveInitiator.value.keyword': [
                        'Svenska Arbetsgivareföreningen (SAF)',
                      ],
                    },
                  },
                ],
              },
            },
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

      const res = await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + authorizedToken)

      expect(res.status).toEqual(200)
      expect(res.body).toEqual({
        query: 'searchQuery',
        results: [searchResultMock.hits.hits[0]._source],
        hits: 20,
      })
    })

    it('searches in elastic with sorting by title asc', async () => {
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery&sort=title&sortOrder=asc')
        .set('Authorization', 'Bearer ' + authorizedToken)

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
            filter: {
              bool: {
                should: [
                  {
                    terms: {
                      'fields.archiveInitiator.value.keyword': [
                        'Svenska Arbetsgivareföreningen (SAF)',
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
        from: 0,
        size: 20,
        sort: [
          {
            'fields.title.value.keyword': 'asc',
          },
          '_score',
        ],
        track_total_hits: true,
      })
    })

    it('searches in elastic with sorting on filename desc', async () => {
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery&sort=filename&sortOrder=desc')
        .set('Authorization', 'Bearer ' + authorizedToken)

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
            filter: {
              bool: {
                should: [
                  {
                    terms: {
                      'fields.archiveInitiator.value.keyword': [
                        'Svenska Arbetsgivareföreningen (SAF)',
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
        from: 0,
        size: 20,
        sort: [
          {
            'fields.filename.value.keyword': 'desc',
          },
          '_score',
        ],
        track_total_hits: true,
      })
    })
  })
})
