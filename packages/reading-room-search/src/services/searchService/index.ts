import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document } from '../../common/types'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
})

const search = async (query: string | string[]) : Promise<Document[]> => {
  const queryString = Array.isArray(query) ? query[0] : query

  const searchResults = await client.search({
    index: 'comprima',
    from: 0,
    size: 100,
    query: {
      query_string: {
        query: queryString
      } 
    }
  })

  const documents = searchResults.hits.hits.map((searchHit) : Document => {
    return searchHit._source as Document
  })

  return documents
}

export const routes = (router: KoaRouter) => {
  router.get('/search', async (ctx) => {
    const { query: { query } } = ctx.request
    if (!query) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: query' }
      return
    }
  
    try
    {
      const results = await search(query)
      ctx.body = { results: results, query: query }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  });
}