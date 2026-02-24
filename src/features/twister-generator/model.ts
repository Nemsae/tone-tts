import type { Twister, TwisterLength } from '@/shared/vendor'
import { callOpenAI, isApiKeyConfigured } from '@/shared/api'

const PREDEFINED_TOPICS = ['Animals', 'Tech', 'Food'] as const
export type PredefinedTopic = typeof PREDEFINED_TOPICS[number]


function getLengthInstruction(length: TwisterLength, customLength?: number): string {
  if (length === 'custom' && customLength) {
    return `Each tongue twister must be exactly ${customLength} words long.`
  }
  const lengthMap: Record<'short' | 'medium' | 'long', string> = {
    short: 'Keep each tongue twister very brief, around 5 words.',
    medium: 'Make each tongue twister moderately long, around 10 words.',
    long: 'Make each tongue twister quite lengthy, around 20 words.',
  }
  return lengthMap[length as 'short' | 'medium' | 'long']
}
export async function generateAITwisters(
  topic: string,
  length: TwisterLength,
  customLength: number | undefined,
  rounds: number,
): Promise<Twister[]> {
  const lengthInstruction = getLengthInstruction(length, customLength)

  const systemPrompt = `You are a tongue twister generator. Generate ${rounds} unique, fun, and challenging tongue twisters that are difficult to say quickly.
Each tongue twister should feature words related to the topic: ${topic}.
${lengthInstruction}
Return only the tongue twisters, one per line, with no numbering, no explanations, and no additional text.`

  const content = await callOpenAI({
    systemPrompt,
    userMessage: `Generate ${rounds} unique tongue twisters about ${topic}.`,
  })

  const texts = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
  const difficulty = length === 'short' ? 1 : length === 'medium' ? 2 : length === 'long' ? 3 : 2
  const usedTexts = new Set<string>()

  return texts
    .filter((text) => {
      const normalized = text.toLowerCase()
      if (usedTexts.has(normalized)) return false
      usedTexts.add(normalized)
      return true
    })
    .map((text, index) => ({
      id: `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      difficulty: difficulty as 1 | 2 | 3,
      topic: PREDEFINED_TOPICS.includes(topic as PredefinedTopic) ? topic as PredefinedTopic : 'Animals',
      length,
    }))
}

export { isApiKeyConfigured }
