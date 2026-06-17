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
  let topPremium: RpcLensSearchResult[] = [];
  let loading = true;
  let error = "";

  onMount(async () => {
    await carregarDados();
  });

  async function carregarDados() {
    loading = true;
    error = "";

    try {
      const [resCaros, resPremium] = await Promise.all([
        LensOracleAPI.getRankings({ category: "expensive", limit: 10 }),
        LensOracleAPI.getRankings({ category: "premium", limit: 10 }),
      ]);

      if (resCaros.data) topCaros = resCaros.data;
      if (resPremium.data) topPremium = resPremium.data;
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
    {/if}
  </Container>
</main>
