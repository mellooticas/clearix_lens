<script lang="ts">
  /**
   * Toast — Clearix Lens Component Contract
   * 4 variants: success, error, warning, info
   */
  import { fly } from 'svelte/transition';

  interface Props {
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    show?: boolean;
    onClose?: () => void;
  }

  let {
    message = '',
    type = 'success',
    duration = 3000,
    show = $bindable(false),
    onClose
  }: Props = $props();

  let timeoutId: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (show && duration > 0) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  });

  function handleClose() {
    show = false;
    onClose?.();
  }

  // Tokens semanticos canonicos DS 2026-05-18. Dark mode adapta via CSS vars.
  const variants: Record<string, { bg: string; icon: string }> = {
    success: { bg: 'bg-success',     icon: '\u2713' },
    error:   { bg: 'bg-destructive', icon: '\u2715' },
    warning: { bg: 'bg-warning',     icon: '\u26A0' },
    info:    { bg: 'bg-info',        icon: '\u2139' }
  };

  let variant = $derived(variants[type]);
</script>

{#if show}
  <div
    class="toast-container fixed bottom-4 right-4 z-50 max-w-md"
    transition:fly={{ y: 50, duration: 300 }}
  >
    <div class="{variant.bg} text-white px-6 py-4 rounded-lg shadow-lg">
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
          <span class="text-lg font-bold">{variant.icon}</span>
        </div>

        <!-- Message -->
        <div class="flex-1">
          <p class="font-medium text-sm">{message}</p>
        </div>

        <!-- Close -->
        <button
          onclick={handleClose}
          class="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Fechar notificacao"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}
