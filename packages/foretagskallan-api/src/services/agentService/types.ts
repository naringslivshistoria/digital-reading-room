// The boundary between the chat and the agent (RAG). The agent looks up the
// student's access rights itself via RLS from userId, so none are passed here.
import { ChatMessage } from '../../common/types'

export interface AgentRequest {
  userId: string // `sub` from the verified JWT, never from the request body
  messages: ChatMessage[]
  signal?: AbortSignal
}

// Field names follow the reading room's ES documents (fields.title, fields.depositor etc.).
export interface Source {
  marker: number // the number in [1] in the answer text
  documentId: number // the ES document's id
  page?: number // 1 = first page
  title: string
  depositor: string
  archiveInitiator?: string
  seriesSignature?: string
  seriesName?: string
  volume?: string
  snippet: string
}

export type AgentEvent =
  | { event: 'sources'; data: { sources: Source[] } }
  | { event: 'delta'; data: { section: 'sourced' | 'general'; text: string } }
  | { event: 'citations'; data: { valid: number[]; invalid: number[] } }
  | { event: 'followups'; data: { questions: string[] } }
  | { event: 'done'; data: { finishReason: 'stop' } }
