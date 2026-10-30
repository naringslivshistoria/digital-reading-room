// Thin wrapper around the OpenAI SDK. Works with any provider that has an
// OpenAI-compatible chat completions API; which one is set by config.llm.baseUrl.
import OpenAI from 'openai'

import config from '../../common/config'
import { ChatMessage } from '../../common/types'

let client: OpenAI | undefined

const getClient = () => {
  if (!client) {
    client = new OpenAI({
      baseURL: config.llm.baseUrl,
      apiKey: config.llm.apiKey || 'not-set',
    })
  }
  return client
}

export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string> {
  const stream = await getClient().chat.completions.create(
    {
      model: config.llm.model,
      stream: true,
      messages: [
        { role: 'system', content: config.llm.systemPrompt },
        ...messages,
      ],
    },
    { signal }
  )

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
