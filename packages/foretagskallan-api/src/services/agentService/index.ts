// Entry point to the agent. The mock is replaced by the real RAG module once it
// exists; the chat and the frontend should not need to change.
import config from '../../common/config'
import { llmAgent } from './llmAgent'
import { mockAgent } from './mockAgent'
import { AgentEvent, AgentRequest } from './types'

export type { AgentEvent, AgentRequest, Source } from './types'

export const askAgent = (request: AgentRequest): AsyncIterable<AgentEvent> =>
  config.agent.mode === 'llm' ? llmAgent(request) : mockAgent(request)
