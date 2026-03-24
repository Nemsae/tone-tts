<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: Snippet;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    confirmVariant?: 'primary' | 'secondary';
  }

  let {
    isOpen,
    onClose,
    title,
    children,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    confirmVariant = 'primary',
  }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <h2 class="modal-title">{title}</h2>
      <div class="modal-body">
        {#if children}
          {@render children()}
        {/if}
      </div>
      <div class="modal-actions">
        {#if cancelLabel}
          <Button variant="secondary" onclick={onClose}>
            {cancelLabel}
          </Button>
        {/if}
        {#if onConfirm}
          <Button variant={confirmVariant} onclick={onConfirm}>
            {confirmLabel}
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '../../app/styles/variables' as *;

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $spacing-lg;
  }

  .modal-content {
    background: $color-surface-container-lowest;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    max-width: 400px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-title {
    font-family: $font-family-display;
    font-size: 1.5rem;
    font-weight: 600;
    color: $color-on-surface;
    margin-bottom: $spacing-lg;
  }

  .modal-body {
    font-family: $font-family-base;
    font-size: 0.875rem;
    color: $color-on-surface-variant;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
</style>
