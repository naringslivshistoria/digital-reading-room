import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document, FilterType, FieldFilterConfig } from '../../common/types'
import config from '../../common/config'
import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
  QueryDslTermQuery,
  QueryDslWildcardQuery,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types'

const client = new Client({
  node: config.elasticSearch.url,
})

const numericFields: Record<string, boolean> = {
  volume: true,
}

const getFullFieldName = (fieldName: string) => {
  switch (fieldName) {
    case 'pageType':
      return `pages.${fieldName}.keyword`
    case 'volume':
      return `fields.${fieldName}.value`
    default:
      return `fields.${fieldName}.value.keyword`
  }
}

const createAccessFilter = (
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  documentIds: string[] | undefined,
  fileNames: string[] | undefined
): QueryDslQueryContainer[] | undefined => {
  const accessFilter: QueryDslQueryContainer[] = []

  if (depositors) {
    accessFilter.push({
      terms: {
        'fields.depositor.value.keyword': depositors,
      },
    })
  }

  if (archiveInitiators) {
    accessFilter.push({
      terms: {
        'fields.archiveInitiator.value.keyword': archiveInitiators,
      },
    })
  }

  if (documentIds) {
    accessFilter.push({
      terms: {
        id: documentIds,
      },
    })
  }

  if (fileNames) {
    accessFilter.push({
      terms: {
        'fields.filename.value.keyword': fileNames,
      },
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
      filter: {
        bool: { should: accessFilter },
      },
    },
  }

  if (filterString) {
    const filters = filterString.split('||')

    filters.forEach((filter) => {
      const filterTerm = filter.split('::')
      if (numericFields[filterTerm[0]]) {
        const term: Record<string, QueryDslTermQuery> = {}
        term[getFullFieldName(filterTerm[0])] = {
          value: filterTerm[1],
        }

        searchQuery.bool.must.push({
          term,
        })
      } else if (filterTerm[0] === 'location' || filterTerm[0] === 'time') {
        const wildcard: { [k: string]: QueryDslWildcardQuery } = {}

        wildcard[`${getFullFieldName(filterTerm[0])}`] = {
          value: filterTerm[1] + '*',
          case_insensitive: true,
        }
        searchQuery.bool.must.push({
          wildcard,
        })
      } else if (filterTerm[0] === 'seriesName') {
        const terms: { [k: string]: string[] } = {}
        terms[`${getFullFieldName(filterTerm[0])}`] = filterTerm[1]
          .split('%%')
          .map((t) => t.split(' - ').slice(-1)[0])
        searchQuery.bool.must.push({
          terms,
        })
      } else {
        const terms: { [k: string]: string[] } = {}

        terms[`${getFullFieldName(filterTerm[0])}`] = filterTerm[1].split('%%')

        searchQuery.bool.must.push({
          terms,
        })
      }
    })
  }

  return searchQuery
}

const setValues = async (
  fieldFilterConfigs: FieldFilterConfig[],
  filter: string[] | string | undefined,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  documentIds: string[] | undefined,
  fileNames: string[] | undefined,
  valueField: string
) => {
  const aggs: Record<string, AggregationsAggregationContainer> = {}
  const filterString = Array.isArray(filter) ? filter[0] : filter

  fieldFilterConfigs.forEach((fieldFilterConfig) => {
    switch (fieldFilterConfig.fieldName) {
      case 'seriesName':
        aggs[fieldFilterConfig.fieldName] = {
          multi_terms: {
            terms: [
              {
                field: `${getFullFieldName('seriesSignature')}`,
              },
              {
                field: `${getFullFieldName(fieldFilterConfig.fieldName)}`,
              },
            ],
            size: 500,
          },
        }
        break
      default:
        aggs[fieldFilterConfig.fieldName] = {
          terms: {
            field: `${getFullFieldName(fieldFilterConfig.fieldName)}`,
            size: 500,
          },
        }
        break
    }
  })

  const accessFilter = createAccessFilter(
    depositors,
    archiveInitiators,
    documentIds,
    fileNames
  )
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - there is a bug in the ElasticSearch types not exposing buckets
        fieldFilterConfig[valueField] = aggregation.buckets
          .filter((bucket: any) => {
            if (
              fieldFilterConfig.fieldName === 'seriesName' &&
              bucket.key.length > 1 &&
              bucket.key[1] === ''
            )
              return false
            return true
          })
          .map((bucket: any) => {
            switch (fieldFilterConfig.fieldName) {
              case 'seriesName':
                return bucket.key
                  .filter((k: string) => k && k != '')
                  .join(' - ')
              default:
                return bucket.key
            }
          })
          .sort((a: string, b: string) => {
            return a == b ? 0 : a < b ? -1 : 1
          })
      }
    })
  }

  return fieldFilterConfigs
}

