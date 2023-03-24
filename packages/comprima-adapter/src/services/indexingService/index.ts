import { Client } from '@elastic/elasticsearch'
import { promises as fs } from 'fs'
import axios from 'axios'

import { Document } from '../../common/types'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
})

const thumbnailTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/apng',
  'image/avif',
  'image/svg',
  'image/svg+xml',
]

const saveThumbnail = async (document: Document) => {
  if (document.pages[0].thumbnailUrl) {
    const response = await axios.get(document.pages[0].thumbnailUrl, { responseType: 'arraybuffer' })

    if (thumbnailTypes.includes(response.headers['content-type'].toLowerCase())) {
      await fs.writeFile(process.cwd() + '/../thumbnails/' + document.id + '.jpg', response.data, 'binary')
      return true
    } else {
      console.error('Rejected thumbnail type', response.headers['content-type'].toLowerCase())
    }
  }

  return false
}

const indexDocument = async (document: Document) => {
  try {
    const hasValidThumbnail = await saveThumbnail(document)

    if (!hasValidThumbnail) {
      document.pages[0].thumbnailUrl = undefined
    }

    await client.index({
      index: 'comprima',
      id: document.id.toString(),
      document
    })
  } catch (err) {
    console.error(err)
  }
}

export default {
  indexDocument
}