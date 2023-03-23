import KoaRouter from '@koa/router'
import comprima from './services/comprimaService'
import index from './services/indexingService'
import { routes as comprimaRoutes } from './services/comprimaService'

const router = new KoaRouter()

router.get('/', async (ctx) => {
  ctx.body = 'Hello world'
});

router.get('/index/:documentId', async (ctx) => {
  if (!ctx.params.documentId) {
    ctx.status = 400
    ctx.body = { errorMessage: 'Missing document id' }
    return
  }

  try
  {
    const document = await comprima.getDocument(parseInt(ctx.params.documentId))
    await index.indexDocument(document)
    ctx.body = { result: 'success' }
  } catch (err) {
    ctx.status = 500
    ctx.body = { results: 'error: ' + err}
  }
})

router.get('/indexlevels', async (ctx) => {
  if (!ctx.query.levels) {
    ctx.status = 400
    ctx.body = { errorMessage: 'Missing parameter: levels' }
    return
  }

  let skip = 0
  if (ctx.query.skip) {
    skip = parseInt(Array.isArray(ctx.query.skip) ? ctx.query.skip[0] : ctx.query.skip)
  }

  try
  {
    const levels = Array.isArray(ctx.query.levels) ? ctx.query.levels : ctx.query.levels.split(',')
    const results = await comprima.search(levels, skip)

    let successful = 0

    await Promise.all(
      results.map(async (document) => {
        try {
          await index.indexDocument(document)
          successful++
         } catch (err) {
          console.error(err)
         }
  
         return document
      }, 0)
    )

    ctx.body = { result: { successful: successful, failed: results.length - successful } }
  } catch (err) {
    ctx.status = 500
    ctx.body = { results: 'error: ' + err}
  }
})

comprimaRoutes(router)

export default router
