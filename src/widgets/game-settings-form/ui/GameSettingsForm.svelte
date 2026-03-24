<script lang="ts">
  import { gameSettingsStore, PREDEFINED_TOPICS } from '@/entities/session';
  import type { TwisterLength } from '@/shared/vendor';
  import styles from './game-settings-form.module.scss';

  interface Props {
    title?: string;
    subtitle?: string;
    submitText?: string;
    onSubmit: () => void;
    isLoading?: boolean;
    error?: string;
    showCustomDifficulty?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    title = 'session setup',
    subtitle = 'configure your practice environment',
    submitText = 'Start Game',
    onSubmit,
    isLoading = false,
    error = '',
    showCustomDifficulty = true,
    children,
  }: Props = $props();

  const DIFFICULTY_OPTIONS: { value: TwisterLength; label: string; words: string }[] = [
    { value: 'short', label: 'Easy', words: '~5 words' },
    { value: 'medium', label: 'Medium', words: '~10 words' },
    { value: 'long', label: 'Hard', words: '~20 words' },
  ];

  if (showCustomDifficulty) {
    DIFFICULTY_OPTIONS.push({ value: 'custom', label: 'Custom', words: '5-40 words' });
  }

  const ROUND_MIN = 1;
  const ROUND_MAX = 10;
</script>

<div class={styles.page}>
  <div class={styles.container}>
    {#if title}
      <section class={styles.header}>
        <h1 class={styles.title}>{title}</h1>
        {#if subtitle}
          <p class={styles.subtitle}>{subtitle}</p>
        {/if}
      </section>
    {/if}

    <form class={styles.form} onsubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {#if children}
        {@render children()}
      {/if}

      <div class={styles.section}>
        <div class={styles.sectionHeader}>
          <h2 class={styles.sectionTitle}>theme</h2>
          <p class={styles.sectionDescription}>select or define your vocabulary set</p>
        </div>
        <div class={styles.sectionContent}>
          <div class={styles.topicGrid}>
            {#each PREDEFINED_TOPICS as topic}
              <label class={styles.topicLabel}>
                <input
                  type="radio"
                  name="theme"
                  class={styles.topicRadio}
                  value={topic}
                  checked={$gameSettingsStore.selectedTopic === topic && !$gameSettingsStore.useCustomTopic}
                  onchange={() => gameSettingsStore.setSelectedTopic(topic)}
                />
                <span class={styles.topicButton}>{topic.toLowerCase()}</span>
              </label>
            {/each}
          </div>
          <input
            type="text"
            class={styles.customTopicInput}
            placeholder="or type custom theme..."
            value={$gameSettingsStore.customTopic}
            oninput={(e) => gameSettingsStore.setCustomTopic(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class={styles.section}>
        <div class={styles.sectionHeader}>
          <h2 class={styles.sectionTitle}>phrase length</h2>
          <p class={styles.sectionDescription}>complexity level per round</p>
        </div>
        <div class={styles.sectionContent}>
          <div class={styles.difficultyButtons}>
            {#each DIFFICULTY_OPTIONS as option}
              <button
                type="button"
                class="{styles.difficultyButton} {$gameSettingsStore.length === option.value ? styles.selected : ''}"
                onclick={() => gameSettingsStore.setLength(option.value)}
              >
                {option.label.toLowerCase()} ({option.words})
              </button>
            {/each}
          </div>
          {#if $gameSettingsStore.length === 'custom'}
            <div class={styles.customLengthRow}>
              <span class={styles.customLengthLabel}>custom length</span>
              <span class={styles.customLengthValue}>{$gameSettingsStore.customLength} words</span>
              <input
                type="range"
                class={styles.rangeInput}
                min={5}
                max={40}
                value={$gameSettingsStore.customLength}
                oninput={(e) => gameSettingsStore.setCustomLength(Number(e.currentTarget.value))}
              />
              <div class={styles.rangeLabels}>
                <span>5</span>
                <span>40</span>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class={styles.section}>
        <div class={styles.sectionHeader}>
          <h2 class={styles.sectionTitle}>number of rounds</h2>
          <p class={styles.sectionDescription}>total iterations for this session</p>
        </div>
        <div class={styles.sectionContent}>
          <div class={styles.roundsRow}>
            <span class={styles.roundsLabel}>count</span>
            <span class={styles.roundsValue}>{$gameSettingsStore.rounds} rounds</span>
          </div>
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
      </div>

      {#if error}
        <div class={styles.error}>{error}</div>
      {/if}

      <div class={styles.ctaSection}>
        <button type="submit" class={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Loading...' : submitText}
          <span class={styles.arrowIcon}>arrow_forward</span>
        </button>
      </div>
    </form>
  </div>
</div>
