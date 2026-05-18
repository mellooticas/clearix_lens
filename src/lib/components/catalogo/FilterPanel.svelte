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
  import TriStateFilter from "./TriStateFilter.svelte";

  export let filters: any = {};
  export let loading = false;
  export let totalResults = 0;

  const dispatch = createEventDispatcher();

  // Opções para os selects (Valores em EN para o novo banco)
  const types = [
    { value: "single_vision", label: "Visão Simples" },
    { value: "bifocal", label: "Bifocal" },
    { value: "multifocal", label: "Multifocal" },
    { value: "reading", label: "Leitura" },
    { value: "occupational", label: "Ocupacional" },
  ];

  const materials = [
    { value: "cr39", label: "CR-39" },
    { value: "polycarbonate", label: "Policarbonato" },
    { value: "trivex", label: "Trivex" },
    { value: "high_index", label: "Alto Índice" },
    { value: "glass", label: "Vidro" },
  ];

  const categories = [
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
  ];

  const indices = [
    { value: 1.5, label: "1.50" },
    { value: 1.53, label: "1.53" },
    { value: 1.56, label: "1.56" },
    { value: 1.59, label: "1.59" },
    { value: 1.61, label: "1.61" },
    { value: 1.67, label: "1.67" },
    { value: 1.74, label: "1.74" },
  ];

  const priceRanges = [
    { value: "all", label: "Todos os preços" },
    { value: "0-300", label: "Até R$ 300" },
    { value: "300-600", label: "R$ 300 - 600" },
    { value: "600-1000", label: "R$ 600 - 1.000" },
    { value: "1000-3000", label: "R$ 1.000 - 3.000" },
    { value: "3000+", label: "Acima de R$ 3.000" },
  ];

  const labs = [
    "Brascor",
    "Sygma",
    "Polylux",
    "Express",
    "So Blocos",
    "Hoya",
    "Braslentes",
    "High Vision",
  ];

  // Valores selecionados
  let selectedType = "";
  let selectedMaterial = "";
  let selectedCategory = "";
  let selectedIndex = "";
  let selectedPriceRange = "all";
  let searchText = filters.busca || "";
  let selectedLabs: string[] = [];

  // Graus
  let esf: number | null = null;
  let cil: number | null = null;
  let add: number | null = null;

  // Tri-state: null=ambos, true=com, false=sem
  let hasAR: boolean | null = null;
  let hasBlue: boolean | null = null;
  let hasFoto: boolean | null = null;
  let hasPolar: boolean | null = null;
  let onlyPremium = false;

  let showAdvancedGrades = false;

  // Aplicar filtros quando mudar
  function applyFilters() {
    const newFilters: any = { busca: searchText };

    if (selectedType) newFilters.tipos = [selectedType];
    if (selectedMaterial) newFilters.materiais = [selectedMaterial];
    if (selectedCategory) newFilters.categorias = [selectedCategory];
    if (selectedIndex) newFilters.indices = [selectedIndex];

    // Filtro Premium
    if (onlyPremium) {
      newFilters.marca_premium = true;
    }

    if (selectedPriceRange !== "all") {
      if (selectedPriceRange === "3000+") {
        newFilters.preco = { min: 3000 };
      } else {
        const parts = selectedPriceRange.split("-");
        if (parts.length === 2) {
          newFilters.preco = { min: Number(parts[0]), max: Number(parts[1]) };
        }
      }
    }

    if (selectedLabs.length > 0) {
      newFilters.fornecedores = selectedLabs;
    }

    if (esf !== null || cil !== null || add !== null) {
      newFilters.graus = {};
      if (esf !== null) newFilters.graus.esferico = esf;
      if (cil !== null) newFilters.graus.cilindrico = cil;
      if (add !== null) newFilters.graus.adicao = add;
    }

    // Tratamentos tri-state: true=com, false=sem, null=ignora
    const tratamentos: any = {};
    if (hasAR !== null) tratamentos.ar = hasAR;
    if (hasBlue !== null) tratamentos.blue = hasBlue;
    if (hasPolar !== null) tratamentos.polarizado = hasPolar;
    if (hasFoto !== null) tratamentos.fotossensivel = hasFoto;

    if (Object.keys(tratamentos).length > 0) {
      newFilters.tratamentos = tratamentos;
    }

    dispatch("change", newFilters);
  }

  function clearFilters() {
    selectedType = "";
    selectedMaterial = "";
    selectedCategory = "";
    selectedIndex = "";
    selectedPriceRange = "all";
    searchText = "";
    selectedLabs = [];
    esf = null;
    cil = null;
    add = null;
    hasAR = null;
    hasBlue = null;
    hasFoto = null;
    hasPolar = null;
    onlyPremium = false;
    dispatch("clear");
  }

  function toggleLab(lab: string) {
    if (selectedLabs.includes(lab)) {
      selectedLabs = selectedLabs.filter((l) => l !== lab);
    } else {
      selectedLabs = [...selectedLabs, lab];
    }
    applyFilters();
  }

  $: hasActiveFilters =
    selectedType ||
    selectedMaterial ||
    selectedIndex ||
    selectedPriceRange !== "all" ||
    searchText ||
    hasAR !== null ||
    hasBlue !== null ||
    hasFoto !== null ||
    hasPolar !== null ||
    onlyPremium ||
    selectedLabs.length > 0 ||
    esf !== null ||
    cil !== null ||
    add !== null;
