<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PanelLeftClose, PanelLeftOpen } from "lucide-svelte";
  import { page } from "$app/stores";
  import { currentUser, logout } from "$lib/stores/auth";

  export let collapsed = false;

  const dispatch = createEventDispatcher();

  const ROUTE_META: Record<string, { kicker: string; title: string }> = {
    '/': { kicker: 'Clearix', title: 'Dashboard' },
    '/lentes': { kicker: 'Clearix', title: 'Lentes' },
    '/standard': { kicker: 'Clearix', title: 'Standard' },
    '/premium': { kicker: 'Clearix', title: 'Premium' },
    '/contato': { kicker: 'Clearix', title: 'Contato' },
    '/simulador/receita': { kicker: 'Clearix', title: 'Simulador de Receita' },
    '/ranking': { kicker: 'Clearix', title: 'Ranking de Lentes' },
    '/saude': { kicker: 'Clearix', title: 'Saude do Sistema' },
  };

  function getRouteMeta(path: string) {
    if (ROUTE_META[path]) return ROUTE_META[path];
    const sorted = Object.keys(ROUTE_META).sort((a, b) => b.length - a.length);
    for (const key of sorted) {
      if (path.startsWith(key + '/')) return ROUTE_META[key];
    }
    return { kicker: 'Clearix', title: 'Clearix Lens' };
  }

  $: meta = getRouteMeta($page.url.pathname);

  let showUserMenu = false;

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest("#lens-user-menu")) {
      showUserMenu = false;
    }
  }

  function handleLogout() {
    showUserMenu = false;
    logout();
  }
</script>

<svelte:window on:click={handleOutsideClick} />

<header class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 shadow-sm sm:px-6 lg:px-8">
  <!-- Left: toggle + route info -->
  <div class="flex min-w-0 flex-1 items-center gap-3">
    <button
      class="p-2 text-muted-foreground hover:text-foreground transition-colors"
      on:click={() => dispatch("menuClick")}
      title={collapsed ? "Expandir menu" : "Recolher menu"}
      aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
    >
      {#if collapsed}
        <PanelLeftOpen class="w-5 h-5" />
      {:else}
        <PanelLeftClose class="w-5 h-5" />
      {/if}
    </button>

    <div class="min-w-0">
      <p class="text-micro font-medium uppercase tracking-wider text-muted-foreground">{meta.kicker}</p>
      <h1 class="truncate text-sm font-semibold text-foreground sm:text-base">{meta.title}</h1>
    </div>
  </div>

  <!-- Right: UserMenu -->
  {#if $currentUser}
    <div id="lens-user-menu" class="relative">
      <button
        class="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent transition-colors"
        on:click={() => (showUserMenu = !showUserMenu)}
        aria-label="Menu do usuario"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg"
          style="background: linear-gradient(135deg, var(--sidebar-primary), #7c3aed);"
        >
          {$currentUser.initials}
        </div>
        <div class="hidden min-w-0 text-left sm:block">
          <p class="truncate text-sm font-semibold text-foreground">{$currentUser.firstName}</p>
          <p class="truncate text-xs text-muted-foreground">{$currentUser.roleLabel}</p>
        </div>
        <svg class="h-4 w-4 text-muted-foreground transition-transform duration-base {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if showUserMenu}
        <div class="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50">
          <div class="border-b border-border px-4 py-3">
            <p class="text-sm font-semibold text-foreground">{$currentUser.name || $currentUser.email}</p>
            <p class="mt-0.5 text-xs text-primary">{$currentUser.roleLabel}</p>
            {#if $currentUser.tenantName}
              <p class="mt-0.5 text-micro font-bold uppercase tracking-wider text-muted-foreground">{$currentUser.tenantName}</p>
            {/if}
          </div>
          <div class="border-t border-border">
            <button
              on:click={handleLogout}
              class="flex w-full items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="text-sm font-semibold">Sair</span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</header>
