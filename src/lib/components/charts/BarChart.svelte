<script lang="ts">
  export let data: Array<{ label: string; value: number; color: string }> = [];
  export let height: number = 300;
  export let showValues: boolean = true;

  $: maxValue = Math.max(...data.map((d) => d.value));
  $: sortedData = [...data].sort((a, b) => b.value - a.value);
</script>

<div class="space-y-4">
  {#each sortedData as item, index}
    {@const percentage = (item.value / maxValue) * 100}
    <div class="group">
      <!-- Header da barra -->
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <!-- Ranking badge -->
          <span
            class="text-xs font-bold text-muted-foreground w-6"
          >
            #{index + 1}
          </span>
          <span
            class="text-sm font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
          >
            {item.label}
          </span>
        </div>
        {#if showValues}
          <span
            class="text-sm font-bold text-foreground font-mono bg-muted px-3 py-1 rounded-full"
          >
            {item.value.toLocaleString("pt-BR")}
          </span>
        {/if}
      </div>

      <!-- Barra de progresso premium -->
      <div class="relative">
        <div
          class="w-full bg-gradient-to-r from-muted to-muted rounded-full h-10 overflow-hidden shadow-inner"
        >
          <div
            class="h-full rounded-full transition-all duration-slow ease-out flex items-center justify-end pr-4 relative overflow-hidden group-hover:shadow-lg"
            style="width: {percentage}%; background: linear-gradient(90deg, {item.color}ee, {item.color})"
          >
            <!-- Efeito de brilho animado -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            ></div>

            <!-- Percentual dentro da barra -->
            {#if percentage > 20}
              <span
                class="text-sm font-bold text-white drop-shadow-md relative z-10"
              >
                {percentage.toFixed(1)}%
              </span>
            {/if}
          </div>
        </div>

        <!-- Percentual fora da barra (para valores pequenos) -->
        {#if percentage <= 20}
          <span
            class="absolute left-full top-1/2 -translate-y-1/2 ml-3 text-xs font-bold text-muted-foreground"
          >
            {percentage.toFixed(1)}%
          </span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
</style>
