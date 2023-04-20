import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document } from '../../common/types'
import config from '../../common/config'
import { SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'

const client = new Client({
  node: config.elasticSearch.url
})

const search = async (query: string | string[], start = 0, size = 20) => {
  const queryString = Array.isArray(query) ? query[0] : query

  const searchResults = await client.search({
    from: start,
    size: size,
    track_total_hits: true,
    index: config.elasticSearch.indexName,
    query: {
      query_string: {
        query: queryString
      }
    }
  })

  const documents = searchResults.hits.hits.map((searchHit) : Document => {
    return searchHit._source as Document
  })

  const totalHits = (searchResults.hits.total as SearchTotalHits)?.value ?? Number(searchResults.hits.total)

  return {
    hits: totalHits,
    documents
  }
}

export const routes = (router: KoaRouter) => {
  router.get('/search', async (ctx) => {
    const { query, start, size } = ctx.request.query
    if (!query) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: query' }
      return
    }
  
    try
    {
      const results = await search(query, start ? Number(start) : 0, size ? Number(size) : 20)
      ctx.body = { results: results.documents, hits: results.hits, query: query }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })
}