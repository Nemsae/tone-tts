<script lang="ts">
  interface Props {
    min?: number;
    max?: number;
    value?: number;
    showLabels?: boolean;
    oninput?: (e: Event) => void;
    class?: string;
  }

  let {
    min = 0,
    max = 100,
    value = $bindable(50),
    showLabels = true,
    oninput,
    class: className = '',
  }: Props = $props();
</script>

<div class="range-slider-wrapper {className}">
  <input
    type="range"
    class="range-slider"
    {min}
    {max}
    bind:value
    {oninput}
  />
  {#if showLabels}
    <div class="range-labels">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../app/styles/variables' as *;

  .range-slider-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    width: 100%;
  }

  .range-slider {
    width: 100%;
    height: 4px;
    background: $color-surface-variant;
    appearance: none;
    border-radius: 2px;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      background: $color-primary;
      border-radius: 50%;
      cursor: pointer;
      transition: transform $transition-fast;

      &:hover {
        transform: scale(1.1);
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 4px;
      }
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: $color-primary;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: transform $transition-fast;

      &:hover {
        transform: scale(1.1);
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 4px;
      }
    }

    &:focus-visible {
      outline: none;
    }
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-family: $font-family-base;
    font-size: 0.625rem;
    color: $color-text-muted;
    opacity: 0.5;
  }
</style>