</script>

<div class="rounded-xl p-6 bg-card border border-border">
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
          placeholder="Buscar por nome, marca ou código..."
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          bind:value={searchText}
          on:input={applyFilters}
        />
      </div>
    </div>

    <!-- Tipo de Lente -->
    <div>
      <span
        class="block text-xs font-medium text-muted-foreground mb-1.5"
        >Tipo</span
      >
      <select
        class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
        bind:value={selectedType}
        on:change={applyFilters}
        aria-label="Tipo de lente"
      >
        <option value="">Todos os tipos</option>
        {#each types as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>

    <!-- Material -->
    <div>
      <span
        class="block text-xs font-medium text-muted-foreground mb-1.5"
        >Material</span
      >
      <select
        class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
        bind:value={selectedMaterial}
        on:change={applyFilters}
        aria-label="Material da lente"
      >
        <option value="">Todos os materiais</option>
        {#each materials as mat}
          <option value={mat.value}>{mat.label}</option>
        {/each}
      </select>
    </div>

    <!-- Categoria -->
    <div>
      <span
        class="block text-xs font-medium text-muted-foreground mb-1.5"
        >Categoria</span
      >
      <select
        class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
        bind:value={selectedCategory}
        on:change={applyFilters}
        aria-label="Categoria da lente"
      >
        <option value="">Todas as categorias</option>
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
    </div>

    <!-- Índice -->
    <div>
      <span
        class="block text-xs font-medium text-muted-foreground mb-1.5"
        >Índice</span
      >
      <select
        class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
        bind:value={selectedIndex}
        on:change={applyFilters}
        aria-label="Índice de refração"
      >
        <option value="">Todos os índices</option>
        {#each indices as idx}
          <option value={idx.value}>{idx.label}</option>
        {/each}
      </select>
    </div>

    <!-- Faixa de Preço -->
    <div>
      <span
        class="block text-xs font-medium text-muted-foreground mb-1.5"
        >Preço</span
      >
      <select
        class="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
        bind:value={selectedPriceRange}
        on:change={applyFilters}
        aria-label="Faixa de preço"
      >
        {#each priceRanges as range}
          <option value={range.value}>{range.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Nova Seção: Laboratórios (Multi-select visual) -->
  <div class="border-t border-border pt-4 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <Factory class="w-4 h-4 text-primary-600 dark:text-primary-400" />
      <span
        class="text-xs font-medium text-foreground uppercase tracking-wider"
        >Laboratórios / Marcas</span
      >
    </div>
    <div class="flex flex-wrap gap-2">
      {#each labs as lab}
        <button
          on:click={() => toggleLab(lab)}
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-base border
            {selectedLabs.includes(lab)
            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
            : 'bg-muted border-border text-muted-foreground hover:border-primary-300'}"
        >
          {lab}
        </button>
      {/each}
    </div>
  </div>

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
          class="w-4 h-4 text-amber-600 dark:text-amber-400"
        />
        <span
          class="text-xs font-medium text-foreground uppercase tracking-wider"
          >Filtrar por Receita (Grau)</span
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
              for="fp-esf"
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
              id="fp-esf"
              type="number"
              step="0.25"
              placeholder="0.00"
              class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none"
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
              for="fp-cil"
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
              id="fp-cil"
              type="number"
              step="0.25"
              max="0"
              placeholder="0.00"
              class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none"
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
              for="fp-add"
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
              id="fp-add"
              type="number"
              step="0.25"
              min="0"
              placeholder="0.00"
              class="w-full px-3 py-2 text-center font-mono font-bold bg-card border border-border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none"
              bind:value={add}
              on:input={applyFilters}
            />
          </div>
          <p class="text-micro text-muted-foreground text-center italic">
            Para multifocais (ex: 2.00)
          </p>
        </div>

        <div
          class="sm:col-span-3 flex items-start gap-2 text-muted-foreground text-micro"
        >
          <Info class="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p>
            O sistema filtrará apenas as lentes que suportam fisicamente o grau
            informado nos seus respectivos ranges de fabricação.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Tratamentos (Checkboxes Horizontais com Indicador Premium) -->
  <div class="border-t border-border pt-4">
    <span
      class="block text-xs font-medium text-muted-foreground mb-3"
      >Tratamentos</span
    >
    <div class="flex flex-wrap gap-3">
      <!-- Filtro Premium (Destaque) -->
      <label
        class="inline-flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
      >
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-amber-300 dark:border-amber-700 text-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
          bind:checked={onlyPremium}
          on:change={applyFilters}
        />
        <span
          class="text-sm font-semibold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors"
          >🔒 Apenas Premium</span
        >
      </label>

      <!-- Antirreflexo (Standard + Premium) -->
      <TriStateFilter
        label="💨 Antirreflexo"
        bind:value={hasAR}
        count={620}
        on:change={applyFilters}
      />

      <!-- Blue Light (Standard + Premium) -->
      <TriStateFilter
        label="🔵 Blue Light"
        bind:value={hasBlue}
        count={466}
        on:change={applyFilters}
      />

      <!-- Fotossensível (Transitions + Acclimates = Premium) -->
      <TriStateFilter
        label="📷 Fotossensível"
        bind:value={hasFoto}
        count={382}
        on:change={applyFilters}
      />

      <!-- Polarizado (Standard + Premium) -->
      <TriStateFilter
        label="😎 Polarizado"
        bind:value={hasPolar}
        count={60}
        on:change={applyFilters}
      />
    </div>

    <!-- Legenda de Tipos -->
    <div
      class="mt-3 flex items-center gap-4 text-xs text-muted-foreground"
    >
      <span>💨 = Standard</span>
      <span>🔒 = Premium</span>
    </div>
  </div>

  <!-- Footer com info e botão limpar -->
  <div
    class="flex items-center justify-between mt-6 pt-4 border-t border-border"
  >
    <div class="text-sm text-muted-foreground">
      <span class="font-semibold text-primary-600 dark:text-primary-400"
        >{loading ? "..." : totalResults}</span
      > lentes encontradas
    </div>
    {#if hasActiveFilters}
      <Button variant="ghost" size="sm" onclick={clearFilters}>
        <RotateCcw class="w-3.5 h-3.5 mr-1.5" />
        Limpar Filtros
      </Button>
    {/if}
  </div>
</div>
