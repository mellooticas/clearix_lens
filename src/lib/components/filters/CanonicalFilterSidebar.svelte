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
        treatments?:   string[];
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
        filtros.priceMin != null || filtros.priceMax != null
    );

    function set<K extends keyof typeof filtros>(key: K, value: (typeof filtros)[K]) {
        onApply({ ...filtros, [key]: value });
    }

    function toggleTreatment(code: string) {
        const cur = filtros.treatments ?? [];
        const next = cur.includes(code) ? cur.filter(c => c !== code) : [...cur, code];
        onApply({ ...filtros, treatments: next.length ? next : undefined });
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

    function isActive(code: string): boolean {
        return (filtros.treatments ?? []).includes(code);
    }
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

            <!-- PREMIUM: Marca (pills) -->
            {#if context === 'premium' && filterOptions.brands?.length}
                <div class="mb-4">
                    <label class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Marca</label>
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
                </div>
            {/if}

            <!-- PREMIUM: Linha -->
            {#if context === 'premium' && filterOptions.product_lines?.length}
                <div class="mb-4">
                    <label for="f-linha" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Linha de produto</label>
                    <select id="f-linha" value={filtros.productLine ?? ''}
                        on:change={(e) => set('productLine', e.currentTarget.value || null)}
                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todas ({filterOptions.product_lines.length})</option>
                        {#each filterOptions.product_lines as opt}
                            <option value={opt.value}>{opt.value} ({opt.count})</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- Tipo -->
            {#if filterOptions.lens_types?.length}
                <div class="mb-4">
                    <label for="f-tipo" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Tipo</label>
                    <select id="f-tipo" value={filtros.lensType ?? ''}
                        on:change={(e) => set('lensType', e.currentTarget.value || null)}
                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todos</option>
                        {#each filterOptions.lens_types as opt}
                            <option value={opt.value}>{TIPO_LABELS[opt.value] ?? opt.value} ({opt.count})</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- Material -->
            {#if filterOptions.materials?.length}
                <div class="mb-4">
                    <label for="f-mat" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Material / Índice</label>
                    <select id="f-mat" value={filtros.materialId ?? ''}
                        on:change={(e) => set('materialId', e.currentTarget.value || null)}
                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todos</option>
                        {#each filterOptions.materials as m}
                            <option value={m.id}>{m.name} · n={m.index} ({m.count})</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- PREMIUM: Coating -->
            {#if context === 'premium' && filterOptions.coatings?.length}
                <div class="mb-4">
                    <label for="f-coat" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Coating</label>
                    <select id="f-coat" value={filtros.coating ?? ''}
                        on:change={(e) => set('coating', e.currentTarget.value || null)}
                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todos ({filterOptions.coatings.length})</option>
                        {#each filterOptions.coatings as opt}
                            <option value={opt.value}>{opt.value} ({opt.count})</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- PREMIUM: Fotossensível -->
            {#if context === 'premium' && filterOptions.photochromics?.length}
                <div class="mb-4">
                    <label for="f-foto" class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Fotossensível (tipo)</label>
                    <select id="f-foto" value={filtros.photochromic ?? ''}
                        on:change={(e) => set('photochromic', e.currentTarget.value || null)}
                        class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todos</option>
                        {#each filterOptions.photochromics as opt}
                            <option value={opt.value}>{opt.value} ({opt.count})</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- Faixa de preço -->
            {#if filterOptions.price_range && filterOptions.price_range.max > 0}
                <div class="mb-5 pb-5 border-b border-border">
                    <label class="text-micro font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Faixa de preço (R$)</label>
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
                </div>
            {/if}

            <!-- Tratamentos (toggles visuais) -->
            <div class="mb-2">
                <p class="text-micro font-black uppercase tracking-wider text-muted-foreground mb-2">Tratamentos</p>
                <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" on:click={() => toggleTreatment('ar')}
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('ar') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                        <Sparkles class="h-3 w-3" /> AR ({treatmentCount('ar')})
                    </button>
                    <button type="button" on:click={() => toggleTreatment('blue')}
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('blue') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                        <Eye class="h-3 w-3" /> Blue ({treatmentCount('blue')})
                    </button>
                    <button type="button" on:click={() => toggleTreatment('photo')}
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('photo') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                        <Sun class="h-3 w-3" /> Foto ({treatmentCount('photo')})
                    </button>
                    <button type="button" on:click={() => toggleTreatment('uv')}
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('uv') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                        <Zap class="h-3 w-3" /> UV ({treatmentCount('uv')})
                    </button>
                    <button type="button" on:click={() => toggleTreatment('scratch')}
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('scratch') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                        <Shield class="h-3 w-3" /> Risco ({treatmentCount('scratch')})
                    </button>
                    {#if treatmentCount('pol') > 0}
                        <button type="button" on:click={() => toggleTreatment('pol')}
                            class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-micro font-semibold transition-colors {isActive('pol') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200' : 'bg-muted text-muted-foreground hover:bg-accent'}">
                            <Palette class="h-3 w-3" /> Polar ({treatmentCount('pol')})
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</aside>
