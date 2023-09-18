import { Client } from '@elastic/elasticsearch'
import axios from 'axios'
import config from '../../common/config'
import log from '../../common/log'

const client = new Client({
  node: config.elasticSearch.url,
})

const ocrUrl = config.ocrUrl

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

const supportedExtensions = [
  '*.jpg',
  '*.jpeg',
  '*.png',
  '*.gif',
  '*.pdf',
  '*.tif',
  '*.tiff',
]

const markAsFailed = async (documentId: string) => {
  await client.update({
    id: documentId,
    index: 'comprima',
    doc: {
      ocrText: '--- exterr ---',
    },
  })
}

export const ocrNext = async () => {
  const next = await client.search({
    index: 'comprima',
    from: 0,
    size: 10,
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
    console.log('Queuing', document._id)
    return axios.get(ocrUrl + '/ocr/' + document._id).catch(async (error) => {
      console.log('Marking document as failed', document._id)
      await markAsFailed(document._id)
    })
  })

  const results = await Promise.all(ocrTasks)

  console.log('Batch done')

  return 1
}
