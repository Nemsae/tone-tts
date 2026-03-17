<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: Snippet;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    confirmVariant?: 'primary' | 'danger';
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
          <button class="modal-btn modal-btn-cancel" onclick={onClose}>
            {cancelLabel}
          </button>
        {/if}
        {#if onConfirm}
          <button
            class="modal-btn modal-btn-{confirmVariant}"
            onclick={onConfirm}
          >
            {confirmLabel}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
