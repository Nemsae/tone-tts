<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { generateAITwisters, isApiKeyConfigured, type PredefinedTopic } from '@/features/twister-generator';
  import { createSession, saveSession, gameFlowStore, type GameSettings } from '@/entities/session';
  import type { TwisterLength } from '@/shared/vendor';
  import styles from './home.module.scss';

  const PREDEFINED_TOPICS = ['Animals', 'Tech', 'Food'] as const;
  const DIFFICULTY_OPTIONS: { value: TwisterLength; label: string; words: string }[] = [
    { value: 'short', label: 'Easy', words: '~5 words' },
    { value: 'medium', label: 'Medium', words: '~10 words' },
    { value: 'long', label: 'Hard', words: '~20 words' },
    { value: 'custom', label: 'Custom', words: '5-40 words' },
  ];
  const ROUND_MIN = 1;
  const ROUND_MAX = 10;

  let selectedTopic = $state<PredefinedTopic | ''>('');
  let customTopic = $state('');
  let useCustomTopic = $state(true);
  let length = $state<TwisterLength>('medium');
  let customLength = $state(10);
  let isLoading = $state(false);
  let error = $state('');
  let customTopicInputRef: HTMLInputElement | null = $state(null);

  const rounds = $derived(gameFlowStore.rounds);

  function updateRounds(newRounds: number) {
    gameFlowStore.setRounds(newRounds);
  }

  async function handleStartGame() {
    const topic = useCustomTopic ? customTopic : selectedTopic;
    if (!topic) {
      error = 'Please select or enter a topic';
      return;
    }

    if (useCustomTopic && topic.length < 2) {
      error = 'Custom topic must be at least 2 characters';
      return;
    }

    if (length === 'custom' && (customLength < 5 || customLength > 40)) {
      error = 'Custom difficulty must be between 5 and 40 words';
      return;
    }

    error = '';
    isLoading = true;

    try {
      const twisters = await generateAITwisters(
        topic,
        length,
        length === 'custom' ? customLength : undefined,
        rounds
      );
      const settings: GameSettings = {
        topic,
        length,
        customLength: length === 'custom' ? customLength : undefined,
        rounds,
      };
      const session = createSession(twisters, settings);
      saveSession(session);
      push('/play');
    } catch (err) {
      error = 'Failed to generate tongue twisters. Please check your API key.';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if !isApiKeyConfigured()}
  <div class={styles.page}>
    <div class={styles.container}>
      <h1 class={styles.title}>Tongue Twister Challenge</h1>
      <p class={styles.subtitle}>Configure your API key to play</p>
      <div class={styles.error}>
        Please add your OpenAI API key to the .env file as VITE_OPENAI_API_KEY
      </div>
    </div>
  </div>
{:else}
  <div class={styles.page}>
    <div class={styles.container}>
      <h1 class={styles.title}>Tongue Twister Challenge</h1>
      <p class={styles.subtitle}>Test your pronunciation skills!</p>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Theme</h2>
        <div class={styles.customTopicSection}>
          <input
            bind:this={customTopicInputRef}
            type="text"
            class="{styles.textInput} {styles.primaryInput}"
            placeholder="e.g. Marvel Superheroes, Lord of the Rings, 80s Music..."
            bind:value={customTopic}
            oninput={() => {
              if (customTopic) {
                selectedTopic = '';
                useCustomTopic = true;
              }
            }}
          />
          <span class={styles.hintText}>or select a preset below</span>
        </div>
        <div class={styles.topicGrid}>
          {#each PREDEFINED_TOPICS as topic}
            <button
              class="{styles.topicButton} {styles.secondaryButton} {selectedTopic === topic && !useCustomTopic ? styles.selected : ''}"
              onclick={() => {
                selectedTopic = topic;
                useCustomTopic = false;
                customTopic = '';
              }}
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
              class="{styles.lengthButton} {length === option.value ? styles.selected : ''}"
              onclick={() => length = option.value}
            >
              <span class={styles.lengthLabel}>{option.label}</span>
              <span class={styles.lengthWords}>{option.words}</span>
            </button>
          {/each}
        </div>
        {#if length === 'custom'}
          <div class={styles.customLengthRow}>
            <label>Words:</label>
            <input
              type="number"
              class={styles.numberInput}
              min={5}
              max={40}
              bind:value={customLength}
            />
          </div>
        {/if}
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Rounds: {rounds}</h2>
        <input
          type="range"
          class={styles.rangeInput}
          min={ROUND_MIN}
          max={ROUND_MAX}
          value={rounds}
          oninput={(e) => updateRounds(Number(e.currentTarget.value))}
        />
        <div class={styles.rangeLabels}>
          <span>{ROUND_MIN}</span>
          <span>{ROUND_MAX}</span>
        </div>
      </div>

      {#if error}
        <div class={styles.error}>{error}</div>
      {/if}

      <button class={styles.startButton} onclick={handleStartGame} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Start Game'}
      </button>
    </div>
  </div>
{/if}
