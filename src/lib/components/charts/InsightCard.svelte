<script lang="ts">
  import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-svelte";

  export let title: string;
  export let insight: string;
  export let icon: string = "💡";
  export let type: "success" | "warning" | "info" | "danger" = "info";

  const typeConfig = {
    success: {
      bg: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      border: "border-green-300 dark:border-green-700/50",
      text: "text-green-900 dark:text-green-100",
      iconColor: "text-green-600 dark:text-green-400",
      iconComponent: CheckCircle2,
      accentBg: "bg-green-500",
    },
    warning: {
      bg: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      border: "border-amber-300 dark:border-amber-700/50",
      text: "text-amber-900 dark:text-amber-100",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconComponent: AlertTriangle,
      accentBg: "bg-amber-500",
    },
    info: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      border: "border-blue-300 dark:border-blue-700/50",
      text: "text-blue-900 dark:text-blue-100",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconComponent: Info,
      accentBg: "bg-blue-500",
    },
    danger: {
      bg: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      border: "border-red-300 dark:border-red-700/50",
      text: "text-red-900 dark:text-red-100",
      iconColor: "text-red-600 dark:text-red-400",
      iconComponent: XCircle,
      accentBg: "bg-red-500",
    },
  };

  $: config = typeConfig[type];
</script>

<div
  class="group relative rounded-xl border-2 {config.border} bg-gradient-to-br {config.bg} overflow-hidden hover:shadow-lg transition-all duration-base"
>
  <!-- Barra lateral colorida -->
  <div
    class="absolute left-0 top-0 bottom-0 w-1.5 {config.accentBg} group-hover:w-2 transition-all duration-base"
  ></div>

  <!-- Conteúdo -->
  <div class="p-5 pl-6">
    <div class="flex items-start gap-4">
      <!-- Ícone com fundo -->
      <div class="flex-shrink-0 flex items-center gap-2">
        <div
          class="w-12 h-12 rounded-xl bg-card shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-base"
        >
          <span class="text-2xl">{icon}</span>
        </div>
        <div
          class="hidden sm:flex w-10 h-10 rounded-lg bg-card/50 items-center justify-center"
        >
          <svelte:component
            this={config.iconComponent}
            class="w-5 h-5 {config.iconColor}"
          />
        </div>
      </div>

      <!-- Texto -->
      <div class="flex-1 min-w-0">
        <h4
          class="font-bold text-base mb-2 {config.text} flex items-center gap-2"
        >
          {title}
          <div class="sm:hidden">
            <svelte:component
              this={config.iconComponent}
              class="w-4 h-4 {config.iconColor}"
            />
          </div>
        </h4>
        <p class="text-sm {config.text} opacity-90 leading-relaxed">
          {insight}
        </p>
      </div>
    </div>
  </div>

  <!-- Efeito de brilho no hover -->
  <div
    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-slow pointer-events-none"
  ></div>
</div>
