// Simple mock of the agent until the real RAG module exists. Gives the same
// answer regardless of question and user; the real agent filters on the
// student's access rights via RLS. All data here is made up.
import { setTimeout as sleep } from 'timers/promises'

import config from '../../common/config'
import { AgentEvent, AgentRequest, Source } from './types'

const SOURCES: Source[] = [
  {
    marker: 1,
    documentId: 900001,
    page: 4,
    title: 'Styrelseprotokoll 1923',
    depositor: 'Exempeldeponenten',
    archiveInitiator: 'Exempel AB',
    seriesSignature: 'A1',
    seriesName: 'Styrelseprotokoll',
    volume: '1',
    snippet: '…beslöts att utöka exporten till Norge och Danmark…',
  },
  {
    marker: 2,
    documentId: 900002,
    page: 1,
    title: 'Brev till agenten i Oslo',
    depositor: 'Exempeldeponenten',
    archiveInitiator: 'Exempel AB',
    seriesSignature: 'E1',
    seriesName: 'Korrespondens',
    volume: '3',
    snippet: '…bekräftar härmed den första leveransen…',
  },
]

const SOURCED_TEXT =
  'Enligt styrelseprotokollet från 1923 beslöt Exempel AB att utöka exporten till Norge och Danmark [1]. Ett brev samma år bekräftar den första leveransen till Oslo [2].'

const GENERAL_TEXT =
  'Det här stycket är mockdata och visar hur allmän kunskap utan källor i arkivet presenteras.'

const FOLLOWUPS = [
  'Vilka andra länder exporterade Exempel AB till?',
  'Vem satt i styrelsen 1923?',
]

async function* streamWords(
  section: 'sourced' | 'general',
  text: string,
  signal?: AbortSignal
): AsyncGenerator<AgentEvent> {
  for (const word of text.split(/(?<=\s)/)) {
    if (config.agent.mockDelayMs > 0) {
      await sleep(config.agent.mockDelayMs, undefined, { signal })
    }
    yield { event: 'delta', data: { section, text: word } }
  }
}

export async function* mockAgent({
  signal,
}: AgentRequest): AsyncGenerator<AgentEvent> {
  yield { event: 'sources', data: { sources: SOURCES } }
  yield* streamWords('sourced', SOURCED_TEXT, signal)
  yield* streamWords('general', GENERAL_TEXT, signal)
  yield { event: 'citations', data: { valid: [1, 2], invalid: [] } }
  yield { event: 'followups', data: { questions: FOLLOWUPS } }
  yield { event: 'done', data: { finishReason: 'stop' } }
}
