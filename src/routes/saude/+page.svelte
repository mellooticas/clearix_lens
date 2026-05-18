<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    const { systemHealth, pricingHealth, catalogSummary } = data;

    const getHealthColor = (status: string) => {
        if (status === "healthy") return "text-emerald-500";
        if (status === "warning") return "text-amber-500";
        if (status === "critical") return "text-rose-500";
        return "text-muted-foreground";
    };

    const getZonaColor = (zona: string) => {
        if (zona.includes("Seguranca")) return "bg-emerald-500";
        if (zona.includes("Competitiva")) return "bg-blue-500";
        if (zona.includes("Performance")) return "bg-amber-500";
        return "bg-muted-foreground";
    };
</script>

<svelte:head>
    <title>Saúde do Motor Óptico — Clearix Lens</title>
</svelte:head>

<div class="p-6 space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6"
    >
        <div>
            <h1
                class="text-3xl font-bold text-foreground flex items-center gap-3"
            >
                <span
                    class="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg text-primary-600 dark:text-primary-400"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                </span>
                Diagnóstico Vital do Motor Óptico
            </h1>
            <p class="mt-2 text-muted-foreground max-w-2xl">
                Monitoramento em tempo real do ecossistema Clearix. O
                "Cérebro" financeiro e clínico calibra o catálogo baseado em
                margens e integridade dos dados.
            </p>
        </div>

    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Coluna 1: Auditoria de Saúde -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Seção: Saúde das Tabelas -->
            <section
                class="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
            >
                <div
                    class="px-6 py-4 bg-muted border-b border-border"
                >
                    <h2
                        class="font-bold text-foreground uppercase tracking-wider text-xs"
                    >
                        Auditoria de Dados Vitais
                    </h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr
                                class="text-xs text-muted-foreground font-bold border-b border-border"
                            >
                                <th class="px-6 py-3 uppercase"
                                    >Módulo / Tabela</th
                                >
                                <th class="px-6 py-3 uppercase"
                                    >Volume (Linhas)</th
                                >
                                <th class="px-6 py-3 uppercase"
                                    >Status de Saúde</th
                                >
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-border"
                        >
                            {#each systemHealth as item}
                                <tr
                                    class="hover:bg-accent transition-colors"
                                >
                                    <td class="px-6 py-4">
                                        <span
                                            class="font-semibold text-foreground"
                                            >{item.table_name}</span
                                        >
                                    </td>
                                    <td
                                        class="px-6 py-4 font-mono text-sm text-muted-foreground"
                                    >
                                        {item.row_count.toLocaleString()}
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="w-2 h-2 rounded-full {item.health_status ===
                                                'healthy'
                                                    ? 'bg-emerald-500'
                                                    : item.health_status ===
                                                        'warning'
                                                      ? 'bg-amber-500'
                                                      : 'bg-rose-500'}"
                                            ></span>
                                            <span
                                                class="text-xs font-bold uppercase tracking-tighter {getHealthColor(
                                                    item.health_status,
                                                )}"
                                            >
                                                {item.health_status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Resumo Global -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each catalogSummary as type}
                    <div
                        class="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group"
                    >
                        <div class="relative z-10">
                            <p
                                class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1"
                            >
                                {type.tipo}
                            </p>
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-4xl font-black text-foreground tracking-tight"
                                    >{type.total}</span
                                >
                                <span
                                    class="text-sm font-medium text-muted-foreground uppercase"
                                    >Itens</span
                                >
                            </div>
                            <div
                                class="mt-4 p-3 bg-muted rounded-xl inline-flex items-center gap-2"
                            >
                                <span
                                    class="text-xs text-muted-foreground"
                                    >Markup Médio:</span
                                >
                                <span
                                    class="text-sm font-bold text-primary-600 dark:text-primary-400"
                                    >{(type.markup || 0).toFixed(2)}x</span
                                >
                            </div>
                        </div>
                        <!-- Background decoration -->
                        <div
                            class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"
                        >
                            <svg
                                class="w-16 h-16 text-foreground"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                {#if type.tipo === "Oftálmicas"}
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                        fill-rule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clip-rule="evenodd"
                                    />
                                {:else}
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clip-rule="evenodd"
                                    />
                                {/if}
                            </svg>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Coluna 2: Saúde da Precificação -->
        <div class="space-y-6">
            <section
                class="bg-foreground text-white rounded-2xl p-6 shadow-xl border border-border relative overflow-hidden"
            >
                <h2
                    class="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2"
                >
                    <svg
                        class="w-4 h-4 text-primary-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    Pulso da Precificação
                </h2>

                <div class="space-y-6">
                    {#each pricingHealth as zone}
                        <div class="space-y-2">
                            <div class="flex justify-between items-baseline">
                                <span
                                    class="text-sm font-medium text-muted-foreground"
                                    >{zone.zona_comercial}</span
                                >
                                <span class="text-xs font-bold text-muted-foreground"
                                    >{zone.qtd_lentes} lentes</span
                                >
                            </div>
                            <div
                                class="h-4 w-full bg-foreground rounded-full overflow-hidden flex"
                            >
                                <div
                                    class="h-full {getZonaColor(
                                        zone.zona_comercial,
                                    )} transition-all duration-deliberate"
                                    style="width: {(
                                        (zone.qtd_lentes /
                                            (catalogSummary[0]?.total || 1)) *
                                        100
                                    ).toFixed(0)}%"
                                ></div>
                            </div>
                            <div class="flex justify-end">
                                <span
                                    class="text-xs font-black text-card"
                                    >Markup: {(zone.markup_medio || 0).toFixed(
                                        2,
                                    )}x</span
                                >
                            </div>
                        </div>
                    {/each}
                </div>

                <div
                    class="mt-8 pt-6 border-t border-border flex flex-col gap-2"
                >
                    <p class="text-micro text-muted-foreground leading-tight">
                        * O sistema utiliza uma curva assintótica dinâmica.
                        O markup médio de cada zona comercial é monitorado
                        continuamente pelo Organismo Vivo de Precificação.
                    </p>
                </div>
            </section>

            <!-- Alerta de Inteligência -->
            <div
                class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl"
            >
                <h3
                    class="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm mb-2"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    Brain Insights
                </h3>
                <p
                    class="text-xs text-amber-700 dark:text-amber-500 leading-relaxed"
                >
                    Identificamos que as lentes de contato estão com markup
                    fixado em 3.2x via Trigger Nativo. Já as oftálmicas seguem o
                    Living Organism. Recomendamos rodar o tuning se a zona de
                    Performance ultrapassar 30% do catálogo.
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    :global(.dark) {
        color-scheme: dark;
    }
</style>
