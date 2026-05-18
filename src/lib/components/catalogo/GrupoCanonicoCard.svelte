<!--
  GrupoCanonicoCard — Canonical Engine v2
  Exibe conceito canônico com SKU (CST/CPR), faixa de preço, tratamentos e counters.
  Props: grupo (CanonicalWithPricing), variant ('standard' | 'premium'), compact
-->
<script lang="ts">
  import type { CanonicalWithPricing } from '$lib/types/database-views';

  export let grupo: CanonicalWithPricing;
  export let variant: 'standard' | 'premium' = 'standard';
  export let compact = false;

  const isPremium = variant === 'premium';
  const linkBase  = isPremium ? '/premium' : '/standard';

  // ── Formatação ──────────────────────────────────────────────────────────────
  function formatarPreco(valor: number | null): string {
    if (valor == null) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL', minimumFractionDigits: 0
    }).format(valor);
  }

  function formatarLensType(lt: string | null): string {
    const mapa: Record<string, string> = {
      single_vision: 'Visão Simples',
      multifocal:    'Multifocal',
      bifocal:       'Bifocal',
      reading:       'Leitura',
      occupational:  'Ocupacional',
    };
    return lt ? (mapa[lt] ?? lt.replace(/_/g, ' ')) : '—';
  }

  function formatarTratamento(code: string): string {
    const mapa: Record<string, string> = {
      ar:      'AR',
      scratch: 'Anti-Risco',
      blue:    'Blue Cut',
      uv:      'UV',
      photo:   'Fotossensível',
    };
    return mapa[code] ?? code.toUpperCase();
  }

  function tratamentoBadgeClass(code: string): string {
    const mapa: Record<string, string> = {
      ar:      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      scratch: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      blue:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      uv:      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      photo:   'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    };
    return mapa[code] ?? 'bg-muted text-foreground';
  }

  $: faixaEsf = (grupo.spherical_min != null && grupo.spherical_max != null)
    ? `${grupo.spherical_min > 0 ? '+' : ''}${grupo.spherical_min} a ${grupo.spherical_max > 0 ? '+' : ''}${grupo.spherical_max}`
    : null;

  $: temPricing  = grupo.price_min != null;
  $: temMarkup   = grupo.markup_max != null;

  $: cardBorder = isPremium
    ? 'border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600'
    : 'border-border hover:border-primary-400 dark:hover:border-primary-600';

  $: skuBadgeClass = isPremium
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
    : 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-700';

  $: headerBg = isPremium
    ? 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
    : 'from-primary-50 to-blue-50 dark:from-primary-950/20 dark:to-blue-950/20';

  $: priceBg = isPremium
    ? 'from-amber-600 to-orange-600'
    : 'from-primary-600 to-indigo-600';
</script>

<a
  href="{linkBase}/{grupo.id}"
  class="grupo-card flex flex-col bg-card border {cardBorder} rounded-2xl hover:shadow-xl transition-all duration-base overflow-hidden group"
>
  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="px-5 pt-5 pb-3 bg-gradient-to-br {headerBg}">
    <div class="flex items-start justify-between gap-2 mb-2">
      <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider font-mono {skuBadgeClass}">
        {grupo.sku}
      </span>
      {#if isPremium}
        <span class="text-amber-500 text-sm" title="Premium">★</span>
      {/if}
    </div>

    <h3 class="font-bold text-foreground text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
      {grupo.canonical_name}
    </h3>

    <div class="text-xs text-muted-foreground font-medium">
      {formatarLensType(grupo.lens_type)}
    </div>
  </div>

  <!-- ── Especificações Técnicas ─────────────────────────────────────────── -->
  <div class="px-5 py-3 flex-1 space-y-2.5">
    <!-- Material + Índice -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-foreground">
        {grupo.material_display}
      </span>
      <span class="text-micro text-muted-foreground">n={grupo.refractive_index}</span>
    </div>

    <!-- Tratamentos -->
    {#if grupo.treatment_codes && grupo.treatment_codes.length > 0}
      <div class="flex flex-wrap gap-1">
        {#each grupo.treatment_codes as code}
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-micro font-bold uppercase tracking-wide {tratamentoBadgeClass(code)}">
            {formatarTratamento(code)}
          </span>
        {/each}
      </div>
    {:else}
      <div class="text-micro text-muted-foreground italic">Sem tratamentos adicionais</div>
    {/if}

    <!-- Faixa de Graus -->
    {#if faixaEsf}
      <div class="text-xs text-muted-foreground">
        <span class="font-semibold text-foreground">Esf:</span>
        {faixaEsf}
        {#if grupo.addition_max}
          &nbsp;<span class="font-semibold text-foreground">Add:</span>
          até +{grupo.addition_max}
        {/if}
      </div>
    {/if}
  </div>

  <!-- ── Pricing ─────────────────────────────────────────────────────────── -->
  {#if temPricing}
    <div class="px-5 py-3 bg-gradient-to-r {priceBg}">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-micro text-white/70 uppercase font-bold tracking-widest">Faixa de Preço</div>
          <div class="text-white font-bold text-base leading-tight">
            {formatarPreco(grupo.price_min)}
            {#if grupo.price_max && grupo.price_max !== grupo.price_min}
              — {formatarPreco(grupo.price_max)}
            {/if}
          </div>
          {#if grupo.price_avg}
            <div class="text-white/70 text-xs">Média: {formatarPreco(grupo.price_avg)}</div>
          {/if}
        </div>
        {#if temMarkup}
          <div class="text-right">
            <div class="text-micro text-white/70 uppercase font-bold tracking-widest">Markup</div>
            <div class="text-white font-bold text-sm">{grupo.markup_min?.toFixed(1)}x — {grupo.markup_max?.toFixed(1)}x</div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- ── Footer: Counters ────────────────────────────────────────────────── -->
  <div class="px-5 py-2.5 bg-muted/50 border-t border-border">
    <div class="flex items-center justify-between text-micro text-muted-foreground font-semibold">
      <span title="Lentes mapeadas">📦 {grupo.mapped_lens_count ?? 0} lentes</span>
      <span title="Marcas">🏷️ {grupo.mapped_brand_count ?? 0} marcas</span>
      <span title="Fornecedores">🚚 {grupo.mapped_supplier_count ?? 0} fornec.</span>
    </div>
  </div>
</a>

<style>
  .grupo-card {
    @apply w-full;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
