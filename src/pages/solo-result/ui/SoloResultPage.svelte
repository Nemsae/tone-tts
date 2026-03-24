<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { loadFinalResult, clearFinalResult, type FinalResult } from '@/entities/session';
  import { onMount } from 'svelte';
  import styles from './solo-result.module.scss';

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  let result = $state<FinalResult | null>(null);

  onMount(() => {
    result = loadFinalResult();
  });

  function handlePlayAgain() {
    clearFinalResult();
    push('/');
  }
</script>

{#if !result}
  <div class={styles.page}>
    <div class={styles.container}>
      <p>Loading...</p>
    </div>
  </div>
{:else}
  {@const message = result.accuracy >= 85 ? "Amazing! You're a tongue twister master!" : result.accuracy >= 70 ? 'Great job! Keep practicing!' : 'Good effort! Try again!'}
  <div class={styles.page}>
    <div class={styles.container}>
      <h1 class={styles.title}>Game Over!</h1>

      <div class={styles.scoreCard}>
        <div class={styles.scoreLabel}>Accuracy</div>
        <div class={styles.scoreValue}>{result.accuracy}%</div>
      </div>

      <div class={styles.scoreCard}>
        <div class={styles.scoreLabel}>Time</div>
        <div class={styles.scoreValue}>{formatTime(result.elapsedTime)}</div>
      </div>

      <p class={styles.message}>{message}</p>

      <div class={styles.buttons}>
        <button class={styles.playAgainButton} onclick={handlePlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  </div>
{/if}
