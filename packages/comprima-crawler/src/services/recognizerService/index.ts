import { Client } from '@elastic/elasticsearch'
import config from '../../common/config'
import log from '../../common/log'
import { detectObjects } from './cocoAdapter'
import { Document } from '../../common/types'

const client = new Client({
  node: config.elasticSearch.url,
})

export const recognizeNext = async () => {
  const next = await client.search<Document>({
    index: 'comprima',
    from: 0,
    size: 100,
    query: {
      bool: {
        must_not: {
          exists: {
            field: 'ocrText',
          },
        },
      },
    },
  })

  if (next.hits.hits.length === 0) {
    log.info('No more documents to process')
    return 0
  } else {
    log.info(`Found ${next.hits.hits.length}`)
  }

  let recognized = 0

  for (const document of next.hits.hits) {
    if (document._source) {
      await recognizeAttachment(document._source)
      recognized++
    }
  }

  return recognized
}

const recognizeAttachment = async (document: Document) => {
  const result = await detectObjects(document.id.toString())
  return 'photo'

  return 'unknown'
}
