<script lang="ts">
  import type { Twister } from '@/shared/vendor';
  import type { GameSettings } from '@/entities/session';
  import twisterCardStyles from './twister-card.module.scss';

  interface Props {
    twister: Twister;
    matchedWords?: boolean[];
    wordsAttempted?: number;
    settings?: GameSettings;
  }

  let { twister, matchedWords, wordsAttempted, settings }: Props = $props();

  const words = $derived(twister.text.split(' '));
  const difficultyLabels: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const displayTopic = $derived(settings?.topic || twister.topic);
  const isCustomLength = $derived(twister.length === 'custom');
  const difficultyDisplay = $derived(
    isCustomLength && settings?.customLength
      ? `Custom (${settings.customLength} words)`
      : difficultyLabels[twister.difficulty]
  );
</script>

<div class={twisterCardStyles.card}>
  <div class={twisterCardStyles.header}>
    <span class={twisterCardStyles.topic}>{displayTopic}</span>
    <span class={twisterCardStyles.difficulty}>{difficultyDisplay}</span>
  </div>
  <div class={twisterCardStyles.text}>
    {#each words as word, index}
      {@const isMatched = matchedWords?.[index]}
      {@const hasBeenAttempted = wordsAttempted !== undefined && index < wordsAttempted}
      <span
        class="{twisterCardStyles.word} {isMatched === true ? twisterCardStyles.matched : ''} {isMatched === false && hasBeenAttempted ? twisterCardStyles.unmatched : ''}"
      >
        {word}{' '}
      </span>
    {/each}
  </div>
</div>
