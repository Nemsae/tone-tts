<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import type { Player } from '@/shared/lib/multiplayer-types';
  import styles from './multiplayer-join.module.scss';

  let playerName = $state('');
  let roomCode = $state('');
  let isJoining = $state(false);
  let error = $state('');
  let players = $state<Player[]>([]);
  let gameStarted = $state(false);

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
      gameStarted = true;
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

  function handleJoinRoom() {
    if (!playerName.trim()) {
      error = 'Please enter your name';
      return;
    }

    if (!roomCode.trim()) {
      error = 'Please enter the room code';
      return;
    }

    if (roomCode.trim().length !== 4) {
      error = 'Room code must be 4 characters';
      return;
    }

    error = '';
    isJoining = true;

    socket.emit('join-room', { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim() }, (response: any) => {
      isJoining = false;
      if (response.success) {
        players = response.game.players;
        multiplayerGameStore.handleJoinRoom(response);
      } else {
        error = response.error || 'Failed to join room';
      }
    });
  }

  function handleBack() {
    multiplayerGameStore.reset();
    socketService.disconnect();
    push('/');
  }

  function handleCopyCode() {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode.trim().toUpperCase());
    }
  }
</script>

<div class={styles.page}>
  <div class={styles.container}>
    <button class={styles.backButton} onclick={handleBack}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>

    <h1 class={styles.title}>Join Multiplayer Game</h1>
    <p class={styles.subtitle}>Enter the room code from your friend</p>

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
      <h2 class={styles.sectionTitle}>Room Code</h2>
      <input
        type="text"
        class="{styles.textInput} {styles.roomCodeInput}"
        placeholder="ABCD"
        maxlength="4"
        bind:value={roomCode}
        oninput={() => {
          roomCode = roomCode.toUpperCase();
        }}
      />
    </div>

    {#if error}
      <div class={styles.error}>{error}</div>
    {/if}

    <button class={styles.startButton} onclick={handleJoinRoom} disabled={isJoining}>
      {isJoining ? 'Joining...' : 'Join Room'}
    </button>
  </div>
</div>
