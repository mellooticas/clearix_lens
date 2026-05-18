<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {
        Search,
        RotateCcw,
        DollarSign,
        Stethoscope,
        Factory,
        ChevronDown,
        ChevronUp,
        Info,
    } from "lucide-svelte";
    import { slide } from "svelte/transition";
    import Button from "$lib/components/ui/Button.svelte";
    import type { FiltrosLentesContato } from "$lib/types/contact-lens";

    export let filters: FiltrosLentesContato = {};
    export let loading = false;
    export let totalResults = 0;
    export let availableBrands: string[] = [];
    export let availableSuppliers: string[] = [];

    const dispatch = createEventDispatcher();

    // Opções
    const types = [
        { value: "diaria", label: "Diária" },
        { value: "quinzenal", label: "Quinzenal" },
        { value: "mensal", label: "Mensal" },
        { value: "trimestral", label: "Trimestral" },
        { value: "anual", label: "Anual" },
    ];

    const purposes = [
        { value: "visao_simples", label: "Visão Simples" },
        { value: "torica", label: "Tórica" },
        { value: "multifocal", label: "Multifocal" },
        { value: "cosmetica", label: "Estética" },
        { value: "terapeutica", label: "Terapêutica" },
    ];

    const materials = [
        { value: "silicone_hidrogel", label: "Silicone Hidrogel" },
        { value: "hidrogel", label: "Hidrogel" },
        { value: "rgp_gas_perm", label: "Rígida G.P." },
    ];

    const priceRanges = [
        { value: "all", label: "Todos os preços" },
        { value: "0-150", label: "Até R$ 150" },
        { value: "150-300", label: "R$ 150 - 300" },
        { value: "300-600", label: "R$ 300 - 600" },
        { value: "600+", label: "Acima de R$ 600" },
    ];

    // Graus
    let showAdvancedGrades = false;
    let esf: number | null = null;
    let cil: number | null = null;
    let add: number | null = null;

    // ... (rest of imports/consts)

    // Selected State (Local)
    let searchText = filters.busca || "";
    let selectedType = "";
    let selectedPurpose = "";
    let selectedMaterial = "";
    let selectedPriceRange = "all";
    let selectedBrands = filters.marcas || [];
    let selectedSuppliers = filters.fornecedores || [];

    // ...

    function applyFilters() {
        const newFilters: FiltrosLentesContato = { busca: searchText };

        if (selectedType) newFilters.tipos = [selectedType as any];
        if (selectedPurpose) newFilters.finalidades = [selectedPurpose as any];
        if (selectedMaterial) newFilters.materiais = [selectedMaterial as any];

        if (selectedBrands.length > 0) newFilters.marcas = selectedBrands;
        if (selectedSuppliers.length > 0)
            newFilters.fornecedores = selectedSuppliers;

        // ...

        dispatch("change", newFilters);
    }

    function clearFilters() {
        searchText = "";
        selectedType = "";
        selectedPurpose = "";
        selectedMaterial = "";
        selectedPriceRange = "all";
        selectedBrands = [];
        selectedSuppliers = [];
        esf = null;
        cil = null;
        add = null;
        dispatch("clear");
    }

    function toggleBrand(brand: string) {
        if (selectedBrands.includes(brand)) {
            selectedBrands = selectedBrands.filter((b) => b !== brand);
        } else {
            selectedBrands = [...selectedBrands, brand];
        }
        applyFilters();
    }

    function toggleSupplier(supplier: string) {
        if (selectedSuppliers.includes(supplier)) {
            selectedSuppliers = selectedSuppliers.filter((s) => s !== supplier);
        } else {
            selectedSuppliers = [...selectedSuppliers, supplier];
        }
        applyFilters();
    }

    $: hasActiveFilters =
        searchText ||
        selectedType ||
        selectedPurpose ||
        selectedMaterial ||
        selectedBrands.length > 0 ||
        selectedSuppliers.length > 0 ||
        selectedPriceRange !== "all" ||
        esf !== null ||
        cil !== null ||
        add !== null;
