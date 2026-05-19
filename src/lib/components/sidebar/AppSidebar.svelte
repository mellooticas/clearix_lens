<script lang="ts">
  import { page } from '$app/stores'
  import { sidebarStore } from '$lib/stores/sidebar.svelte'
  import { navigation } from '$lib/navigation'
  import { theme } from '$lib/stores/theme'
  import { currentUser } from '$lib/stores/auth'
  import ClearixLogo from '$lib/components/brand/ClearixLogo.svelte'

  const APP_TITLE = 'Lens'

  // SVG icon path map (matching the original Sidebar)
  const iconPaths: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    sparkles: 'M5 3l3.057 2.197L12 3l1.943 5.197 5.057.803-4 3.197 1.943 5.197L12 15l-4.943 2.197L9 12l-4-3.197 5.057-.803L5 3z',
    eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    zap: 'M13 10V3L4 14h7v7l9-11h-7z',
    trophy: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  }

  // Sun / Moon icon paths for theme toggle
  const sunPath = 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  const moonPath = 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'

  let currentPath = $derived($page.url.pathname)

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/'
    return currentPath === href || currentPath.startsWith(href + '/')
  }
</script>

<!-- Mobile overlay -->
{#if sidebarStore.mobileOpen}
  <div class="fixed inset-0 z-50 lg:hidden">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick={() => sidebarStore.closeMobile()}></div>
    <div class="fixed inset-y-0 left-0 w-72 transition-transform duration-base ease-in-out translate-x-0">
      <div
        class="flex h-full grow flex-col overflow-y-auto border-r"
        style="background-color: var(--sidebar); border-color: var(--sidebar-border); color: var(--sidebar-foreground);"
      >
        <!-- Brand -->
        <div class="flex h-16 shrink-0 items-center justify-between border-b px-4" style="border-color: var(--sidebar-border);">
          <a href="/" onclick={() => sidebarStore.closeMobile()} class="flex items-center gap-3">
            <ClearixLogo size={36} variant="icon" />
            <div>
              <p class="text-micro font-semibold uppercase tracking-[0.15em] opacity-50">Clearix</p>
              <p class="text-lg font-black tracking-tight">{APP_TITLE}</p>
            </div>
          </a>
          <button onclick={() => sidebarStore.closeMobile()} class="rounded-lg p-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Fechar menu">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4">
          {#each navigation as section}
            <div class="mt-5 first:mt-0">
              <p class="mb-2 px-3 text-micro font-semibold uppercase tracking-wider opacity-40">{section.label}</p>
              <div class="space-y-1">
                {#each section.items as item}
                  {@const active = isActive(item.href)}
                  <a
                    href={item.href}
                    onclick={() => sidebarStore.closeMobile()}
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    style={active ? 'background-color: color-mix(in srgb, var(--sidebar-primary) 12%, transparent); color: var(--sidebar-primary);' : ''}
                  >
                    <span style={active ? 'color: var(--sidebar-primary);' : 'opacity: 0.6;'}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5 shrink-0">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={iconPaths[item.icon] || ''} />
                      </svg>
                    </span>
                    <span class="min-w-0 flex-1 truncate">{item.label}</span>
                  </a>
                {/each}
              </div>
            </div>
          {/each}
        </nav>

        <!-- Footer -->
        <div class="border-t p-3 space-y-2" style="border-color: var(--sidebar-border);">
          <button onclick={() => theme.toggle()} class="flex w-full items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
            {#if $theme === 'dark'}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sunPath} /></svg>
              <span>Modo Claro</span>
            {:else}
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={moonPath} /></svg>
              <span>Modo Escuro</span>
            {/if}
          </button>
          {#if $currentUser}
            <div class="flex items-center gap-3 px-3 py-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-micro font-bold" style="background-color: var(--sidebar-primary); color: var(--sidebar-primary-foreground);">{$currentUser.initials}</div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{$currentUser.firstName}</p>
                <p class="truncate text-xs opacity-60">{$currentUser.roleLabel}</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Desktop sidebar -->
<aside
  class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-base {sidebarStore.collapsed ? 'lg:w-[72px]' : 'lg:w-64'}"
>
  <div
    class="flex h-full grow flex-col overflow-y-auto border-r"
    style="background-color: var(--sidebar); border-color: var(--sidebar-border); color: var(--sidebar-foreground);"
  >
    <!-- Brand -->
    <div class="flex h-16 shrink-0 items-center border-b {sidebarStore.collapsed ? 'justify-center px-3' : 'gap-3 px-4'}" style="border-color: var(--sidebar-border);">
      <a href="/" class="flex items-center {sidebarStore.collapsed ? '' : 'gap-3'}">
        <ClearixLogo size={36} variant="icon" />
        {#if !sidebarStore.collapsed}
          <div>
            <p class="text-micro font-semibold uppercase tracking-[0.15em] opacity-50">Clearix</p>
            <p class="text-lg font-black tracking-tight">{APP_TITLE}</p>
          </div>
        {/if}
      </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      {#each navigation as section}
        <div class="mt-5 first:mt-0">
          {#if !sidebarStore.collapsed}
            <p class="mb-2 px-3 text-micro font-semibold uppercase tracking-wider opacity-40">{section.label}</p>
          {:else}
            <div class="mx-auto my-3 h-px w-8" style="background-color: var(--sidebar-border);"></div>
          {/if}
          <div class="space-y-1">
            {#each section.items as item}
              {@const active = isActive(item.href)}
              <a
                href={item.href}
                title={sidebarStore.collapsed ? item.label : ''}
                class="flex items-center rounded-lg transition-colors {sidebarStore.collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm font-medium'}"
                style={active ? 'background-color: color-mix(in srgb, var(--sidebar-primary) 12%, transparent); color: var(--sidebar-primary);' : ''}
              >
                <span style={active ? 'color: var(--sidebar-primary);' : 'opacity: 0.6;'}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5 shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={iconPaths[item.icon] || ''} />
                  </svg>
                </span>
                {#if !sidebarStore.collapsed}
                  <span class="min-w-0 flex-1 truncate">{item.label}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </nav>

    <!-- Footer -->
    <div class="border-t p-3 space-y-2 {sidebarStore.collapsed ? 'items-center' : ''}" style="border-color: var(--sidebar-border);">
      <button
        onclick={() => theme.toggle()}
        class="flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity {sidebarStore.collapsed ? 'justify-center px-0' : 'px-3'}"
        aria-label={$theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
      >
        {#if $theme === 'dark'}
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sunPath} /></svg>
        {:else}
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={moonPath} /></svg>
        {/if}
        {#if !sidebarStore.collapsed}<span>{$theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>{/if}
      </button>

      {#if $currentUser}
        <div class="flex items-center gap-3 rounded-lg px-3 py-2 {sidebarStore.collapsed ? 'justify-center px-0' : ''}" title={sidebarStore.collapsed ? $currentUser.firstName : ''}>
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-micro font-bold" style="background-color: var(--sidebar-primary); color: var(--sidebar-primary-foreground);">{$currentUser.initials}</div>
          {#if !sidebarStore.collapsed}
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{$currentUser.firstName}</p>
              <p class="truncate text-xs opacity-60">{$currentUser.roleLabel}</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</aside>
