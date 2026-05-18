<script lang="ts">
  import { cn } from "$lib/utils";
  import { theme } from "$lib/stores/theme";

  export let variant: "full" | "icon" | "text" = "full";
  export let size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" = "md";

  let className = "";
  export { className as class };

  // Determinar se está em dark mode
  $: isDark = $theme === 'dark';

  const sizeClasses = {
    sm: "max-h-8 w-auto",
    md: "max-h-12 w-auto",
    lg: "max-h-16 w-auto",
    xl: "max-h-20 w-auto",
    "2xl": "max-h-32 w-auto",
    "3xl": "max-h-40 w-auto",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
    "3xl": "text-6xl",
  };

  // Classe de cor baseada no tema atual do store
  $: themeColorClass = isDark ? "text-white" : "text-primary-500";
</script>

<div class={cn("flex items-center gap-2", className)}>
  {#if variant === "icon"}
    <!-- Apenas ícone - usa clearix-icon.svg -->
    <img
      src="/clearix-icon.svg"
      alt="Clearix Lens"
      class={cn(
        "object-contain transition-all duration-base",
        sizeClasses[size]
      )}
      style={isDark ? "filter: invert(1) hue-rotate(180deg) brightness(1.2);" : ""}
    />
  {:else if variant === "full"}
    <!-- Logo completo - usa clearix-icon.svg -->
    <img
      src="/clearix-icon.svg"
      alt="Clearix Lens"
      class={cn(
        "object-contain transition-all duration-base",
        sizeClasses[size]
      )}
      style={isDark ? "filter: invert(1) hue-rotate(180deg) brightness(1.2);" : ""}
    />
  {:else if variant === "text"}
    <!-- Apenas texto -->
    <div class="flex flex-col">
      <h1
        class={cn(
          "font-headline font-bold leading-tight tracking-tight flex items-center",
          textSizeClasses[size],
          themeColorClass,
        )}
      >
        Clearix<span class="text-violet-500 ml-0.5">Lens</span>
      </h1>

      {#if size === "lg" || size === "xl"}
        <p
          class={cn(
            "text-xs font-medium tracking-wider opacity-90 mt-1 text-amber-600",
            size === "xl" ? "text-sm" : "text-xs",
          )}
        >
          INTELLIGENCE SYSTEM
        </p>
      {/if}
    </div>
  {/if}
</div>
