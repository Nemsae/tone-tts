import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export interface TwisterGenerationParams {
  systemPrompt: string
  userMessage: string
}

export async function callOpenAI({ systemPrompt, userMessage }: TwisterGenerationParams): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'o3-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    reasoning_effort: 'low',
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}

export function isApiKeyConfigured(): boolean {
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY)
}
