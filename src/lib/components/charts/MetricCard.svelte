<script lang="ts">
  import { TrendingUp, TrendingDown, Minus } from "lucide-svelte";

  export let title: string;
  export let value: string | number;
  export let trend: "up" | "down" | "neutral" = "neutral";
  export let trendValue: string = "";
  export let icon: string = "📊";
  export let color: "blue" | "green" | "amber" | "purple" | "red" = "blue";

  const colorClasses = {
    blue: {
      gradient: "from-primary-500 to-primary-600",
      bg: "bg-primary-50 dark:bg-primary-900/20",
      border: "border-primary-200 dark:border-primary-700/50",
      text: "text-primary-600 dark:text-primary-400",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-700/50",
      text: "text-green-600 dark:text-green-400",
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-700/50",
      text: "text-amber-600 dark:text-amber-400",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-700/50",
      text: "text-purple-600 dark:text-purple-400",
    },
    red: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-700/50",
      text: "text-red-600 dark:text-red-400",
    },
  };

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    down: {
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    neutral: {
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  };

  $: currentColor = colorClasses[color];
  $: currentTrend = trendConfig[trend];
</script>

<div
  class="bg-card rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-base border {currentColor.border}"
>
  <!-- Header com gradiente -->
  <div
    class="bg-gradient-to-r {currentColor.gradient} px-5 py-4 relative overflow-hidden"
  >
    <!-- Efeito de brilho no hover -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-slow"
    ></div>

    <div class="flex items-center gap-3 text-white relative z-10">
      <span class="text-3xl drop-shadow-md">{icon}</span>
      <span class="text-sm font-semibold opacity-95 uppercase tracking-wider"
        >{title}</span
      >
    </div>
  </div>

  <!-- Corpo do card -->
  <div class="p-6 {currentColor.bg}">
    <!-- Valor principal -->
    <div
      class="text-4xl font-bold {currentColor.text} mb-3 font-mono tracking-tight"
    >
      {value}
    </div>

    <!-- Trend indicator -->
    {#if trendValue}
      <div
        class="flex items-center gap-2 {currentTrend.bg} px-3 py-2 rounded-lg w-fit"
      >
        <svelte:component
          this={currentTrend.icon}
          class="w-4 h-4 {currentTrend.color}"
        />
        <span class="text-sm {currentTrend.color} font-semibold">
          {trendValue}
        </span>
      </div>
    {/if}
  </div>

  <!-- Borda inferior decorativa -->
  <div class="h-1 bg-gradient-to-r {currentColor.gradient} opacity-50"></div>
</div>
