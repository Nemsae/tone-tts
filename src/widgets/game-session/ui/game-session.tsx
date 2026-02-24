/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Session, ScoringResult } from '@/entities/session'
import { scoreTwister } from '@/entities/session'
import type { Twister } from '@/shared/vendor'
import { useSpeech } from '@/shared/ui/use-speech'
import { getCurrentTwister, advanceSession, addRoundResult, isSessionComplete, calculateAccuracy, saveSession } from '@/entities/session'
import { GameHud } from './game-hud'
import styles from './game-session.module.scss'
import twisterCardStyles from './twister-card.module.scss'

interface GameSessionProps {
  session: Session
  onSessionChange: (session: Session) => void
  onComplete: (result: { accuracy: number; elapsedTime: number }) => void
}

const DEFAULT_AUTO_CHECK_DELAY = 1500

interface TwisterCardProps {
  twister: Twister
  matchedWords?: boolean[]
  wordsAttempted?: number
}

function TwisterCard({ twister, matchedWords, wordsAttempted }: TwisterCardProps) {
  const words = twister.text.split(' ')
  const difficultyLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

  return (
    <div className={twisterCardStyles.card}>
      <div className={twisterCardStyles.header}>
        <span className={twisterCardStyles.topic}>{twister.topic}</span>
        <span className={twisterCardStyles.difficulty}>{difficultyLabels[twister.difficulty]}</span>
      </div>
      <div className={twisterCardStyles.text}>
        {words.map((word, index) => {
          const isMatched = matchedWords?.[index]
          const hasBeenAttempted = wordsAttempted !== undefined && index < wordsAttempted
          return (
            <span
              key={index}
              className={`${twisterCardStyles.word} ${isMatched === true ? twisterCardStyles.matched : ''} ${isMatched === false && hasBeenAttempted ? twisterCardStyles.unmatched : ''}`}
            >
              {word}{' '}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function GameSession({ session: initialSession, onSessionChange, onComplete }: GameSessionProps) {
  const [session, setSession] = useState(initialSession)
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null)
  const [liveMatchedWords, setLiveMatchedWords] = useState<boolean[] | undefined>(undefined)
  const [liveWordsAttempted, setLiveWordsAttempted] = useState<number | undefined>(undefined)
const [autoCheckDelay] = useState(DEFAULT_AUTO_CHECK_DELAY)
  const [autoCheckEnabled] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null)
  const [totalPausedTime, setTotalPausedTime] = useState(0)
const autoCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasListeningRef = useRef(false)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedTimeRef = useRef(0)

  const { isListening, transcript, error, startListening, stopListening } = useSpeech()

  const currentTwister = getCurrentTwister(session)

  const handleScore = useCallback(() => {
    if (!currentTwister || !transcript) return

    const result = scoreTwister(transcript, currentTwister.text)
    setScoringResult(result)

    if (result.isMatch) {
      const newSession = addRoundResult(session, { twisterId: currentTwister.id, similarity: result.similarity })
      setSession(newSession)
      onSessionChange(newSession)
      saveSession(newSession)
    }
  }, [currentTwister, transcript, session, onSessionChange])

  useEffect(() => {
    if (!isListening) {
      setLiveMatchedWords(undefined)
      setLiveWordsAttempted(undefined)
      return
    }

    if (wasListeningRef.current && transcript && autoCheckEnabled && autoCheckDelay > 0) {
      autoCheckTimerRef.current = setTimeout(() => {
        handleScore()
      }, autoCheckDelay)
    }

    wasListeningRef.current = isListening

    return () => {
      if (autoCheckTimerRef.current) {
        clearTimeout(autoCheckTimerRef.current)
      }
    }
  }, [isListening, transcript, autoCheckEnabled, autoCheckDelay, handleScore])

  useEffect(() => {
    if (!currentTwister || !transcript) {
      return
    }

    const result = scoreTwister(transcript, currentTwister.text)
    setLiveMatchedWords(result.matchedWords)
    setLiveWordsAttempted(result.wordsAttempted)
  }, [transcript, currentTwister])

  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setHasMicPermission(true)
      } catch {
        setHasMicPermission(false)
      }
    }
    checkMicPermission()
  }, [])

  const handleNext = useCallback(() => {
    if (!currentTwister) return

    setScoringResult(null)
    wasListeningRef.current = false
    if (autoCheckTimerRef.current) {
      clearTimeout(autoCheckTimerRef.current)
    }

setTimeout(() => {
      const nextSession = advanceSession(session)

      if (isSessionComplete(nextSession)) {
        const accuracy = calculateAccuracy(nextSession)
        onComplete({ accuracy, elapsedTime: elapsedTimeRef.current })
      } else {
        setSession(nextSession)
        onSessionChange(nextSession)
        saveSession(nextSession)
      }
    }, 500)
  }, [currentTwister, session, onComplete, onSessionChange])

  useEffect(() => {
    if (scoringResult?.isMatch) {
      const timer = setTimeout(() => {
        handleNext()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [scoringResult, handleNext])

useEffect(() => {
    if (gameStarted && gameStartTime && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        const currentTime = Date.now()
        const pausedTime = pauseStartTime ? currentTime - pauseStartTime : 0
        const newElapsedTime = currentTime - gameStartTime - totalPausedTime - pausedTime
        setElapsedTime(newElapsedTime)
        elapsedTimeRef.current = newElapsedTime
      }, 100)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [gameStarted, gameStartTime, isPaused, pauseStartTime, totalPausedTime])

  const handleStartGame = useCallback(() => {
    setGameStartTime(Date.now())
    setGameStarted(true)
    startListening()
  }, [startListening])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    setPauseStartTime(Date.now())
    stopListening()
  }, [stopListening])

  const handleResume = useCallback(() => {
    if (pauseStartTime) {
      setTotalPausedTime((prev) => prev + Date.now() - pauseStartTime)
    }
    setIsPaused(false)
    setPauseStartTime(null)
    startListening()
  }, [pauseStartTime, startListening])

  if (!currentTwister) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.session}>
      {!gameStarted && (
        <div className={styles.preGame}>
          <div className={styles.gameInfo}>
            <h2>Game Session</h2>
            <div className={styles.gameInfoItem}>
              <span className={styles.gameInfoLabel}>Theme:</span>
              <span className={styles.gameInfoValue}>{session.settings?.topic}</span>
            </div>
            <div className={styles.gameInfoItem}>
              <span className={styles.gameInfoLabel}>Difficulty:</span>
              <span className={styles.gameInfoValue}>
                {session.settings?.length === 'short' ? 'Easy' : session.settings?.length === 'medium' ? 'Medium' : session.settings?.length === 'long' ? 'Hard' : session.settings?.length === 'custom' ? 'Custom' : session.settings?.length}
                {session.settings?.length === 'custom' && session.settings?.customLength ? ` (${session.settings.customLength} words)` : ''}
              </span>
            </div>
            <div className={styles.gameInfoItem}>
              <span className={styles.gameInfoLabel}>Rounds:</span>
              <span className={styles.gameInfoValue}>{session.settings?.rounds}</span>
            </div>
            {hasMicPermission === false && (
              <div className={styles.error}>
                Microphone access is required. Please enable it in your browser settings and refresh the page.
              </div>
            )}
          </div>
          <button className={styles.micButton} onClick={handleStartGame}>
            Start Speaking
          </button>
        </div>
      )}

      {gameStarted && (
        <>
          <GameHud session={session} elapsedTime={elapsedTime} />

          <TwisterCard twister={currentTwister} matchedWords={scoringResult?.matchedWords ?? liveMatchedWords} wordsAttempted={scoringResult?.wordsAttempted ?? liveWordsAttempted} />

          <div className={styles.controls}>
            <div className={styles.transcript}>
              {transcript || (isListening ? 'Listening...' : 'Press the button and speak')}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {scoringResult && (
              <div className={`${styles.result} ${scoringResult.isMatch ? styles.success : styles.failure}`}>
                {scoringResult.isMatch ? 'Great job!' : `Try again! (${scoringResult.similarity}% match)`}
              </div>
            )}

<div className={styles.buttons}>
              {!isListening ? (
                <button className={styles.micButton} onClick={startListening}>
                  Start Listening
                </button>
              ) : (
                <button className={`${styles.micButton} ${styles.listening}`} onClick={handlePause}>
                  Stop
                </button>
              )}

              {scoringResult && !scoringResult.isMatch && (
                <button className={styles.nextButton} onClick={handleNext}>
                  Skip
                </button>
              )}
            </div>
          </div>

          {isPaused && (
            <div className={styles.pauseOverlay}>
              <div className={styles.pauseModal}>
                <h2>Game Paused</h2>
                <p>Take a break! Click resume when you're ready to continue.</p>
                <button className={styles.resumeButton} onClick={handleResume}>
                  Resume Game
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
