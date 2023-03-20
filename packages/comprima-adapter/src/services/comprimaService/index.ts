import KoaRouter from '@koa/router'

import { Document } from '../../common/types'
import comprimaAdapter from './comprimaAdapter'

const batchSize = 10

const search = async (freeTextQuery: string | string[], levels: string[], skip?: number) : Promise<Document[]> => {
  let lastSetSize = batchSize
  const totalResults = Array<Document>()
  let currentSkip = skip ?? 0
  while (lastSetSize === batchSize) {
    const result = await comprimaAdapter.searchDocuments(freeTextQuery, levels, currentSkip, batchSize)
    totalResults.push(...result)
    lastSetSize = result.length
    currentSkip += batchSize
    
    console.info('Successfully retrieved batch of', batchSize)
  }

  return totalResults
}

export const routes = (router: KoaRouter) => {
  router.get('/search', async (ctx) => {
    const { query } = ctx.request
    if (!query.query) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: query' }
      return
    }
    if (!query.levels) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: levels' }
      return
    }
  
    try
    {
      const levels = Array.isArray(query.levels) ? query.levels : query.levels.split(',')
      const results = await search(query.query, levels)
      ctx.body = { numResults: results.length, results: results, freeTextQuery: ctx.request.query.freeTextQuery }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  });

  router.get('/document/:documentId/attachment', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }
  
    try
    {
      const document = await comprimaAdapter.getDocument(parseInt(ctx.params.documentId))
      const attachment = await comprimaAdapter.getAttachment(document)

      ctx.set('content-type', document.fields.mimeType?.value)
      ctx.body = attachment.data
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })  
  
  router.get('/document/:documentId', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }
  
    try
    {
      const results = await comprimaAdapter.getDocument(parseInt(ctx.params.documentId))
      ctx.body = results
    } catch (err) {
      ctx.status = 500
      console.error(err)
      ctx.body = { results: 'error: ' + err}
    }
  })  
}

export default {
  search,
  getDocument: comprimaAdapter.getDocument
}
