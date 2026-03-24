<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import { gameSettingsStore, PREDEFINED_TOPICS, type GameSettings } from '@/entities/session';
  import type { TwisterLength } from '@/shared/vendor';
  import type { GameSettings as MultiplayerGameSettings, Player } from '@/shared/lib/multiplayer-types';
  import styles from './multiplayer-setup.module.scss';

  const DIFFICULTY_OPTIONS: { value: TwisterLength; label: string; words: string }[] = [
    { value: 'short', label: 'Easy', words: '~5 words' },
    { value: 'medium', label: 'Medium', words: '~10 words' },
    { value: 'long', label: 'Hard', words: '~20 words' },
  ];
  const ROUND_MIN = 1;
  const ROUND_MAX = 10;

  let step = $state<'setup' | 'lobby'>('setup');
  let playerName = $state('');
  let isCreatingRoom = $state(false);
  let isStartingGame = $state(false);
  let error = $state('');
  let roomCode = $state<string | null>(null);
  let players = $state<Player[]>([]);
  let customTopicInput = $state('');

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

      <h1 class={styles.title}>Create Multiplayer Game</h1>
      <p class={styles.subtitle}>Set up your game room and invite friends</p>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Your Name</h2>
        <input
          type="text"
          class={styles.textInput}
          placeholder="Enter your name"
          bind:value={playerName}
        />
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Theme</h2>
        <div class={styles.customTopicSection}>
          <input
            type="text"
            class="{styles.textInput} {styles.primaryInput}"
            placeholder="e.g. Marvel Superheroes, Lord of the Rings..."
            bind:value={customTopicInput}
            oninput={() => {
              gameSettingsStore.setCustomTopic(customTopicInput);
            }}
          />
          <span class={styles.hintText}>or select a preset below</span>
        </div>
        <div class={styles.topicGrid}>
          {#each PREDEFINED_TOPICS as topic}
            <button
              class="{styles.topicButton} {styles.secondaryButton} {$gameSettingsStore.selectedTopic === topic && !$gameSettingsStore.useCustomTopic ? styles.selected : ''}"
              onclick={() => gameSettingsStore.setSelectedTopic(topic)}
            >
              {topic}
            </button>
          {/each}
        </div>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Difficulty</h2>
        <div class={styles.lengthGrid}>
          {#each DIFFICULTY_OPTIONS as option}
            <button
              class="{styles.lengthButton} {$gameSettingsStore.length === option.value ? styles.selected : ''}"
              onclick={() => gameSettingsStore.setLength(option.value)}
            >
              <span class={styles.lengthLabel}>{option.label}</span>
              <span class={styles.lengthWords}>{option.words}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Rounds: {$gameSettingsStore.rounds}</h2>
        <input
          type="range"
          class={styles.rangeInput}
          min={ROUND_MIN}
          max={ROUND_MAX}
          value={$gameSettingsStore.rounds}
          oninput={(e) => gameSettingsStore.setRounds(Number(e.currentTarget.value))}
        />
        <div class={styles.rangeLabels}>
          <span>{ROUND_MIN}</span>
          <span>{ROUND_MAX}</span>
        </div>
      </div>

      {#if error}
        <div class={styles.error}>{error}</div>
      {/if}

      <button class={styles.startButton} onclick={handleCreateRoom} disabled={isCreatingRoom}>
        {isCreatingRoom ? 'Creating...' : 'Create Room'}
      </button>
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
