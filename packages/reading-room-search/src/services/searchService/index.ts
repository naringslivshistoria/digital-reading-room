import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document } from '../../common/types'
import config from '../../common/config'
import {
  QueryDslQueryContainer,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types'

const client = new Client({
  node: config.elasticSearch.url,
})

const createAccessFilter = (
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined
): QueryDslQueryContainer[] | undefined => {
  const accessFilter: QueryDslQueryContainer[] = []

  if (depositors) {
    depositors.forEach((depositor) => {
      accessFilter.push({
        term: {
          'fields.depositor.value.keyword': depositor,
        },
      })
    })
  }

  if (archiveInitiators) {
    archiveInitiators.forEach((archiveInitiator) => {
      accessFilter.push({
        term: {
          'fields.archiveInitiator.value.keyword': archiveInitiator,
        },
      })
    })
  }

  return accessFilter.length == 0 ? undefined : accessFilter
}

const createSearchQuery = (
  queryString: string,
  accessFilter: QueryDslQueryContainer[] | undefined,
  filterString: string | undefined
) => {
  const must: QueryDslQueryContainer[] = [
    {
      query_string: {
        query: queryString,
      },
    },
  ]

  const searchQuery = {
    bool: {
      must,
      should: accessFilter,
      minimum_should_match: 1,
    },
  }

  if (filterString) {
    console.log(filterString)
    const regex = /(\S*):(\S*)/g

    filterString.match(regex)?.forEach((match) => {
      console.log('match', match)
      const filterTerm = match.split(':')
      const wildcard: { [k: string]: string } = {}
      wildcard[`fields.${filterTerm[0]}.value.keyword`] = filterTerm[1]
      searchQuery.bool.must.push({
        wildcard,
      })
    })
  }

  return searchQuery
}

const search = async (
  query: string | string[],
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  start = 0,
  size = 20,
  filter: string | string[] | undefined
) => {
  const queryString = Array.isArray(query) ? query[0] : query
  const filterString = Array.isArray(filter) ? query[0] : filter

  const accessFilter = createAccessFilter(depositors, archiveInitiators)
  const searchQuery = createSearchQuery(queryString, accessFilter, filterString)

  console.log(
    'query string',
    queryString,
    'filter string',
    filterString,
    'search query',
    JSON.stringify(searchQuery, null, 2)
  )

  const searchResults = await client.search({
    from: start,
    size: size,
    track_total_hits: true,
    index: config.elasticSearch.indexName,
    query: searchQuery,
  })

  const documents = searchResults.hits.hits.map((searchHit): Document => {
    return searchHit._source as Document
  })

  const totalHits =
    (searchResults.hits.total as SearchTotalHits)?.value ??
    Number(searchResults.hits.total)

  return {
    hits: totalHits,
    documents,
  }
}

export const routes = (router: KoaRouter) => {
  router.get('(.*)/search', async (ctx) => {
    const { query, start, size, filter } = ctx.request.query
    if (!query) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: query' }
      return
    }

    try {
      const results = await search(
        query,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        start ? Number(start) : 0,
        size ? Number(size) : 20,
        filter
      )
      ctx.body = {
        results: results.documents,
        hits: results.hits,
        query: query,
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err }
    }
  })
}
