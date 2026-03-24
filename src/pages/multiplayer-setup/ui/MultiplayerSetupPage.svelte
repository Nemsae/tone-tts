<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import { gameSettingsStore, type GameSettings } from '@/entities/session';
  import type { GameSettings as MultiplayerGameSettings, Player } from '@/shared/lib/multiplayer-types';
  import { GameSettingsForm } from '@/widgets/game-settings-form';
  import styles from './multiplayer-setup.module.scss';

  let step = $state<'setup' | 'lobby'>('setup');
  let playerName = $state('');
  let isCreatingRoom = $state(false);
  let isStartingGame = $state(false);
  let error = $state('');
  let roomCode = $state<string | null>(null);
  let players = $state<Player[]>([]);

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
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('player-joined');
    socket.off('player-left');
    socket.off('game-started');
  });

  async function handleCreateRoom() {
    if (!playerName.trim()) {
      error = 'Please enter your name';
      return;
    }

    const topic = gameSettingsStore.topic;
    if (!topic) {
      error = 'Please select or enter a topic';
      return;
    }

    error = '';
    isCreatingRoom = true;

    const settings: MultiplayerGameSettings = {
      topic,
      length: gameSettingsStore.length,
      customLength: gameSettingsStore.length === 'custom' ? gameSettingsStore.customLength : undefined,
      rounds: gameSettingsStore.rounds,
    };

    socket.emit('create-room', { playerName: playerName.trim(), settings }, (response: any) => {
      isCreatingRoom = false;
      if (response.success) {
        roomCode = response.roomCode;
        players = response.game.players;
        multiplayerGameStore.handleCreateRoom(response);
        step = 'lobby';
      } else {
        error = response.error || 'Failed to create room';
      }
    });
  }

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
    {#if step === 'setup'}
      <button class={styles.backButton} onclick={handleBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <GameSettingsForm
        title="multiplayer session setup"
        subtitle="configure your game room and invite friends to play"
        submitText="create room"
        onSubmit={handleCreateRoom}
        isLoading={isCreatingRoom}
        {error}
        showCustomDifficulty={false}
      >
        {#snippet children()}
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <h2 class={styles.sectionTitle}>your name</h2>
              <p class={styles.sectionDescription}>how players will see you</p>
            </div>
            <div class={styles.sectionContent}>
              <input
                type="text"
                class={styles.textInput}
                placeholder="Enter your name"
                bind:value={playerName}
              />
            </div>
          </div>
        {/snippet}
      </GameSettingsForm>
    {:else if step === 'lobby'}
      <button class={styles.backButton} onclick={handleBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Leave Room
      </button>

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

      <button class={styles.startButton} onclick={handleStartGame} disabled={isStartingGame || players.length < 1}>
        {isStartingGame ? 'Starting...' : 'Start Game'}
      </button>
    {/if}
  </div>
</div>
