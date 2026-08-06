<script lang="ts">
    /**
     * FilterSection — módulo de filtro recolhível (padrão visual Finance)
     *
     * Cada grupo de filtro vira um módulo escondido que expande sob demanda:
     * cabeçalho com título + badge do valor ativo + chevron. Auto-expande
     * quando o filtro está ativo; preferência manual persiste em localStorage.
     */
    import { onMount } from 'svelte';
    import { ChevronDown } from 'lucide-svelte';

    export let id: string;
    export let title: string;
    /** Resumo do valor ativo (badge no cabeçalho); null/'' = sem filtro ativo */
    export let active: string | null = null;
    export let storageKey = 'lens-filtros-expandidos';

    let expanded = false;
    let loaded = false;

    onMount(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
            expanded = active ? true : !!saved[id];
        } catch {
            expanded = !!active;
        }
        loaded = true;
    });

    // Filtro ficou ativo depois (URL/sidebar) → abre; nunca fecha sozinho
    $: if (loaded && active && !expanded) expanded = true;

    function toggle() {
        expanded = !expanded;
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
            saved[id] = expanded;
            localStorage.setItem(storageKey, JSON.stringify(saved));
        } catch { /* localStorage indisponível — segue sem persistir */ }
    }
</script>

<div class="border border-border rounded-xl overflow-hidden bg-card">
    <button type="button" on:click={toggle}
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-accent transition-colors">
        <span class="text-micro font-black uppercase tracking-wider {active ? 'text-foreground' : 'text-muted-foreground'}">{title}</span>
        <span class="flex items-center gap-2 min-w-0">
            {#if active}
                <span class="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-micro font-bold rounded truncate max-w-[110px]">{active}</span>
            {/if}
            <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 {expanded ? 'rotate-180' : ''}" />
        </span>
    </button>
    {#if expanded}
        <div class="px-3 pb-3 pt-0.5">
            <slot />
        </div>
    {/if}
</div>
