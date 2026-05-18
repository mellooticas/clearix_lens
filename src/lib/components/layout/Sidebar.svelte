<script lang="ts">
  import { page } from "$app/stores";
  import { currentUser } from "$lib/stores/auth";
  import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";

  export let collapsed = false;

  type NavSection = {
    label?: string;
    items: { id: string; label: string; href: string; icon: string }[];
  };

  const sections: NavSection[] = [
    {
      items: [{ id: "home", label: "Dashboard", href: "/", icon: "home" }],
    },
    {
      label: "CATALOGOS",
      items: [
        { id: "lentes", label: "Lentes", href: "/lentes", icon: "grid" },
        { id: "standard", label: "Standard", href: "/standard", icon: "box" },
        { id: "premium", label: "Premium", href: "/premium", icon: "sparkles" },
        { id: "contato", label: "Contato", href: "/contato", icon: "eye" },
      ],
    },
    {
      label: "OPERACAO",
      items: [
        { id: "simulador", label: "Simulador de Receita", href: "/simulador/receita", icon: "zap" },
      ],
    },
    {
      label: "ESTRATEGIA & BI",
      items: [
        { id: "ranking", label: "Ranking de Lentes", href: "/ranking", icon: "trophy" },
      ],
    },
    {
      label: "GESTAO",
      items: [
        { id: "saude", label: "Saude do Sistema", href: "/saude", icon: "shield" },
      ],
    },
  ];

  function isActive(path: string) {
    if (!path) return false;
    if (path === "/") return $page.url.pathname === "/";
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + "/");
  }

  // Simple SVG icon map
  const iconPaths: Record<string, string> = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    grid: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    sparkles: "M5 3l3.057 2.197L12 3l1.943 5.197 5.057.803-4 3.197 1.943 5.197L12 15l-4.943 2.197L9 12l-4-3.197 5.057-.803L5 3z",
    eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    zap: "M13 10V3L4 14h7v7l9-11h-7z",
    trophy: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  };
</script>

<aside
  class="fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-base ease-in-out border-r border-border
         {collapsed ? 'w-[72px]' : 'w-64'}"
  style="background-color: var(--sidebar); color: var(--sidebar-foreground);"
>
  <!-- Brand -->
  <div
    class="flex h-16 shrink-0 items-center border-b {collapsed ? 'justify-center px-3' : 'gap-3 px-4'}"
    style="border-color: var(--sidebar-border);"
  >
    <a href="/" class="flex items-center {collapsed ? '' : 'gap-3'}">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <circle cx="85" cy="50" r="7" fill="#6366F1" />
        <path d="M 74.75 25.25 A 35 35 0 1 0 74.75 74.75" stroke="#1A3A5C" stroke-width="14" stroke-linecap="round" />
      </svg>
      {#if !collapsed}
        <div>
          <p class="text-micro font-semibold uppercase tracking-[0.15em] opacity-50">Clearix</p>
          <p class="text-lg font-black tracking-tight">Lens</p>
        </div>
      {/if}
    </a>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto px-3 py-4">
    {#each sections as section}
      <div class="mt-5 first:mt-0">
        {#if section.label && !collapsed}
          <p class="mb-2 px-3 text-micro font-semibold uppercase tracking-wider opacity-40">{section.label}</p>
        {:else if section.label && collapsed}
          <div class="mx-auto my-3 h-px w-8" style="background-color: var(--sidebar-border);"></div>
        {/if}
        <div class="space-y-1">
          {#each section.items as item}
            {@const active = isActive(item.href)}
            <a
              href={item.href}
              title={collapsed ? item.label : ''}
              class="flex items-center rounded-lg transition-colors
                     {collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm font-medium'}"
              style={active ? 'background-color: color-mix(in srgb, var(--sidebar-primary) 12%, transparent); color: var(--sidebar-primary);' : ''}
            >
              <span style={active ? 'color: var(--sidebar-primary);' : 'opacity: 0.6;'}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={iconPaths[item.icon] || ''} />
                </svg>
              </span>
              {#if !collapsed}
                <span class="min-w-0 flex-1 truncate">{item.label}</span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </nav>

  <!-- Footer -->
  <div class="border-t p-3 space-y-2" style="border-color: var(--sidebar-border);">
    <!-- Theme Toggle -->
    <div class="flex items-center {collapsed ? 'justify-center' : 'px-1'}">
      <ThemeToggle size="sm" />
    </div>

    <!-- User Profile -->
    {#if $currentUser}
      <div class="flex items-center gap-3 rounded-lg px-3 py-2 {collapsed ? 'justify-center px-0' : ''}" title={collapsed ? $currentUser.firstName : ''}>
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-micro font-bold"
          style="background-color: var(--sidebar-primary); color: var(--sidebar-primary-foreground);"
        >
          {$currentUser.initials}
        </div>
        {#if !collapsed}
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{$currentUser.firstName}</p>
            <p class="truncate text-xs opacity-60">{$currentUser.roleLabel}</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</aside>
