<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import type { Session, ScoringResult } from '@/entities/session';
  import { scoreTwister, getCurrentTwister, advanceSession, addRoundResult, isSessionComplete, calculateAccuracy, saveSession, loadSession, clearSession, saveFinalResult } from '@/entities/session';
  import { speechStore, Modal } from '@/shared/ui';
  import GameHud from './GameHud.svelte';
  import TwisterCard from './TwisterCard.svelte';
  import styles from './game-session.module.scss';

  let session = $state<Session | null>(null);
  let scoringResult = $state<ScoringResult | null>(null);
  let liveMatchedWords = $state<boolean[] | undefined>(undefined);
  let liveWordsAttempted = $state<number | undefined>(undefined);
  let gameStarted = $state(false);
  let elapsedTime = $state(0);
  let gameStartTime = $state<number | null>(null);
  let hasMicPermission = $state<boolean | null>(null);
  let isPaused = $state(false);
  let pauseStartTime = $state<number | null>(null);
  let totalPausedTime = $state(0);
  let showSkipModal = $state(false);

  const DEFAULT_AUTO_CHECK_DELAY = 1500;
  let autoCheckDelay = DEFAULT_AUTO_CHECK_DELAY;
  let autoCheckEnabled = true;
  let autoCheckTimer: ReturnType<typeof setTimeout> | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let elapsedTimeRef = 0;

  let speechState = $state({ isListening: false, transcript: '', error: null as string | null });

  onMount(() => {
    session = loadSession();
    const unsubscribe = speechStore.subscribe((state) => {
      speechState = state;
    });
    return unsubscribe;
  });

  function handleComplete(result: { accuracy: number; elapsedTime: number }) {
    saveFinalResult({ accuracy: result.accuracy, elapsedTime: result.elapsedTime });
    clearSession();
    push('/solo-result');
  }

  const currentTwister = $derived(session ? getCurrentTwister(session) : null);

  function handleScore() {
    if (!currentTwister || !speechState.transcript) return;

    const result = scoreTwister(speechState.transcript, currentTwister.text);
    scoringResult = result;

    if (result.isMatch) {
      const newSession = addRoundResult(session, {
        twisterId: currentTwister.id,
        similarity: result.similarity,
      });
      session = newSession;
      saveSession(newSession);
    }
  }

  $effect(() => {
    const currentSpeechState = speechState;
    const listening = currentSpeechState.isListening;
    const text = currentSpeechState.transcript;
    const shouldCheck = autoCheckEnabled && autoCheckDelay > 0;

    if (!listening) {
      liveMatchedWords = undefined;
      liveWordsAttempted = undefined;
      if (autoCheckTimer) {
        clearTimeout(autoCheckTimer);
        autoCheckTimer = null;
      }
      return;
    }

    if (text && shouldCheck) {
      if (autoCheckTimer) {
        clearTimeout(autoCheckTimer);
      }
      autoCheckTimer = setTimeout(() => {
        handleScore();
      }, autoCheckDelay);
    }
  });

  $effect(() => {
    const twister = currentTwister;
    const text = speechState.transcript;
    if (!twister || !text) {
      return;
    }

    const result = scoreTwister(text, twister.text);
    liveMatchedWords = result.matchedWords;
    liveWordsAttempted = result.wordsAttempted;
  });

  $effect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        hasMicPermission = true;
      } catch {
        hasMicPermission = false;
      }
    };
    checkMicPermission();
  });

  function handleNext(sessionToUse?: Session) {
    const sessionToAdvance = sessionToUse ?? session;

    if (!currentTwister) return;

    scoringResult = null;
    liveMatchedWords = undefined;
    liveWordsAttempted = undefined;
    if (autoCheckTimer) {
      clearTimeout(autoCheckTimer);
      autoCheckTimer = null;
    }

    speechStore.stopListening();
    speechStore.clearTranscript();

    setTimeout(() => {
      const nextSession = advanceSession(sessionToAdvance);

      if (isSessionComplete(nextSession)) {
        const accuracy = calculateAccuracy(nextSession);
        handleComplete({ accuracy, elapsedTime: elapsedTimeRef });
      } else {
        session = nextSession;
        saveSession(nextSession);
        speechStore.startListening();
      }
    }, 500);
  }

  function handleSkip() {
    if (!currentTwister) return;

    const result = scoreTwister('', currentTwister.text);
    result.isMatch = false;
    result.similarity = 0;
    scoringResult = result;

    const newSession = addRoundResult(session, { twisterId: currentTwister.id, similarity: 0 });
    session = newSession;
    saveSession(newSession);

    showSkipModal = false;
    handleNext(newSession);
  }

  $effect(() => {
    if (scoringResult?.isMatch) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  });

  $effect(() => {
    if (gameStarted && gameStartTime && !isPaused) {
      timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const pausedTime = pauseStartTime ? currentTime - pauseStartTime : 0;
        const newElapsedTime = currentTime - gameStartTime - totalPausedTime - pausedTime;
        elapsedTime = newElapsedTime;
        elapsedTimeRef = newElapsedTime;
      }, 100);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  });

  function handleStartGame() {
    gameStartTime = Date.now();
    gameStarted = true;
    speechStore.startListening();
  }

  function handlePause() {
    isPaused = true;
    pauseStartTime = Date.now();
    speechStore.stopListening();
  }

  function handleResume() {
    if (pauseStartTime) {
      totalPausedTime += Date.now() - pauseStartTime;
    }
    isPaused = false;
    pauseStartTime = null;
    speechStore.startListening();
  }