</script>

<div class="bg-card border border-border rounded-xl p-6">
    <!-- Grid de Filtros Compactos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <!-- Busca Textual (Full Width em mobile) -->
        <div class="md:col-span-2 lg:col-span-5">
            <div class="relative">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                />
                <input
                    type="text"
                    placeholder="Buscar lente, marca ou código..."
                    class="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    bind:value={searchText}
                    on:input={applyFilters}
                />
            </div>
        </div>

        <!-- Tipo (Descarte) -->
        <div>
            <label
                class="block text-xs font-medium text-muted-foreground mb-1.5"
                >Descarte</label
            >
            <select
                class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
                bind:value={selectedType}
                on:change={applyFilters}
            >
                <option value="">Todos</option>
                {#each types as t}
                    <option value={t.value}>{t.label}</option>
                {/each}
            </select>
        </div>

        <!-- Finalidade -->
        <div>
            <label
                class="block text-xs font-medium text-muted-foreground mb-1.5"
                >Finalidade</label
            >
            <select
                class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
                bind:value={selectedPurpose}
                on:change={applyFilters}
            >
                <option value="">Todas</option>
                {#each purposes as p}
                    <option value={p.value}>{p.label}</option>
                {/each}
            </select>
        </div>

        <!-- Material -->
        <div>
            <label
                class="block text-xs font-medium text-muted-foreground mb-1.5"
                >Material</label
            >
            <select
                class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
                bind:value={selectedMaterial}
                on:change={applyFilters}
            >
                <option value="">Todos</option>
                {#each materials as m}
                    <option value={m.value}>{m.label}</option>
                {/each}
            </select>
        </div>

        <!-- Preço -->
        <div>
            <label
                class="block text-xs font-medium text-muted-foreground mb-1.5"
                >Preço</label
            >
            <select
                class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
                bind:value={selectedPriceRange}
                on:change={applyFilters}
            >
                {#each priceRanges as r}
                    <option value={r.value}>{r.label}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Fornecedores (Pills) -->
    {#if availableSuppliers && availableSuppliers.length > 0}
        <div
            class="border-t border-border pt-4 mb-6"
        >
            <div class="flex items-center gap-2 mb-3">
                <Factory class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <label
                    class="text-xs font-medium text-foreground uppercase tracking-wider"
                >
                    Fornecedores
                </label>
            </div>
            <div class="flex flex-wrap gap-2">
                {#each availableSuppliers as supplier}
                    <button
                        on:click={() => toggleSupplier(supplier)}
                        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-base border
                        {selectedSuppliers.includes(supplier)
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                            : 'bg-muted border-border text-muted-foreground hover:border-purple-300'}"
                    >
                        {supplier}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Marcas (Pills) -->
    {#if availableBrands.length > 0}
        <div
            class="border-t border-border pt-4 mb-6"
        >
            <div class="flex items-center gap-2 mb-3">
                <Factory
                    class="w-4 h-4 text-primary-600 dark:text-primary-400"
                />
                <label
                    class="text-xs font-medium text-foreground uppercase tracking-wider"
                    >Marcas Principais</label
                >
            </div>
            <div class="flex flex-wrap gap-2">
                {#each availableBrands as brand}
                    <button
                        on:click={() => toggleBrand(brand)}
                        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-base border
            {selectedBrands.includes(brand)
                            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                            : 'bg-muted border-border text-muted-foreground hover:border-primary-300'}"
                    >
                        {brand}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Nova Seção: Dioptrias (O que o paciente precisa?) -->
    <div class="border-t border-border pt-4 mb-6">
        <div
            class="flex items-center justify-between cursor-pointer group"
            on:click={() => (showAdvancedGrades = !showAdvancedGrades)}
            role="button"
            tabindex="0"
            on:keydown={(e) =>
                e.key === "Enter" && (showAdvancedGrades = !showAdvancedGrades)}
        >
            <div class="flex items-center gap-2">
                <Stethoscope
                    class="w-4 h-4 text-brand-gold-600 dark:text-brand-gold-400"
                />
                <label
                    class="text-xs font-medium text-foreground uppercase tracking-wider"
                    >Filtrar por Receita (Grau)</label
                >
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
                <span
                    class="text-micro font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {showAdvancedGrades ? "RECOLHER" : "CONFIGURAR GRAU"}
                </span>
                {#if showAdvancedGrades}
                    <ChevronUp class="w-4 h-4" />
                {:else}
                    <ChevronDown class="w-4 h-4" />
                {/if}
            </div>
        </div>

        {#if showAdvancedGrades}
            <div
                transition:slide
                class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-muted rounded-xl border border-dashed border-border"
            >
                <!-- Esférico -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-xs font-semibold text-foreground"
                            >Esférico (SPH)</label
                        >
                        {#if esf !== null}
                            <button
                                class="text-micro text-primary-600 hover:underline"
                                on:click={() => {
                                    esf = null;
                                    applyFilters();
                                }}>Limpar</button
                            >
                        {/if}
                    </div>
                    <div class="relative">
                        <input
                            type="number"
                            step="0.25"
                            placeholder="0.00"
                            class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-brand-gold-500/20 outline-none"
                            bind:value={esf}
                            on:input={applyFilters}
                        />
                    </div>
                    <p class="text-micro text-muted-foreground text-center italic">
                        Ex: -2.00 ou +4.25
                    </p>
                </div>

                <!-- Cilíndrico -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-xs font-semibold text-foreground"
                            >Cilíndrico (CYL)</label
                        >
                        {#if cil !== null}
                            <button
                                class="text-micro text-primary-600 hover:underline"
                                on:click={() => {
                                    cil = null;
                                    applyFilters();
                                }}>Limpar</button
                            >
                        {/if}
                    </div>
                    <div class="relative">
                        <input
                            type="number"
                            step="0.25"
                            max="0"
                            placeholder="0.00"
                            class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-brand-gold-500/20 outline-none"
                            bind:value={cil}
                            on:input={applyFilters}
                        />
                    </div>
                    <p class="text-micro text-muted-foreground text-center italic">
                        Sempre negativo (ex: -0.75)
                    </p>
                </div>

                <!-- Adição -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-xs font-semibold text-foreground"
                            >Adição (ADD)</label
                        >
                        {#if add !== null}
                            <button
                                class="text-micro text-primary-600 hover:underline"
                                on:click={() => {
                                    add = null;
                                    applyFilters();
                                }}>Limpar</button
                            >
                        {/if}
                    </div>
                    <div class="relative">
                        <input
                            type="number"
                            step="0.25"
                            min="0"
                            placeholder="0.00"
                            class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-brand-gold-500/20 outline-none"
                            bind:value={add}
                            on:input={applyFilters}
                        />
                    </div>
                    <p class="text-micro text-muted-foreground text-center italic">
                        Multifocais (ex: 2.00)
                    </p>
                </div>

                <div
                    class="sm:col-span-3 flex items-start gap-2 text-muted-foreground text-micro"
                >
                    <Info class="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <p>
                        O sistema filtrará apenas as lentes que suportam
                        fisicamente o grau informado nos seus respectivos ranges
                        de fabricação.
                    </p>
                </div>
            </div>
        {/if}
    </div>

    <!-- Footer -->
    <div
        class="flex items-center justify-between mt-6 pt-4 border-t border-border"
    >
        <div class="text-sm text-muted-foreground">
            <span
                class="font-semibold text-primary-600 dark:text-primary-400"
                >{loading ? "..." : totalResults}</span
            > lentes encontradas
        </div>
        {#if hasActiveFilters}
            <Button variant="secondary" size="sm" onclick={clearFilters}>
                <RotateCcw class="w-3.5 h-3.5 mr-1.5" />
                Limpar Filtros
            </Button>
        {/if}
    </div>
</div>
