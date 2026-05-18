<script lang="ts">
  export let data: Array<{ label: string; value: number; color: string }> = [];
  export let size: number = 200;

  $: total = data.reduce((sum, item) => sum + item.value, 0);

  function calculateArcs() {
    let currentAngle = -90; // Start from top
    const radius = size / 2;
    const innerRadius = radius * 0.65; // Donut hole (mais fino para visual premium)

    return data.map((item) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);

      const x3 = radius + innerRadius * Math.cos(endRad);
      const y3 = radius + innerRadius * Math.sin(endRad);
      const x4 = radius + innerRadius * Math.cos(startRad);
      const y4 = radius + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        "Z",
      ].join(" ");

      currentAngle += angle;

      return {
        path: pathData,
        color: item.color,
        label: item.label,
        value: item.value,
        percentage: percentage.toFixed(1),
      };
    });
  }

  $: arcs = calculateArcs();
</script>

<div class="flex flex-col lg:flex-row items-center gap-8">
  <!-- SVG Chart -->
  <div class="relative flex-shrink-0">
    <svg width={size} height={size} class="drop-shadow-lg">
      <!-- Fundo do donut com glassmorphism -->
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill="url(#gradient-bg)"
        opacity="0.1"
      />

      <!-- Gradiente de fundo -->
      <defs>
        <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Arcos do donut -->
      {#each arcs as arc, i}
        <path
          d={arc.path}
          fill={arc.color}
          class="transition-all duration-base hover:opacity-90 hover:scale-105 cursor-pointer"
          style="transform-origin: {size / 2}px {size /
            2}px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"
        />
      {/each}

      <!-- Centro com total -->
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size / 2) * 0.65}
        fill="white"
        class="dark:fill-background"
        opacity="0.95"
      />
      <text
        x={size / 2}
        y={size / 2 - 8}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-3xl font-bold fill-primary-600 dark:fill-primary-400"
      >
        {data.length}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 16}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-xs font-medium fill-muted-foreground uppercase tracking-wider"
      >
        Categorias
      </text>
    </svg>
  </div>

  <!-- Legenda Premium -->
  <div class="flex-1 w-full space-y-3">
    {#each arcs as arc, i}
      <div
        class="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-base cursor-pointer"
      >
        <!-- Indicador de cor com gradiente -->
        <div
          class="w-5 h-5 rounded-md flex-shrink-0 shadow-sm ring-2 ring-card dark:ring-background group-hover:scale-110 transition-transform"
          style="background: linear-gradient(135deg, {arc.color}, {arc.color}dd)"
        ></div>

        <!-- Label -->
        <span
          class="text-sm font-medium text-foreground flex-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        >
          {arc.label}
        </span>

        <!-- Percentual -->
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-bold text-primary-600 dark:text-primary-400"
          >
            {arc.percentage}%
          </span>
          <span
            class="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded"
          >
            {arc.value}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>