</script>

{#if !currentTwister}
  <div class={styles.loading}>Loading...</div>
{:else}
  <div class={styles.session}>
    {#if !gameStarted}
      <div class={styles.preGame}>
        <div class={styles.gameInfo}>
          <h2>Game Session</h2>
          <div class={styles.gameInfoItem}>
            <span class={styles.gameInfoLabel}>Theme:</span>
            <span class={styles.gameInfoValue}>{session.settings?.topic}</span>
          </div>
          <div class={styles.gameInfoItem}>
            <span class={styles.gameInfoLabel}>Difficulty:</span>
            <span class={styles.gameInfoValue}>
              {session.settings?.length === 'short'
                ? 'Easy'
                : session.settings?.length === 'medium'
                  ? 'Medium'
                  : session.settings?.length === 'long'
                    ? 'Hard'
                    : session.settings?.length === 'custom'
                      ? 'Custom'
                      : session.settings?.length}
              {#if session.settings?.length === 'custom' && session.settings?.customLength}
                ({session.settings.customLength} words)
              {/if}
            </span>
          </div>
          <div class={styles.gameInfoItem}>
            <span class={styles.gameInfoLabel}>Rounds:</span>
            <span class={styles.gameInfoValue}>{session.settings?.rounds}</span>
          </div>
          {#if hasMicPermission === false}
            <div class={styles.error}>
              Microphone access is required. Please enable it in your browser settings and refresh
              the page.
            </div>
          {/if}
        </div>
        <button class={styles.micButton} onclick={handleStartGame}>
          Start Speaking
        </button>
      </div>
    {:else}
      <div class={styles.gameStarted}>
        <GameHud {session} {elapsedTime} />

        <TwisterCard
          twister={currentTwister}
          matchedWords={scoringResult?.matchedWords ?? liveMatchedWords}
          wordsAttempted={scoringResult?.wordsAttempted ?? liveWordsAttempted}
          settings={session.settings}
        />

        <div class={styles.controls}>
          <div class={styles.transcript}>
            {speechState.transcript || (speechState.isListening ? 'Listening...' : 'Press the button and speak')}
          </div>

          {#if speechState.error}
            <div class={styles.error}>{speechState.error}</div>
          {/if}

          {#if scoringResult}
            <div
              class="{styles.result} {scoringResult.isMatch ? styles.success : styles.failure}"
            >
              {scoringResult.isMatch
                ? 'Great job!'
                : `Try again! (${scoringResult.similarity}% match)`}
            </div>
          {/if}

          <div class={styles.buttons}>
            {#if !speechState.isListening}
              <button class={styles.micButton} onclick={() => speechStore.startListening()}>
                Start Listening
              </button>
            {:else}
              <button class="{styles.micButton} {styles.listening}" onclick={handlePause}>
                Stop
              </button>
            {/if}

            <button class={styles.skipButton} onclick={() => showSkipModal = true}>
              Skip
            </button>
          </div>
        </div>

        {#if isPaused}
          <Modal
            isOpen={isPaused}
            onClose={() => {}}
            title="Game Paused"
            confirmLabel="Resume Game"
            cancelLabel=""
            onConfirm={handleResume}
          >
            <p>Take a break! Click resume when you're ready to continue.</p>
          </Modal>
        {/if}

        <Modal
          isOpen={showSkipModal}
          onClose={() => showSkipModal = false}
          title="Skip Round?"
          confirmLabel="Skip"
          cancelLabel="Continue Playing"
          onConfirm={handleSkip}
          confirmVariant="danger"
        >
          <p>Are you sure you want to skip this round?</p>
          <p style="margin-top: 8px;">
            Skipping will count as a <strong>0% match</strong> and will affect your final accuracy
            score.
          </p>
        </Modal>
      </div>
    {/if}
  </div>
{/if}
