<script lang="ts">
  /**
   * DashboardMetricCard — Padrão Clearix by DIGIAI v2
   *
   * Regras de design:
   * - Fundo NEUTRO (bg-white / dark:bg-neutral-800) — nunca colorido
   * - Cor semântica APENAS no icon-badge e no trend indicator
   * - SEM gradientes · SEM shadows pesadas · SEM emojis
   * - SEM hover:-translate-y (sem scale effects)
   */

  export let title: string;
  export let value: string | number;
  /** Ícone SVG como string HTML ou nome de preset */
  export let iconSlot: 'lentes' | 'fornecedores' | 'decisoes' | 'economia' | 'prazo' | 'ranking' = 'lentes';
  /** Cor semântica — aparece SOMENTE no badge do ícone e no trend */
  export let semantic: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'primary';
  export let subtitle: string | undefined = undefined;
  export let trend: { value: string; up: boolean } | undefined = undefined;

  // Mapeamento de cores semânticas (badge apenas) — tokens canonicos DS 2026-05-18.
  // Dark mode adapta via CSS vars (.dark { --success/warning/...: ... }).
  const semanticBadge: Record<string, string> = {
    primary: 'bg-primary/10     text-primary',
    success: 'bg-success/15     text-success',
    warning: 'bg-warning/15     text-warning',
    error:   'bg-destructive/15 text-destructive',
    info:    'bg-info/15        text-info',
  };

  $: badgeClass = semanticBadge[semantic] ?? semanticBadge.primary;
</script>

<div class="card p-5 space-y-4">

  <!-- Linha superior: badge do ícone + título -->
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none mb-1">
        {title}
      </p>
      <p class="text-2xl font-bold tabular-nums text-foreground tracking-tight">
        {value}
      </p>
    </div>

    <!-- Icon badge — única área com cor semântica -->
    <div class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center {badgeClass}">
      {#if iconSlot === 'lentes'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      {:else if iconSlot === 'fornecedores'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      {:else if iconSlot === 'decisoes'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      {:else if iconSlot === 'economia'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      {:else if iconSlot === 'prazo'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      {:else if iconSlot === 'ranking'}
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      {/if}
    </div>
  </div>

  <!-- Linha inferior: subtitle + trend -->
  {#if subtitle || trend}
    <div class="flex items-center justify-between gap-2 pt-1 border-t border-border">
      {#if subtitle}
        <p class="text-xs text-muted-foreground">{subtitle}</p>
      {/if}
      {#if trend}
        <!-- Trend indicator — cor semântica permitida aqui -->
        <span class="inline-flex items-center gap-1 text-xs font-medium tabular-nums
          {trend.up ? 'text-success' : 'text-destructive'}">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {#if trend.up}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
            {/if}
          </svg>
          {trend.value}
        </span>
      {/if}
    </div>
  {/if}

</div>
