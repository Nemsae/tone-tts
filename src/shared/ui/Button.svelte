<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'tertiary';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
    class?: string;
  }

  let {
    variant = 'primary',
    type = 'button',
    disabled = false,
    onclick,
    children,
    class: className = '',
  }: Props = $props();
</script>

<button
  class="btn btn-{variant} {className}"
  {type}
  {disabled}
  {onclick}
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style lang="scss">
  @use '../../app/styles/variables' as *;

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: 0.75rem 1.5rem;
    font-family: $font-family-base;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-primary {
    background: $color-primary;
    color: $color-on-primary;

    &:hover:not(:disabled) {
      background: $color-primary-light;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  .btn-secondary {
    background: transparent;
    color: $color-primary;
    border: 1px solid rgba($color-outline, 0.35);

    &:hover:not(:disabled) {
      background: $color-surface-container;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  .btn-tertiary {
    background: transparent;
    color: $color-text-secondary;
    padding: 0.75rem 1rem;
    font-weight: 600;

    &:hover:not(:disabled) {
      color: $color-text;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
</style>
