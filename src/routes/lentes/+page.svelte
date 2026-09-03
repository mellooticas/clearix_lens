<script lang="ts">
    /**
     * Catálogo de Lentes Reais
     *
     * Mostra TODAS as 3.698 lentes reais (v_catalog_lenses), divididas em
     * tabs Premium / Standard via flag is_premium. Conceitos canônicos NÃO
     * aparecem aqui — só no detalhe individual da lente.
     */
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Crown, Sparkles, Search, X, Sun, Eye, Droplets, Shield, Zap, Palette } from 'lucide-svelte';
    import Container from '$lib/components/layout/Container.svelte';
    import FilterSection from '$lib/components/filters/FilterSection.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    $: lentes         = data.lentes;
    $: total          = data.total;
    $: premiumTotal   = data.premiumTotal;
    $: standardTotal  = data.standardTotal;
    $: pagina         = data.pagina;
    $: pageSize       = data.pageSize;
    $: totalPages     = Math.max(1, Math.ceil(total / pageSize));
    $: filtros        = data.filtros;
    $: filterOptions  = data.filterOptions;
    $: hasActiveFilters = !!(
        filtros.busca || filtros.excluir || filtros.tipo || filtros.fornecedor || filtros.marca ||
        filtros.material || filtros.indice != null || filtros.isPremium !== null ||
        filtros.coating || filtros.linha || filtros.design || filtros.altura ||
        filtros.precoMin != null || filtros.precoMax != null ||
        (filtros.treatments?.length ?? 0) > 0 || (filtros.excludeTreatments?.length ?? 0) > 0
    );

    // Badges dos módulos recolhidos (resumo do valor ativo no cabeçalho)
    $: fornecedorLabel = filtros.fornecedor ? (filterOptions.laboratorios.find(o => o.value === filtros.fornecedor)?.label ?? '1 ativo') : null;
    $: marcaLabel      = filtros.marca      ? (filterOptions.marcas.find(o => o.value === filtros.marca)?.label ?? '1 ativo') : null;
    $: materialLabel   = filtros.material   ? (filterOptions.materiais.find(o => o.value === filtros.material)?.label ?? '1 ativo') : null;
    $: precoLabel      = (filtros.precoMin != null || filtros.precoMax != null)
        ? `${filtros.precoMin ?? '…'}–${filtros.precoMax ?? '…'}` : null;
    $: tratAtivos = (filtros.treatments?.length ?? 0) + (filtros.excludeTreatments?.length ?? 0);
    $: tratLabel  = tratAtivos > 0 ? `${tratAtivos} ativo${tratAtivos > 1 ? 's' : ''}` : null;

    // ── Tratamentos: tri-state (padrão Vendas) ───────────────────────────────
    // neutro (tanto faz) → verde (quero) → vermelho riscado (não quero) → neutro
    type TriState = 'neutral' | 'include' | 'exclude';

    const TRATAMENTOS = [
        { code: 'ar',      label: 'AR',    icon: Sparkles },
        { code: 'blue',    label: 'Blue',  icon: Eye },
        { code: 'photo',   label: 'Foto',  icon: Sun },
        { code: 'uv',      label: 'UV',    icon: Zap },
        { code: 'scratch', label: 'Risco', icon: Shield },
        { code: 'pol',     label: 'Polar', icon: Palette },
        { code: 'hidro',   label: 'Hidro', icon: Droplets },
    ] as const;

    function estadoTrat(code: string): TriState {
        if ((filtros.treatments ?? []).includes(code)) return 'include';
        if ((filtros.excludeTreatments ?? []).includes(code)) return 'exclude';
        return 'neutral';
    }

    /** Quantas lentes têm este tratamento, já considerando os outros filtros. */
    function countTrat(code: string): number {
        return filterOptions.treatments?.find(t => t.value === code)?.count ?? 0;
    }

    function cycleTratamento(code: string) {
        const inc = [...(filtros.treatments ?? [])];
        const exc = [...(filtros.excludeTreatments ?? [])];
        const estado = estadoTrat(code);

        let nextInc = inc;
        let nextExc = exc;
        if (estado === 'neutral') {
            nextInc = [...inc, code];
        } else if (estado === 'include') {
            nextInc = inc.filter(c => c !== code);
            nextExc = [...exc, code];
        } else {
            nextExc = exc.filter(c => c !== code);
        }

        // Limpa os booleans legados (ar=true) — a URL canônica é trat / trat_nao
        const params: Record<string, string | null> = {};
        for (const t of TRATAMENTOS) params[t.code] = null;
        params.trat     = nextInc.length ? nextInc.join(',') : null;
        params.trat_nao = nextExc.length ? nextExc.join(',') : null;
        navegar(params);
    }

    function classeTrat(code: string): string {
        const estado = estadoTrat(code);
        if (estado === 'include') return 'bg-green-600 text-white shadow-sm hover:bg-green-700';
        if (estado === 'exclude') return 'bg-red-600 text-white shadow-sm line-through hover:bg-red-700';
        // Neutro, mas o catálogo não tem nenhuma com este tratamento no contexto atual
        if (countTrat(code) === 0) return 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500/70 border border-dashed border-red-300 dark:border-red-800';
        return 'bg-muted text-muted-foreground hover:bg-accent';
    }

    function tituloTrat(code: string): string {
        const estado = estadoTrat(code);
        const n = countTrat(code);
        if (estado === 'include') return `Mostrando só as COM — clique para excluir (${n})`;
        if (estado === 'exclude') return 'Escondendo as COM — clique para limpar';
        return n === 0 ? 'Não temos nenhuma assim com os filtros atuais' : `${n} lentes têm — clique para exigir`;
    }

    // Inputs locais de preço (só navega ao soltar)
    let precoMinInput: string = '';
    let precoMaxInput: string = '';
    $: precoMinInput = filtros.precoMin != null ? String(filtros.precoMin) : '';
    $: precoMaxInput = filtros.precoMax != null ? String(filtros.precoMax) : '';

    function aplicarPreco() {
        navegar({
            precoMin: precoMinInput ? precoMinInput : null,
            precoMax: precoMaxInput ? precoMaxInput : null,
        });
    }

    // Tab ativo derivado do filtro is_premium
    $: activeTab = filtros.isPremium === true  ? 'premium'
                 : filtros.isPremium === false ? 'standard'
                 : 'todos';

    // Busca local (input) — contém / não contém (termos separados por vírgula)
    let buscaInput = '';
    let excluirInput = '';
    $: buscaInput   = filtros.busca ?? '';
    $: excluirInput = filtros.excluir ?? '';

    function navegar(params: Record<string, string | number | null>) {
        const url = new URL($page.url);
        for (const [k, v] of Object.entries(params)) {
            if (v === null || v === '') url.searchParams.delete(k);
            else url.searchParams.set(k, String(v));
        }
        // Reset paginação ao mudar filtros
        if (!('pagina' in params)) url.searchParams.delete('pagina');
        goto(url.pathname + url.search, { keepFocus: true, noScroll: false });
    }

    function setTab(tab: 'todos' | 'premium' | 'standard') {
        const premium = tab === 'premium' ? 'true' : tab === 'standard' ? 'false' : null;
        navegar({ premium });
    }

    function aplicarBusca() {
        navegar({ busca: buscaInput || null, excluir: excluirInput || null });
    }

    function setFiltro(key: 'tipo' | 'fornecedor' | 'marca' | 'material' | 'indice' | 'coating' | 'linha' | 'design' | 'altura', value: string | null) {
        navegar({ [key]: value });
    }


    function limparFiltros() {
        goto('/lentes');
    }

    function fmtBRL(v: number | null | undefined): string {
        if (v == null) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }

    const TIPO_LABELS: Record<string, string> = {
        single_vision: 'Visão Simples',
        multifocal:    'Multifocal',
        bifocal:       'Bifocal',
        occupational:  'Ocupacional',
    };
