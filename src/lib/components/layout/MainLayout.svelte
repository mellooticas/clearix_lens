<script lang="ts">
  import AppSidebar from "$lib/components/sidebar/AppSidebar.svelte";
  import Header from "./Header.svelte";
  import { sidebarStore } from "$lib/stores/sidebar.svelte";

  export let currentPage = '';

  function handleToggleSidebar() {
    sidebarStore.toggleCollapse();
  }
</script>

<div class="min-h-screen bg-background transition-colors duration-base">
  <AppSidebar />

  <div
    class="transition-all duration-base flex flex-col min-h-screen"
    style="padding-left: {sidebarStore.collapsed ? '72px' : '16rem'}"
  >
    <Header on:menuClick={handleToggleSidebar} collapsed={sidebarStore.collapsed} />

    <main class="flex-1 p-4 md:p-8">
      <div class="mx-auto max-w-7xl">
        <slot />
      </div>
    </main>
  </div>
</div>
