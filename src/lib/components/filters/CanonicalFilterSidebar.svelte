<script lang="ts">
    /**
     * CanonicalFilterSidebar — sidebar de filtros unificada para canônicas
     *
     * Uso em: Clearix Lens `/premium` e `/standard`.
     * Replicável em Vendas e DCL quando precisarem do mesmo padrão.
     *
     * Recebe:
     *  - context: 'premium' | 'standard' (controla campos ricos visíveis)
     *  - filterOptions: retorno de rpc_{premium,standard}_filter_options
     *  - filtros: estado corrente (brand, productLine, lensType, materialId, coating, photochromic, treatments[], priceMin, priceMax)
     *  - onApply: callback chamado quando usuário muda algo
     */
    import { X, Sparkles, Eye, Sun, Zap, Shield, Droplets, Palette } from 'lucide-svelte';
    import FilterSection from './FilterSection.svelte';

    type Ctx = 'premium' | 'standard';

    export let context: Ctx;
    export let filterOptions: any = null;
    export let filtros: {
        brand?:        string | null;
        productLine?:  string | null;
        lensType?:     string | null;
        materialId?:   string | null;
        coating?:      string | null;
        photochromic?: string | null;
        treatments?:          string[];
        excludeTreatments?:   string[];
        priceMin?:     number | null;
        priceMax?:     number | null;
    } = {};
    export let onApply: (next: typeof filtros) => void;
    export let loading = false;

    let priceMinInput = '';
    let priceMaxInput = '';
    $: priceMinInput = filtros.priceMin != null ? String(filtros.priceMin) : '';
    $: priceMaxInput = filtros.priceMax != null ? String(filtros.priceMax) : '';

    const TIPO_LABELS: Record<string, string> = {
        single_vision: 'Visão Simples',
        multifocal:    'Multifocal',
        bifocal:       'Bifocal',
        occupational:  'Ocupacional',
    };

    $: hasActiveFilters = !!(
        filtros.brand || filtros.productLine || filtros.lensType || filtros.materialId ||
        filtros.coating || filtros.photochromic ||
        (filtros.treatments && filtros.treatments.length > 0) ||
        (filtros.excludeTreatments && filtros.excludeTreatments.length > 0) ||
        filtros.priceMin != null || filtros.priceMax != null
    );

    function set<K extends keyof typeof filtros>(key: K, value: (typeof filtros)[K]) {
        onApply({ ...filtros, [key]: value });
    }

    type TriState = 'neutral' | 'include' | 'exclude';

    function treatmentState(code: string): TriState {
        if ((filtros.treatments ?? []).includes(code)) return 'include';
        if ((filtros.excludeTreatments ?? []).includes(code)) return 'exclude';
        return 'neutral';
    }

    // Padrão Vendas: neutro (ambos) → verde (com) → vermelho (sem) → neutro
    function cycleTreatment(code: string) {
        const inc = filtros.treatments ?? [];
        const exc = filtros.excludeTreatments ?? [];
        const state = treatmentState(code);
        if (state === 'neutral') {
            const nextInc = [...inc, code];
            onApply({ ...filtros, treatments: nextInc });
        } else if (state === 'include') {
            const nextInc = inc.filter(c => c !== code);
            const nextExc = [...exc, code];
            onApply({
                ...filtros,
                treatments: nextInc.length ? nextInc : undefined,
                excludeTreatments: nextExc,
            });
        } else {
            const nextExc = exc.filter(c => c !== code);
            onApply({ ...filtros, excludeTreatments: nextExc.length ? nextExc : undefined });
        }
    }

    function triClass(code: string): string {
        const state = treatmentState(code);
        if (state === 'include') return 'bg-green-600 text-white shadow-sm hover:bg-green-700';
        if (state === 'exclude') return 'bg-red-600 text-white shadow-sm line-through hover:bg-red-700';
        return 'bg-muted text-muted-foreground hover:bg-accent';
    }

    function triTitle(code: string): string {
        const state = treatmentState(code);
        if (state === 'include') return 'Com — clique para EXCLUIR';
        if (state === 'exclude') return 'Sem — clique para limpar';
        return 'Ambos — clique para exigir';
    }

    function aplicarPreco() {
        const min = priceMinInput ? parseFloat(priceMinInput) : null;
        const max = priceMaxInput ? parseFloat(priceMaxInput) : null;
        onApply({ ...filtros, priceMin: min, priceMax: max });
    }

    function clearAll() {
        onApply({});
    }

    function treatmentCount(code: string): number {
        const t = (filtros.treatments ?? []);
        if (t.length > 0 && !t.includes(code)) {
            // Quando outro tratamento está ativo, a cascade pode zerar. Mostra só se > 0.
            const found = filterOptions?.treatments?.find((x: any) => x.code === code);
            return found?.count ?? 0;
        }
        const found = filterOptions?.treatments?.find((x: any) => x.code === code);
        return found?.count ?? 0;
    }

    const TREATMENT_DEFS = [
        { code: 'ar',      label: 'AR',    icon: Sparkles },
        { code: 'blue',    label: 'Blue',  icon: Eye },
        { code: 'photo',   label: 'Foto',  icon: Sun },
        { code: 'uv',      label: 'UV',    icon: Zap },
        { code: 'scratch', label: 'Risco', icon: Shield },
        { code: 'pol',     label: 'Polar', icon: Palette },
    ];

    // Badges dos módulos recolhidos (resumo do valor ativo no cabeçalho)
    $: materialLabel = filtros.materialId
        ? (filterOptions?.materials?.find((m: any) => m.id === filtros.materialId)?.name ?? '1 ativo')
        : null;
    $: precoLabel = (filtros.priceMin != null || filtros.priceMax != null)
        ? `${filtros.priceMin ?? '…'}–${filtros.priceMax ?? '…'}`
        : null;
    $: tratLabel = (() => {
        const inc = (filtros.treatments ?? []).length;
        const exc = (filtros.excludeTreatments ?? []).length;
        if (!inc && !exc) return null;
        const parts = [];
        if (inc) parts.push(`${inc} com`);
        if (exc) parts.push(`${exc} sem`);
        return parts.join(' · ');
    })();
