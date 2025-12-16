import { Client } from '@elastic/elasticsearch'
import axios from 'axios'
import FormData from 'form-data'
import config from '../../common/config'
import log from '../../common/log'

interface OcrApiResponse {
  document: {
    filename: string
    mime_type: string
    page_count: number
    pages: Array<{
      page_index: number
      image_text: string
      image_description: string
    }>
    full_text: string
  }
}

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
): Promise<OcrApiResponse> => {
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

  return response.data as OcrApiResponse
}

const saveOcrData = async (
  documentId: string,
  ocrResponse: OcrApiResponse
) => {
  const { document } = ocrResponse

  const ocrContent = document.full_text
  const ocrDescription = document.pages
    .map((page) => page.image_description)
    .filter(Boolean)
    .join('\n')
  const ocrMetadata = JSON.stringify({
    filename: document.filename,
    mime_type: document.mime_type,
    page_count: document.page_count,
    pages: document.pages.map((page) => ({
      page_index: page.page_index,
      image_text: page.image_text,
    })),
  })

  await client.update({
    id: documentId,
    index: config.elasticSearch.indexName,
    doc: {
      ocrContent,
      ocrDescription,
      ocrMetadata,
      ocrStatus: 'success',
    },
  })
}

const markAsFailed = async (documentId: string) => {
  await client.update({
    id: documentId,
    index: config.elasticSearch.indexName,
    doc: {
      ocrStatus: 'error',
    },
  })
}

const markAsTooLarge = async (documentId: string) => {
  await client.update({
    id: documentId,
    index: config.elasticSearch.indexName,
    doc: {
      ocrStatus: 'too_large',
    },
  })
}

const processDocument = async (documentId: string) => {
  try {
    log.info(`Processing ${documentId}`)
    const attachment = await getAttachment(documentId)
    log.info(`Retrieved attachment, size: ${attachment.data.length}`)

    if (attachment.data.length >= MAX_ATTACHMENT_SIZE) {
      log.warn(`Attachment too large: ${attachment.data.length}`)
      await markAsTooLarge(documentId)
      return true
    }

    const ocrResponse = await callOcrApi(
      attachment.data,
      attachment.headers['content-type']
    )
    log.info('OCR complete')

    await saveOcrData(documentId, ocrResponse)
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
            field: 'ocrStatus',
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