</script>

<svelte:head>
    <title>Catálogo de Lentes | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-20">
    <!-- Hero -->
    <div class="bg-background border-b border-border">
        <Container>
            <div class="py-10">
                <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Catálogo de Lentes
                </h1>
                <p class="mt-2 text-muted-foreground">
                    {total.toLocaleString('pt-BR')} lentes reais — Premium e Standard
                </p>
            </div>
        </Container>
    </div>

    <Container>
        <div class="py-8 space-y-6">

            <!-- KPIs -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div class="rounded-xl bg-card border border-border p-4">
                    <p class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Total</p>
                    <p class="text-3xl font-black text-foreground">{(premiumTotal + standardTotal).toLocaleString('pt-BR')}</p>
                </div>
                <div class="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4">
                    <div class="flex items-center gap-2 mb-1">
                        <Crown class="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p class="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Premium</p>
                    </div>
                    <p class="text-3xl font-black text-amber-900 dark:text-amber-100">{premiumTotal.toLocaleString('pt-BR')}</p>
                </div>
                <div class="rounded-xl bg-cyan-50 dark:bg-cyan-950/30 p-4">
                    <div class="flex items-center gap-2 mb-1">
                        <Sparkles class="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <p class="text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Standard</p>
                    </div>
                    <p class="text-3xl font-black text-cyan-900 dark:text-cyan-100">{standardTotal.toLocaleString('pt-BR')}</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-2 border-b border-border">
                <button
                    class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors {activeTab === 'todos' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
                    on:click={() => setTab('todos')}
                >
                    Todas ({(premiumTotal + standardTotal).toLocaleString('pt-BR')})
                </button>
                <button
                    class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 {activeTab === 'premium' ? 'border-amber-600 text-amber-700 dark:text-amber-300' : 'border-transparent text-muted-foreground hover:text-foreground'}"
                    on:click={() => setTab('premium')}
                >
                    <Crown class="h-3.5 w-3.5" />
                    Premium ({premiumTotal.toLocaleString('pt-BR')})
                </button>
                <button
                    class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 {activeTab === 'standard' ? 'border-cyan-600 text-cyan-700 dark:text-cyan-300' : 'border-transparent text-muted-foreground hover:text-foreground'}"
                    on:click={() => setTab('standard')}
                >
                    <Sparkles class="h-3.5 w-3.5" />
                    Standard ({standardTotal.toLocaleString('pt-BR')})
                </button>
            </div>

            <!-- Search bar: contém / não contém (termos separados por vírgula) -->
            <div class="flex gap-2 flex-wrap md:flex-nowrap">
                <div class="relative flex-1 min-w-[220px]">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                    <input
                        type="text"
                        placeholder="Contém… nome, marca, fornecedor ou SKU (real/canônico); vírgula = E"
                        bind:value={buscaInput}
                        on:keydown={(e) => e.key === 'Enter' && aplicarBusca()}
                        class="w-full pl-10 pr-4 py-2 bg-card border border-emerald-200 dark:border-emerald-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div class="relative flex-1 min-w-[220px]">
                    <X class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <input
                        type="text"
                        placeholder="Não contém… ex.: pronta, bloco"
                        bind:value={excluirInput}
                        on:keydown={(e) => e.key === 'Enter' && aplicarBusca()}
                        class="w-full pl-10 pr-4 py-2 bg-card border border-red-200 dark:border-red-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                </div>
                <button
                    on:click={aplicarBusca}
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Buscar
                </button>
                {#if hasActiveFilters}
                    <button
                        on:click={limparFiltros}
                        class="px-3 py-2 bg-muted hover:bg-accent text-muted-foreground text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <X class="h-4 w-4" /> Limpar
                    </button>
                {/if}
            </div>

            <!-- Sidebar + Lista -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

                <!-- Sidebar de filtros -->
                <aside class="lg:col-span-1 space-y-4">
                    <div class="bg-card border border-border rounded-2xl p-5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-black uppercase tracking-wider text-foreground">Filtros</h2>
                            {#if hasActiveFilters}
                                <button
                                    on:click={limparFiltros}
                                    class="text-micro font-bold uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <X class="h-3 w-3" /> Limpar
                                </button>
                            {/if}
                        </div>

                        <!-- Módulos recolhíveis (padrão visual Finance: escondido + expansão) -->
                        <div class="space-y-2">

                        <FilterSection id="fornecedor" title="Laboratório" active={fornecedorLabel}>
                            <select
                                id="filtro-fornecedor"
                                value={filtros.fornecedor ?? ''}
                                on:change={(e) => setFiltro('fornecedor', e.currentTarget.value || null)}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Todos ({filterOptions.laboratorios.length})</option>
                                {#each filterOptions.laboratorios as opt}
                                    <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                {/each}
                            </select>
                        </FilterSection>

                        {#if filterOptions.marcas.length > 0}
                            <FilterSection id="marca" title="Marca" active={marcaLabel}>
                                <select
                                    id="filtro-marca"
                                    value={filtros.marca ?? ''}
                                    on:change={(e) => setFiltro('marca', e.currentTarget.value || null)}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Todas ({filterOptions.marcas.length})</option>
                                    {#each filterOptions.marcas as opt}
                                        <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                    {/each}
                                </select>
                            </FilterSection>
                        {/if}

                        {#if filterOptions.product_lines.length > 0}
                            <FilterSection id="linha" title="Linha de produto" active={filtros.linha ?? null}>
                                <select
                                    id="filtro-linha"
                                    value={filtros.linha ?? ''}
                                    on:change={(e) => setFiltro('linha', e.currentTarget.value || null)}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Todas ({filterOptions.product_lines.length})</option>
                                    {#each filterOptions.product_lines as opt}
                                        <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.value} ({opt.count})</option>
                                    {/each}
                                </select>
                            </FilterSection>
                        {/if}

                        <FilterSection id="tipo" title="Tipo" active={filtros.tipo ? (TIPO_LABELS[filtros.tipo] ?? filtros.tipo) : null}>
                            <select
                                id="filtro-tipo"
                                value={filtros.tipo ?? ''}
                                on:change={(e) => setFiltro('tipo', e.currentTarget.value || null)}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Todos</option>
                                {#each filterOptions.tipos as opt}
                                    <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                {/each}
                            </select>
                        </FilterSection>

                        <FilterSection id="material" title="Material" active={materialLabel}>
                            <select
                                id="filtro-material"
                                value={filtros.material ?? ''}
                                on:change={(e) => setFiltro('material', e.currentTarget.value || null)}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Todos ({filterOptions.materiais.length})</option>
                                {#each filterOptions.materiais as opt}
                                    <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                {/each}
                            </select>
                        </FilterSection>

                        <FilterSection id="indice" title="Índice de refração" active={filtros.indice != null ? `n = ${filtros.indice}` : null}>
                            <select
                                id="filtro-indice"
                                value={filtros.indice != null ? String(filtros.indice) : ''}
                                on:change={(e) => setFiltro('indice', e.currentTarget.value || null)}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Todos</option>
                                {#each filterOptions.indices as opt}
                                    <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                {/each}
                            </select>
                        </FilterSection>

                        {#if filterOptions.coatings.length > 0}
                            <FilterSection id="coating" title="Coating" active={filtros.coating ?? null}>
                                <select
                                    id="filtro-coating"
                                    value={filtros.coating ?? ''}
                                    on:change={(e) => setFiltro('coating', e.currentTarget.value || null)}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Todos ({filterOptions.coatings.length})</option>
                                    {#each filterOptions.coatings as opt}
                                        <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.value} ({opt.count})</option>
                                    {/each}
                                </select>
                            </FilterSection>
                        {/if}

                        {#if filterOptions.lens_designs.length > 0}
                            <FilterSection id="design" title="Design" active={filtros.design ?? null}>
                                <select
                                    id="filtro-design"
                                    value={filtros.design ?? ''}
                                    on:change={(e) => setFiltro('design', e.currentTarget.value || null)}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Todos</option>
                                    {#each filterOptions.lens_designs as opt}
                                        <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.value} ({opt.count})</option>
                                    {/each}
                                </select>
                            </FilterSection>
                        {/if}

                        {#if filterOptions.min_heights.length > 0}
                            <FilterSection id="altura" title="Altura mínima" active={filtros.altura ? `${filtros.altura} mm` : null}>
                                <select
                                    id="filtro-altura"
                                    value={filtros.altura ?? ''}
                                    on:change={(e) => setFiltro('altura', e.currentTarget.value || null)}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Todas</option>
                                    {#each filterOptions.min_heights as opt}
                                        <option value={opt.value} disabled={opt.count === 0} class={opt.count === 0 ? 'text-red-400' : ''}>{opt.count === 0 ? '— ' : ''}{opt.label} ({opt.count})</option>
                                    {/each}
                                </select>
                            </FilterSection>
                        {/if}

                        <FilterSection id="preco" title="Faixa de preço" active={precoLabel}>
                            <div class="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={filterOptions.price_min}
                                    max={filterOptions.price_max}
                                    step="10"
                                    placeholder={String(Math.floor(filterOptions.price_min))}
                                    bind:value={precoMinInput}
                                    on:blur={aplicarPreco}
                                    on:keydown={(e) => e.key === 'Enter' && aplicarPreco()}
                                    class="w-full px-2 py-2 border border-border rounded-lg text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span class="text-muted-foreground text-xs">→</span>
                                <input
                                    type="number"
                                    min={filterOptions.price_min}
                                    max={filterOptions.price_max}
                                    step="10"
                                    placeholder={String(Math.ceil(filterOptions.price_max))}
                                    bind:value={precoMaxInput}
                                    on:blur={aplicarPreco}
                                    on:keydown={(e) => e.key === 'Enter' && aplicarPreco()}
                                    class="w-full px-2 py-2 border border-border rounded-lg text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <p class="text-micro text-muted-foreground mt-1">
                                R$ {filterOptions.price_min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R$ {filterOptions.price_max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </p>
                        </FilterSection>

                        <FilterSection id="tratamentos" title="Tratamentos" active={tratLabel}>
                            <p class="text-micro text-muted-foreground mb-2 flex items-center gap-2 flex-wrap">
                                <span class="inline-flex items-center gap-1">
                                    <span class="inline-block w-2 h-2 rounded-full bg-muted-foreground/40"></span> tanto faz
                                </span>
                                <span class="inline-flex items-center gap-1">
                                    <span class="inline-block w-2 h-2 rounded-full bg-green-600"></span> quero
                                </span>
                                <span class="inline-flex items-center gap-1">
                                    <span class="inline-block w-2 h-2 rounded-full bg-red-600"></span> não quero
                                </span>
                            </p>
                            <div class="grid grid-cols-2 gap-1.5">
                                {#each TRATAMENTOS as t (t.code)}
                                    <button
                                        type="button"
                                        on:click={() => cycleTratamento(t.code)}
                                        title={tituloTrat(t.code)}
                                        class="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {classeTrat(t.code)}"
                                    >
                                        <span class="flex items-center gap-1.5">
                                            <svelte:component this={t.icon} class="h-3 w-3" />
                                            {t.label}
                                        </span>
                                        <span class="tabular-nums opacity-70">{countTrat(t.code)}</span>
                                    </button>
                                {/each}
                            </div>
                        </FilterSection>

                        </div>
                    </div>
                </aside>

                <!-- Conteúdo principal -->
                <div class="lg:col-span-3 space-y-4">
                    {#if lentes.length === 0}
                        <div class="bg-card border border-border rounded-2xl p-12 text-center">
                            <p class="text-muted-foreground">Nenhuma lente encontrada com os filtros atuais.</p>
                        </div>
                    {:else}
                        <p class="text-sm text-muted-foreground">
                            Mostrando <span class="font-bold text-foreground">{lentes.length}</span> de
                            <span class="font-bold text-foreground">{total.toLocaleString('pt-BR')}</span>
                            {total === 1 ? 'lente' : 'lentes'}
                        </p>

                        <div class="bg-card border border-border rounded-2xl overflow-hidden">
                            <div class="divide-y divide-border">
                                {#each lentes as lente (lente.id)}
                                    <a
                                        href="/lentes/{lente.id}"
                                        class="flex items-center gap-4 px-5 py-4 hover:bg-accent transition-colors"
                                    >
                                        <!-- Badge premium/standard -->
                                        <div class="shrink-0">
                                            {#if lente.is_premium}
                                                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                    <Crown class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                            {:else}
                                                <div class="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                                    <Sparkles class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                                </div>
                                            {/if}
                                        </div>

                                        <!-- Info principal -->
                                        <div class="flex-1 min-w-0">
                                            <p class="font-semibold text-foreground truncate">{lente.lens_name ?? '—'}</p>
                                            <p class="text-xs text-muted-foreground truncate mt-0.5">
                                                {lente.brand_name ?? '—'}
                                                {#if lente.supplier_name} · {lente.supplier_name}{/if}
                                                {#if lente.material_name} · {lente.material_name}{/if}
                                                {#if lente.refractive_index} · n={lente.refractive_index}{/if}
                                                {#if lente.sku} · <span class="font-mono">{lente.sku}</span>{/if}
                                            </p>
                                            <!-- Tags visuais de tratamentos -->
                                            <div class="flex items-center gap-1 mt-1.5 flex-wrap">
                                                {#if lente.anti_reflective}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-micro font-bold">AR</span>
                                                {/if}
                                                {#if lente.blue_light}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-micro font-bold">Blue</span>
                                                {/if}
                                                {#if lente.photochromic}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-micro font-bold">Foto</span>
                                                {/if}
                                                {#if lente.uv_filter}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 text-micro font-bold">UV</span>
                                                {/if}
                                                {#if lente.anti_scratch}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-micro font-bold">Risco</span>
                                                {/if}
                                                {#if lente.polarized}
                                                    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-micro font-bold">Polar</span>
                                                {/if}
                                            </div>
                                        </div>

                                        <!-- Tipo -->
                                        <div class="hidden md:block shrink-0 text-right">
                                            <p class="text-xs text-muted-foreground">Tipo</p>
                                            <p class="text-sm font-semibold text-foreground">{TIPO_LABELS[lente.lens_type ?? ''] ?? lente.lens_type ?? '—'}</p>
                                        </div>

                                        <!-- Preço -->
                                        <div class="shrink-0 text-right min-w-[100px]">
                                            <p class="text-xs text-muted-foreground">Sugerido</p>
                                            <p class="text-base font-bold text-primary-600 dark:text-primary-400">{fmtBRL(lente.price_suggested)}</p>
                                        </div>
                                    </a>
                                {/each}
                            </div>
                        </div>

                        <!-- Paginação -->
                        {#if totalPages > 1}
                            <div class="flex items-center justify-center gap-2 flex-wrap pt-4">
                                <button
                                    disabled={pagina === 1}
                                    on:click={() => navegar({ pagina: pagina - 1 })}
                                    class="px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    ← Anterior
                                </button>
                                <span class="text-sm text-muted-foreground">
                                    Página <span class="font-bold text-foreground">{pagina}</span> de <span class="font-bold text-foreground">{totalPages}</span>
                                </span>
                                <button
                                    disabled={pagina === totalPages}
                                    on:click={() => navegar({ pagina: pagina + 1 })}
                                    class="px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    Próxima →
                                </button>
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </Container>
</main>