const createSortingArray = (sortOrder: any) => {
  const relevanceKeyword = '_score'
  switch (sortOrder.field) {
    case 'relevance':
      return [relevanceKeyword]
    default:
      return [
        { [getFullFieldName(sortOrder.field)]: sortOrder.order },
        relevanceKeyword,
      ]
  }
}

const search = async (
  query: string | string[] | undefined,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  documentIds: [string] | undefined,
  fileNames: [string] | undefined,
  start = 0,
  size = 20,
  filter: string | string[] | undefined,
  sort: string | string[] | undefined,
  sortOrder: string | string[] | undefined
) => {
  const queryString = Array.isArray(query) ? query[0] : query
  const filterString = Array.isArray(filter) ? filter[0] : filter
  const sortString = Array.isArray(sort) ? sort[0] : sort
  const sortOrderString = Array.isArray(sortOrder) ? sortOrder[0] : sortOrder

  const accessFilter = createAccessFilter(
    depositors,
    archiveInitiators,
    documentIds,
    fileNames
  )
  const searchQuery = createSearchQuery(queryString, accessFilter, filterString)
  const sortingArray = createSortingArray({
    field: sortString,
    order: sortOrderString,
  })

  const searchResults = await client.search({
    from: start,
    size: size,
    track_total_hits: true,
    index: config.elasticSearch.indexName,
    query: searchQuery,
    sort: sortingArray,
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

    const fieldFilterConfigs: FieldFilterConfig[] = [
      {
        fieldName: 'location',
        displayName: 'Geografi',
        filterType: FilterType.freeText,
        visualSize: 3,
      },
      {
        fieldName: 'time',
        displayName: 'Årtal',
        filterType: FilterType.freeText,
        visualSize: 3,
      },
      {
        fieldName: 'pageType',
        displayName: 'Mediatyp',
        filterType: FilterType.values,
        visualSize: 3,
      },
      {
        fieldName: 'depositor',
        displayName: 'Deponent',
        filterType: FilterType.values,
        visualSize: 3,
      },
      {
        fieldName: 'archiveInitiator',
        parentField: 'depositor',
        displayName: 'Arkivbildare',
        filterType: FilterType.values,
        visualSize: 3,
      },
      {
        fieldName: 'seriesName',
        parentField: 'archiveInitiator',
        displayName: 'Serie',
        filterType: FilterType.values,
        visualSize: 3,
      },
      {
        fieldName: 'volume',
        parentField: 'seriesName',
        displayName: 'Volym',
        filterType: FilterType.values,
        visualSize: 1,
      },
    ]

    const standaloneConfigs = fieldFilterConfigs.filter((filterConfig) => {
      return !filterConfig.parentField
    })

    await setValues(
      fieldFilterConfigs,
      filter,
      ctx.state?.user?.depositors,
      ctx.state?.user?.archiveInitiators,
      ctx.state?.user?.documentIds,
      ctx.state?.user?.fileNames,
      'values'
    )

    await setValues(
      standaloneConfigs,
      undefined,
      ctx.state?.user?.depositors,
      ctx.state?.user?.archiveInitiators,
      ctx.state?.user?.documentIds,
      ctx.state?.user?.fileNames,
      'allValues'
    )

    const dependentConfigs = fieldFilterConfigs.filter((filterConfig) => {
      return filterConfig.parentField !== undefined
    })

    for (const filterConfig of dependentConfigs) {
      let parentFilter: string | undefined = ''

      if (filter as string) {
        parentFilter = (filter as string).split('||').find((filterPart) => {
          return filterPart.split('::')?.[0] === filterConfig.parentField
        })
      }

      await setValues(
        [filterConfig],
        parentFilter,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        ctx.state?.user?.documentIds,
        ctx.state?.user?.fileNames,
        'allValues'
      )
    }

    ctx.body = fieldFilterConfigs
  })

  router.get('(.*)/search', async (ctx) => {
    const { query, start, size, filter, sort, sortOrder } = ctx.request.query
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
        ctx.state?.user?.documentIds,
        ctx.state?.user?.fileNames,
        start ? Number(start) : 0,
        size ? Number(size) : 20,
        filter,
        sort,
        sortOrder
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
