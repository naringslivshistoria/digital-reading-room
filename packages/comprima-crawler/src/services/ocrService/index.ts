import { Client } from '@elastic/elasticsearch'
import axios from 'axios'
import FormData from 'form-data'
import config from '../../common/config'
import log from '../../common/log'

const client = new Client({
  node: config.elasticSearch.url,
})

const MAX_ATTACHMENT_SIZE = 100000000

const supportedFormats = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'image/tif',
  'image/tiff',
  'image/webp',
]

const getExtension = (mimeType: string): string => {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/tiff': 'tiff',
    'image/webp': 'webp',
  }
  return map[mimeType.toLowerCase()] || 'bin'
}

const getAttachment = async (documentId: string) => {
  const url = `${config.comprimaUrl}/document/${documentId}/attachment`
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'arraybuffer',
  })
  return response
}

const callOcrApi = async (
  fileData: ArrayBuffer,
  contentType: string
): Promise<string> => {
  log.info(`Sending attachment of type ${contentType} to OCR API`)

  const form = new FormData()
  form.append('file', Buffer.from(fileData), {
    filename: `document.${getExtension(contentType)}`,
    contentType: contentType,
  })
  form.append(
    'config_json',
    JSON.stringify({
      description_language: config.ocr.descriptionLanguage,
      dpi: config.ocr.dpi,
    })
  )

  const response = await axios.post(`${config.ocrApiUrl}/ocr`, form, {
    headers: form.getHeaders(),
  })

  return JSON.stringify(response.data)
}

const saveOcrText = async (documentId: string, text: string) => {
  await client.update({
    id: documentId,
    index: config.elasticSearch.indexName,
    doc: {
      ocrText: text,
    },
  })
}

const markAsFailed = async (documentId: string) => {
  await client.update({
    id: documentId,
    index: config.elasticSearch.indexName,
    doc: {
      ocrText: '--- exterr ---',
    },
  })
}

const processDocument = async (documentId: string) => {
  try {
    log.info(`Processing ${documentId}`)
    const attachment = await getAttachment(documentId)
    log.info(`Retrieved attachment, size: ${attachment.data.length}`)

    let ocrText: string
    if (attachment.data.length < MAX_ATTACHMENT_SIZE) {
      ocrText = await callOcrApi(
        attachment.data,
        attachment.headers['content-type']
      )
      log.info('OCR complete')
    } else {
      log.warn(`Attachment too large: ${attachment.data.length}`)
      ocrText = '--- extsz ---'
    }

    await saveOcrText(documentId, ocrText)
    return true
  } catch (error) {
    log.error('OCR failed', error as object)
    await markAsFailed(documentId)
    return false
  }
}

export const ocrNext = async () => {
  const next = await client.search({
    index: config.elasticSearch.indexName,
    from: 0,
    size: config.ocr.batchSize,
    query: {
      bool: {
        must_not: {
          exists: {
            field: 'ocrText',
          },
        },
        must: {
          bool: {
            should: [
              {
                terms: { 'fields.format.value.keyword': supportedFormats },
              },
              {
                match: { 'pages.pageType': 'image' },
              },
              {
                match: { 'fields.filename.value': '*.jpg' },
              },
              {
                match: { 'fields.filename.value': '*.jpeg' },
              },
              {
                match: { 'fields.filename.value': '*.gif' },
              },
              {
                match: { 'fields.filename.value': '*.tif' },
              },
              {
                match: { 'fields.filename.value': '*.tiff' },
              },
              {
                match: { 'fields.filename.value': '*.pdf' },
              },
              {
                match: { 'fields.filename.value': '*.png' },
              },
            ],
          },
        },
      },
    },
  })

  if (next.hits.hits.length === 0) {
    log.info('No more documents to process')
    return null
  } else {
    log.info(`Found ${next.hits.hits.length}`)
  }

  const ocrTasks = next.hits.hits.map((document) => {
    log.info(`Queuing ${document._id}`)
    return processDocument(document._id as string)
  })

  await Promise.all(ocrTasks)

  log.info('Batch done')

  return 1
}
