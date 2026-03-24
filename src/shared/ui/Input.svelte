<script lang="ts">
  interface Props {
    type?: 'text' | 'number' | 'email' | 'password';
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    maxlength?: number;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    class?: string;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    error = '',
    maxlength,
    oninput,
    onchange,
    class: className = '',
  }: Props = $props();
</script>

<div class="input-wrapper {className}">
  <input
    {type}
    bind:value
    {placeholder}
    {disabled}
    {maxlength}
    class="input-field"
    class:has-error={!!error}
    {oninput}
    {onchange}
  />
  {#if error}
    <span class="input-error">{error}</span>
  {/if}
</div>

<style lang="scss">
  @use '../../app/styles/variables' as *;

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    width: 100%;
  }

  .input-field {
    font-family: $font-family-base;
    font-size: 0.875rem;
    padding: $spacing-sm $spacing-md;
    background: $color-surface;
    color: $color-text;
    border: 2px solid $color-outline-variant;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.has-error {
      border-color: $color-error;
    }
  }

  .input-error {
    font-family: $font-family-base;
    font-size: 0.75rem;
    color: $color-error;
  }
</style>
