import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import config from '../../common/config'
import Axios from 'Axios'
import ocr from './ocr'

const client = new Client({
  node: config.elasticSearch.url
})

const getAttachment = async (documentId : string) => {
  const url = `${process.env.COMPRIMA_ADAPTER_URL || 'https://comprima.dev.cfn.iteam.se'}/document/${documentId}/attachment`
  const response = await Axios({
    method: 'get',
    url: url,
    responseType: 'arraybuffer',
  })  

  return response
}

const addOcrTextToDocument = async (documentId: string, text: string) => {
  await client.update({
    id: documentId,
    index: 'comprima',
    doc: {
      ocrText: text,
    }
  })
}

export const routes = (router: KoaRouter) => {
  router.get('/ocr/:documentId', async (ctx) => {
    const { documentId } = ctx.params
    if (!documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: document Id' }
      return
    }
  
    try
    {
      const attachment = await getAttachment(documentId)
      const ocrText = await ocr(attachment.data, attachment.headers['content-type'])

      await addOcrTextToDocument(documentId, ocrText)
          
      ctx.body = { results: ocrText }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err}
    }
  })
}