</script>

<aside class="lg:col-span-1 space-y-4">
    <div class="bg-card border border-border rounded-2xl p-5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-black uppercase tracking-wider text-foreground">Filtros</h2>
            {#if hasActiveFilters}
                <button type="button" on:click={clearAll}
                    class="text-micro font-bold uppercase text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X class="h-3 w-3" /> Limpar
                </button>
            {/if}
        </div>

        {#if loading}
            <div class="space-y-3">
                {#each Array(6) as _}
                    <div class="h-8 bg-muted rounded-lg animate-pulse"></div>
                {/each}
            </div>
        {:else if filterOptions}
            <!-- Módulos recolhíveis (padrão visual Finance: escondido + expansão) -->
            <div class="space-y-2">

                {#if context === 'premium' && filterOptions.brands?.length}
                    <FilterSection id="marca" title="Marca" active={filtros.brand ?? null}>
                        <div class="flex flex-wrap gap-1.5">
                            {#each filterOptions.brands as b}
                                <button type="button"
                                    on:click={() => set('brand', filtros.brand === b.value ? null : b.value)}
                                    class="px-2.5 py-1 text-micro font-bold rounded-lg border transition-all
                                        {filtros.brand === b.value
                                            ? 'bg-amber-600 border-amber-600 text-white'
                                            : 'bg-card border-border text-foreground hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}">
                                    {b.value}<span class="ml-1 opacity-70">({b.count})</span>
                                </button>
                            {/each}
                        </div>
                    </FilterSection>
                {/if}

                {#if context === 'premium' && filterOptions.product_lines?.length}
                    <FilterSection id="linha" title="Linha de produto" active={filtros.productLine ?? null}>
                        <select id="f-linha" value={filtros.productLine ?? ''}
                            on:change={(e) => set('productLine', e.currentTarget.value || null)}
                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todas ({filterOptions.product_lines.length})</option>
                            {#each filterOptions.product_lines as opt}
                                <option value={opt.value}>{opt.value} ({opt.count})</option>
                            {/each}
                        </select>
                    </FilterSection>
                {/if}

                {#if filterOptions.lens_types?.length}
                    <FilterSection id="tipo" title="Tipo" active={filtros.lensType ? (TIPO_LABELS[filtros.lensType] ?? filtros.lensType) : null}>
                        <select id="f-tipo" value={filtros.lensType ?? ''}
                            on:change={(e) => set('lensType', e.currentTarget.value || null)}
                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todos</option>
                            {#each filterOptions.lens_types as opt}
                                <option value={opt.value}>{TIPO_LABELS[opt.value] ?? opt.value} ({opt.count})</option>
                            {/each}
                        </select>
                    </FilterSection>
                {/if}

                {#if filterOptions.materials?.length}
                    <FilterSection id="material" title="Material / Índice" active={materialLabel}>
                        <select id="f-mat" value={filtros.materialId ?? ''}
                            on:change={(e) => set('materialId', e.currentTarget.value || null)}
                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todos</option>
                            {#each filterOptions.materials as m}
                                <option value={m.id}>{m.name} · n={m.index} ({m.count})</option>
                            {/each}
                        </select>
                    </FilterSection>
                {/if}

                {#if context === 'premium' && filterOptions.coatings?.length}
                    <FilterSection id="coating" title="Coating" active={filtros.coating ?? null}>
                        <select id="f-coat" value={filtros.coating ?? ''}
                            on:change={(e) => set('coating', e.currentTarget.value || null)}
                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todos ({filterOptions.coatings.length})</option>
                            {#each filterOptions.coatings as opt}
                                <option value={opt.value}>{opt.value} ({opt.count})</option>
                            {/each}
                        </select>
                    </FilterSection>
                {/if}

                {#if context === 'premium' && filterOptions.photochromics?.length}
                    <FilterSection id="foto" title="Fotossensível" active={filtros.photochromic ?? null}>
                        <select id="f-foto" value={filtros.photochromic ?? ''}
                            on:change={(e) => set('photochromic', e.currentTarget.value || null)}
                            class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todos</option>
                            {#each filterOptions.photochromics as opt}
                                <option value={opt.value}>{opt.value} ({opt.count})</option>
                            {/each}
                        </select>
                    </FilterSection>
                {/if}

                {#if filterOptions.price_range && filterOptions.price_range.max > 0}
                    <FilterSection id="preco" title="Faixa de preço" active={precoLabel}>
                        <div class="flex items-center gap-2">
                            <input type="number" min="0" step="10"
                                placeholder={String(Math.floor(filterOptions.price_range.min))}
                                bind:value={priceMinInput}
                                on:blur={aplicarPreco}
                                on:keydown={(e) => e.key === 'Enter' && aplicarPreco()}
                                class="w-full px-2 py-2 border border-border rounded-lg text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            <span class="text-muted-foreground text-xs">→</span>
                            <input type="number" min="0" step="10"
                                placeholder={String(Math.ceil(filterOptions.price_range.max))}
                                bind:value={priceMaxInput}
                                on:blur={aplicarPreco}
                                on:keydown={(e) => e.key === 'Enter' && aplicarPreco()}
                                class="w-full px-2 py-2 border border-border rounded-lg text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <p class="text-micro text-muted-foreground mt-1">
                            R$ {filterOptions.price_range.min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a
                            R$ {filterOptions.price_range.max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                    </FilterSection>
                {/if}

                <FilterSection id="tratamentos" title="Tratamentos" active={tratLabel}>
                    <p class="text-micro text-muted-foreground mb-2">
                        <span class="inline-block w-2 h-2 rounded-full bg-muted-foreground/40 mr-1 align-middle"></span> ambos
                        <span class="mx-1">·</span>
                        <span class="inline-block w-2 h-2 rounded-full bg-green-600 mr-1 align-middle"></span> com
                        <span class="mx-1">·</span>
                        <span class="inline-block w-2 h-2 rounded-full bg-red-600 mr-1 align-middle"></span> sem
                    </p>
                    <div class="grid grid-cols-2 gap-1.5">
                        {#each TREATMENT_DEFS as t (t.code)}
                            {#if t.code !== 'pol' || treatmentCount('pol') > 0 || treatmentState('pol') !== 'neutral'}
                                <button type="button"
                                    on:click={() => cycleTreatment(t.code)}
                                    title={triTitle(t.code)}
                                    class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {triClass(t.code)}">
                                    <svelte:component this={t.icon} class="h-3 w-3" /> {t.label} ({treatmentCount(t.code)})
                                </button>
                            {/if}
                        {/each}
                    </div>
                    {#if (filtros.excludeTreatments ?? []).length > 0}
                        <p class="text-micro text-red-500 mt-1.5">
                            Excluindo: {(filtros.excludeTreatments ?? []).join(', ')}
                        </p>
                    {/if}
                </FilterSection>

            </div>
        {/if}
    </div>
</aside>
