import type { Session } from '@/entities/session'
import { calculateAccuracy } from '@/entities/session'
import styles from './game-hud.module.scss'

interface GameHudProps {
  session: Session
  elapsedTime: number
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function GameHud({ session, elapsedTime }: GameHudProps) {
  const accuracy = session.roundResults.length > 0 ? calculateAccuracy(session) : 0

  return (
    <div className={styles.hud}>
      <div className={styles.timerContainer}>
        <div className={styles.timerLabel}>Time</div>
        <div className={styles.timerValue}>{formatTime(elapsedTime)}</div>
      </div>
      <div className={styles.info}>
        <div className={styles.round}>
          Round {session.currentIndex + 1} / {session.twisters.length}
        </div>
        <div className={styles.accuracy}>
          Accuracy: {accuracy}%
        </div>
      </div>
    </div>
  )
}
