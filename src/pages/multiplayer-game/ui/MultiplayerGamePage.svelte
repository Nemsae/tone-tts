<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import { speechStore, Modal } from '@/shared/ui';
  import type { Twister, Player, LeaderboardEntry } from '@/shared/lib/multiplayer-types';
  import styles from './multiplayer-game.module.scss';

  const DEFAULT_ROUND_DURATION = 30000;

  function getRoundDuration(settings: any): number {
    if (!settings?.roundTimeLimit) return DEFAULT_ROUND_DURATION;
    return settings.roundTimeLimit;
  }

  let autoSubmitEnabled = $derived($multiplayerGameStore.game?.settings?.autoSubmitEnabled ?? false);
  let autoSubmitDelay = $derived($multiplayerGameStore.game?.settings?.autoSubmitDelay ?? 1500);

  let elapsedTime = $state(0);
  let roundStartTime = $state<number | null>(null);
  let currentTwister = $state<Twister | null>(null);
  let players = $state<Player[]>([]);
  let gameStatus = $state<'lobby' | 'playing' | 'paused' | 'game-over'>('playing');
  let isHost = $state(false);
  let error = $state('');
  let hasMicPermission = $state<boolean | null>(null);
  let showSkipModal = $state(false);
  let hasSubmitted = $state(false);
  let mySimilarity = $state<number | null>(null);
  let leaderboard = $state<LeaderboardEntry[]>([]);
  let gameStarted = $state(false);

  let speechState = $state({ isListening: false, transcript: '', error: null as string | null });
  let autoCheckTimer: ReturnType<typeof setTimeout> | null = null;

  const socket = socketService.connect();

  onMount(() => {
    const store = $multiplayerGameStore;
    currentTwister = store.currentTwister;
    roundStartTime = store.roundStartTime;
    players = store.game?.players ?? [];
    gameStatus = store.game?.status ?? 'playing';
    isHost = store.player?.isHost ?? false;

    const unsubscribe = speechStore.subscribe((state) => {
      speechState = state;
    });

    if (store.game?.status === 'playing') {
      gameStarted = true;
      startGameTimer();
      speechStore.startListening();
    }

    socket.on('game-started', (data: { game: any; currentTwister: Twister; roundStartTime: number }) => {
      currentTwister = data.currentTwister;
      roundStartTime = data.roundStartTime;
      gameStatus = 'playing';
      gameStarted = true;
      hasSubmitted = false;
      mySimilarity = null;
      multiplayerGameStore.handleGameStarted(data);
      startGameTimer();
      speechStore.startListening();
    });

    socket.on('player-submitted', (data: { playerId: string; similarity: number }) => {
      multiplayerGameStore.handlePlayerSubmitted(data);
      players = $multiplayerGameStore.game?.players ?? [];
    });

    socket.on('round-advanced', (data: { currentRound: number; currentTwister: Twister; roundStartTime: number }) => {
      currentTwister = data.currentTwister;
      roundStartTime = data.roundStartTime;
      hasSubmitted = false;
      mySimilarity = null;
      multiplayerGameStore.handleRoundAdvanced(data);
      speechStore.stopListening();
      speechStore.clearTranscript(true);
      speechState = { ...speechState, isListening: false, transcript: '' };
      speechStore.startListening();
    });

    socket.on('game-paused', (data: { pausedAt: number; pausedBy: string }) => {
      gameStatus = 'paused';
      multiplayerGameStore.handleGamePaused(data);
      speechStore.stopListening();
    });

    socket.on('game-resumed', (data: { resumedAt: number; totalPausedTime: number }) => {
      gameStatus = 'playing';
      multiplayerGameStore.handleGameResumed(data);
      speechStore.startListening();
    });

    socket.on('game-ended', (data: { leaderboard: LeaderboardEntry[] }) => {
      gameStatus = 'game-over';
      leaderboard = data.leaderboard;
      multiplayerGameStore.handleGameEnded(data);
      speechStore.stopListening();
      speechStore.clearTranscript();
      push('/multiplayer-result');
    });

    socket.on('player-left', (data: { playerId: string; players: Player[] }) => {
      players = data.players;
      multiplayerGameStore.handlePlayerLeft(data);
    });

    checkMicPermission();

    const handleBeforeUnload = () => {
      speechStore.clearTranscript();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  onDestroy(() => {
    if (autoCheckTimer) {
      clearTimeout(autoCheckTimer);
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    socket.off('game-started');
    socket.off('player-submitted');
    socket.off('round-advanced');
    socket.off('game-paused');
    socket.off('game-resumed');
    socket.off('game-ended');
    socket.off('player-left');
    speechStore.stopListening();
    speechStore.clearTranscript();
  });

  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let gameStartTime = $state<number | null>(null);

  function checkMicPermission() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        hasMicPermission = true;
      })
      .catch(() => {
        hasMicPermission = false;
      });
  }

  function startGameTimer() {
    gameStartTime = Date.now();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
      if (gameStartTime) {
        elapsedTime = Date.now() - gameStartTime;
      }
    }, 100);
  }

  function handleSubmit() {
    if (!speechState.transcript || hasSubmitted) return;

    socket.emit('submit-answer', {
      transcript: speechState.transcript,
      timestamp: Date.now()
    }, (response: any) => {
      if (response.success) {
        hasSubmitted = true;
        mySimilarity = response.similarity;
      } else {
        error = response.error || 'Failed to submit answer';
      }
    });
  }

  function handlePause() {
    socket.emit('pause-game', {}, (response: any) => {
      if (!response.success) {
        error = response.error || 'Failed to pause';
      }
    });
  }

  function handleResume() {
    socket.emit('resume-game', {}, (response: any) => {
      if (!response.success) {
        error = response.error || 'Failed to resume';
      }
    });
  }

  function handleLeave() {
    socketService.disconnect();
    multiplayerGameStore.reset();
    push('/');
  }

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function getRemainingTime(): number {
    const roundDuration = getRoundDuration($multiplayerGameStore.game?.settings);
    if (!roundStartTime) return roundDuration;
    return Math.max(0, roundDuration - (Date.now() - roundStartTime));
  }

  $effect(() => {
    const currentSpeechState = speechState;
    const listening = currentSpeechState.isListening;
    const text = currentSpeechState.transcript;

    if (!listening) {
      if (autoCheckTimer) {
        clearTimeout(autoCheckTimer);
        autoCheckTimer = null;
      }
      return;
    }

    if (text && !hasSubmitted && autoSubmitEnabled) {
      if (autoCheckTimer) {
        clearTimeout(autoCheckTimer);
      }
      autoCheckTimer = setTimeout(() => {
        handleSubmit();
      }, autoSubmitDelay);
    }
  });
