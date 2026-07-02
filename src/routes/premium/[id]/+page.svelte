<script lang="ts">
    import { ChevronLeft, Crown, Layers, Tag } from "lucide-svelte";
    import Container from "$lib/components/layout/Container.svelte";
    import type { PageData } from "./$types";
    import type { CanonicalPremiumV3, CanonicalDetailEnriched, CanonicalPriceTiers } from "$lib/types/database-views";

    export let data: PageData;

    $: conceito = data.conceito as unknown as CanonicalPremiumV3;
    $: lentes = (data.lentes ?? []) as CanonicalDetailEnriched[];
    $: tiers = data.tiers as CanonicalPriceTiers | null;

    function formatPrice(value: number | null | undefined): string {
        if (value == null) return "—";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    }

    function formatDiopter(value: number | null | undefined): string {
        if (value == null) return "—";
        const sign = value > 0 ? "+" : "";
        return `${sign}${value.toFixed(2)}`;
    }
</script>

<svelte:head>
    <title>{conceito.canonical_name} — Premium | Clearix Lens</title>
</svelte:head>

<main class="min-h-screen bg-muted pb-20">
    <!-- Top Bar -->
    <div class="bg-card border-b border-border sticky top-0 z-30">
        <Container>
            <div class="flex items-center justify-between py-4">
                <a
                    href="/lentes"
                    class="flex items-center gap-2 text-muted-foreground hover:text-amber-600 transition-colors text-sm font-medium"
                >
                    <ChevronLeft class="h-4 w-4" /> Voltar
                </a>
                <span
                    class="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full flex items-center gap-1"
                >
                    <Crown class="h-3 w-3" /> Premium
                </span>
            </div>
        </Container>
    </div>

    <Container>
        <div class="py-12">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Info -->
                <div class="lg:col-span-2 space-y-6">
                    <div>
                        <p class="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                            {conceito.brand}{conceito.product_line ? ` · ${conceito.product_line}` : ""}
                        </p>
                        <h1 class="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {conceito.canonical_name}
                        </h1>
                        <p class="mt-2 text-muted-foreground font-mono text-xs">
                            SKU: {conceito.sku ?? "—"}
                        </p>
                    </div>

                    <!-- Especificações Ópticas -->
                    <div class="bg-card border border-border rounded-xl p-6">
                        <h2 class="font-bold text-foreground mb-4 uppercase text-xs tracking-wider">
                            Especificações Ópticas
                        </h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs text-muted-foreground">Tipo</p>
                                <p class="font-semibold text-foreground">{conceito.lens_type}</p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Material</p>
                                <p class="font-semibold text-foreground">{conceito.material_name}</p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Índice</p>
                                <p class="font-semibold text-foreground">{conceito.refractive_index}</p>
                            </div>
                            {#if conceito.coating_name}
                                <div>
                                    <p class="text-xs text-muted-foreground">Tratamento</p>
                                    <p class="font-semibold text-foreground">{conceito.coating_name}</p>
                                </div>
                            {/if}
                            {#if conceito.photochromic_type}
                                <div>
                                    <p class="text-xs text-muted-foreground">Fotocrômico</p>
                                    <p class="font-semibold text-foreground">{conceito.photochromic_type}</p>
                                </div>
                            {/if}
                            <div>
                                <p class="text-xs text-muted-foreground">Classe</p>
                                <p class="font-semibold text-foreground">{conceito.material_class}</p>
                            </div>
                        </div>

                        <!-- Faixas de prescrição -->
                        <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                            <div>
                                <p class="text-xs text-muted-foreground">Esférico</p>
                                <p class="font-mono text-sm text-foreground">
                                    {formatDiopter(conceito.spherical_min)} a {formatDiopter(conceito.spherical_max)}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Cilíndrico</p>
                                <p class="font-mono text-sm text-foreground">
                                    {formatDiopter(conceito.cylindrical_min)} a {formatDiopter(conceito.cylindrical_max)}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Adição</p>
                                <p class="font-mono text-sm text-foreground">
                                    {formatDiopter(conceito.addition_min)} a {formatDiopter(conceito.addition_max)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Faixas de Preço (tiers por custo efetivo — doc 14) -->
                    {#if tiers && tiers.tier_count > 0}
                        <div class="bg-card border border-border rounded-xl overflow-hidden">
                            <div class="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h2 class="font-bold text-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                                    <Layers class="h-4 w-4 text-amber-600" /> Faixas de Preço
                                </h2>
                                <span class="text-xs text-muted-foreground">
                                    {tiers.tier_count} faixa{tiers.tier_count > 1 ? "s" : ""} · spread {tiers.spread_pct}% · custo efetivo com acordos vigentes
                                </span>
                            </div>
                            <div class="divide-y divide-border">
                                {#each tiers.tiers as faixa}
                                    <div class="px-6 py-3 flex items-center justify-between gap-4">
                                        <div class="flex items-center gap-3">
                                            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                                                {faixa.tier}
                                            </span>
                                            <div>
                                                <p class="text-sm font-semibold text-foreground">
                                                    {faixa.lens_count} lente{faixa.lens_count > 1 ? "s" : ""}
                                                </p>
                                                {#if faixa.lenses.some((l) => l.has_discount)}
                                                    <p class="text-xs text-green-600 flex items-center gap-1">
                                                        <Tag class="h-3 w-3" />
                                                        {faixa.lenses.filter((l) => l.has_discount).length} em promoção de laboratório
                                                    </p>
                                                {/if}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm font-bold text-foreground">
                                                {formatPrice(faixa.sell_min)}
                                                {#if faixa.sell_max != null && faixa.sell_max !== faixa.sell_min}
                                                    – {formatPrice(faixa.sell_max)}
                                                {/if}
                                            </p>
                                            <p class="text-xs text-muted-foreground">venda</p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Lentes Reais Mapeadas -->
                    <div class="bg-card border border-border rounded-xl overflow-hidden">
                        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 class="font-bold text-foreground uppercase text-xs tracking-wider">
                                Lentes Mapeadas
                            </h2>
                            <span class="text-xs text-muted-foreground">
                                {lentes.length} opções · {conceito.mapped_supplier_count} fornecedores
                            </span>
                        </div>
                        {#if lentes.length === 0}
                            <p class="px-6 py-8 text-sm text-center text-muted-foreground">
                                Nenhuma lente real mapeada para este conceito ainda.
                            </p>
                        {:else}
                            <div class="divide-y divide-border">
                                {#each lentes as lente}
                                    <div class="px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors">
                                        <div class="flex-1">
                                            <p class="font-semibold text-foreground">{lente.lens_name}</p>
                                            <p class="text-xs text-muted-foreground mt-1">
                                                {lente.brand_name ?? "—"}
                                                {#if lente.supplier_name} · {lente.supplier_name}{/if}
                                                {#if lente.lens_sku} · <span class="font-mono">{lente.lens_sku}</span>{/if}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-lg font-bold text-amber-600 dark:text-amber-400">
                                                {formatPrice(lente.sell_price)}
                                            </p>
                                            {#if lente.effective_markup}
                                                <p class="text-xs text-muted-foreground">
                                                    markup {lente.effective_markup.toFixed(2)}x
                                                </p>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Pricing Sidebar -->
                <div class="lg:col-span-1">
                    <div class="bg-card border border-amber-100 dark:border-amber-900/30 rounded-xl p-6 sticky top-20">
                        <h3 class="font-bold text-lg mb-4">Preços Agregados</h3>
                        <div class="space-y-3">
                            <div>
                                <p class="text-xs text-muted-foreground mb-1">Mínimo</p>
                                <p class="text-xl font-bold text-foreground">{formatPrice(conceito.price_min)}</p>
                            </div>
                            <div class="border-t border-border pt-3">
                                <p class="text-xs text-muted-foreground mb-1">Máximo</p>
                                <p class="text-xl font-bold text-foreground">{formatPrice(conceito.price_max)}</p>
                            </div>
                            <div class="border-t border-border pt-3">
                                <p class="text-xs text-muted-foreground mb-1">Médio</p>
                                <p class="text-xl font-bold text-amber-600 dark:text-amber-400">
                                    {formatPrice(conceito.price_avg)}
                                </p>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t border-border space-y-2">
                            <p class="text-xs text-muted-foreground">
                                <span class="font-bold text-foreground">{conceito.mapped_lens_count}</span> lentes mapeadas
                            </p>
                            <p class="text-xs text-muted-foreground">
                                <span class="font-bold text-foreground">{conceito.mapped_supplier_count}</span> fornecedores
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Container>
</main>
