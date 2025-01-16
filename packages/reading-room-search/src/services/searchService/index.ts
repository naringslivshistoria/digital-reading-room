import KoaRouter from '@koa/router'
import { FilterType, FieldFilterConfig } from '../../common/types'
import { findParents, search, setValues } from './queryFunctions'

export const routes = (router: KoaRouter) => {
  router.get('(.*)/search/get-field-filters', async (ctx) => {
    const filter = ctx.query.filter

    const fieldFilterConfigs: FieldFilterConfig[] = [
      {
        fieldName: 'attachmentType',
        displayName: 'Mediatyp',
        filterType: FilterType.values,
        visualSize: 3,
      },
      {
        fieldName: 'depositor',
        displayName: 'Deponent',
        filterType: FilterType.values,
        visualSize: 4,
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
        visualSize: 2,
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
      ctx.state?.user?.series,
      ctx.state?.user?.volumes,
      ctx.state?.user?.documentIds,
      ctx.state?.user?.fileNames,
      'values'
    )

    await setValues(
      standaloneConfigs,
      undefined,
      ctx.state?.user?.depositors,
      ctx.state?.user?.archiveInitiators,
      ctx.state?.user?.series,
      ctx.state?.user?.volumes,
      ctx.state?.user?.documentIds,
      ctx.state?.user?.fileNames,
      'allValues'
    )

    const dependentConfigs = fieldFilterConfigs.filter((filterConfig) => {
      return filterConfig.parentField !== undefined
    })

    for (const filterConfig of dependentConfigs) {
      // Recursively include all ancestors to avoid false matches when
      // several archives have the same series names etc.

      const parents = findParents(filterConfig, fieldFilterConfigs)
      const parentFilters = filter
        ? (filter as string).split('||').filter((filterPart) => {
            return parents.some((parent) => {
              return parent === filterPart.split('::')?.[0]
            })
          })
        : []

      const parentFilter = parentFilters.join('||')
      await setValues(
        [filterConfig],
        parentFilter,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        ctx.state?.user?.series,
        ctx.state?.user?.volumes,
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
        ctx.state?.user?.series,
        ctx.state?.user?.volumes,
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
