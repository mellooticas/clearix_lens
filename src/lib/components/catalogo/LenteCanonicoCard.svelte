<script lang="ts">
  /**
   * LenteCanonicoCard — card para lentes canônicas Premium/Standard
   */
  import { Crown, Sparkles, Zap, ShieldCheck, TrendingUp } from 'lucide-svelte'
  import type { CanonicalPremiumV3, CanonicalStandardV3 } from '$lib/types/lentes'

  export let lente: CanonicalPremiumV3 | CanonicalStandardV3
  export let isPremium: boolean = false
  export let href: string = ''

  function formatPrice(v: number | null): string {
    if (v == null) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function formatLensType(type: string): string {
    const map: Record<string, string> = {
      single_vision: 'Visão Simples',
      multifocal: 'Multifocal',
      bifocal: 'Bifocal',
      occupational: 'Ocupacional',
    }
    return map[type] ?? type
  }

  function getTreatmentLabel(code: string): string {
    const map: Record<string, string> = {
      ar: 'Anti-Reflexo',
      scratch: 'Anti-Risco',
      blue: 'Blue Cut',
      uv: 'UV',
      photo: 'Fotossensível',
      pol: 'Polarizado',
    }
    return map[code] ?? code.toUpperCase()
  }

  $: iconColor = isPremium ? 'text-amber-500' : 'text-cyan-500'
  $: bgColor = isPremium
    ? 'border-amber-100 dark:border-amber-900/30'
    : 'border-cyan-100 dark:border-cyan-900/30'
  $: badgeBg = isPremium
    ? 'bg-amber-50 dark:bg-amber-900/20'
    : 'bg-cyan-50 dark:bg-cyan-900/20'
  $: badgeText = isPremium
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-cyan-700 dark:text-cyan-300'
  $: premiumLente = isPremium ? (lente as CanonicalPremiumV3) : null
</script>

<a {href} class="group">
  <div class={`bg-card border ${bgColor} rounded-2xl p-5 hover:shadow-md transition-all duration-base flex flex-col gap-3 h-full`}>
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1">
        <h3 class="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
          {lente.canonical_name}
        </h3>
        {#if isPremium && premiumLente?.brand}
          <p class="text-micro text-muted-foreground mt-1 truncate">
            {premiumLente.brand}
            {#if premiumLente.product_line}
              • {premiumLente.product_line}
            {/if}
          </p>
        {/if}
      </div>

      {#if isPremium}
        <span class={`shrink-0 px-2 py-1 ${badgeBg} ${badgeText} text-micro font-bold rounded-full uppercase tracking-wider flex items-center gap-1`}>
          <Crown class="h-3 w-3" /> PRE
        </span>
      {:else}
        <span class={`shrink-0 px-2 py-1 ${badgeBg} ${badgeText} text-micro font-bold rounded-full uppercase tracking-wider flex items-center gap-1`}>
          <Sparkles class="h-3 w-3" /> STD
        </span>
      {/if}
    </div>

    <!-- Specs Grid -->
    <div class="space-y-2 flex-1">
      <div class="flex items-center gap-2">
        <Zap class={`h-4 w-4 ${iconColor}`} />
        <span class="text-xs text-muted-foreground font-medium">
          {formatLensType(lente.lens_type)}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <ShieldCheck class={`h-4 w-4 ${iconColor}`} />
        <span class="text-xs text-muted-foreground font-medium">
          {lente.material_name}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <TrendingUp class={`h-4 w-4 ${iconColor}`} />
        <span class="text-xs text-muted-foreground font-medium">
          n = {lente.refractive_index}
        </span>
      </div>
    </div>

    <!-- Treatments -->
    {#if lente.treatment_codes && lente.treatment_codes.length > 0}
      <div class="flex flex-wrap gap-1">
        {#each lente.treatment_codes as code}
          <span class={`px-2 py-0.5 ${isPremium ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300' : 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300'} text-[9px] font-bold rounded-full uppercase tracking-wide`}>
            {getTreatmentLabel(code)}
          </span>
        {/each}
      </div>
    {/if}

    <!-- Pricing -->
    <div class="border-t border-border pt-3 mt-2 space-y-1">
      <div class="flex justify-between text-xs">
        <span class="text-muted-foreground">De</span>
        <span class="font-bold text-foreground">{formatPrice(lente.price_min)}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-muted-foreground">Até</span>
        <span class="font-bold text-foreground">{formatPrice(lente.price_max)}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-muted-foreground">Médio</span>
        <span class="font-semibold text-primary-600 dark:text-primary-400">{formatPrice(lente.price_avg)}</span>
      </div>
    </div>

    <!-- Metadata -->
    <div class="text-micro text-muted-foreground space-y-0.5 border-t border-border pt-2 mt-1">
      <div>📦 {lente.mapped_lens_count} lente(s)</div>
      {#if isPremium && premiumLente}
        <div>🏷️ {premiumLente.mapped_brand_count} marca(s)</div>
      {/if}
      <div>🚚 {lente.mapped_supplier_count} fornecedor(es)</div>
    </div>
  </div>
</a>
