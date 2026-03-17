<script lang="ts">
  import type { Session } from '@/entities/session';
  import { calculateAccuracy } from '@/entities/session';
  import styles from './game-hud.module.scss';

  interface Props {
    session: Session;
    elapsedTime: number;
  }

  let { session, elapsedTime }: Props = $props();

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const accuracy = $derived(session.roundResults.length > 0 ? calculateAccuracy(session) : 0);
</script>

<div class={styles.hud}>
  <div class={styles.timerContainer}>
    <div class={styles.timerLabel}>Time</div>
    <div class={styles.timerValue}>{formatTime(elapsedTime)}</div>
  </div>
  <div class={styles.info}>
    <div class={styles.round}>
      Round {session.currentIndex + 1} / {session.twisters.length}
    </div>
    <div class={styles.accuracy}>Accuracy: {accuracy}%</div>
  </div>
</div>
