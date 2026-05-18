<script lang="ts">
    /**
     * Detalhe da Lente de Contato — client-side via browser supabase
     * Fonte: public.v_contact_lenses
     */
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { supabase } from '$lib/supabase';
    import Container from '$lib/components/layout/Container.svelte';

    export let data: PageData;

    const DESCARTE_LABELS: Record<string, string> = {
        diaria:     'Descarte Diário',
        quinzenal:  'Descarte Quinzenal',
        mensal:     'Descarte Mensal',
        trimestral: 'Descarte Trimestral',
        anual:      'Uso Anual',
    };

    const PURPOSE_LABELS: Record<string, string> = {
        visao_simples: 'Visão Simples',
        torica:        'Tórica (Astigmatismo)',
        multifocal:    'Multifocal',
        cosmetica:     'Cosmético / Colorida',
        terapeutica:   'Terapêutico',
    };

    // Estado
    let lente: Record<string, any> | null = null;
    let loading = true;
    let erro: string | null = null;

    // Edição de preços
    let editando      = false;
    let editCost      = 0;
    let editSugerido  = 0;
    let editSalvando  = false;
    let editErro: string | null = null;
    let editSucesso   = false;

    // Edição de specs ópticos
    let editSpecs     = false;
    type SpecField = number | null;
    let specEsfMin:  SpecField = null;
    let specEsfMax:  SpecField = null;
    let specCilMin:  SpecField = null;
    let specCilMax:  SpecField = null;
    let specAxisMin: SpecField = null;
    let specAxisMax: SpecField = null;
    let specAddMin:  SpecField = null;
    let specAddMax:  SpecField = null;
    let specCurva:   SpecField = null;
    let specDiam:    SpecField = null;
    let specDkT:     SpecField = null;
    let specAgua:    SpecField = null;
    let specDias:    SpecField = null;
    let specUnCaixa: SpecField = null;
    let specsSalvando = false;
    let specsErro: string | null = null;
    let specsSucesso = false;

    onMount(async () => {
        const { data: row, error: err } = await supabase
            .from('v_contact_lenses')
            .select('*')
            .eq('id', data.id)
            .single();

        if (err || !row) {
            erro = err?.message ?? 'Lente não encontrada';
        } else {
            lente        = row;
            editCost     = row.price_cost      ?? 0;
            editSugerido = row.price_suggested ?? 0;
        }
        loading = false;
    });

    function abrirEdicao() {
        editCost     = lente?.price_cost      ?? 0;
        editSugerido = lente?.price_suggested ?? 0;
        editErro     = null;
        editSucesso  = false;
        editando     = true;
    }

    function abrirSpecs() {
        specEsfMin  = lente?.spherical_min   ?? null;
        specEsfMax  = lente?.spherical_max   ?? null;
        specCilMin  = lente?.cylindrical_min ?? null;
        specCilMax  = lente?.cylindrical_max ?? null;
        specAxisMin = lente?.axis_min        ?? null;
        specAxisMax = lente?.axis_max        ?? null;
        specAddMin  = lente?.addition_min    ?? null;
        specAddMax  = lente?.addition_max    ?? null;
        specCurva   = lente?.base_curve      ?? null;
        specDiam    = lente?.diameter        ?? null;
        specDkT     = lente?.dk_t            ?? null;
        specAgua    = lente?.water_content   ?? null;
        specDias    = lente?.usage_days      ?? null;
        specUnCaixa = lente?.units_per_box   ?? null;
        specsErro   = null;
        specsSucesso = false;
        editSpecs   = true;
    }

    async function salvarSpecs() {
        specsSalvando = true;
        specsErro     = null;
        specsSucesso  = false;
        try {
            const { data: res, error: err } = await supabase
                .rpc('rpc_update_contact_lens_specs', {
                    p_id:              lente!.id,
                    p_spherical_min:   specEsfMin,
                    p_spherical_max:   specEsfMax,
                    p_cylindrical_min: specCilMin,
                    p_cylindrical_max: specCilMax,
                    p_axis_min:        specAxisMin,
                    p_axis_max:        specAxisMax,
                    p_addition_min:    specAddMin,
                    p_addition_max:    specAddMax,
                    p_base_curve:      specCurva,
                    p_diameter:        specDiam,
                    p_dk_t:            specDkT,
                    p_water_content:   specAgua,
                    p_usage_days:      specDias,
                    p_units_per_box:   specUnCaixa,
                });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar specs');
            // Recarrega a lente pra refletir persistido
            const { data: row } = await supabase
                .from('v_contact_lenses')
                .select('*')
                .eq('id', lente!.id)
                .single();
            if (row) lente = row;
            editSpecs = false;
            specsSucesso = true;
            setTimeout(() => specsSucesso = false, 3000);
        } catch (e: any) {
            specsErro = e.message;
        } finally {
            specsSalvando = false;
        }
    }

    async function salvarPrecos() {
        editSalvando = true;
        editErro     = null;
        editSucesso  = false;
        try {
            const { data: res, error: err } = await supabase
                .rpc('rpc_update_contact_lens_price', {
                    p_id:              lente!.id,
                    p_price_cost:      editCost,
                    p_price_suggested: editSugerido,
                });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar');
            lente        = { ...lente!, price_cost: editCost, price_suggested: editSugerido };
            editando     = false;
            editSucesso  = true;
            setTimeout(() => editSucesso = false, 3000);
        } catch (e: any) {
            editErro = e.message;
        } finally {
            editSalvando = false;
        }
    }

    function fmt(v: number | null | undefined): string {
        if (v == null) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }
