<script lang="ts">
    /**
     * LenteCard — card padrão para lentes do v_catalog_lenses
     * Padrão visual unificado com /lentes, /standard, /premium e /contato
     */
    import type { VCatalogLens, RpcLensSearchResult } from '$lib/types/database-views';

    export let lente: VCatalogLens | RpcLensSearchResult | any;
    export let href: string | undefined = undefined;

    const TIPO_LABELS: Record<string, string> = {
        single_vision: 'Visão Simples',
        multifocal:    'Multifocal',
        bifocal:       'Bifocal',
        occupational:  'Ocupacional',
    };

    function fmt(v: number | null | undefined): string {
        if (!v) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }

    $: _l = lente as any;

    $: tratamentos = (() => {
        const nomes: string[] = _l.treatment_names ?? [];
        if (nomes.length > 0) {
            return nomes.map((n: string) => {
                const u = n.toUpperCase();
                if (u.includes('REFLEX') || u.includes('ANTI-RE')) return 'AR';
                if (u.includes('RISCO'))                            return 'AS';
                if (u.includes('UV'))                               return 'UV';
                if (u.includes('BLUE') || u.includes('VIDEO'))      return 'Blue';
                if (u.includes('FOTOCR'))                           return 'Foto';
                if (u.includes('TRANSIT'))                          return 'Trans';
                if (u.includes('POLARIZ'))                          return 'Pol';
                return n.split(' ')[0];
            });
        }
        const t: string[] = [];
        if (_l.anti_reflective) t.push('AR');
        if (_l.anti_scratch)    t.push('AS');
        if (_l.uv_filter)       t.push('UV');
        if (_l.blue_light)      t.push('Blue');
        if (_l.photochromic)    t.push('Foto');
        if (_l.polarized)       t.push('Pol');
        return t;
    })();

    $: destino = href ?? `/lentes/${_l.id}`;
</script>

<a href={destino}
    class="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-base flex flex-col gap-3 no-underline">

    <!-- Nome + badge linha -->
    <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-foreground text-sm leading-snug line-clamp-2">
                {_l.lens_name ?? _l.nome ?? '—'}
            </h3>
            <p class="text-micro text-muted-foreground mt-0.5 truncate">
                {_l.supplier_name ?? _l.fornecedor ?? '—'}
            </p>
        </div>
        {#if _l.is_premium}
            <span class="shrink-0 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black rounded-full uppercase tracking-wide">★ PRE</span>
        {:else}
            <span class="shrink-0 px-1.5 py-0.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-[9px] font-black rounded-full uppercase tracking-wide">STD</span>
        {/if}
    </div>

    <!-- Specs -->
    <div class="space-y-1.5 flex-1">
        {#if _l.brand_name || _l.marca}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Marca</span>
                <span class="text-xs text-muted-foreground truncate">{_l.brand_name ?? _l.marca}</span>
            </div>
        {/if}
        {#if _l.lens_type ?? _l.tipo_lente}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Tipo</span>
                <span class="text-xs text-muted-foreground">{TIPO_LABELS[_l.lens_type ?? _l.tipo_lente] ?? _l.lens_type ?? _l.tipo_lente}</span>
            </div>
        {/if}
        {#if _l.material_name}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">Material</span>
                <span class="text-xs text-muted-foreground leading-tight">
                    {_l.material_name}{#if _l.refractive_index} · <span class="text-muted-foreground">n={_l.refractive_index}</span>{/if}
                </span>
            </div>
        {/if}
        {#if _l.sku}
            <div class="flex items-center gap-2">
                <span class="text-micro font-black uppercase tracking-wide text-muted-foreground w-14 shrink-0">SKU</span>
                <span class="font-mono text-micro bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{_l.sku}</span>
            </div>
        {/if}
    </div>

    <!-- Treatment chips -->
    <div class="flex flex-wrap gap-1 min-h-[18px]">
        {#each tratamentos as trat}
            <span class="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[9px] font-black rounded uppercase">{trat}</span>
        {/each}
    </div>

    <!-- Footer preço -->
    <div class="flex items-center justify-between pt-3 border-t border-border">
        <span class="text-micro font-black uppercase tracking-wide text-muted-foreground">
            {_l.price_suggested ?? _l.preco ? 'Sugerido' : _l.price_min ? 'A partir de' : 'Preço'}
        </span>
        <span class="text-base font-black text-foreground">
            {#if _l.price_suggested ?? _l.preco}
                {fmt(_l.price_suggested ?? _l.preco)}
            {:else if _l.price_min}
                {fmt(_l.price_min)}
            {:else}
                Sob Consulta
            {/if}
        </span>
    </div>
</a>
