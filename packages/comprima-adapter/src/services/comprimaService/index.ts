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

// video/mp4 only — never a bare includes('mp4'), which wrongly catches audio/mp4.
const isTranscodableVideo = (t: string) => {
  const v = t.toLowerCase()
  return v.startsWith('video/') && v.includes('mp4')
}

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

      // The document format is the authoritative content type and is available
      // before fetching the attachment, which lets us decide whether to
      // transcode. Only a video/mp4 is transcoded — audio/mp4 (and any other
      // audio type) must pass through untouched, since the ffmpeg branch maps a
      // mandatory video stream (0:v:0) that audio-only files do not have.
      let contentType = document.fields.format?.value ?? ''
      let isVideoMp4 = isTranscodableVideo(contentType)

      // We withhold the Range header for video/mp4 because that branch buffers
      // and transcodes the whole file. Note this is NOT what protects ffmpeg
      // from a truncated slice: the 47% of video docs with no `format` are
      // pre-decided as non-video here (empty format) and so DO get Range
      // forwarded upstream — they only flip to transcode after the post-fetch
      // header check below. That is safe purely because Comprima ignores Range
      // entirely and always returns 200 + the full file; byte-range serving
      // never actually happens on the final hop.
      const attachment = await comprimaAdapter.getAttachment(
        document,
        isVideoMp4 ? undefined : rangeHeader
      )
      const attachmentStream = attachment.data as Readable

      if (!contentType) {
        // Edge case: format hint missing, fall back to the upstream content
        // type. Comprima returns Content-Type: video/mp4 for these no-MIME
        // docs, so this fallback covers them. The startsWith('video/') guard in
        // isTranscodableVideo also hardens this path: a stray audio/mp4 response
        // is correctly rejected here rather than pushed into the ffmpeg branch.
        contentType = attachment.headers['content-type'] ?? ''
        isVideoMp4 = isTranscodableVideo(contentType)
      }

      if (isVideoMp4) {
        const tmpPath = join(tmpdir(), `comprima-mp4-${randomBytes(8).toString('hex')}.mp4`)
        const output = new PassThrough()
        let cleanedUp = false
        const cleanup = () => {
          if (!cleanedUp) {
            cleanedUp = true
            unlink(tmpPath, () => {
              /* best-effort cleanup; ignore errors */
            })
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
          '-map', '0:a:0?',
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

        // Kill ffmpeg and clean up if the client disconnects mid-stream so the
        // CPU-intensive process does not run to completion for an aborted request.
        const abort = () => {
          ffmpeg.kill('SIGKILL')
          output.destroy()
          cleanup()
        }
        ctx.req.on('close', abort)
        ffmpeg.on('close', () => {
          ctx.req.off('close', abort)
          if (!useFallback) cleanup()
        })

        // The transcoded stream is a fragmented MP4 of a different length than
        // the source, so the original byte offsets are invalid. Respond 200 and
        // tell the browser not to attempt range requests against it.
        ctx.type = 'video/mp4'
        ctx.response.set('accept-ranges', 'none')
        ctx.body = output
      } else {
        if (attachment.headers['content-range']) {
          ctx.response.set('content-range', attachment.headers['content-range'])
        }
        if (attachment.headers['accept-ranges']) {
          ctx.response.set('accept-ranges', attachment.headers['accept-ranges'])
        }
        if (attachment.status === 206) {
          ctx.status = 206
        }
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
