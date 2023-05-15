import KoaRouter from '@koa/router'
import { Client, errors } from '@elastic/elasticsearch'
import { Document } from '../../common/types'
import config from '../../common/config'
import axios from 'axios'
import fs from 'fs'
import { arch } from 'os'

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
  archiveInitiators: string[] | undefined
) => {
  const hasAccess =
    depositors?.includes(document.fields.archiveInitiator?.value) ||
    archiveInitiators?.includes(document.fields.depositor?.value)

  return hasAccess
}

const getDocument = async (
  id: string,
  depositors: string[] | undefined,
  archiveInitiators: string[] | undefined
) => {
  try {
    const result = await client.get({
      index: config.elasticSearch.indexName,
      id: id,
    })

    const document = result._source as Document

    if (!checkDocumentAccess(document, depositors, archiveInitiators)) {
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
        ctx.state.user.archiveInitiators,
        ctx.state.user.depositors
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
        ctx.state.user.archiveInitiators,
        ctx.state.user.depositors
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
        ctx.state.user.archiveInitiators,
        ctx.state.user.archiveInitiators
      )

      if (document) {
        const thumbnail = fs.createReadStream(
          process.cwd() + '/../thumbnails/' + documentId + '.jpg'
        )

        ctx.response.set('content-type', 'image/jpg')
        ctx.body = thumbnail
      }
    } catch (err) {
      ctx.status = 500

      if (err instanceof DocumentNotFoundError) {
        ctx.status = 404
      }

      ctx.body = { results: 'error: ' + err }
    }
  })
}
