import KoaRouter from '@koa/router'
import fs from 'fs'

export const routes = (router: KoaRouter) => {
  router.get('/thumbnail/:documentId', async (ctx) => {
    const { documentId } = ctx.params
    if (!documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: documentId' }
      return
    }
  
    try
    {
      const thumbnail = fs.createReadStream(process.cwd() + '/../thumbnails/' + documentId + '.jpg')

      ctx.response.set("content-type", 'image/jpg');
      ctx.body = thumbnail
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  });
}