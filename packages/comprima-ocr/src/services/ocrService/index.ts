import KoaRouter from '@koa/router'
import { Client } from '@elastic/elasticsearch'
import config from '../../common/config'
import axios from 'axios'
import ocr from './ocr'

const client = new Client({
  node: config.elasticSearch.url,
})

const getAttachment = async (documentId: string) => {
  const url = `${
    process.env.COMPRIMA_ADAPTER__URL || 'https://comprima.dev.cfn.iteam.se'
  }/document/${documentId}/attachment`
  const response = await axios({
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
    },
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

    try {
      console.log('Processing', documentId)
      const attachment = await getAttachment(documentId)
      console.log('Retrieved attachment', attachment.data.length)

      let ocrText: string
      if (attachment.data.length > 100000000) {
        ocrText = await ocr(attachment.data, attachment.headers['content-type'])
        console.log('OCR complete')
      } else {
        console.log('Attachment too large', attachment.data.length)
        ocrText = '--- extsz ---'
      }

      await addOcrTextToDocument(documentId, ocrText)
      ctx.body = { results: ocrText }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err }
    }
  })
}
