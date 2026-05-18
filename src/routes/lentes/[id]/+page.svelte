<script lang="ts">
    /**
     * Detalhe da Lente Real — com edição completa (Geral / Prescrição / Tratamentos / Preços & Estoque).
     * Toda escrita via RPCs públicas (padrão C6):
     *   - rpc_update_lens_full
     *   - rpc_update_lens_prescription_range (copy-on-write em lens_matrices)
     *   - rpc_update_lens_treatments
     */
    import { Crown, Sparkles, ChevronLeft, Layers, Pencil, X } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation';
    import Container from '$lib/components/layout/Container.svelte';
    import { supabase } from '$lib/supabase';
    import type { PageData } from './$types';
    import type { VCatalogLens, LensEditOptions } from '$lib/types/database-views';

    export let data: PageData;

    $: lente = data.lente as unknown as VCatalogLens;
    $: conceito = data.conceito;
    $: isPremium = data.isPremium;
    $: opts = data.editOptions as LensEditOptions;

    const TIPO_LABELS: Record<string, string> = {
        single_vision: 'Visão Simples',
        multifocal:    'Multifocal',
        bifocal:       'Bifocal',
        occupational:  'Ocupacional',
    };

    // Tratamentos derivados (leitura)
    $: tratamentos = (() => {
        const nomes = lente.treatment_names ?? [];
        if (nomes.length > 0) return nomes;
        const r: string[] = [];
        if (lente.anti_reflective) r.push('Anti-Reflexo');
        if (lente.anti_scratch)    r.push('Anti-Risco');
        if (lente.uv_filter)       r.push('UV400');
        if (lente.blue_light)      r.push('Blue Cut');
        if (lente.photochromic)    r.push('Fotossensível');
        if (lente.polarized)       r.push('Polarizado');
        return r;
    })();

    // ===== Modal de edição =====
    type Aba = 'geral' | 'prescricao' | 'tratamentos' | 'precos';
    let modalAberto = false;
    let aba: Aba = 'geral';
    let salvando  = false;
    let erro: string | null = null;
    let sucesso: string | null = null;

    // Form state — Geral
    let fLensName    = '';
    let fSku         = '';
    let fLensType    = 'single_vision';
    let fCategory    = '';
    let fIsPremium   = false;
    let fStatus      = 'active';
    let fBrandId     = '';
    let fMaterialId  = '';
    let fSupplierId  = '';

    // Form state — Prescrição
    let fSphMin = 0;
    let fSphMax = 0;
    let fCylMin = 0;
    let fCylMax = 0;
    let fAddMin: number | null = null;
    let fAddMax: number | null = null;
    let fStep   = 0.25;
    let temAdicao = false;

    // Form state — Tratamentos
    let fTreatmentIds: string[] = [];

    // Form state — Preços & Estoque
    let fPriceCost      = 0;
    let fPriceSuggested = 0;
    let fStockAvailable = 0;
    let fStockMinimum   = 0;
    let fLeadTime       = 0;

    function abrirModal(inicial: Aba = 'geral') {
        // seed do estado a partir da lente atual
        fLensName    = lente.lens_name ?? '';
        fSku         = lente.sku ?? '';
        fLensType    = (lente.lens_type as string) ?? 'single_vision';
        fCategory    = lente.category ?? '';
        fIsPremium   = lente.is_premium ?? false;
        fStatus      = (lente.status as string) ?? 'active';
        fBrandId     = lente.brand_id ?? '';
        fMaterialId  = lente.material_id ?? '';
        fSupplierId  = lente.supplier_id ?? '';

        fSphMin = Number(lente.spherical_min ?? 0);
        fSphMax = Number(lente.spherical_max ?? 0);
        fCylMin = Number(lente.cylindrical_min ?? 0);
        fCylMax = Number(lente.cylindrical_max ?? 0);
        fAddMin = lente.addition_min != null ? Number(lente.addition_min) : null;
        fAddMax = lente.addition_max != null ? Number(lente.addition_max) : null;
        temAdicao = fAddMin != null || fAddMax != null;
        fStep   = 0.25;

        fTreatmentIds = [...((lente.treatment_ids ?? []) as string[])];

        fPriceCost      = Number(lente.price_cost ?? 0);
        fPriceSuggested = Number(lente.price_suggested ?? 0);
        fStockAvailable = Number(lente.stock_available ?? 0);
        fStockMinimum   = Number(lente.stock_minimum ?? 0);
        fLeadTime       = Number(lente.lead_time_days ?? 0);

        erro = null;
        sucesso = null;
        aba = inicial;
        modalAberto = true;
    }

    function fecharModal() {
        modalAberto = false;
        erro = null;
        sucesso = null;
    }

    async function salvarGeral() {
        salvando = true; erro = null; sucesso = null;
        try {
            const { data: res, error: err } = await supabase.rpc('rpc_update_lens_full', {
                p_id:          lente.id,
                p_lens_name:   fLensName || null,
                p_sku:         fSku      || null,
                p_lens_type:   fLensType,
                p_category:    fCategory || null,
                p_is_premium:  fIsPremium,
                p_status:      fStatus,
                p_brand_id:    fBrandId    || null,
                p_material_id: fMaterialId || null,
                p_supplier_id: fSupplierId || null,
            });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar');
            sucesso = 'Dados gerais atualizados';
            await invalidateAll();
        } catch (e: any) { erro = e.message; }
        finally { salvando = false; }
    }

    async function salvarPrescricao() {
        salvando = true; erro = null; sucesso = null;
        try {
            const { data: res, error: err } = await supabase.rpc('rpc_update_lens_prescription_range', {
                p_id:              lente.id,
                p_spherical_min:   fSphMin,
                p_spherical_max:   fSphMax,
                p_cylindrical_min: fCylMin,
                p_cylindrical_max: fCylMax,
                p_addition_min:    temAdicao ? fAddMin : null,
                p_addition_max:    temAdicao ? fAddMax : null,
                p_step:            fStep,
            });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar');
            sucesso = 'Faixa de prescrição atualizada';
            await invalidateAll();
        } catch (e: any) { erro = e.message; }
        finally { salvando = false; }
    }

    async function salvarTratamentos() {
        salvando = true; erro = null; sucesso = null;
        try {
            const { data: res, error: err } = await supabase.rpc('rpc_update_lens_treatments', {
                p_id:            lente.id,
                p_treatment_ids: fTreatmentIds,
            });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar');
            sucesso = 'Tratamentos atualizados';
            await invalidateAll();
        } catch (e: any) { erro = e.message; }
        finally { salvando = false; }
    }

    async function salvarPrecos() {
        salvando = true; erro = null; sucesso = null;
        try {
            const { data: res, error: err } = await supabase.rpc('rpc_update_lens_full', {
                p_id:              lente.id,
                p_price_cost:      fPriceCost,
                p_price_suggested: fPriceSuggested,
                p_stock_available: fStockAvailable,
                p_stock_minimum:   fStockMinimum,
                p_lead_time_days:  fLeadTime,
            });
            if (err) throw new Error(err.message);
            if (res && !res.ok) throw new Error(res.error ?? 'Erro ao salvar');
            sucesso = 'Preços e estoque atualizados';
            await invalidateAll();
        } catch (e: any) { erro = e.message; }
        finally { salvando = false; }
    }

    function toggleTreatment(id: string) {
        fTreatmentIds = fTreatmentIds.includes(id)
            ? fTreatmentIds.filter(x => x !== id)
            : [...fTreatmentIds, id];
    }

    function fmt(v: number | null | undefined): string {
        if (v == null) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }

    function fmtDiopter(v: number | null | undefined): string {
        if (v == null) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${Number(v).toFixed(2)}`;
    }

    $: faixaZerada =
        (lente.spherical_min == null || Number(lente.spherical_min) === 0) &&
        (lente.spherical_max == null || Number(lente.spherical_max) === 0) &&
        (lente.cylindrical_min == null || Number(lente.cylindrical_min) === 0) &&
        (lente.cylindrical_max == null || Number(lente.cylindrical_max) === 0);
</script>

<svelte:head>
    <title>{lente.lens_name ?? 'Lente'} | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-24">
    <!-- Top bar -->
    <div class="bg-card border-b border-border sticky top-0 z-30">
        <Container>
            <div class="flex items-center justify-between py-4">
                <a href="/lentes" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    <ChevronLeft class="h-4 w-4" /> Catálogo de Lentes
                </a>
                <div class="flex items-center gap-2">
                    {#if isPremium}
                        <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                            <Crown class="h-3 w-3" /> Premium
                        </span>
                    {:else}
                        <span class="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                            <Sparkles class="h-3 w-3" /> Standard
                        </span>
                    {/if}
                    <button on:click={() => abrirModal('geral')}
                        class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
                        <Pencil class="h-3 w-3" /> Editar Lente
                    </button>
                </div>
            </div>
        </Container>
    </div>

    <Container>
        <div class="py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Coluna principal -->
            <div class="lg:col-span-2 space-y-6">

                <!-- Header -->
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h1 class="text-2xl font-black text-foreground leading-tight">{lente.lens_name ?? '—'}</h1>
                    <p class="text-sm text-muted-foreground mt-1">
                        {lente.brand_name ?? '—'}
                        {#if lente.supplier_name} · {lente.supplier_name}{/if}
                    </p>
                    {#if lente.sku}
                        <p class="font-mono text-xs text-muted-foreground mt-2">SKU: {lente.sku}</p>
                    {/if}

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                        {#if lente.lens_type}
                            <div class="bg-muted rounded-xl px-3 py-2.5">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Tipo</div>
                                <div class="text-sm font-semibold text-foreground">{TIPO_LABELS[lente.lens_type] ?? lente.lens_type}</div>
                            </div>
                        {/if}
                        {#if lente.material_name}
                            <div class="bg-muted rounded-xl px-3 py-2.5">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Material</div>
                                <div class="text-sm font-semibold text-foreground">{lente.material_name}</div>
                            </div>
                        {/if}
                        {#if lente.refractive_index}
                            <div class="bg-muted rounded-xl px-3 py-2.5">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Índice</div>
                                <div class="text-sm font-semibold text-foreground">n = {lente.refractive_index}</div>
                            </div>
                        {/if}
                        {#if lente.stock_available != null}
                            <div class="bg-muted rounded-xl px-3 py-2.5">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-0.5">Estoque</div>
                                <div class="text-sm font-semibold {lente.stock_available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">{lente.stock_available} unid.</div>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Tratamentos -->
                <div class="bg-card border border-border rounded-2xl p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Tratamentos</h2>
                        <button on:click={() => abrirModal('tratamentos')} class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400">Editar</button>
                    </div>
                    {#if tratamentos.length > 0}
                        <div class="flex flex-wrap gap-2">
                            {#each tratamentos as t}
                                <span class="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-lg border border-primary-100 dark:border-primary-800">{t}</span>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-xs text-muted-foreground">Nenhum tratamento vinculado.</p>
                    {/if}
                </div>

                <!-- Faixa de prescrição -->
                <div class="bg-card border {faixaZerada ? 'border-amber-400 dark:border-amber-500' : 'border-border'} rounded-2xl p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Faixa de Prescrição</h2>
                        <button on:click={() => abrirModal('prescricao')} class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400">Editar</button>
                    </div>
                    {#if faixaZerada}
                        <p class="text-xs text-amber-700 dark:text-amber-400 mb-3 font-medium">
                            ⚠ Faixa zerada — a lente não pode ser incluída em vendas até que os limites sejam definidos.
                        </p>
                    {/if}
                    <div class="grid grid-cols-3 gap-3">
                        <div class="text-center bg-muted rounded-xl p-3">
                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1">Esférico</div>
                            <div class="font-mono text-sm text-foreground">{fmtDiopter(lente.spherical_min)} a {fmtDiopter(lente.spherical_max)}</div>
                        </div>
                        <div class="text-center bg-muted rounded-xl p-3">
                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1">Cilíndrico</div>
                            <div class="font-mono text-sm text-foreground">{fmtDiopter(lente.cylindrical_min)} a {fmtDiopter(lente.cylindrical_max)}</div>
                        </div>
                        <div class="text-center bg-muted rounded-xl p-3">
                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-1">Adição</div>
                            <div class="font-mono text-sm text-foreground">
                                {#if lente.addition_min != null}{fmtDiopter(lente.addition_min)} a {fmtDiopter(lente.addition_max)}{:else}—{/if}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Conceito canônico -->
                <div class="bg-card border border-border rounded-2xl overflow-hidden">
                    <div class="px-5 py-4 border-b border-border flex items-center gap-2">
                        <Layers class="h-4 w-4 text-muted-foreground" />
                        <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Conceito Canônico</h2>
                    </div>
                    {#if !conceito}
                        <p class="px-5 py-8 text-sm text-center text-muted-foreground">Esta lente ainda não foi mapeada para um conceito canônico.</p>
                    {:else}
                        <a href="{conceito.kind === 'premium' ? '/premium' : '/standard'}/{conceito.id}"
                           class="block px-5 py-4 hover:bg-accent transition-colors">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-foreground truncate">{conceito.canonical_name}</p>
                                    <p class="text-xs text-muted-foreground mt-1 truncate">
                                        {conceito.material_name ?? conceito.material_class}
                                        {#if conceito.refractive_index} · n={conceito.refractive_index}{/if}
                                        {#if conceito.treatment_codes && conceito.treatment_codes.length > 0} · {conceito.treatment_codes.join(', ')}{/if}
                                    </p>
                                    {#if conceito.sku}
                                        <p class="font-mono text-micro text-muted-foreground mt-1">{conceito.sku}</p>
                                    {/if}
                                </div>
                                <div class="text-right shrink-0">
                                    <p class="text-xs text-muted-foreground">{conceito.mapped_lens_count} lentes</p>
                                    {#if conceito.price_avg != null}
                                        <p class="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">~{fmt(conceito.price_avg)}</p>
                                    {/if}
                                </div>
                            </div>
                        </a>
                    {/if}
                </div>
            </div>

            <!-- Sidebar preço -->
            <div class="space-y-4">
                <div class="bg-card border border-border rounded-2xl p-5 sticky top-20">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-sm font-black uppercase tracking-wide text-muted-foreground">Preços & Estoque</h2>
                        <button on:click={() => abrirModal('precos')} class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400">Editar</button>
                    </div>

                    <div class="space-y-4">
                        {#if lente.price_suggested}
                            <div>
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Sugerido</div>
                                <div class="text-3xl font-black text-foreground mt-0.5">{fmt(lente.price_suggested)}</div>
                            </div>
                        {/if}
                        {#if lente.price_cost}
                            <div class="pt-3 border-t border-border">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Custo</div>
                                <div class="text-xl font-bold text-muted-foreground mt-0.5">{fmt(lente.price_cost)}</div>
                            </div>
                        {/if}
                        {#if lente.price_cost && lente.price_suggested}
                            <div class="pt-3 border-t border-border">
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground">Margem</div>
                                <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {(((Number(lente.price_suggested) - Number(lente.price_cost)) / Number(lente.price_suggested)) * 100).toFixed(1)}%
                                </div>
                            </div>
                        {/if}
                    </div>

                    {#if lente.lead_time_days || lente.stock_minimum}
                        <div class="mt-6 pt-6 border-t border-border space-y-2">
                            {#if lente.lead_time_days}
                                <div class="flex items-center justify-between">
                                    <span class="text-xs text-muted-foreground">Prazo entrega</span>
                                    <span class="text-xs font-bold text-foreground">{lente.lead_time_days} dias</span>
                                </div>
                            {/if}
                            {#if lente.stock_minimum}
                                <div class="flex items-center justify-between">
                                    <span class="text-xs text-muted-foreground">Estoque mínimo</span>
                                    <span class="text-xs font-bold text-foreground">{lente.stock_minimum} unid.</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </Container>
</main>

<!-- ============ Modal Edição ============ -->
{#if modalAberto}
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h2 class="text-lg font-black text-foreground">Editar Lente</h2>
                    <p class="text-xs text-muted-foreground truncate max-w-md">{lente.lens_name}</p>
                </div>
                <button on:click={fecharModal} class="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">
                    <X class="h-5 w-5" />
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-border bg-muted/40 px-2">
                {#each [
                    ['geral','Geral'],
                    ['prescricao','Prescrição'],
                    ['tratamentos','Tratamentos'],
                    ['precos','Preços & Estoque'],
                ] as [k, label]}
                    <button on:click={() => { aba = k; erro = null; sucesso = null; }}
                        class="px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 {aba === k ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-muted-foreground hover:text-foreground'}">
                        {label}
                    </button>
                {/each}
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6">
                {#if erro}
                    <div class="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-bold rounded-lg">{erro}</div>
                {/if}
                {#if sucesso}
                    <div class="mb-4 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">✓ {sucesso}</div>
                {/if}

                {#if aba === 'geral'}
                    <div class="space-y-4">
                        <div>
                            <label for="f-lens-name" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Nome</label>
                            <input id="f-lens-name" type="text" bind:value={fLensName}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="f-sku" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">SKU</label>
                                <input id="f-sku" type="text" bind:value={fSku}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label for="f-category" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Categoria</label>
                                <input id="f-category" type="text" bind:value={fCategory} placeholder="premium, standard…"
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="f-lens-type" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Tipo</label>
                                <select id="f-lens-type" bind:value={fLensType}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    {#each opts.lens_types as lt}
                                        <option value={lt.value}>{lt.label}</option>
                                    {/each}
                                </select>
                            </div>
                            <div>
                                <label for="f-status" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Status</label>
                                <select id="f-status" bind:value={fStatus}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    {#each opts.statuses as st}
                                        <option value={st.value}>{st.label}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label for="f-brand" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Marca</label>
                            <select id="f-brand" bind:value={fBrandId}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">—</option>
                                {#each opts.brands as b}
                                    <option value={b.id}>{b.name}{b.is_global_premium ? ' ⭐' : ''}</option>
                                {/each}
                            </select>
                        </div>

                        <div>
                            <label for="f-material" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Material</label>
                            <select id="f-material" bind:value={fMaterialId}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">—</option>
                                {#each opts.materials as m}
                                    <option value={m.id}>{m.name}{m.refractive_index ? ` (n=${m.refractive_index})` : ''}</option>
                                {/each}
                            </select>
                        </div>

                        <div>
                            <label for="f-supplier" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Fornecedor</label>
                            <select id="f-supplier" bind:value={fSupplierId}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">—</option>
                                {#each opts.suppliers as s}
                                    <option value={s.id}>{s.name}</option>
                                {/each}
                            </select>
                        </div>

                        <label class="flex items-center gap-2 text-sm text-foreground">
                            <input type="checkbox" bind:checked={fIsPremium} class="rounded border-border" />
                            Marcar como Premium
                        </label>

                        <p class="text-micro text-muted-foreground italic pt-2 border-t border-border">
                            Mudar nome, marca, material ou tipo dispara re-canonicalização automática (Canonical Engine v3).
                        </p>
                    </div>

                {:else if aba === 'prescricao'}
                    <div class="space-y-5">
                        <p class="text-xs text-muted-foreground">
                            A faixa é armazenada em <code class="bg-muted px-1 rounded">lens_matrices</code> e pode ser compartilhada entre lentes. Ao salvar, o sistema faz <strong>copy-on-write</strong>: reaproveita uma matrix existente com os mesmos valores ou cria uma nova, sem afetar outras lentes.
                        </p>

                        <div>
                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-2">Esférico</div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="f-sph-min" class="text-micro text-muted-foreground">Mínimo</label>
                                    <input id="f-sph-min" type="number" step="0.25" bind:value={fSphMin}
                                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label for="f-sph-max" class="text-micro text-muted-foreground">Máximo</label>
                                    <input id="f-sph-max" type="number" step="0.25" bind:value={fSphMax}
                                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-2">Cilíndrico</div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="f-cyl-min" class="text-micro text-muted-foreground">Mínimo</label>
                                    <input id="f-cyl-min" type="number" step="0.25" bind:value={fCylMin}
                                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label for="f-cyl-max" class="text-micro text-muted-foreground">Máximo</label>
                                    <input id="f-cyl-max" type="number" step="0.25" bind:value={fCylMax}
                                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                        </div>

                        <label class="flex items-center gap-2 text-sm text-foreground">
                            <input type="checkbox" bind:checked={temAdicao} class="rounded border-border" />
                            Possui adição (multifocal / bifocal)
                        </label>

                        {#if temAdicao}
                            <div>
                                <div class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-2">Adição</div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label for="f-add-min" class="text-micro text-muted-foreground">Mínima</label>
                                        <input id="f-add-min" type="number" step="0.25" min="0" bind:value={fAddMin}
                                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                    <div>
                                        <label for="f-add-max" class="text-micro text-muted-foreground">Máxima</label>
                                        <input id="f-add-max" type="number" step="0.25" min="0" bind:value={fAddMax}
                                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <div>
                            <label for="f-step" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Passo (step)</label>
                            <input id="f-step" type="number" step="0.05" min="0.05" bind:value={fStep}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                {:else if aba === 'tratamentos'}
                    <div class="space-y-3">
                        <p class="text-xs text-muted-foreground">Selecione os tratamentos vinculados à lente. A lista vem de <code class="bg-muted px-1 rounded">catalog_lenses.lens_treatments</code>.</p>
                        {#if opts.treatments.length === 0}
                            <p class="text-sm text-muted-foreground italic">Nenhum tratamento disponível no tenant.</p>
                        {:else}
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                                {#each opts.treatments as t}
                                    <label class="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent cursor-pointer">
                                        <input type="checkbox"
                                            checked={fTreatmentIds.includes(t.id)}
                                            on:change={() => toggleTreatment(t.id)}
                                            class="rounded border-border" />
                                        <span class="flex-1 text-sm text-foreground">{t.name}</span>
                                        {#if t.code}
                                            <span class="font-mono text-micro text-muted-foreground">{t.code}</span>
                                        {/if}
                                    </label>
                                {/each}
                            </div>
                        {/if}
                    </div>

                {:else if aba === 'precos'}
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="f-cost" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Custo (R$)</label>
                                <input id="f-cost" type="number" step="0.01" min="0" bind:value={fPriceCost}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label for="f-suggested" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Sugerido (R$)</label>
                                <input id="f-suggested" type="number" step="0.01" min="0" bind:value={fPriceSuggested}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>

                        {#if fPriceCost > 0 && fPriceSuggested > 0}
                            <div class="text-xs text-muted-foreground text-right">
                                Margem:
                                <span class="font-bold text-emerald-600 dark:text-emerald-400">
                                    {(((fPriceSuggested - fPriceCost) / fPriceSuggested) * 100).toFixed(1)}%
                                </span>
                            </div>
                        {/if}

                        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                            <div>
                                <label for="f-stock-av" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Estoque Disp.</label>
                                <input id="f-stock-av" type="number" min="0" bind:value={fStockAvailable}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label for="f-stock-min" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Estoque Mín.</label>
                                <input id="f-stock-min" type="number" min="0" bind:value={fStockMinimum}
                                    class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>

                        <div>
                            <label for="f-lead" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1">Prazo entrega (dias)</label>
                            <input id="f-lead" type="number" min="0" bind:value={fLeadTime}
                                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
                <button on:click={fecharModal}
                    class="px-4 py-2 bg-muted hover:bg-accent text-muted-foreground text-xs font-bold rounded-lg transition-colors">
                    Fechar
                </button>
                <button
                    on:click={() => {
                        if (aba === 'geral')       salvarGeral();
                        else if (aba === 'prescricao') salvarPrescricao();
                        else if (aba === 'tratamentos') salvarTratamentos();
                        else if (aba === 'precos') salvarPrecos();
                    }}
                    disabled={salvando}
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                    {salvando ? 'Salvando…' : 'Salvar alterações'}
                </button>
            </div>
        </div>
    </div>
{/if}
