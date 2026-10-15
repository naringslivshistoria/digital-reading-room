import KoaRouter from '@koa/router'
import { PassThrough } from 'stream'

import { streamChat } from './llmClient'
import { ChatMessage } from '../../common/types'

const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY = 20

const parseMessages = (body: unknown): ChatMessage[] | null => {
  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0) return null
  if (messages.length > MAX_HISTORY) return null

  const valid = messages.every(
    (m) =>
      (m?.role === 'user' || m?.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH
  )
  if (!valid || messages[messages.length - 1].role !== 'user') return null

  return messages.map((m) => ({ role: m.role, content: m.content }))
}

const sseEvent = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

export const routes = (router: KoaRouter) => {
  /**
   * POST /chat
   * Body: { messages: [{ role: 'user' | 'assistant', content: string }] }
   * Response: text/event-stream with the events `delta`, `done` and `error`.
   */
  router.post('/chat', async (ctx) => {
    const messages = parseMessages(ctx.request.body)
    if (!messages) {
      ctx.status = 400
      ctx.body = {
        message: `Body must be { messages: [...] } with 1-${MAX_HISTORY} messages, the last from 'user', max ${MAX_MESSAGE_LENGTH} chars each`,
      }
      return
    }

    const abort = new AbortController()
    ctx.req.on('close', () => abort.abort())

    const stream = new PassThrough()
    ctx.request.socket.setTimeout(0)
    ctx.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    ctx.status = 200
    ctx.body = stream

    void (async () => {
      try {
        for await (const delta of streamChat(messages, abort.signal)) {
          stream.write(sseEvent('delta', { text: delta }))
        }
        stream.write(sseEvent('done', {}))
      } catch (error) {
        if (!abort.signal.aborted) {
          console.error('LLM error:', error)
          stream.write(
            sseEvent('error', { message: 'Could not generate an answer' })
          )
        }
      } finally {
        stream.end()
      }
    })()
  })
}
