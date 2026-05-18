<script lang="ts">
    /**
     * Catálogo de Lentes de Contato — client-side via browser supabase
     * Fonte: public.v_contact_lenses (migration 281 — COALESCE fix)
     * Padrão visual unificado com /lentes, /standard e /premium
     */
    import { onMount }       from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { goto }          from '$app/navigation';
    import type { PageData } from './$types';
    import { supabase }      from '$lib/supabase';
    import Container         from '$lib/components/layout/Container.svelte';
    import ContactLensCard   from '$lib/components/catalogo/ContactLensCard.svelte';
    import type { RpcContactLensSearchResult as ContactLens } from '$lib/types/database-views';

    export let data: PageData;

    const LIMITE = 24;

    // ── Estado ──────────────────────────────────────────────────────────────────
    let lentes: ContactLens[] = [];
    let total         = 0;
    let total_paginas = 0;
    let loading       = true;
    let erro: string | null = null;

    // Opções de filtro
    let tiposLente: string[]  = [];
    let finalidades: string[] = [];
    let materiais: string[]   = [];
    let marcas_ct: string[]   = [];
    let opcoesCarregadas      = false;

    // Form (espelha URL)
    let busca     = '';
    let lens_type = '';
    let purpose   = '';
    let material  = '';
    let marca      = '';
    let is_colored = false;
    let has_uv_ct  = false;
    let filtrosAbertos = false;

    // ── Labels ───────────────────────────────────────────────────────────────────
    const DESCARTE_LABELS: Record<string, string> = {
        diaria:     'Descarte Diário',
        quinzenal:  'Quinzenal',
        mensal:     'Mensal',
        trimestral: 'Trimestral',
        anual:      'Uso Anual',
    };
    const PURPOSE_LABELS: Record<string, string> = {
        visao_simples: 'Visão Simples',
        torica:        'Tórica (Astigmatismo)',
        multifocal:    'Multifocal',
        cosmetica:     'Cosmético / Colorida',
        terapeutica:   'Terapêutico',
    };

    // ── Fetch principal ──────────────────────────────────────────────────────────
    async function fetchContato() {
        loading = true;
        erro    = null;

        busca     = data.busca     ?? '';
        lens_type = data.lens_type ?? '';
        purpose   = data.purpose   ?? '';
        material  = data.material  ?? '';
        marca     = data.brand     ?? '';
        is_colored = data.is_colored === true;
        has_uv_ct  = data.has_uv ?? false;

        const offset = (data.pagina - 1) * LIMITE;

        let query = supabase
            .from('v_contact_lenses')
            .select(
                'id,brand_name,manufacturer_name,is_premium,product_name,slug,lens_type,purpose,material,is_colored,available_colors,usage_days,units_per_box,dk_t,price_suggested,stock_available,uv_protection',
                { count: 'exact' }
            )
            .eq('status', 'active');

        if (busca)      query = query.or(`product_name.ilike.%${busca}%,brand_name.ilike.%${busca}%`);
        if (lens_type)  query = query.eq('lens_type',    lens_type);
        if (purpose)    query = query.eq('purpose',      purpose);
        if (material)   query = query.eq('material',     material);
        if (marca)      query = query.eq('brand_name',   marca);
        if (is_colored) query = query.eq('is_colored',   true);
        if (has_uv_ct)  query = query.eq('uv_protection', true);

        const { data: rows, count, error: err } = await query
            .order('brand_name',   { ascending: true, nullsFirst: false })
            .order('product_name', { ascending: true })
            .range(offset, offset + LIMITE - 1);

        if (err) {
            erro   = err.message;
            lentes = [];
        } else {
            lentes        = (rows ?? []) as ContactLens[];
            total         = count ?? 0;
            total_paginas = Math.ceil(total / LIMITE);
        }
        loading = false;
    }

    // ── Fetch opções ─────────────────────────────────────────────────────────────
    async function fetchOpcoes() {
        if (opcoesCarregadas) return;
        const { data: rows } = await supabase
            .from('v_contact_lenses')
            .select('lens_type, purpose, material, brand_name')
            .eq('status', 'active')
            .limit(500);
        const ts = new Set<string>();
        const ps = new Set<string>();
        const ms = new Set<string>();
        const bs = new Set<string>();
        for (const r of rows ?? []) {
            if (r.lens_type)   ts.add(r.lens_type);
            if (r.purpose)     ps.add(r.purpose);
            if (r.material)    ms.add(r.material);
            if (r.brand_name)  bs.add(r.brand_name);
        }
        tiposLente  = [...ts].sort();
        finalidades = [...ps].sort();
        materiais   = [...ms].sort();
        marcas_ct   = [...bs].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        opcoesCarregadas = true;
    }

    // ── Navegação ────────────────────────────────────────────────────────────────
    function aplicarFiltros() {
        const p = new URLSearchParams();
        if (busca)      p.set('busca',    busca);
        if (lens_type)  p.set('tipo',     lens_type);
        if (purpose)    p.set('uso',      purpose);
        if (material)   p.set('material', material);
        if (marca)      p.set('marca',    marca);
        if (is_colored) p.set('colorida', '1');
        if (has_uv_ct)  p.set('uv',       '1');
        goto(`/contato?${p.toString()}`);
    }

    function limparFiltros() {
        busca = ''; lens_type = ''; purpose = ''; material = '';
        marca = ''; is_colored = false; has_uv_ct = false;
        goto('/contato');
    }

    function irParaPagina(p: number) {
        const params = new URLSearchParams();
        if (busca)      params.set('busca',    busca);
        if (lens_type)  params.set('tipo',     lens_type);
        if (purpose)    params.set('uso',      purpose);
        if (material)   params.set('material', material);
        if (marca)      params.set('marca',    marca);
        if (is_colored) params.set('colorida', '1');
        if (has_uv_ct)  params.set('uv',       '1');
        params.set('pagina', String(p));
        goto(`/contato?${params.toString()}`);
    }

    // ── Ciclo de vida ────────────────────────────────────────────────────────────
    onMount(() => { fetchOpcoes(); });
    afterNavigate(() => { fetchContato(); });

    $: filtrosAtivos = [data.busca, data.lens_type, data.purpose, data.material,
        data.brand, data.is_colored ? '1' : '', data.has_uv ? '1' : '']
        .filter(Boolean).length;
