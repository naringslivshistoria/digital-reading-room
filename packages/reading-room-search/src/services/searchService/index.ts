import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document, FilterType, FieldFilterConfig } from '../../common/types'
import config from '../../common/config'
import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types'

const client = new Client({
  node: config.elasticSearch.url,
})

const numericFields: Record<string, boolean> = {
  volume: true,
}

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
  queryString: string | undefined,
  accessFilter: QueryDslQueryContainer[] | undefined,
  filterString: string | undefined
) => {
  const must: QueryDslQueryContainer[] = []

  if (queryString) {
    must.push({
      query_string: {
        query: queryString,
      },
    })
  }

  const searchQuery = {
    bool: {
      must,
      should: accessFilter,
      minimum_should_match: 1,
    },
  }

  if (filterString) {
    const filters = filterString.split('||')

    filters.forEach((filter) => {
      const filterTerm = filter.split('::')
      const wildcard: { [k: string]: {} } = {}
      const keywordString = numericFields[filterTerm[0]] ? '' : '.keyword'

      wildcard[`fields.${filterTerm[0]}.value${keywordString}`] = {
        value: filterTerm[1],
        case_insensitive: true,
      }
      searchQuery.bool.must.push({
        wildcard,
      })
    })
  }

  return searchQuery
}

const setValues = async (
  fieldFilterConfigs: FieldFilterConfig[],
  filter: string[] | string | undefined,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined
) => {
  const aggs: Record<string, AggregationsAggregationContainer> = {}
  const filterString = Array.isArray(filter) ? filter[0] : filter

  fieldFilterConfigs.forEach((fieldFilterConfig) => {
    const keywordString = numericFields[fieldFilterConfig.fieldName]
      ? ''
      : '.keyword'

    aggs[fieldFilterConfig.fieldName] = {
      terms: {
        field: `fields.${fieldFilterConfig.fieldName}.value${keywordString}`,
        size: 500,
      },
    }
  })

  const accessFilter = createAccessFilter(depositors, archiveInitiators)
  const query = createSearchQuery(undefined, accessFilter, filterString)

  const searchResults = await client.search({
    size: 0,
    index: config.elasticSearch.indexName,
    aggs,
    query,
  })

  if (searchResults.aggregations) {
    fieldFilterConfigs.forEach((fieldFilterConfig) => {
      const aggregation =
        searchResults.aggregations &&
        searchResults.aggregations[fieldFilterConfig.fieldName]

      if (aggregation) {
        // @ts-ignore - there is a bug in the ElasticSearch types not exposing buckets
        fieldFilterConfig.values = aggregation.buckets.map((bucket: any) => {
          return bucket.key
        })
      }
    })
  }

  return fieldFilterConfigs
}

const search = async (
  query: string | string[] | undefined,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  start = 0,
  size = 20,
  filter: string | string[] | undefined
) => {
  const queryString = Array.isArray(query) ? query[0] : query
  const filterString = Array.isArray(filter) ? filter[0] : filter

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
  router.get('(.*)/search/get-field-filters', async (ctx) => {
    const filter = ctx.query.filter

    // dummy implementation
    const fieldFilterConfigs: FieldFilterConfig[] = [
      {
        fieldName: 'depositor',
        displayName: 'Deponent',
        filterType: FilterType.values,
      },
      {
        fieldName: 'archiveInitiator',
        displayName: 'Arkivbildare',
        filterType: FilterType.values,
      },
      {
        fieldName: 'seriesName',
        displayName: 'Serie',
        filterType: FilterType.values,
      },
      {
        fieldName: 'volume',
        displayName: 'Volym',
        filterType: FilterType.values,
      },
      {
        fieldName: 'format',
        displayName: 'Mediatyp',
        filterType: FilterType.values,
      },
    ]

    await setValues(
      fieldFilterConfigs,
      filter,
      ctx.state?.user?.depositors,
      ctx.state?.user?.archiveInitiators
    )

    ctx.body = fieldFilterConfigs
  })

  router.get('(.*)/search', async (ctx) => {
    const { query, start, size, filter } = ctx.request.query
    if (!query && !filter) {
      ctx.status = 400
      ctx.body = {
        errorMessage:
          'Required parameter missing: either query or filter must be specified',
      }
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
