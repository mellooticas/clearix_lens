<script lang="ts">
  export let size = 24;
  export let variant: "icon" | "powered-by" = "icon";

  let className = "";
  export { className as class };
</script>

{#if variant === "icon"}
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size} {...$$restProps}>
    <rect x="10" y="10" width="35" height="80" rx="4" fill="#2563EB" />
    <path d="M45 10 H60 A40 40 0 0 1 60 90 H45 Z" fill="#06B6D4" />
  </svg>
{:else if variant === "powered-by"}
  <span class="inline-flex items-center gap-1 text-micro text-muted-foreground {className}">
    powered by
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={12} height={12}>
      <rect x="10" y="10" width="35" height="80" rx="4" fill="#2563EB" />
      <path d="M45 10 H60 A40 40 0 0 1 60 90 H45 Z" fill="#06B6D4" />
    </svg>
    <span class="font-semibold tracking-wide">DIGIAI</span>
  </span>
{/if}