</script>

<svelte:head>
    <title>Contato ({total.toLocaleString('pt-BR')}) | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-24">

    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <div class="bg-background border-b border-border">
        <Container maxWidth="xl" padding="sm">
            <div class="py-6">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-black rounded-full uppercase tracking-wide">👁️ Contato & Estética</span>
                        </div>
                        <h1 class="text-2xl font-black text-foreground">Lentes de Contato</h1>
                        <p class="text-sm text-muted-foreground mt-1">
                            {#if loading}Carregando...{:else}{total.toLocaleString('pt-BR')} produtos · descarte diário, mensal e coloridas{/if}
                        </p>
                    </div>
                    <a href="/lentes" class="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg hover:bg-accent transition-colors">← Catálogo Ótico</a>
                </div>
            </div>
        </Container>
    </div>

    <Container maxWidth="xl" padding="md">

        <!-- ── Filtros ───────────────────────────────────────────────────────── -->
        <div class="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
            <button
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors text-left"
                on:click={() => (filtrosAbertos = !filtrosAbertos)}
                type="button"
            >
                <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                    </svg>
                    <span class="text-sm font-bold text-foreground">Filtros</span>
                    {#if filtrosAtivos > 0}
                        <span class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-black rounded-full">
                            {filtrosAtivos} {filtrosAtivos === 1 ? 'ativo' : 'ativos'}
                        </span>
                    {/if}
                </div>
                <svg class="w-4 h-4 text-muted-foreground transition-transform duration-base {filtrosAbertos ? 'rotate-180' : ''}"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {#if filtrosAbertos}
                <div class="border-t border-border px-5 py-5">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Buscar</label>
                            <input type="text" bind:value={busca}
                                placeholder="Marca ou nome..."
                                on:keydown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                class="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"/>
                        </div>
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Marca</label>
                            <select bind:value={marca}
                                class="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                                <option value="">Todas</option>
                                {#each marcas_ct as m}
                                    <option value={m}>{m}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Descarte</label>
                            <select bind:value={lens_type}
                                class="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                                <option value="">Todos</option>
                                {#each tiposLente as t}
                                    <option value={t}>{DESCARTE_LABELS[t] ?? t}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Finalidade</label>
                            <select bind:value={purpose}
                                class="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                                <option value="">Todas</option>
                                {#each finalidades as p}
                                    <option value={p}>{PURPOSE_LABELS[p] ?? p.replace('_', ' ')}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Material</label>
                            <select bind:value={material}
                                class="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                                <option value="">Todos</option>
                                {#each materiais as m}
                                    <option value={m}>{m}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center gap-6">
                        <div>
                            <label class="block text-micro font-black uppercase tracking-wider text-muted-foreground mb-2">Características</label>
                            <div class="flex flex-wrap gap-x-5 gap-y-2">
                                <label class="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" bind:checked={is_colored} class="w-3.5 h-3.5 rounded accent-primary-600"/>
                                    <span class="text-sm text-foreground">Colorida / Estética</span>
                                </label>
                                <label class="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" bind:checked={has_uv_ct} class="w-3.5 h-3.5 rounded accent-primary-600"/>
                                    <span class="text-sm text-foreground">Proteção UV</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                        <button type="button" on:click={aplicarFiltros}
                            class="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors">
                            Aplicar Filtros
                        </button>
                        {#if filtrosAtivos > 0}
                            <button type="button" on:click={limparFiltros}
                                class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Limpar tudo
                            </button>
                        {/if}
                        <span class="text-xs text-muted-foreground ml-auto">
                            {#if !loading}{total.toLocaleString('pt-BR')} resultado{total !== 1 ? 's' : ''}{/if}
                        </span>
                    </div>
                </div>
            {/if}
        </div>

        <!-- ── Grid ──────────────────────────────────────────────────────────── -->
        <div class="mt-6">
            {#if loading}
                <div class="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-2xl">
                    <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-muted-foreground text-sm">Buscando lentes de contato...</p>
                </div>

            {:else if erro}
                <div class="py-16 text-center bg-card border border-red-200 dark:border-red-900 rounded-2xl">
                    <p class="text-red-500 font-semibold">{erro}</p>
                    <button type="button" on:click={fetchContato}
                        class="mt-4 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg">
                        Tentar novamente
                    </button>
                </div>

            {:else if lentes.length === 0}
                <div class="py-24 text-center">
                    <div class="text-5xl mb-4">👁️‍🗨️</div>
                    <p class="text-muted-foreground text-lg font-semibold">Nenhuma lente encontrada</p>
                    <p class="text-muted-foreground text-sm mt-1">Tente ajustar os filtros</p>
                    {#if filtrosAtivos > 0}
                        <button type="button" on:click={limparFiltros}
                            class="mt-5 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold transition-colors">
                            ← Limpar filtros
                        </button>
                    {/if}
                </div>

            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {#each lentes as lente (lente.id)}
                        <ContactLensCard {lente} />
                    {/each}
                </div>

                <!-- ── Paginação ──────────────────────────────────────────────── -->
                {#if total_paginas > 1}
                    <div class="flex flex-col items-center gap-3 mt-10">
                        <div class="flex items-center gap-2">
                            <button type="button" disabled={data.pagina <= 1}
                                on:click={() => irParaPagina(data.pagina - 1)}
                                class="px-4 py-2 text-sm font-bold rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                ← Anterior
                            </button>
                            <div class="flex items-center gap-1">
                                {#each Array.from({ length: total_paginas }, (_, i) => i + 1) as p}
                                    {#if p === 1 || p === total_paginas || (p >= data.pagina - 2 && p <= data.pagina + 2)}
                                        <button type="button" on:click={() => irParaPagina(p)}
                                            class="w-9 h-9 text-sm font-bold rounded-lg transition-colors {p === data.pagina ? 'bg-primary-600 text-white shadow-sm' : 'bg-card border border-border text-muted-foreground hover:bg-accent'}">
                                            {p}
                                        </button>
                                    {:else if p === data.pagina - 3 || p === data.pagina + 3}
                                        <span class="text-muted-foreground text-sm px-1">…</span>
                                    {/if}
                                {/each}
                            </div>
                            <button type="button" disabled={data.pagina >= total_paginas}
                                on:click={() => irParaPagina(data.pagina + 1)}
                                class="px-4 py-2 text-sm font-bold rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                Próxima →
                            </button>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            Página {data.pagina} de {total_paginas} · {total.toLocaleString('pt-BR')} produtos
                        </p>
                    </div>
                {/if}
            {/if}
        </div>

    </Container>
</main>
