import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import { Document } from '../../common/types'
import config from '../../common/config'
import Axios from 'axios'

const getAttachmentStream = async (id: string) => {
  const url = `${process.env.COMPRIMA_ADAPTER_URL || 'https://comprima.dev.cfn.iteam.se'}/document/${id}/attachment`
  const response = await Axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  })  

  return response
}

const client = new Client({
  node: config.elasticSearch.url
})

const getDocument = async (id: string) => {
  const result = await client.get({
    index: config.elasticSearch.indexName,
    id: id
  })

  const document = result._source as Document

  return document
}

export const routes = (router: KoaRouter) => {
  router.get('/document/:id', async (ctx) => {
    const { id } = ctx.params
    if (!id) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: id' }
      return
    }
  
    try
    {
      const results = await getDocument(id)
      ctx.body = { results: results }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })

  router.get('/document/:id/attachment/:filename*', async (ctx) => {
    const { id } = ctx.params
    if (!id) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: id' }
      return
    }
  
    try
    {
      const response = await getAttachmentStream(id)
      ctx.type = response.headers['content-type']?.toString() ?? 'image/jpeg'
      ctx.body = response.data
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })
}