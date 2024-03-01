import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
  QueryDslTermQuery,
  QueryDslWildcardQuery,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types'
import { Document, FieldFilterConfig } from '../../common/types'
import config from '../../common/config'
import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: config.elasticSearch.url,
})

const numericFields: Record<string, boolean> = {
  volume: true,
}

const pageTypeConfig = [
  {
    values: ['Image'],
    description: 'Bild (Foton & Inscanningar)',
  },
  {
    values: ['Film', 'Text', 'Unknown'],
    description: 'Ljud & Video',
  },
  {
    values: ['PDF', 'Word', 'Powerpoint', 'Excel'],
    description: 'Dokument',
  },
]

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
        const should: QueryDslQueryContainer[] = []

        filterTerm[1].split('%%').forEach((value) => {
          const term: Record<string, QueryDslTermQuery> = {}
          term[getFullFieldName(filterTerm[0])] = {
            value,
          }

          should.push({ term })
        })

        searchQuery.bool.must.push({
          bool: { should },
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
      } else if (filterTerm[0] === 'pageType') {
        const terms: { [k: string]: string[] } = {}

        const config = pageTypeConfig.find(
          (c) => c.description == filterTerm[1]
        )
        if (config) {
          terms[`${getFullFieldName(filterTerm[0])}`] = config.values

          searchQuery.bool.must.push({
            terms,
          })
        }
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

export const setValues = async (
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
              case 'pageType': {
                //group pageTypes
                const config = pageTypeConfig.find(
                  (c) => c.values[c.values.indexOf(bucket.key)]
                )
                return config?.description
              }
              case 'seriesName': {
                return bucket.key
                  .filter((k: string) => k && k != '')
                  .join(' - ')
              }
              default:
                return bucket.key
            }
          })
          .filter((value: string) => value)
          .filter((value: string, index: number, array: Array<string>) => {
            //distinct
            return array.indexOf(value) === index
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

export const search = async (
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

export const findParents = (
  filter: FieldFilterConfig | undefined,
  filters: FieldFilterConfig[]
): string[] => {
  const parentFieldNames: string[] = []

  if (!filter || !filter.parentField) {
    return []
  }

  parentFieldNames.push(filter.parentField)
  const parentFilter = filters.find((f) => {
    return f.fieldName === filter.parentField
  })

  return findParents(parentFilter, filters).concat(parentFieldNames)
}
