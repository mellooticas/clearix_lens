<script lang="ts">
  import { ShieldCheck, TrendingUp, Info } from "lucide-svelte";

  // Props para receber os dados das duas opções
  export let brandOption = {
    nome: "Varilux Comfort Max",
    marca: "Essilor",
    tecnologia: "W.A.V.E 2.0",
    tratamentos: ["Crizal Sapphire", "Blue UV"],
    precoVenda: 1800.0,
    precoCusto: 650.0, // Tech only
    prazo: "5-7 dias úteis",
  };

  export let privateLabelOption = {
    nome: "Clearix Lens Gold Digital",
    marca: "Marca Própria",
    tecnologia: "Freeform HD Personalizada",
    tratamentos: ["Ultra AR", "Bluetech"],
    precoVenda: 1400.0,
    precoCusto: 250.0, // Tech only (Leilão reverso)
    prazo: "3-5 dias úteis",
  };

  // Estado para mostrar/esconder margens (Modo Gerente)
  let showMargins = false;

  // Cálculos reativos
  $: brandMargin = brandOption.precoVenda - brandOption.precoCusto;
  $: privateMargin =
    privateLabelOption.precoVenda - privateLabelOption.precoCusto;
  $: marginDiff = privateMargin - brandMargin;
</script>

<div class="w-full max-w-5xl mx-auto p-4">
  <!-- Header de Controle (Vendedor vs Gerente) -->
  <div class="flex justify-end mb-4">
    <button
      class="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1 transition-colors font-medium border border-primary-200 px-3 py-1 rounded-full bg-primary-50"
      on:click={() => (showMargins = !showMargins)}
    >
      <ShieldCheck size={14} />
      {showMargins ? "Ocultar Margens" : "Modo Gestão"}
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
    <!-- VS Badge Central -->
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-card border-4 border-border font-bold text-muted-foreground shadow-lg font-headline"
    >
      VS
    </div>

    <!-- COLUNA 1: GRIFE (Padrão de Mercado) -->
    <div
      class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div
        class="bg-muted p-6 border-b border-border group-hover:bg-accent transition-colors"
      >
        <span
          class="text-xs font-bold tracking-wider text-muted-foreground uppercase font-headline"
          >Referência de Mercado</span
        >
        <h3 class="text-2xl font-bold text-foreground mt-1 font-headline">
          {brandOption.nome}
        </h3>
        <p class="text-primary-600 font-medium font-sans">
          {brandOption.marca}
        </p>
      </div>

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="font-semibold text-foreground">Tecnologia:</span>
            {brandOption.tecnologia}
          </div>
          <div class="flex items-start gap-2 text-sm text-muted-foreground">
            <span class="font-semibold text-foreground">Tratamentos:</span>
            <div class="flex flex-wrap gap-1">
              {#each brandOption.tratamentos as t}
                <span
                  class="px-2 py-0.5 bg-muted rounded-md text-xs font-medium text-foreground border border-border"
                  >{t}</span
                >
              {/each}
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="font-semibold text-foreground">Prazo Estimado:</span>
            {brandOption.prazo}
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-border">
          <div class="flex justify-between items-end">
            <div>
              <span class="text-sm text-muted-foreground block mb-1">Investimento</span>
              <span class="text-3xl font-bold text-foreground font-headline">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(brandOption.precoVenda)}
              </span>
            </div>
            <button
              class="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm shadow-lg shadow-border uppercase tracking-wide"
            >
              Selecionar
            </button>
          </div>
        </div>

        {#if showMargins}
          <div
            class="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 animate-slide-up"
          >
            <div
              class="flex justify-between text-xs text-red-800 mb-1 font-medium"
            >
              <span
                >Custo Lab: {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(brandOption.precoCusto)}</span
              >
            </div>
            <div class="flex justify-between font-bold text-red-900">
              <span>Margem Líquida:</span>
              <span
                >{new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(brandMargin)}</span
              >
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- COLUNA 2: MARCA PRÓPRIA (Foco em Lucro) -->
    <div
      class="bg-card rounded-2xl border-2 border-brand-gold-400 shadow-xl overflow-hidden relative transform md:-translate-y-2 ring-4 ring-brand-gold-100/50"
    >
      <!-- Faixa de Destaque -->
      <div
        class="bg-gradient-to-r from-brand-gold-500 to-yellow-500 p-1.5 text-center shadow-lg relative z-10"
      >
        <span
          class="text-xs font-bold text-white tracking-widest uppercase flex items-center justify-center gap-2 font-headline drop-shadow-sm"
        >
          Recomendação Clearix Lens
        </span>
      </div>

      <div
        class="bg-brand-gold-50 p-6 border-b border-brand-gold-100 relative overflow-hidden"
      >
        <!-- Background Pattern (Opcional) -->
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-brand-gold-200/20 rounded-full blur-3xl -mr-10 -mt-10"
        ></div>

        <span
          class="text-xs font-bold tracking-wider text-brand-gold-700 uppercase font-headline relative z-10"
          >Marca Própria Premium</span
        >
        <h3
          class="text-2xl font-bold text-foreground mt-1 font-headline relative z-10"
        >
          {privateLabelOption.nome}
        </h3>
        <p class="text-brand-gold-600 font-medium font-sans relative z-10">
          {privateLabelOption.marca}
        </p>
      </div>

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-foreground">
            <span class="font-semibold text-foreground">Tecnologia:</span>
            <span
              class="px-2 py-0.5 bg-brand-gold-100 text-brand-gold-800 rounded font-bold text-micro tracking-wide border border-brand-gold-200"
              >EQUIVALENTE</span
            >
            {privateLabelOption.tecnologia}
          </div>
          <div class="flex items-start gap-2 text-sm text-foreground">
            <span class="font-semibold text-foreground">Tratamentos:</span>
            <div class="flex flex-wrap gap-1">
              {#each privateLabelOption.tratamentos as t}
                <span
                  class="px-2 py-0.5 bg-brand-gold-100 text-brand-gold-800 rounded-md text-xs border border-brand-gold-200 font-medium"
                  >{t}</span
                >
              {/each}
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-foreground">
            <!-- Destaque para prazo menor (sourcing local) -->
            <span class="font-semibold text-foreground">Prazo Otimizado:</span>
            <span
              class="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-xs border border-green-100"
            >
              {privateLabelOption.prazo} ⚡
            </span>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-brand-gold-100">
          <div class="flex justify-between items-end">
            <div>
              <span class="text-sm text-muted-foreground block mb-1"
                >Condição Especial</span
              >
              <div class="flex items-center gap-3">
                <span
                  class="text-lg text-muted-foreground line-through decoration-red-300 decoration-2 opacity-60"
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(brandOption.precoVenda)}
                </span>
                <span
                  class="text-3xl font-bold text-brand-gold-600 font-headline drop-shadow-sm"
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(privateLabelOption.precoVenda)}
                </span>
              </div>
            </div>
            <button
              class="px-6 py-2.5 bg-gradient-to-r from-brand-gold-500 to-yellow-600 text-white rounded-lg hover:from-brand-gold-600 hover:to-yellow-700 transition-all font-bold shadow-lg shadow-brand-gold-200 hover:shadow-xl text-sm flex items-center gap-2 uppercase tracking-wide transform hover:-translate-y-0.5"
            >
              Escolher Premium
            </button>
          </div>
        </div>

        {#if showMargins}
          <div
            class="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 animate-slide-up ring-2 ring-green-100 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute right-0 top-0 opacity-10 transform translate-x-1/2 -translate-y-1/2"
            >
              <TrendingUp size={100} />
            </div>

            <div
              class="flex items-center gap-2 text-green-800 text-xs mb-2 relative z-10 font-bold uppercase tracking-wide"
            >
              <TrendingUp size={14} />
              <span>Sourcing Dinâmico Ativo</span>
            </div>
            <div
              class="flex justify-between text-xs text-green-700 mb-1 relative z-10"
            >
              <span
                >Custo Otimizado (5 Labs): <span class="font-mono"
                  >{new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(privateLabelOption.precoCusto)}</span
                ></span
              >
            </div>
            <div
              class="flex justify-between font-bold text-green-900 text-lg border-t border-green-200 pt-2 mt-2 relative z-10"
            >
              <span>Margem Líquida:</span>
              <span
                >{new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(privateMargin)}</span
              >
            </div>
            <div
              class="text-center text-micro text-white bg-green-600 rounded-full py-0.5 px-2 mt-2 inline-block font-bold shadow-sm relative z-10"
            >
              VOCÊ GANHA +{new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(marginDiff)}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <p class="text-center text-muted-foreground text-xs mt-8 opacity-70">
    Comparação técnica baseada em índice de refração 1.67 e antirreflexo
    premium.<br />
    <span class="font-bold text-primary-900"
      >Clearix Lens Intelligence System</span
    > v2.0
  </p>
</div>

<style>
  /* Pequenos ajustes para animações mais suaves */
  button:active {
    transform: scale(0.98);
  }
</style>
