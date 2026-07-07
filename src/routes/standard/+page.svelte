<script lang="ts">
    /**
     * Standard Collection v4 — Sidebar unificada (padrão CanonicalFilterSidebar)
     *
     * Fonte: catalog_lenses.rpc_standard_filter_options + rpc_standard_search.
     * Sem marca. Material e tratamento são os filtros principais.
     */
    import { afterNavigate } from '$app/navigation';
    import { goto }          from '$app/navigation';
    import type { PageData } from './$types';
    import { LensOracleAPI } from '$lib/api/lens-oracle';
    import Container         from '$lib/components/layout/Container.svelte';
    import CanonicalFilterSidebar from '$lib/components/filters/CanonicalFilterSidebar.svelte';
    import type { StandardFilterOptions, CanonicalStandardV3 } from '$lib/types/database-views';

    export let data: PageData;

    const LIMITE = 24;

    let items: CanonicalStandardV3[] = [];
    let total = 0;
    let total_paginas = 0;
    let loading = true;
    let loadingFilters = true;
    let erro: string | null = null;
    let filterOptions: StandardFilterOptions | null = null;

    $: filtros = {
        lensType:   data.lens_type   ?? null,
        materialId: data.material_id ?? null,
        treatments: data.treatments  ?? [],
        excludeTreatments: data.exclude_treatments ?? [],
        priceMin:   data.price_min   ?? null,
        priceMax:   data.price_max   ?? null,
    };

    const TIPO_LABELS: Record<string, string> = {
        single_vision: 'Visão Simples',
        multifocal:    'Multifocal',
        bifocal:       'Bifocal',
        occupational:  'Ocupacional',
    };

    const TREATMENT_CLASSES: Record<string, string> = {
        ar:      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        blue:    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
        photo:   'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        uv:      'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
        scratch: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        pol:     'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    };

    async function fetchFilterOptions() {
        loadingFilters = true;
        const res = await LensOracleAPI.getStandardFilterOptions({
            lens_type:   filtros.lensType   || undefined,
            material_id: filtros.materialId || undefined,
            treatments:  filtros.treatments?.length ? filtros.treatments : undefined,
            exclude_treatments: filtros.excludeTreatments?.length ? filtros.excludeTreatments : undefined,
        });
        if (res.data) filterOptions = res.data as any;
        loadingFilters = false;
    }

    async function fetchResults() {
        loading = true;
        erro = null;
        const offset = (data.pagina - 1) * LIMITE;
        const res = await LensOracleAPI.searchStandard({
            lens_type:   filtros.lensType   || undefined,
            material_id: filtros.materialId || undefined,
            treatments:  filtros.treatments?.length ? filtros.treatments : undefined,
            exclude_treatments: filtros.excludeTreatments?.length ? filtros.excludeTreatments : undefined,
            price_min:   filtros.priceMin   ?? undefined,
            price_max:   filtros.priceMax   ?? undefined,
            limit: LIMITE,
            offset,
        });
        if (res.error) { erro = res.error.message; items = []; }
        else if (res.data) {
            items = res.data.items ?? [];
            total = res.data.total ?? 0;
            total_paginas = Math.ceil(total / LIMITE);
        }
        loading = false;
    }

    function navegar(next: typeof filtros) {
        const p = new URLSearchParams();
        if (next.lensType)   p.set('tipo',     next.lensType);
        if (next.materialId) p.set('material', next.materialId);
        if (next.treatments?.length) p.set('trat', next.treatments.join(','));
        if (next.excludeTreatments?.length) p.set('sem', next.excludeTreatments.join(','));
        if (next.priceMin != null) p.set('precoMin', String(next.priceMin));
        if (next.priceMax != null) p.set('precoMax', String(next.priceMax));
        goto(`/standard${p.toString() ? '?' + p.toString() : ''}`);
    }

    function irParaPagina(pg: number) {
        const params = new URLSearchParams();
        if (filtros.lensType)   params.set('tipo',     filtros.lensType);
        if (filtros.materialId) params.set('material', filtros.materialId);
        if (filtros.treatments?.length) params.set('trat', filtros.treatments.join(','));
        if (filtros.excludeTreatments?.length) params.set('sem', filtros.excludeTreatments.join(','));
        if (filtros.priceMin != null) params.set('precoMin', String(filtros.priceMin));
        if (filtros.priceMax != null) params.set('precoMax', String(filtros.priceMax));
        params.set('pagina', String(pg));
        goto(`/standard?${params.toString()}`);
    }

    afterNavigate(() => {
        fetchFilterOptions();
        fetchResults();
    });

    function fmt(v: number | null | undefined): string {
        if (v == null) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }
</script>

<svelte:head>
    <title>Standard ({total.toLocaleString('pt-BR')}) | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-20">
    <!-- Hero -->
    <div class="bg-background border-b border-border">
        <Container>
            <div class="py-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <span class="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-xs font-black rounded-full uppercase tracking-wide">Standard</span>
                    <h1 class="text-2xl font-black text-foreground mt-1">Standard Collection</h1>
                    <p class="text-sm text-muted-foreground mt-1">
                        {#if loading}Carregando…{:else}{total.toLocaleString('pt-BR')} conceitos · foco técnico (sem marca){/if}
                    </p>
                </div>
                <div class="flex gap-2">
                    <a href="/lentes" class="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg hover:bg-accent transition-colors">Lentes reais</a>
                    <a href="/premium" class="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">Premium</a>
                </div>
            </div>
        </Container>
    </div>

    <Container>
        <div class="py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

            <CanonicalFilterSidebar
                context="standard"
                {filterOptions}
                {filtros}
                loading={loadingFilters}
                onApply={navegar}
            />

            <div class="lg:col-span-3 space-y-4">
                {#if loading}
                    <div class="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-2xl">
                        <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p class="text-muted-foreground text-sm">Carregando standard…</p>
                    </div>
                {:else if erro}
                    <div class="py-16 text-center bg-card border border-red-200 dark:border-red-900 rounded-2xl">
                        <p class="text-red-500 font-semibold">{erro}</p>
                    </div>
                {:else if items.length === 0}
                    <div class="py-24 text-center bg-card border border-border rounded-2xl">
                        <p class="text-muted-foreground text-lg font-semibold">Nenhum conceito standard encontrado</p>
                        <p class="text-muted-foreground text-sm mt-1">Tente ajustar os filtros</p>
                    </div>
                {:else}
                    <p class="text-sm text-muted-foreground">
                        Mostrando <span class="font-bold text-foreground">{items.length}</span> de
                        <span class="font-bold text-foreground">{total.toLocaleString('pt-BR')}</span>
                        conceitos standard
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {#each items as c (c.id)}
                            <a href="/standard/{c.id}"
                                class="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-base flex flex-col gap-3 no-underline">

                                <div>
                                    <h3 class="font-bold text-foreground text-sm leading-snug line-clamp-2">{c.canonical_name ?? '—'}</h3>
                                    {#if c.sku}
                                        <p class="font-mono text-micro text-muted-foreground mt-0.5">{c.sku}</p>
                                    {/if}
                                </div>

                                <div class="space-y-1 flex-1">
                                    <p class="text-xs text-muted-foreground">
                                        <span class="font-semibold">{TIPO_LABELS[c.lens_type] ?? c.lens_type}</span>
                                        {#if c.material_name} · {c.material_name}{/if}
                                        {#if c.refractive_index} · n={c.refractive_index}{/if}
                                    </p>
                                </div>

                                {#if c.treatment_codes && c.treatment_codes.length > 0}
                                    <div class="flex flex-wrap gap-1">
                                        {#each c.treatment_codes as t}
                                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-micro font-bold uppercase {TREATMENT_CLASSES[t] ?? 'bg-muted text-muted-foreground'}">{t}</span>
                                        {/each}
                                    </div>
                                {/if}

                                <div class="flex items-center justify-between pt-3 border-t border-border">
                                    <span class="text-micro text-muted-foreground">
                                        {c.mapped_lens_count} lentes · {c.mapped_supplier_count} forn.
                                    </span>
                                    {#if c.price_avg}
                                        <span class="text-xs font-bold text-sky-700 dark:text-sky-300">{fmt(c.price_avg)}</span>
                                    {/if}
                                </div>
                            </a>
                        {/each}
                    </div>

                    {#if total_paginas > 1}
                        <div class="flex items-center justify-center gap-2 pt-4">
                            <button type="button" disabled={data.pagina <= 1}
                                on:click={() => irParaPagina(data.pagina - 1)}
                                class="px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
                                ← Anterior
                            </button>
                            <span class="text-sm text-muted-foreground">
                                Página <span class="font-bold text-foreground">{data.pagina}</span> de <span class="font-bold text-foreground">{total_paginas}</span>
                            </span>
                            <button type="button" disabled={data.pagina >= total_paginas}
                                on:click={() => irParaPagina(data.pagina + 1)}
                                class="px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
                                Próxima →
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </Container>
</main>
