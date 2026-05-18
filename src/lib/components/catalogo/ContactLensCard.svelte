<script lang="ts">
    /**
     * ContactLensCard — card padrão para lentes de contato
     * Padrão visual unificado com /lentes, /standard e /premium
     */
    import type { RpcContactLensSearchResult as LenteContato } from '$lib/types/database-views';

    export let lente: LenteContato;

    function fmt(v: number | null | undefined): string {
        if (!v) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }

    const DESCARTE_LABELS: Record<string, string> = {
        diaria:      'Descarte Diário',
        quinzenal:   'Descarte Quinzenal',
        mensal:      'Descarte Mensal',
        trimestral:  'Descarte Trimestral',
        anual:       'Uso Anual',
    };
</script>

<a href="/contato/{lente.id}"
    class="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-base flex flex-col gap-3 no-underline">

    <!-- Nome + badge tipo -->
    <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-foreground text-sm leading-snug line-clamp-2">
                {lente.product_name ?? '—'}
            </h3>
            <p class="text-micro text-muted-foreground mt-0.5 truncate">
                {lente.brand_name ?? '—'}
            </p>
        </div>
        {#if lente.stock_available > 0}
            <span class="shrink-0 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-wide">Em Stock</span>
        {:else}
            <span class="shrink-0 px-1.5 py-0.5 bg-muted text-muted-foreground text-[9px] font-black rounded-full uppercase tracking-wide">Contato</span>
        {/if}
    </div>

    <!-- Specs -->
    <div class="space-y-1.5 flex-1">
        {#if lente.lens_type}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Tipo</span>
                <span class="text-xs text-muted-foreground">{DESCARTE_LABELS[lente.lens_type] ?? lente.lens_type}</span>
            </div>
        {/if}
        {#if lente.material}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Material</span>
                <span class="text-xs text-muted-foreground truncate">{lente.material}</span>
            </div>
        {/if}
        {#if lente.manufacturer_name}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Fab.</span>
                <span class="text-xs text-muted-foreground truncate">{lente.manufacturer_name}</span>
            </div>
        {/if}
        {#if lente.usage_days}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Descarte</span>
                <span class="text-xs text-muted-foreground">{lente.usage_days} dias</span>
            </div>
        {/if}
    </div>

    <!-- Chips (finalidade + dk_t) -->
    <div class="flex flex-wrap gap-1 min-h-[18px]">
        {#if lente.purpose}
            <span class="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[9px] font-black rounded uppercase">
                {lente.purpose.replace('_', ' ')}
            </span>
        {/if}
        {#if lente.dk_t}
            <span class="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-[9px] font-black rounded uppercase">
                Dk/t {lente.dk_t}
            </span>
        {/if}
    </div>

    <!-- Footer preço -->
    <div class="flex items-center justify-between pt-3 border-t border-border">
        <span class="text-micro font-black uppercase tracking-wide text-muted-foreground">
            {lente.units_per_box ? `Caixa · ${lente.units_per_box} unid.` : 'Preço / Caixa'}
        </span>
        <span class="text-base font-black text-foreground">
            {fmt(lente.price_suggested)}
        </span>
    </div>
</a>
