<!--
  Rankings de Lentes - Clearix Lens
  Análise completa dos grupos mais relevantes utilizando LensOracleAPI
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { LensOracleAPI } from "$lib/api/lens-oracle";
  import Container from "$lib/components/layout/Container.svelte";
  import PageHero from "$lib/components/layout/PageHero.svelte";
  import SectionHeader from "$lib/components/layout/SectionHeader.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import type { RpcLensSearchResult } from "$lib/types/database-views";

  let topCaros: RpcLensSearchResult[] = [];
  let topPopulares: RpcLensSearchResult[] = [];
  let topPremium: RpcLensSearchResult[] = [];
  let distribuicaoTipo: Array<{ tipo_lente: string; count: number }> = [];
  let distribuicaoMaterial: Array<{ material: string; count: number }> = [];
  let loading = true;
  let error = "";

  onMount(async () => {
    await carregarDados();
  });

  async function carregarDados() {
    loading = true;
    error = "";

    try {
      const [resCaros, resPopulares, resPremium, resTipo, resMaterial] =
        await Promise.all([
          LensOracleAPI.getRankings({ category: "expensive", limit: 10 }),
          LensOracleAPI.getRankings({ category: "popular", limit: 10 }),
          LensOracleAPI.getRankings({ category: "premium", limit: 10 }),
          Promise.resolve({ data: [] as Array<{ tipo_lente: string; count: number }>, error: null }),
          Promise.resolve({ data: [] as Array<{ material: string; count: number }>, error: null }),
        ]);

      if (resCaros.data) topCaros = resCaros.data;
      if (resPopulares.data) topPopulares = resPopulares.data;
      if (resPremium.data) topPremium = resPremium.data;
      if (resTipo.data)
        distribuicaoTipo = resTipo.data.sort((a: { tipo_lente: string; count: number }, b: { tipo_lente: string; count: number }) => b.count - a.count);
      if (resMaterial.data)
        distribuicaoMaterial = resMaterial.data.sort(
          (a: { material: string; count: number }, b: { material: string; count: number }) => b.count - a.count,
        );
    } catch (err) {
      error = err instanceof Error ? err.message : "Erro ao carregar dados";
      console.error("❌ Erro ao carregar ranking:", err);
    } finally {
      loading = false;
    }
  }

  function formatarPreco(valor: number | null): string {
    if (!valor) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function formatarTexto(texto: string | null): string {
    if (!texto) return "N/A";
    return texto.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function calcularTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.count || 0), 0);
  }

  function calcularPercentual(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
</script>

<svelte:head>
  <title>Rankings | Clearix Lens</title>
</svelte:head>

<main
  class="min-h-screen bg-gradient-to-br from-muted via-blue-50 to-muted dark:from-background dark:via-background dark:to-background"
>
  <Container>
    <PageHero
      title="🏆 Rankings"
      subtitle="Análise completa baseada no motor Lens Oracle"
    />

    {#if loading}
      <div class="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    {:else if error}
      <div
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mt-8"
      >
        <p class="text-red-800 dark:text-red-200">❌ {error}</p>
      </div>
    {:else}
      <section class="mt-8">
        <SectionHeader
          title="🏅 Top 10"
          subtitle="Lentes classificadas por preço e exclusividade"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <!-- Mais Caros -->
          <div
            class="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4"
            >
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span>💰</span>
                <span>Mais Caros</span>
              </h3>
            </div>
            <div class="p-6 space-y-3 max-h-[600px] overflow-y-auto">
              {#each topCaros as lens, index}
                <div
                  class="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                >
                  <span
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm"
                  >
                    {index + 1}
                  </span>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-semibold text-foreground text-sm leading-tight mb-1"
                    >
                      {lens.lens_name}
                    </h4>
                    <p class="text-xs text-muted-foreground">
                      {formatarTexto(lens.lens_type)} • {lens.brand_name}
                    </p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <p
                      class="font-bold text-amber-600 dark:text-amber-400 text-sm"
                    >
                      {formatarPreco(lens.price_suggested)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Mais Populares -->
          <div
            class="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4"
            >
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🔥</span>
                <span>Mais Populares</span>
              </h3>
            </div>
            <div class="p-6 space-y-3 max-h-[600px] overflow-y-auto">
              {#each topPopulares as lens, index}
                <div
                  class="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                >
                  <span
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm"
                  >
                    {index + 1}
                  </span>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-semibold text-foreground text-sm leading-tight mb-1"
                    >
                      {lens.lens_name}
                    </h4>
                    <p class="text-xs text-muted-foreground">
                      {formatarTexto(lens.lens_type)} • {lens.brand_name}
                    </p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <p
                      class="font-bold text-green-600 dark:text-green-400 text-sm"
                    >
                      {formatarPreco(lens.price_suggested)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Premium -->
          <div
            class="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
          >
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span>👑</span>
                <span>Top Premium</span>
              </h3>
            </div>
            <div class="p-6 space-y-3 max-h-[600px] overflow-y-auto">
              {#each topPremium as lens, index}
                <div
                  class="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                >
                  <span
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold text-sm"
                  >
                    {index + 1}
                  </span>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-semibold text-foreground text-sm leading-tight mb-1"
                    >
                      {lens.lens_name}
                    </h4>
                    <p class="text-xs text-muted-foreground">
                      {formatarTexto(lens.lens_type)} • {lens.brand_name}
                    </p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <p
                      class="font-bold text-purple-600 dark:text-purple-400 text-sm"
                    >
                      {formatarPreco(lens.price_suggested)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </section>

      <!-- Distribuições -->
      <section class="mt-12">
        <SectionHeader
          title="📊 Distribuição"
          subtitle="Composição técnica do catálogo"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div
            class="bg-card rounded-xl p-6 shadow-lg border border-border"
          >
            <h3 class="text-lg font-bold text-foreground mb-4">
              Por Tipo de Lente
            </h3>
            <div class="space-y-4">
              {#each distribuicaoTipo as item}
                {@const total = calcularTotal(distribuicaoTipo)}
                {@const percentual = calcularPercentual(item.count, total)}
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span
                      class="text-sm font-medium text-foreground"
                    >
                      {formatarTexto(item.tipo_lente)}
                    </span>
                    <span
                      class="text-sm text-muted-foreground"
                    >
                      {item.count.toLocaleString("pt-BR")} ({percentual}%)
                    </span>
                  </div>
                  <div
                    class="w-full bg-border rounded-full h-2.5"
                  >
                    <div
                      class="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-slow"
                      style="width: {percentual}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div
            class="bg-card rounded-xl p-6 shadow-lg border border-border"
          >
            <h3 class="text-lg font-bold text-foreground mb-4">
              Por Material
            </h3>
            <div class="space-y-4">
              {#each distribuicaoMaterial as item}
                {@const total = calcularTotal(distribuicaoMaterial)}
                {@const percentual = calcularPercentual(item.count, total)}
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span
                      class="text-sm font-medium text-foreground"
                    >
                      {formatarTexto(item.material)}
                    </span>
                    <span
                      class="text-sm text-muted-foreground"
                    >
                      {item.count.toLocaleString("pt-BR")} ({percentual}%)
                    </span>
                  </div>
                  <div
                    class="w-full bg-border rounded-full h-2.5"
                  >
                    <div
                      class="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-slow"
                      style="width: {percentual}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </section>
    {/if}
  </Container>
</main>