</script>

<div class={styles.page}>
  {#if !gameStarted}
    <div class={styles.loading}>Waiting for game to start...</div>
  {:else if gameStatus === 'paused'}
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Game Paused"
      confirmLabel="Resume Game"
      cancelLabel=""
      onConfirm={handleResume}
    >
      <p>Take a break! The host will resume when everyone's ready.</p>
    </Modal>
  {:else}
    <div class={styles.gameContainer}>
      <div class={styles.header}>
        <button class={styles.leaveButton} onclick={handleLeave}>Leave Game</button>
        <div class={styles.timer}>
          <span class={styles.timerLabel}>Total Time</span>
          <span class={styles.timerValue}>{formatTime(elapsedTime)}</span>
        </div>
        {#if isHost}
          <button class={styles.pauseButton} onclick={handlePause}>Pause</button>
        {/if}
      </div>

      <div class={styles.playersRow}>
        {#each players as player}
          <div class="{styles.playerCard} {player.id === $multiplayerGameStore.player?.id ? styles.myCard : ''}">
            <span class={styles.playerName}>{player.name}</span>
            <span class={styles.playerScore}>
              {player.currentScore > 0 ? `${player.currentScore}%` : '-'}
            </span>
          </div>
        {/each}
      </div>

      {#if currentTwister}
        <div class={styles.twisterSection}>
          <div class={styles.twisterCard}>
            <div class={styles.twisterHeader}>
              <span class={styles.twisterTopic}>{currentTwister.topic}</span>
              <span class={styles.twisterDifficulty}>
                {currentTwister.difficulty === 1 ? 'Easy' : currentTwister.difficulty === 2 ? 'Medium' : 'Hard'}
              </span>
            </div>
            <div class={styles.twisterText}>{currentTwister.text}</div>
          </div>

          <div class={styles.countdown}>
            <span class={styles.countdownLabel}>Time Left</span>
            <span class={styles.countdownValue}>{Math.ceil(getRemainingTime() / 1000)}s</span>
          </div>
        </div>
      {/if}

      <div class={styles.controls}>
        <div class={styles.transcript}>
          {speechState.transcript || (speechState.isListening ? 'Listening...' : 'Press the button and speak')}
        </div>

        {#if speechState.error}
          <div class={styles.error}>{speechState.error}</div>
        {/if}

        {#if hasSubmitted}
          <div class={styles.submittedMessage}>
            Submitted! Score: {mySimilarity}%
          </div>
        {:else}
          <div class={styles.buttons}>
            {#if !speechState.isListening}
              <button class={styles.micButton} onclick={() => speechStore.startListening()}>
                Start Speaking
              </button>
            {:else}
              <button class="{styles.micButton} {styles.listening}" onclick={() => speechStore.stopListening()}>
                Stop
              </button>
              {#if !autoSubmitEnabled && speechState.transcript}
                <button class={styles.submitButton} onclick={handleSubmit}>
                  Submit Answer
                </button>
              {/if}

              {#if speechState.transcript}
                <button class={styles.resetButton} onclick={() => speechStore.clearTranscript(true)}>
                  Reset
                </button>
              {/if}
            {/if}
          </div>
        {/if}

        {#if hasMicPermission === false}
          <div class={styles.error}>
            Microphone access is required. Please enable it in your browser settings.
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <Modal
    isOpen={showSkipModal}
    onClose={() => showSkipModal = false}
    title="Leave Game?"
    confirmLabel="Leave"
    cancelLabel="Stay"
    onConfirm={handleLeave}
    confirmVariant="danger"
  >
    <p>Are you sure you want to leave the game?</p>
  </Modal>
</div>
