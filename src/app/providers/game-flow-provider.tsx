import { useState, type ReactNode } from 'react'
import { GameFlowContext, type GameScreen, type TwisterTopic, type GameSettings } from './game-flow-context'
import type { Twister, TwisterLength } from '@/shared/vendor'

interface GameFlowProviderProps {
  children: ReactNode
}



export function GameFlowProvider({ children }: GameFlowProviderProps) {
  const [screen, setScreen] = useState<GameScreen>('home')
  const [topic, setTopic] = useState<TwisterTopic | string>('Animals')
  const [length, setLength] = useState<TwisterLength>('medium')
  const [customLength, setCustomLength] = useState<number | undefined>(undefined)
  const [rounds, setRounds] = useState(5)
  const [twisters, setTwisters] = useState<Twister[]>([])
  const [currentTwisterIndex, setCurrentTwisterIndex] = useState(0)
  const [finalAccuracy, setFinalAccuracy] = useState(0)
  const [finalTime, setFinalTime] = useState(0)

  const startGame = (settings: GameSettings, generatedTwisters: Twister[]) => {
    setTopic(settings.topic)
    setLength(settings.length)
    setCustomLength(settings.customLength)
    setRounds(settings.rounds)
    setTwisters(generatedTwisters)
    setCurrentTwisterIndex(0)
    setScreen('play')
  }

  const nextTwister = () => {
    setCurrentTwisterIndex((prev) => prev + 1)
  }

  const finishGame = (result: { accuracy: number; elapsedTime: number }) => {
    setFinalAccuracy(result.accuracy)
    setFinalTime(result.elapsedTime)
    setScreen('game-over')
  }

  const returnHome = () => {
    setScreen('home')
    setFinalAccuracy(0)
    setFinalTime(0)
    setTwisters([])
    setCurrentTwisterIndex(0)
  }

  const replay = () => {
    setCurrentTwisterIndex(0)
    setFinalAccuracy(0)
    setFinalTime(0)
    setScreen('play')
  }

  return (
    <GameFlowContext.Provider
      value={{
        screen,
        topic,
        length,
        customLength,
        rounds,
        twisters,
        currentTwisterIndex,
        finalAccuracy,
        finalTime,
        startGame,
        finishGame,
        returnHome,
        replay,
        nextTwister,
      }}
    >
      {children}
    </GameFlowContext.Provider>
  )
}
