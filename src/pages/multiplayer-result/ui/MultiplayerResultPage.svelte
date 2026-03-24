<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { multiplayerGameStore } from '@/shared/lib';
  import type { LeaderboardEntry } from '@/shared/lib/multiplayer-types';
  import styles from './multiplayer-result.module.scss';

  let leaderboard = $state<LeaderboardEntry[]>([]);
  let roomCode = $state<string | null>(null);

  onMount(() => {
    const store = $multiplayerGameStore;
    leaderboard = store.leaderboard;
    roomCode = store.roomCode;
  });

  function handlePlayAgain() {
    push('/');
  }

  function handlePlayAgainMultiplayer() {
    push('/multiplayer-setup');
  }

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  function getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }
</script>

<div class={styles.page}>
  <div class={styles.container}>
    <h1 class={styles.title}>Game Over!</h1>

    {#if roomCode}
      <div class={styles.roomCodeDisplay}>
        <span class={styles.roomCodeLabel}>Room</span>
        <span class={styles.roomCode}>{roomCode}</span>
      </div>
    {/if}

    {#if leaderboard.length > 0}
      <div class={styles.leaderboard}>
        <h2 class={styles.leaderboardTitle}>Leaderboard</h2>
        {#each leaderboard as entry, index}
          <div class="{styles.leaderboardItem} {index === 0 ? styles.firstPlace : ''}">
            <span class={styles.rank}>{getRankEmoji(index + 1)}</span>
            <span class={styles.playerName}>{entry.player.name}</span>
            <span class={styles.playerAccuracy}>{entry.accuracy}%</span>
            <span class={styles.playerTime}>{formatTime(entry.time)}</span>
          </div>
        {/each}
      </div>
    {:else}
      <div class={styles.noResults}>
        <p>No results available</p>
      </div>
    {/if}

    <div class={styles.buttons}>
      <button class={styles.playAgainButton} onclick={handlePlayAgainMultiplayer}>
        Play Again
      </button>
      <button class={styles.homeButton} onclick={handlePlayAgain}>
        Back to Home
      </button>
    </div>
  </div>
</div>
