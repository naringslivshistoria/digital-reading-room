import { Client } from '@elastic/elasticsearch'
import config from '../../common/config'
import log from '../../common/log'
import { detectObjects } from './cocoAdapter'
import { AttachmentType, Document } from '../../common/types'
import { pageTypeToAttachmentType } from '../../common/translations'

const client = new Client({
  node: config.elasticSearch.url,
})

export const recognizeNext = async () => {
  const next = await client.search<Document>({
    index: config.elasticSearch.indexName,
    from: 0,
    size: 100,
    query: {
      bool: {
        must_not: {
          exists: {
            field: 'attachmentType',
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

const documentFalseObjects: Record<string, boolean> = {
  refrigerator: true,
  tv: true,
  clock: true,
  book: true,
  'stop sign': true,
  laptop: true,
  'traffic light': true,
  remote: true,
  toilet: true,
  microwave: true,
}

const updateAttachmentType = async (
  document: Document,
  attachmentType: AttachmentType
) => {
  await client.update()
}

const recognizeAttachment = async (document: Document) => {
  const results = await detectObjects(document.id.toString())

  let attachmentType: AttachmentType

  if (results) {
    for (const result of results) {
      if (!documentFalseObjects[result.class]) {
        attachmentType = 'Foto'
        break
      }
    }
  }

  if (!attachmentType) {
    attachmentType =
      pageTypeToAttachmentType[document.pages[0].pageType.toLowerCase()]
  }

  await updateAttachmentType(document, attachmentType)
}
