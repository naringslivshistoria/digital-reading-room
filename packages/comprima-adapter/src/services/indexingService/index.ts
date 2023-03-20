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
  const response = await axios.get(document.pages[0].thumbnailUrl, { responseType: 'arraybuffer' })

  if (thumbnailTypes.includes(response.headers['content-type'].toLowerCase())) {
    await fs.writeFile(process.cwd() + '/../thumbnails/' + document.id + '.jpg', response.data, 'binary')
  } else {
    console.error('Rejected thumbnail type', response.headers['content-type'].toLowerCase())
  }
}

const indexDocument = async (document: Document) => {
  try {
    await client.index({
      index: 'comprima',
      id: document.id.toString(),
      document
    })

    await saveThumbnail(document)
  } catch (err) {
    console.error(err)
  }
}

export default {
  indexDocument
}