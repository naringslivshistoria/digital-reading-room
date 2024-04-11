import KoaRouter from '@koa/router'
import comprima from './services/comprimaService'
import index from './services/indexingService'
import { routes as comprimaRoutes } from './services/comprimaService'

const router = new KoaRouter()

router.get('/', async (ctx) => {
  ctx.body = 'Comprima Adapter API'
})

router.get('/healthz', async (ctx) => {
  ctx.body = {
    comprima: 'Not OK',
    elasticSearch: 'Not OK',
  }

  try {
    await comprima.healthCheck()
    ctx.body.comprima = 'OK'
  } catch (error) {
    console.error(error)
    ctx.status = 500
  }

  try {
    await index.healthCheck()
    ctx.body.elasticSearch = 'OK'
  } catch (error) {
    console.error(error)
    ctx.status = 500
  }
})

router.get('/index/:documentId', async (ctx) => {
  if (!ctx.params.documentId) {
    ctx.status = 400
    ctx.body = { errorMessage: 'Missing document id' }
    return
  }

  try {
    const document = await comprima.getDocument(parseInt(ctx.params.documentId))
    await index.indexDocument(document)
    ctx.body = { result: 'success' }
  } catch (err) {
    ctx.status = 500
    ctx.body = { results: 'error: ' + err }
  }
})

router.get('/indexlevel', async (ctx) => {
  if (!ctx.query.level) {
    ctx.status = 400
    ctx.body = { errorMessage: 'Missing parameter: level' }
    return
  }

  let skip = 0
  if (ctx.query.skip) {
    skip = parseInt(
      Array.isArray(ctx.query.skip) ? ctx.query.skip[0] : ctx.query.skip
    )
  }

  try {
    const level = Array.isArray(ctx.query.level)
      ? ctx.query.level[0]
      : ctx.query.level
    const results = await comprima.search(level, skip)

    let successful = 0

    // Do not Promise.all this as concurrent indexing of many documents
    // will use a lot of memory.
    for (const document of results) {
      try {
        document.level = level
        /*        if (
          document.id !== 2203920 &&
          document.id !== 2203921 &&
          document.id !== 2203922
        ) {*/
        await index.indexDocument(document)
        console.log('Successfully indexed document', document.id)
        successful++
        //}
      } catch (err) {
        console.error(err)
      }
    }

    /*await Promise.all(
      results.map(async (document) => {
        try {
          document.level = level;
          await index.indexDocument(document);
          successful++;
        } catch (err) {
          console.error(err);
        }

        return document;
      }, 0)
    );*/

    ctx.body = {
      result: { successful: successful, failed: results.length - successful },
    }
  } catch (err) {
    ctx.status = 500
    ctx.body = { results: 'error: ' + err }
  }
})

comprimaRoutes(router)

export default router
