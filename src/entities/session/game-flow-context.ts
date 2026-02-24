import { createContext, useContext } from 'react'
import type { Twister, TwisterTopic } from '@/shared/vendor'
import type { GameSettings } from './model'

export type GameScreen = 'home' | 'play' | 'game-over'

export interface GameFlowContextValue {
  screen: GameScreen
  topic: TwisterTopic | string
  length: 'short' | 'medium' | 'long' | 'custom'
  customLength?: number
  rounds: number
  twisters: Twister[]
  currentTwisterIndex: number
  finalAccuracy: number
  finalTime: number
  startGame: (settings: GameSettings, twisters: Twister[]) => void
  finishGame: (result: { accuracy: number; elapsedTime: number }) => void
  returnHome: () => void
  replay: () => void
  nextTwister: () => void
  updateRounds: (rounds: number) => void
}

export const GameFlowContext = createContext<GameFlowContextValue | null>(null)

export function useGameFlow(): GameFlowContextValue {
  const context = useContext(GameFlowContext)

  if (context === null) {
    throw new Error('useGameFlow must be used within the game provider.')
  }

  return context
}
