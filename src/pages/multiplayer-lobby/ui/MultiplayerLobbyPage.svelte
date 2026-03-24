<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import type { Player, GameState } from '@/shared/lib/multiplayer-types';
  import { Button } from '@/shared/ui';
  import styles from './multiplayer-lobby.module.scss';

  let roomCode = $state<string | null>(null);
  let players = $state<Player[]>([]);
  let isStartingGame = $state(false);
  let error = $state('');
  let isHost = $state(false);

  const socket = socketService.connect();

  onMount(() => {
    socket.on('connect', () => {
      multiplayerGameStore.setConnected(true);
    });

    socket.on('disconnect', () => {
      multiplayerGameStore.setConnected(false);
    });

    socket.on('connect_error', (err) => {
      error = `Connection error: ${err.message}`;
    });

    socket.on('player-joined', (data: { player: Player; players: Player[]; game: any }) => {
      players = data.players;
      multiplayerGameStore.handlePlayerJoined(data);
    });

    socket.on('player-left', (data: { playerId: string; players: Player[] }) => {
      players = data.players;
      multiplayerGameStore.handlePlayerLeft(data);
    });

    socket.on('game-started', (data: { game: any; currentTwister: any; roundStartTime: number }) => {
      multiplayerGameStore.handleGameStarted(data);
      push('/multiplayer-game');
    });

    const unsubscribe = multiplayerGameStore.subscribe((store) => {
      const game = store.game as GameState | null;
      if (game) {
        roomCode = game.roomCode;
        players = game.players || [];
        const currentPlayerId = store.player?.id;
        isHost = game.players?.find(p => p.id === currentPlayerId)?.isHost || false;
      }
    });

    return () => {
      unsubscribe();
    };
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('player-joined');
    socket.off('player-left');
    socket.off('game-started');
  });

  function handleStartGame() {
    isStartingGame = true;
    socket.emit('start-game', {}, (response: any) => {
      isStartingGame = false;
      if (!response.success) {
        error = response.error || 'Failed to start game';
      }
    });
  }

  function handleBack() {
    multiplayerGameStore.reset();
    socketService.disconnect();
    push('/');
  }
</script>

<div class={styles.page}>
  <div class={styles.container}>
    <Button variant="tertiary" onclick={handleBack}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Leave Room
    </Button>

    <h1 class={styles.title}>Game Lobby</h1>

    <div class={styles.roomCodeSection}>
      <span class={styles.roomCodeLabel}>Room Code</span>
      <span class={styles.roomCode}>{roomCode}</span>
      <span class={styles.roomCodeHint}>Share this code with friends to join</span>
    </div>

    <div class={styles.playersSection}>
      <h2 class={styles.sectionTitle}>Players ({players.length}/4)</h2>
      <div class={styles.playersList}>
        {#each players as player}
          <div class={styles.playerItem}>
            <span class={styles.playerName}>
              {player.name}
              {#if player.isHost}
                <span class={styles.hostBadge}>Host</span>
              {/if}
            </span>
            <span class={styles.playerStatus}>
              {player.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        {/each}
      </div>
    </div>

    {#if error}
      <div class={styles.error}>{error}</div>
    {/if}

    {#if isHost}
      <Button variant="primary" onclick={handleStartGame} disabled={isStartingGame || players.length < 1}>
        {isStartingGame ? 'Starting...' : 'Start Game'}
      </Button>
    {/if}
  </div>
</div>
