import KoaRouter from '@koa/router'
import { Client, errors } from '@elastic/elasticsearch'
import { Document } from '../../common/types'
import config from '../../common/config'
import axios from 'axios'
import fs from 'fs'

class DocumentNotFoundError extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DocumentNotFoundError.prototype)
  }
}

const getAttachmentStream = async (id: string) => {
  const url = `${
    config.comprimaAdapter?.url || 'https://comprima.dev.cfn.iteam.se'
  }/document/${id}/attachment`

  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  })

  return response
}

const client = new Client({
  node: config.elasticSearch.url,
})

const checkDocumentAccess = (
  document: Document,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  series: string[] | undefined,
  volumes: string[] | undefined,
  documentIds: string[] | undefined,
  fileNames: string[] | undefined
) => {
  const hasAccessToArchive = (): Boolean => {
    let hasAccess = false
    archiveInitiators?.forEach((archiveInitiator) => {
      if (
        document.fields.depositor?.value == archiveInitiator.split('>')[0] &&
        document.fields.archiveInitiator?.value ==
          archiveInitiator.split('>')[1]
      ) {
        hasAccess = true
      }
    })
    return hasAccess
  }
  const hasAccessToSeries = () => {
    series?.forEach((serie) => {
      if (
        document.fields.depositor?.value == serie.split('>')[0] &&
        document.fields.archiveInitiator?.value == serie.split('>')[1] &&
        document.fields.seriesName?.value == serie.split('>')[2]
      )
        return true
    })
    return false
  }

  const hasAccessToVolumes = () => {
    let hasAccess = false
    volumes?.forEach((volume) => {
      if (
        document.fields.depositor?.value == volume.split('>')[0] &&
        document.fields.archiveInitiator?.value == volume.split('>')[1] &&
        document.fields.seriesName?.value == volume.split('>')[2] &&
        document.fields.volume?.value == volume.split('>')[3]
      )
        hasAccess = true
    })
    return hasAccess
  }

  const hasAccess =
    depositors?.includes(document.fields.depositor?.value) ||
    hasAccessToArchive() ||
    hasAccessToSeries() ||
    hasAccessToVolumes() ||
    documentIds?.includes(document.id.toString()) ||
    fileNames?.includes(document.fields.filename?.toString())

  return hasAccess
}

const getDocument = async (
  id: string,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined,
  series: string[] | undefined,
  volumes: string[] | undefined,
  documentIds: string[] | undefined,
  fileNames: string[] | undefined
) => {
  try {
    const result = await client.get({
      index: config.elasticSearch.indexName,
      id: id,
    })

    const document = result._source as Document

    if (
      !checkDocumentAccess(
        document,
        depositors,
        archiveInitiators,
        series,
        volumes,
        documentIds,
        fileNames
      )
    ) {
      throw new DocumentNotFoundError('Document not found')
    }

    return document
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if ((err as errors.ResponseError).meta.statusCode === 404) {
        throw new DocumentNotFoundError('Document not found')
      }
    }

    throw err
  }
}

export const routes = (router: KoaRouter) => {
  router.get('(.*)/document/:id', async (ctx) => {
    const { id } = ctx.params

    try {
      const results = await getDocument(
        id,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        ctx.state?.user?.series,
        ctx.state?.user?.volumes,
        ctx.state?.user?.documentIds,
        ctx.state?.user?.fileNames
      )
      ctx.body = { results: results }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err }
    }
  })

  router.get('(.*)/document/:id/attachment/:filename*', async (ctx) => {
    const { id } = ctx.params
    if (!id) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: id' }
      return
    }

    try {
      // Try to get document to verify that it is indexed in elasticsearch and
      // that attachment thereby is allowed to be retrieved
      const document = await getDocument(
        id,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        ctx.state?.user?.series,
        ctx.state?.user?.volumes,
        ctx.state.user.documentIds,
        ctx.state.user.fileNames
      )

      if (!document) {
        ctx.status = 404
        return
      }

      const response = await getAttachmentStream(id)
      ctx.type = response.headers['content-type']?.toString() ?? 'image/jpeg'
      ctx.body = response.data
    } catch (err) {
      if (err instanceof DocumentNotFoundError) {
        ctx.status = 404
        ctx.body = { results: 'error: document not found' }
      } else {
        ctx.status = 500
        ctx.body = { results: 'error: ' + err }
      }
    }
  })

  router.get('(.*)/document/:documentId/thumbnail', async (ctx) => {
    const { documentId } = ctx.params
    if (!documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: documentId' }
      return
    }

    try {
      // Try to get document to verify that it is indexed in elasticsearch and
      // that attachment thereby is allowed to be retrieved
      const document = await getDocument(
        documentId,
        ctx.state?.user?.depositors,
        ctx.state?.user?.archiveInitiators,
        ctx.state?.user?.series,
        ctx.state?.user?.volumes,
        ctx.state?.user?.documentIds,
        ctx.state?.user?.fileNames
      )

      if (!document) {
        ctx.status = 404
        return
      }

      const dirName =
        process.cwd() + '/../thumbnails/' + documentId.substring(0, 3) + '/'

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true })
      }

      const thumbnail = fs.createReadStream(dirName + documentId + '.jpg')

      ctx.response.set('content-type', 'image/jpg')
      ctx.body = thumbnail
    } catch (err) {
      ctx.status = 500

      if (err instanceof DocumentNotFoundError) {
        ctx.status = 404
      }

      ctx.body = { results: 'error: ' + err }
    }
  })
}
