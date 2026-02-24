export type TwisterLength = 'short' | 'medium' | 'long' | 'custom'
export type TwisterTopic = 'Animals' | 'Tech' | 'Food' | string

export interface Twister {
  id: string
  text: string
  difficulty: 1 | 2 | 3
  topic: TwisterTopic
  length?: TwisterLength
}