</script>

<svelte:head>
    <title>{lente?.product_name ?? 'Lente de Contato'} | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-24">

    <!-- Back bar -->
    <div class="bg-card border-b border-border">
        <Container maxWidth="xl" padding="sm">
            <div class="py-3">
                <a href="/contato" class="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Catálogo de Contato
                </a>
            </div>
        </Container>
    </div>

    <Container maxWidth="xl" padding="md">
        <div class="mt-6">

            {#if loading}
                <div class="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-2xl">
                    <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-muted-foreground text-sm">Carregando dados da lente de contato...</p>
                </div>

            {:else if erro || !lente}
                <div class="py-16 text-center bg-card border border-red-200 dark:border-red-900 rounded-2xl">
                    <div class="text-5xl mb-4">👁️</div>
                    <p class="text-red-500 font-semibold">{erro ?? 'Lente não encontrada'}</p>
                    <a href="/contato" class="mt-4 inline-block px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg">
                        ← Voltar ao Catálogo
                    </a>
                </div>

            {:else}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <!-- Coluna principal -->
                    <div class="lg:col-span-2 space-y-4">

                        <!-- Header card -->
                        <div class="bg-card border border-border rounded-2xl p-6">
                            <div class="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 class="text-xl font-black text-foreground leading-tight">
                                        {lente.product_name ?? '—'}
                                    </h1>
                                    <p class="text-sm text-muted-foreground mt-0.5">
                                        {lente.brand_name ?? '—'}{#if lente.manufacturer_name} · {lente.manufacturer_name}{/if}
                                    </p>
                                </div>
                                <div class="flex gap-2 shrink-0">
                                    {#if lente.stock_available > 0}
                                        <span class="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full uppercase">Em Stock</span>
                                    {/if}
                                    {#if lente.is_colored}
                                        <span class="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-black rounded-full uppercase">Colorida</span>
                                    {/if}
                                </div>
                            </div>

                            <!-- Specs grid -->
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {#if lente.lens_type}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Tipo</div>
                                        <div class="text-sm font-semibold text-foreground">{DESCARTE_LABELS[lente.lens_type] ?? lente.lens_type}</div>
                                    </div>
                                {/if}
                                {#if lente.purpose}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Finalidade</div>
                                        <div class="text-sm font-semibold text-foreground">{PURPOSE_LABELS[lente.purpose] ?? lente.purpose.replace('_', ' ')}</div>
                                    </div>
                                {/if}
                                {#if lente.material}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Material</div>
                                        <div class="text-sm font-semibold text-foreground truncate">{lente.material}</div>
                                    </div>
                                {/if}
                                {#if lente.usage_days}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Descarte</div>
                                        <div class="text-sm font-semibold text-foreground">{lente.usage_days} dias</div>
                                    </div>
                                {/if}
                                {#if lente.units_per_box}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Unid./Caixa</div>
                                        <div class="text-sm font-semibold text-foreground">{lente.units_per_box} lentes</div>
                                    </div>
                                {/if}
                                {#if lente.stock_available != null}
                                    <div class="bg-muted rounded-xl px-3 py-2.5">
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Estoque</div>
                                        <div class="text-sm font-semibold {lente.stock_available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">{lente.stock_available} caixas</div>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Especificações Ópticas (edição unificada) -->
                        <div class="bg-card border border-border rounded-2xl p-5">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Especificações Ópticas</h2>
                                {#if !editSpecs}
                                    <button on:click={abrirSpecs}
                                        class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                                        Editar
                                    </button>
                                {/if}
                            </div>

                            {#if specsSucesso}
                                <div class="mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">
                                    ✓ Especificações atualizadas com sucesso
                                </div>
                            {/if}

                            {#if editSpecs}
                                <!-- Modo edição -->
                                <div class="space-y-4">
                                    <!-- Esférico -->
                                    <div>
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Esférico (dioptrias)</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="number" step="0.25" placeholder="mínimo (ex: -12.00)" bind:value={specEsfMin}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input type="number" step="0.25" placeholder="máximo (ex: +8.00)" bind:value={specEsfMax}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                        </div>
                                    </div>
                                    <!-- Cilíndrico -->
                                    <div>
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Cilíndrico (dioptrias)</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="number" step="0.25" placeholder="mínimo (ex: -2.25)" bind:value={specCilMin}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input type="number" step="0.25" placeholder="máximo (ex: 0)" bind:value={specCilMax}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                        </div>
                                    </div>
                                    <!-- Eixo -->
                                    <div>
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Eixo (graus 0–180)</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="number" step="1" min="0" max="180" placeholder="mínimo" bind:value={specAxisMin}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input type="number" step="1" min="0" max="180" placeholder="máximo" bind:value={specAxisMax}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                        </div>
                                    </div>
                                    <!-- Adição -->
                                    <div>
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Adição (multifocal)</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="number" step="0.25" placeholder="mínima (ex: +0.75)" bind:value={specAddMin}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input type="number" step="0.25" placeholder="máxima (ex: +2.50)" bind:value={specAddMax}
                                                class="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                        </div>
                                    </div>
                                    <!-- Parametros fisicos -->
                                    <div>
                                        <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1.5">Parâmetros Físicos</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <div>
                                                <label class="text-micro text-muted-foreground">Curva Base (mm)</label>
                                                <input type="number" step="0.1" min="7.0" max="10.0" placeholder="ex: 8.6" bind:value={specCurva}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label class="text-micro text-muted-foreground">Diâmetro (mm)</label>
                                                <input type="number" step="0.1" min="8.0" max="16.0" placeholder="ex: 14.2" bind:value={specDiam}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label class="text-micro text-muted-foreground">Dk/t</label>
                                                <input type="number" step="1" min="0" placeholder="ex: 147" bind:value={specDkT}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label class="text-micro text-muted-foreground">% Água</label>
                                                <input type="number" step="1" min="0" max="100" placeholder="ex: 38" bind:value={specAgua}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label class="text-micro text-muted-foreground">Dias de Uso</label>
                                                <input type="number" step="1" min="0" placeholder="ex: 30" bind:value={specDias}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label class="text-micro text-muted-foreground">Unid./Caixa</label>
                                                <input type="number" step="1" min="0" placeholder="ex: 6" bind:value={specUnCaixa}
                                                    class="w-full mt-0.5 px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {#if specsErro}
                                        <p class="text-xs text-red-500 font-medium">{specsErro}</p>
                                    {/if}

                                    <div class="flex gap-2 pt-2">
                                        <button on:click={salvarSpecs} disabled={specsSalvando}
                                            class="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                            {specsSalvando ? 'Salvando…' : 'Salvar Especificações'}
                                        </button>
                                        <button on:click={() => { editSpecs = false; specsErro = null; }}
                                            class="px-3 py-2 bg-muted hover:bg-accent text-muted-foreground text-xs font-bold rounded-lg transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            {:else}
                                <!-- Modo leitura: ranges + parametros + extras -->
                                <div class="space-y-3">
                                    {#if lente.spherical_min != null || lente.cylindrical_min != null || lente.axis_min != null || lente.addition_min != null}
                                        <div class="grid grid-cols-2 gap-2">
                                            {#if lente.spherical_min != null}
                                                <div class="bg-muted rounded-xl px-3 py-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Esférico</div>
                                                    <div class="text-sm font-semibold text-foreground">{lente.spherical_min} a {lente.spherical_max}</div>
                                                </div>
                                            {/if}
                                            {#if lente.cylindrical_min != null}
                                                <div class="bg-muted rounded-xl px-3 py-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Cilíndrico</div>
                                                    <div class="text-sm font-semibold text-foreground">{lente.cylindrical_min} a {lente.cylindrical_max}</div>
                                                </div>
                                            {/if}
                                            {#if lente.axis_min != null}
                                                <div class="bg-muted rounded-xl px-3 py-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Eixo</div>
                                                    <div class="text-sm font-semibold text-foreground">{lente.axis_min}° a {lente.axis_max}°</div>
                                                </div>
                                            {/if}
                                            {#if lente.addition_min != null}
                                                <div class="bg-muted rounded-xl px-3 py-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Adição</div>
                                                    <div class="text-sm font-semibold text-foreground">{lente.addition_min} a {lente.addition_max}</div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}

                                    {#if lente.dk_t || lente.water_content || lente.diameter || lente.base_curve}
                                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {#if lente.dk_t}
                                                <div class="text-center bg-muted rounded-xl p-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Dk/t</div>
                                                    <div class="text-base font-black text-foreground">{lente.dk_t}</div>
                                                </div>
                                            {/if}
                                            {#if lente.water_content}
                                                <div class="text-center bg-muted rounded-xl p-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">H₂O</div>
                                                    <div class="text-base font-black text-foreground">{lente.water_content}%</div>
                                                </div>
                                            {/if}
                                            {#if lente.diameter}
                                                <div class="text-center bg-muted rounded-xl p-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Diâmetro</div>
                                                    <div class="text-base font-black text-foreground">{lente.diameter}mm</div>
                                                </div>
                                            {/if}
                                            {#if lente.base_curve}
                                                <div class="text-center bg-muted rounded-xl p-2.5">
                                                    <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Curva</div>
                                                    <div class="text-base font-black text-foreground">{lente.base_curve}</div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}

                                    {#if lente.spherical_min == null && !lente.dk_t && !lente.water_content && !lente.diameter && !lente.base_curve}
                                        <div class="text-center py-4 text-xs text-muted-foreground">
                                            Nenhuma especificação cadastrada. Clique em "Editar" para preencher.
                                        </div>
                                    {/if}

                                    <div class="flex flex-wrap gap-2 pt-1">
                                        {#if lente.uv_protection}
                                            <span class="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-lg">Proteção UV</span>
                                        {/if}
                                        {#if lente.is_colored}
                                            <span class="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg">Colorida</span>
                                        {/if}
                                        {#each (lente.available_colors ?? []) as cor}
                                            <span class="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg">{cor}</span>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Sidebar preço -->
                    <div class="space-y-4">
                        <div class="bg-card border border-border rounded-2xl p-5">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Preço</h2>
                                {#if !editando}
                                    <button on:click={abrirEdicao}
                                        class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                                        Editar
                                    </button>
                                {/if}
                            </div>

                            {#if editSucesso}
                                <div class="mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">
                                    ✓ Preços atualizados com sucesso
                                </div>
                            {/if}

                            {#if editando}
                                <!-- Modo edição -->
                                <div class="space-y-3">
                                    <div>
                                        <label class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Custo (R$)</label>
                                        <input type="number" step="0.01" min="0" bind:value={editCost}
                                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                    <div>
                                        <label class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Preço por Caixa (R$)</label>
                                        <input type="number" step="0.01" min="0" bind:value={editSugerido}
                                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                    {#if editCost > 0 && editSugerido > 0}
                                        <div class="text-xs text-muted-foreground text-right">
                                            Markup: <span class="font-bold text-emerald-600 dark:text-emerald-400">
                                                {(editSugerido / editCost).toFixed(2)}x
                                            </span>
                                        </div>
                                    {/if}
                                    {#if editErro}
                                        <p class="text-xs text-red-500 font-medium">{editErro}</p>
                                    {/if}
                                    <div class="flex gap-2 pt-1">
                                        <button on:click={salvarPrecos} disabled={editSalvando}
                                            class="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                            {editSalvando ? 'Salvando…' : 'Salvar'}
                                        </button>
                                        <button on:click={() => { editando = false; editErro = null; }}
                                            class="px-3 py-2 bg-muted hover:bg-accent text-muted-foreground text-xs font-bold rounded-lg transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            {:else}
                                <!-- Modo leitura -->
                                <div class="space-y-4">
                                    {#if lente.price_suggested}
                                        <div>
                                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Por Caixa</div>
                                            <div class="text-3xl font-black text-foreground mt-0.5">{fmt(lente.price_suggested)}</div>
                                            {#if lente.units_per_box}
                                                <div class="text-xs text-muted-foreground mt-0.5">{lente.units_per_box} lentes por caixa</div>
                                            {/if}
                                        </div>
                                    {/if}
                                    {#if lente.price_cost && lente.price_cost > 0}
                                        <div class="pt-3 border-t border-border">
                                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Custo</div>
                                            <div class="text-xl font-bold text-muted-foreground dark:text-muted-foreground mt-0.5">{fmt(lente.price_cost)}</div>
                                        </div>
                                    {/if}
                                    {#if lente.lead_time_days}
                                        <div class="pt-3 border-t border-border">
                                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Prazo de Entrega</div>
                                            <div class="text-sm font-bold text-foreground mt-0.5">{lente.lead_time_days} dias</div>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>

                        <a href="/contato"
                            class="block w-full text-center px-4 py-3 bg-muted hover:bg-accent text-foreground text-sm font-bold rounded-xl transition-colors">
                            ← Voltar ao Catálogo
                        </a>
                    </div>
                </div>
            {/if}
        </div>
    </Container>
</main>
