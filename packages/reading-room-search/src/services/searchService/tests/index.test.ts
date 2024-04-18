import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { Client } from '@elastic/elasticsearch'
import koaJwt from 'koa-jwt'
import jwt from 'jsonwebtoken'

import { routes } from '../index'
import searchResultMock from './searchResultMock'
import { FieldFilterConfig } from '../../../common/types'

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
    depositors: ['Svenska Arbetsgivareföreningen (SAF)'],
    archiveInitiators: [],
  },
  'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
  {
    expiresIn: '3h',
  }
)

describe('searchService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('GET /search/get-field-filters', () => {
    it('Creates field filters and groups pageTypes/MediaTyp correctly', async () => {
      const mock = jest.spyOn(Client.prototype, 'search')

      mock.mockResolvedValueOnce({
        took: 5,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 476, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          volume: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: 1, doc_count: 457 }],
          },
          pageType: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: 'Image', doc_count: 476 },
              { key: 'Film', doc_count: 476 },
              { key: 'Text', doc_count: 476 },
              { key: 'Unknown', doc_count: 476 },
              { key: 'PDF', doc_count: 476 },
              { key: 'Word', doc_count: 476 },
              { key: 'Powerpoint', doc_count: 476 },
              { key: 'Excel', doc_count: 476 },
            ],
          },
          seriesName: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: ['D 1', 'LIGGARE OCH REGISTER'],
                key_as_string: 'D 1|LIGGARE OCH REGISTER',
                doc_count: 457,
              },
              {
                key: [
                  'M 1',
                  'Digitaliserade och detaljregistrerade handlingar',
                ],
                key_as_string:
                  'M 1|Digitaliserade och detaljregistrerade handlingar',
                doc_count: 19,
              },
            ],
          },
          archiveInitiator: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: 'A Tillmans Platsbyrå', doc_count: 476 }],
          },
          depositor: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: 'Centrum för Näringslivshistoria', doc_count: 476 },
            ],
          },
          location: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: '', doc_count: 476 }],
          },
          time: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: '', doc_count: 457 },
              { key: '1917-01-01 - 1917-12-31', doc_count: 4 },
              { key: '1915-01-01 - 1915-12-31', doc_count: 2 },
              { key: '1926-01-01 - 1926-12-31', doc_count: 2 },
              { key: '1899-01-01 - 1918-12-31', doc_count: 1 },
              { key: '1911-01-01 - 1911-12-31', doc_count: 1 },
              { key: '1914-01-01 - 1929-12-31', doc_count: 1 },
              { key: '1915-11-26 - 1915-11-26', doc_count: 1 },
              { key: '1917-05-14 - 1917-05-14', doc_count: 1 },
              { key: '1918-01-01 - 1918-12-31', doc_count: 1 },
              { key: '1919-01-01 - 1919-12-31', doc_count: 1 },
              { key: '1920-01-01 - 1920-12-31', doc_count: 1 },
              { key: '1927-01-01 - 1927-12-31', doc_count: 1 },
              { key: '1930-01-01 - 1930-12-31', doc_count: 1 },
              { key: '1932-01-01 - 1932-12-31', doc_count: 1 },
            ],
          },
        },
      })
      mock.mockResolvedValueOnce({
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 476, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          pageType: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: 'Image', doc_count: 476 },
              { key: 'Film', doc_count: 476 },
              { key: 'Text', doc_count: 476 },
              { key: 'Unknown', doc_count: 476 },
              { key: 'PDF', doc_count: 476 },
              { key: 'Word', doc_count: 476 },
              { key: 'Powerpoint', doc_count: 476 },
              { key: 'Excel', doc_count: 476 },
            ],
          },
          depositor: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: 'Centrum för Näringslivshistoria', doc_count: 476 },
            ],
          },
          location: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: '', doc_count: 476 }],
          },
          time: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: '', doc_count: 457 },
              { key: '1917-01-01 - 1917-12-31', doc_count: 4 },
              { key: '1915-01-01 - 1915-12-31', doc_count: 2 },
              { key: '1926-01-01 - 1926-12-31', doc_count: 2 },
              { key: '1899-01-01 - 1918-12-31', doc_count: 1 },
              { key: '1911-01-01 - 1911-12-31', doc_count: 1 },
              { key: '1914-01-01 - 1929-12-31', doc_count: 1 },
              { key: '1915-11-26 - 1915-11-26', doc_count: 1 },
              { key: '1917-05-14 - 1917-05-14', doc_count: 1 },
              { key: '1918-01-01 - 1918-12-31', doc_count: 1 },
              { key: '1919-01-01 - 1919-12-31', doc_count: 1 },
              { key: '1920-01-01 - 1920-12-31', doc_count: 1 },
              { key: '1927-01-01 - 1927-12-31', doc_count: 1 },
              { key: '1930-01-01 - 1930-12-31', doc_count: 1 },
              { key: '1932-01-01 - 1932-12-31', doc_count: 1 },
            ],
          },
        },
      })
      mock.mockResolvedValueOnce({
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 476, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          archiveInitiator: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: 'A Tillmans Platsbyrå', doc_count: 476 }],
          },
        },
      })
      mock.mockResolvedValueOnce({
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 476, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          seriesName: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: ['D 1', 'LIGGARE OCH REGISTER'],
                key_as_string: 'D 1|LIGGARE OCH REGISTER',
                doc_count: 457,
              },
              {
                key: [
                  'M 1',
                  'Digitaliserade och detaljregistrerade handlingar',
                ],
                key_as_string:
                  'M 1|Digitaliserade och detaljregistrerade handlingar',
                doc_count: 19,
              },
            ],
          },
        },
      })
      mock.mockResolvedValueOnce({
        took: 2,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 476, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          volume: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [{ key: 1, doc_count: 457 }],
          },
        },
      })

      const resp = await request(app.callback())
        .get('/search/get-field-filters')
        .set('Authorization', 'Bearer ' + authorizedToken)

      const pageTypeFilter = resp.body.find(
        (f: FieldFilterConfig) => f.fieldName == 'pageType'
      )

      expect(pageTypeFilter).toEqual({
        fieldName: 'pageType',
        displayName: 'Mediatyp',
        filterType: 1,
        visualSize: 2,
        values: ['Bild (Foton & Inscanningar)', 'Dokument', 'Ljud & Video'],
        allValues: ['Bild (Foton & Inscanningar)', 'Dokument', 'Ljud & Video'],
      })
    })
  })
  describe('GET /search?freeTextQuery', () => {
    it('searches in elastic search with correct access filter for depositor', async () => {
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
                      'fields.depositor.value.keyword': [
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

    it('searches in elastic with correct access filter for archiveInitiator', async () => {
      const token = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: ['My Company'],
          archiveInitiators: ['My Company>Main Company Archive'],
        },
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
        {
          expiresIn: '3h',
        }
      )
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + token)

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        query: {
          bool: {
            must: [{ query_string: { query: 'searchQuery' } }],
            filter: {
              bool: {
                should: [
                  {
                    terms: { 'fields.depositor.value.keyword': ['My Company'] },
                  },
                  {
                    bool: {
                      should: [
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                            ],
                          },
                        },
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

    it('searches in elastic with correct access filter with multiple archiveInitiator', async () => {
      const token = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [
            'My Company>Main Company Archive',
            'My Company>Historic Archive',
          ],
        },
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
        {
          expiresIn: '3h',
        }
      )
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + token)

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        query: {
          bool: {
            must: [{ query_string: { query: 'searchQuery' } }],
            filter: {
              bool: {
                should: [
                  {
                    bool: {
                      should: [
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Historic Archive',
                                  ],
                                },
                              },
                            ],
                          },
                        },
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

    it('searches in elastic with correct access filter with multiple series', async () => {
      const token = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [],
          series: [
            'My Company>Main Company Archive>My First Serie',
            'My Company>Main Company Archive>My Second Serie',
          ],
        },
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
        {
          expiresIn: '3h',
        }
      )
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + token)

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        query: {
          bool: {
            must: [{ query_string: { query: 'searchQuery' } }],
            filter: {
              bool: {
                should: [
                  {
                    bool: {
                      should: [
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.seriesName.value.keyword': [
                                    'My First Serie',
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.seriesName.value.keyword': [
                                    'My Second Serie',
                                  ],
                                },
                              },
                            ],
                          },
                        },
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

    it('searches in elastic with correct access filter with multiple volumes', async () => {
      const token = jwt.sign(
        {
          sub: 'foo',
          username: 'bar',
          depositors: [],
          archiveInitiators: [],
          series: [],
          volumes: [
            'My Company>Main Company Archive>My First Serie>Volume 1',
            'My Company>Main Company Archive>My First Serie>2',
          ],
        },
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
        {
          expiresIn: '3h',
        }
      )
      const elasticSpy = jest.spyOn(Client.prototype, 'search')

      await request(app.callback())
        .get('/search?query=searchQuery')
        .set('Authorization', 'Bearer ' + token)

      expect(elasticSpy).toBeCalledWith({
        index: 'svejs',
        query: {
          bool: {
            must: [{ query_string: { query: 'searchQuery' } }],
            filter: {
              bool: {
                should: [
                  {
                    bool: {
                      should: [
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.seriesName.value.keyword': [
                                    'My First Serie',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.volume.value.keyword': ['Volume 1'],
                                },
                              },
                            ],
                          },
                        },
                        {
                          bool: {
                            must: [
                              {
                                terms: {
                                  'fields.depositor.value.keyword': [
                                    'My Company',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.archiveInitiator.value.keyword': [
                                    'Main Company Archive',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.seriesName.value.keyword': [
                                    'My First Serie',
                                  ],
                                },
                              },
                              {
                                terms: {
                                  'fields.volume.value.keyword': ['2'],
                                },
                              },
                            ],
                          },
                        },
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
                      'fields.depositor.value.keyword': [
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
                      'fields.depositor.value.keyword': [
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
