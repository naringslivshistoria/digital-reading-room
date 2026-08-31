import KoaRouter from '@koa/router'

import { Document } from '../../common/types'
import comprimaAdapter from './comprimaAdapter'

import { Readable, PassThrough } from 'stream'
import { pipeline } from 'stream/promises'
import { spawn } from 'child_process'
import { createWriteStream, createReadStream, unlink, ReadStream } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomBytes } from 'crypto'

const batchSize = 10

// video/mp4 only — in this archive that means MPEG-4 Part 2, which browsers
// cannot decode. Never a bare includes('mp4'): that also catches audio/mp4,
// which despite the name is H.264 video that browsers play natively.
const isTranscodableVideo = (t: string) => {
  const v = t.toLowerCase()
  return v.startsWith('video/') && v.includes('mp4')
}

// A 206 means a byte range; so does a Content-Range on a 200, which a
// non-compliant upstream can send. Either way the body is a slice, and a slice
// must never reach the transcoder.
const isPartialResponse = (response: {
  status: number
  headers: Record<string, unknown>
}) => response.status === 206 || Boolean(response.headers['content-range'])

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
      const rangeHeader = ctx.request.headers['range']
      const document = await comprimaAdapter.getDocument(
        parseInt(ctx.params.documentId)
      )

      // The document format is the authoritative content type and is available
      // before fetching the attachment, which lets us decide whether to
      // transcode. Only a video/mp4 is transcoded: in this archive video/mp4
      // means MPEG-4 Part 2, which browsers cannot decode, while audio/mp4 is
      // (despite the MIME name) H.264 video that browsers play natively.
      // audio/mp4 therefore passes through untouched — not because ffmpeg
      // would fail on it, but because re-encoding an already-compatible file
      // only costs CPU and quality. Genuinely audio-only types (audio/mpeg,
      // audio/wav) never match the gate either.
      const formatContentType = document.fields.format?.value ?? ''
      let contentType = formatContentType
      let isVideoMp4 = isTranscodableVideo(contentType)

      // We withhold the Range header for video/mp4 because that branch buffers
      // and transcodes the whole file. The 47% of video docs with no `format`
      // are pre-decided as non-video here (empty format) and so DO get Range
      // forwarded upstream — they only flip to transcode after the post-fetch
      // header check below. Comprima ignores Range today and always answers
      // 200 + the full file, but that is an external, unenforced invariant, so
      // the partial-response guard after the type check re-fetches rather than
      // trusting it. Keep what we actually sent: only a forwarded Range makes a
      // Range-less retry worth attempting.
      const forwardedRange = isVideoMp4 ? undefined : rangeHeader
      let attachment = await comprimaAdapter.getAttachment(
        document,
        forwardedRange
      )

      // Edge case: format hint missing, fall back to the upstream content type.
      // Comprima returns Content-Type: video/mp4 for these no-MIME docs, so this
      // fallback covers them. The startsWith('video/') guard in
      // isTranscodableVideo also hardens this path: a stray audio/mp4 response
      // (H.264 video, already browser-playable) is correctly kept out of the
      // ffmpeg branch rather than being needlessly re-encoded. Run
      // again after a re-fetch, so the decision always describes the body we are
      // about to serve rather than the discarded one.
      const resolveTypeFromUpstream = () => {
        if (formatContentType) return
        contentType = attachment.headers['content-type'] ?? ''
        isVideoMp4 = isTranscodableVideo(contentType)
      }

      resolveTypeFromUpstream()

      const refusePartialBody = () => {
        console.error(
          `Refusing to transcode a partial body for document ${ctx.params.documentId}`
        )
        ctx.status = 502
        ctx.body = {
          errorMessage:
            'Upstream returned a partial response for a video attachment; cannot transcode a partial body',
          documentId: ctx.params.documentId,
        }
      }

      if (isVideoMp4 && isPartialResponse(attachment)) {
        // Feeding a partial slice to ffmpeg yields a silently truncated
        // transcode, so this body is unusable either way — discard it.
        ;(attachment.data as Readable).destroy()

        if (!forwardedRange) {
          // Nothing to retry: we never sent a Range, so a Range-less re-fetch is
          // byte-for-byte the same request and would pull a whole video again
          // only to fail the same way.
          console.error(
            `Upstream returned an unsolicited partial response for video document ${ctx.params.documentId}`
          )
          refusePartialBody()
          return
        }

        // We only learned this was a video after forwarding the client's Range,
        // and upstream honoured it. Re-fetch the whole file once.
        console.warn(
          `Upstream returned a partial response for video document ${ctx.params.documentId}; re-fetching the full file`
        )
        attachment = await comprimaAdapter.getAttachment(document, undefined)
        resolveTypeFromUpstream()

        if (isVideoMp4 && isPartialResponse(attachment)) {
          // Fail closed: a partial body must never reach the transcoder.
          ;(attachment.data as Readable).destroy()
          refusePartialBody()
          return
        }
      }

      const attachmentStream = attachment.data as Readable

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

        // Buffer to disk so ffmpeg can seek backwards to the moov atom (not
        // seekable via pipe). 0o600 keeps the temp file, which may hold
        // restricted archive content, owner-only.
        const fileWrite = createWriteStream(tmpPath, { mode: 0o600 })

        // If the client disconnects during buffering, the post-spawn abort
        // handler does not exist yet and 'close' is never replayed — destroy
        // the streams (with an error, so the buffering promise below settles)
        // to avoid transcoding for a dead request.
        let clientGone = false
        const onClientClose = () => {
          clientGone = true
          attachmentStream.destroy(
            new Error('client disconnected during buffering')
          )
          fileWrite.destroy()
          cleanup()
        }
        ctx.req.on('close', onClientClose)

        // pipeline() pipes, propagates errors and destroys both streams on
        // failure; the temp file is ours, so cleanup() stays explicit.
        try {
          await pipeline(attachmentStream, fileWrite)
        } catch (err) {
          cleanup()
          throw err
        }

        ctx.req.off('close', onClientClose)
        if (clientGone || ctx.req.destroyed) {
          cleanup()
          return
        }

        const ffmpeg = spawn('ffmpeg', [
          '-hide_banner',
          '-loglevel', 'error',
          '-i', tmpPath,
          '-map', '0:v:0',
          '-map', '0:a:0?',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', 'frag_keyframe+empty_moov',
          '-f', 'mp4',
          'pipe:1',
        ])
        ffmpeg.stderr.on('data', (data) => console.error('[ffmpeg]', data.toString()))
        let useFallback = false
        let fallbackStream: ReadStream | undefined
        ffmpeg.on('error', (err) => {
          useFallback = true
          console.error(
            `ffmpeg unavailable for document ${ctx.params.documentId}, falling back to direct stream: ${err.message}`
          )
          const fallback = createReadStream(tmpPath)
          fallbackStream = fallback
          fallback.pipe(output)
          // The exit handler returns early for the fallback, so the fallback's
          // own terminal handlers release the client-disconnect listener.
          fallback.on('close', () => {
            ctx.req.off('close', abort)
            cleanup()
          })
          fallback.on('error', (e) => {
            output.destroy(e)
            ctx.req.off('close', abort)
            cleanup()
          })
        })
        // When spawn fails, stdout ends immediately; a plain pipe would end
        // `output` before the fallback's data flows, producing an empty 200
        ffmpeg.stdout.pipe(output, { end: false })

        // Kill ffmpeg and clean up if the client disconnects mid-stream so the
        // CPU-intensive process does not run to completion for an aborted request.
        const abort = () => {
          ffmpeg.kill('SIGKILL')
          fallbackStream?.destroy()
          output.destroy()
          cleanup()
        }
        ctx.req.on('close', abort)
        ffmpeg.on('close', (code) => {
          if (useFallback) return // the fallback owns the response and cleanup

          ctx.req.off('close', abort)
          cleanup()
          if (code === 0) {
            output.end()
          } else {
            console.error(
              `[ffmpeg] exited with code ${code} for document ${ctx.params.documentId}`
            )
            // Never end() a failed transcode: a clean terminating chunk presents a
            // truncated file as complete. Destroying aborts the chunked transfer so
            // the client sees an error instead of a short video. Koa only turns a
            // body error into a response before the headers go out, so tear the
            // response down too — otherwise a mid-stream failure hangs the client.
            output.destroy(new Error(`ffmpeg exited with code ${code}`))
            ctx.res.destroy()
          }
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
