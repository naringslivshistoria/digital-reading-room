import { Client } from '@elastic/elasticsearch'
import { promises as fs } from 'fs'
import axios from 'axios'

import { Document } from '../../common/types'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
})

const saveThumbnail = async (document: Document) => {
  const response = await axios.get(document.pages[0].thumbnailUrl, { responseType: 'arraybuffer' })
  
  await fs.writeFile(process.cwd() + '/../thumbnails/' + document.id + '.jpg', response.data, 'binary')
}

const indexDocument = async (document: Document) => {
  try {
    await client.index({
      index: 'comprima-prod-3',
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