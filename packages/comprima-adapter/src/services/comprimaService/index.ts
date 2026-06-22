import KoaRouter from '@koa/router'

import { Document } from '../../common/types'
import comprimaAdapter from './comprimaAdapter'

import { Readable, PassThrough } from 'stream'
import { spawn } from 'child_process'
import { createWriteStream, createReadStream, unlink } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomBytes } from 'crypto'

const batchSize = 10

const healthCheck = async () => {
  await comprimaAdapter.getDocuments('34913', 0, 1)
}

const search = async (level: string, skip?: number, maxResults?: number): Promise<Document[]> => {
  let lastSetSize = batchSize
  const totalResults = Array<Document>()
  let currentSkip = skip ?? 0
  while (lastSetSize === batchSize) {
    const startTime = Date.now()
    const result = await comprimaAdapter.getDocuments(
      level,
      currentSkip,
      batchSize
    )
    totalResults.push(...result)
    lastSetSize = result.length
    const elapsedTime = Date.now() - startTime

    console.info(
      `Successfully retrieved documents ${currentSkip + 1} to ${
        currentSkip + lastSetSize
      } in ${elapsedTime} ms`
    )
    currentSkip += batchSize

    if (maxResults && totalResults.length >= maxResults) {
      break
    }
  }

  return totalResults
}

export const routes = (router: KoaRouter) => {
  router.get('/documents', async (ctx) => {
    const { query } = ctx.request
    if (!query.level) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing parameter: level' }
      return
    }

    try {
      const level = Array.isArray(query.level) ? query.level[0] : query.level
      const results = await search(level)
      ctx.body = {
        numResults: results.length,
        results: results,
        freeTextQuery: ctx.request.query.freeTextQuery,
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err }
    }
  })

  router.get('/document/:documentId/attachment', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }

    try {
      const rangeHeader = ctx.request.headers['range'] as string | undefined
      const document = await comprimaAdapter.getDocument(
        parseInt(ctx.params.documentId)
      )
      const attachment = await comprimaAdapter.getAttachment(document, rangeHeader)
      const attachmentStream = attachment.data as Readable

      const contentType = document.fields.format?.value ?? attachment.headers['content-type'] ?? ''
      const isMp4 = contentType.toLowerCase().includes('mp4')

      if (attachment.headers['content-range']) {
        ctx.response.set('content-range', attachment.headers['content-range'])
      }
      if (attachment.headers['accept-ranges']) {
        ctx.response.set('accept-ranges', attachment.headers['accept-ranges'])
      }
      if (attachment.status === 206) {
        ctx.status = 206
      }

      if (isMp4) {
        const tmpPath = join(tmpdir(), `comprima-mp4-${randomBytes(8).toString('hex')}.mp4`)
        const output = new PassThrough()
        let cleanedUp = false
        const cleanup = () => {
          if (!cleanedUp) {
            cleanedUp = true
            unlink(tmpPath, () => {})
          }
        }

        // Buffer to disk so ffmpeg can seek backwards to the moov atom (not seekable via pipe)
        const fileWrite = createWriteStream(tmpPath)
        attachmentStream.pipe(fileWrite)
        await new Promise<void>((resolve, reject) => {
          fileWrite.on('finish', resolve)
          fileWrite.on('error', reject)
          attachmentStream.on('error', reject)
        })

        const ffmpeg = spawn('ffmpeg', [
          '-hide_banner',
          '-loglevel', 'error',
          '-i', tmpPath,
          '-map', '0:v:0',
          '-map', '0:a:0',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'copy',
          '-movflags', 'frag_keyframe+empty_moov',
          '-f', 'mp4',
          'pipe:1',
        ])
        ffmpeg.stderr.on('data', (data) => console.error('[ffmpeg]', data.toString()))
        let useFallback = false
        ffmpeg.on('error', (err) => {
          useFallback = true
          console.warn('ffmpeg unavailable, falling back to direct stream:', err.message)
          const fallback = createReadStream(tmpPath)
          fallback.pipe(output)
          fallback.on('close', cleanup)
        })
        ffmpeg.stdout.pipe(output)
        ffmpeg.on('close', () => {
          if (!useFallback) cleanup()
        })

        ctx.type = 'video/mp4'
        ctx.body = output
      } else {
        ctx.type = contentType
        ctx.body = attachmentStream
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { results: 'error: ' + err }
    }
  })

  router.get('/document/:documentId', async (ctx) => {
    if (!ctx.params.documentId) {
      ctx.status = 400
      ctx.body = { errorMessage: 'Missing document id' }
      return
    }

    try {
      const results = await comprimaAdapter.getDocument(
        parseInt(ctx.params.documentId)
      )
      ctx.body = results
    } catch (err) {
      ctx.status = 500
      console.error(err)
      ctx.body = { results: 'error: ' + err }
    }
  })
}

export default {
  healthCheck,
  search,
  getDocument: comprimaAdapter.getDocument,
}
