<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { socketService, multiplayerGameStore } from '@/shared/lib';
  import { gameSettingsStore, validateTopic } from '@/entities/session';
  import { get } from 'svelte/store';
  import type { GameSettings as MultiplayerGameSettings } from '@/shared/lib/multiplayer-types';
  import { GameSettingsForm } from '@/widgets/game-settings-form';
  import { Button, Input } from '@/shared/ui';
  import styles from './multiplayer-setup.module.scss';

  let playerName = $state('');
  let isCreatingRoom = $state(false);
  let error = $state('');

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
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
  });

  async function handleCreateRoom() {
    if (!playerName.trim()) {
      error = 'Please enter your name';
      return;
    }

    const storeState = get(gameSettingsStore);
    const useCustomTopic = storeState.useCustomTopic;
    const topic = useCustomTopic ? storeState.customTopic : storeState.selectedTopic;
    if (!topic) {
      error = 'Please select or enter a topic';
      return;
    }

    // Validate custom topic
    if (useCustomTopic) {
      const validationError = validateTopic(topic);
      if (validationError) {
        error = validationError;
        return;
      }
    }

    error = '';
    isCreatingRoom = true;

    const settings: MultiplayerGameSettings = {
      topic,
      length: storeState.length,
      customLength: storeState.length === 'custom' ? storeState.customLength : undefined,
      rounds: storeState.rounds,
      roundTimeLimit: storeState.roundTimeLimitEnabled ? storeState.roundTimeLimit : null,
      autoSubmitEnabled: storeState.autoSubmitEnabled,
      autoSubmitDelay: storeState.autoSubmitDelay,
    };

    socket.emit('create-room', { playerName: playerName.trim(), settings }, (response: any) => {
      isCreatingRoom = false;
      if (response.success) {
        multiplayerGameStore.handleCreateRoom(response);
        push('/multiplayer-lobby');
      } else {
        error = response.error || 'Failed to create room';
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
      Back
    </Button>

    <GameSettingsForm
      title="multiplayer session setup"
      subtitle="configure your game room and invite friends to play"
      submitText="create room"
      onSubmit={handleCreateRoom}
      isLoading={isCreatingRoom}
      {error}
      showCustomDifficulty={false}
      showRoundTimeLimit={true}
      showAutoSubmit={true}
    >
      {#snippet children()}
        <div class={styles.section}>
          <div class={styles.sectionHeader}>
            <h2 class={styles.sectionTitle}>your name</h2>
            <p class={styles.sectionDescription}>how players will see you</p>
          </div>
          <div class={styles.sectionContent}>
            <Input
              placeholder="Enter your name"
              bind:value={playerName}
            />
          </div>
        </div>
      {/snippet}
    </GameSettingsForm>
  </div>
</div>
