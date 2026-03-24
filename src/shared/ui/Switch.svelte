<script lang="ts">
  interface Props {
    checked?: boolean;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
    class?: string;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    onchange,
    class: className = '',
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="switch-wrapper {className}" class:disabled>
  <input
    type="checkbox"
    class="switch-input"
    bind:checked
    {disabled}
    onchange={handleChange}
  />
  <span class="switch-track">
    <span class="switch-thumb"></span>
  </span>
</label>

<style lang="scss">
  @use '../../app/styles/variables' as *;

  .switch-wrapper {
    display: inline-flex;
    cursor: pointer;

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .switch-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .switch-track {
    position: relative;
    width: 44px;
    height: 24px;
    background: $color-surface-variant;
    border-radius: 12px;
    transition: background $transition-fast;

    .switch-input:checked + & {
      background: $color-primary;
    }

    .switch-input:focus-visible + & {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: $color-on-surface-variant;
    border-radius: 50%;
    transition: transform $transition-fast;

    .switch-input:checked + & {
      transform: translateX(20px);
      background: $color-on-primary;
    }
  }
</style>
