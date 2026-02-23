import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadFinalResult, clearFinalResult, type FinalResult } from '@/entities/session'
import styles from '../game-over.module.scss'

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

export function GameOverPage() {
  const navigate = useNavigate()
  const [result] = useState<FinalResult | null>(() => loadFinalResult())

  const handlePlayAgain = () => {
    clearFinalResult()
    navigate('/')
  }

  const handleHome = () => {
    clearFinalResult()
    navigate('/')
  }

  if (!result) {
    navigate('/')
    return null
  }

  let message = ''
  if (result.accuracy >= 85) {
    message = "Amazing! You're a tongue twister master!"
  } else if (result.accuracy >= 70) {
    message = 'Great job! Keep practicing!'
  } else {
    message = 'Good effort! Try again!'
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Game Over!</h1>

        <div className={styles.scoreCard}>
          <div className={styles.scoreLabel}>Accuracy</div>
          <div className={styles.scoreValue}>{result.accuracy}%</div>
        </div>

        <div className={styles.scoreCard}>
          <div className={styles.scoreLabel}>Time</div>
          <div className={styles.scoreValue}>{formatTime(result.elapsedTime)}</div>
        </div>

        <p className={styles.message}>{message}</p>

        <div className={styles.buttons}>
          <button className={styles.playAgainButton} onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className={styles.homeButton} onClick={handleHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
