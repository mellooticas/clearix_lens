<script lang="ts">
  import AppSidebar from "$lib/components/sidebar/AppSidebar.svelte";
  import Header from "./Header.svelte";
  import { sidebarStore } from "$lib/stores/sidebar.svelte";
  import type { Snippet } from "svelte";

  let { currentPage = '', children }: { currentPage?: string; children?: Snippet } = $props();

  // Reactivo via $derived — segue mudancas do rune sidebarStore.collapsed
  let paddingLeft = $derived(sidebarStore.collapsed ? '72px' : '16rem');

  function handleToggleSidebar() {
    sidebarStore.toggleCollapse();
  }
</script>

<div class="min-h-screen bg-background transition-colors duration-base">
  <AppSidebar />

  <div
    class="transition-all duration-base flex flex-col min-h-screen"
    style="padding-left: {paddingLeft}"
  >
    <Header on:menuClick={handleToggleSidebar} collapsed={sidebarStore.collapsed} />

    <main class="flex-1 p-4 md:p-8">
      <div class="mx-auto max-w-7xl">
        {@render children?.()}
      </div>
    </main>
  </div>
</div>
