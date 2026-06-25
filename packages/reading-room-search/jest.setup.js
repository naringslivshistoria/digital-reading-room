// Polyfill Web platform globals that undici (via @elastic/elasticsearch)
// references at module-load time but which jest-environment-node's VM
// sandbox does not expose. Guarded so this is a no-op where they exist.
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web')
const { TextEncoder, TextDecoder } = require('node:util')
const { MessageChannel, MessagePort } = require('node:worker_threads')

const globals = {
  ReadableStream,
  WritableStream,
  TransformStream,
  TextEncoder,
  TextDecoder,
  MessageChannel,
  MessagePort,
}

for (const [name, value] of Object.entries(globals)) {
  if (typeof globalThis[name] === 'undefined') {
    globalThis[name] = value
  }
}
