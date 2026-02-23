export type TwisterLength = 'short' | 'medium' | 'long' | 'custom'

export interface Twister {
  id: string
  text: string
  difficulty: 1 | 2 | 3
  topic: 'Animals' | 'Tech' | 'Food'
  length?: TwisterLength
}
