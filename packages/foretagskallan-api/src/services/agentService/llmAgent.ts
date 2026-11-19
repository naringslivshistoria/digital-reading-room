// Calls the LLM directly without vector search, so the answer has no sources.
// Only for trying a real model before the RAG agent exists.
import { streamChat } from './llmClient'
import { AgentEvent, AgentRequest } from './types'

export async function* llmAgent({
  messages,
  signal,
}: AgentRequest): AsyncGenerator<AgentEvent> {
  for await (const text of streamChat(messages, signal)) {
    yield { event: 'delta', data: { section: 'general', text } }
  }
  yield { event: 'done', data: { finishReason: 'stop' } }
}
