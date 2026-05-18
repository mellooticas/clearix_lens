<script lang="ts">
  /**
   * StepCard - Card de passo numerado
   * Usado em seções "Como Funciona" / "Processo"
   */
  
  export let number = 1;
  export let title = '';
  export let description = '';
  export let color: 'blue' | 'green' | 'orange' | 'gold' = 'blue';
</script>

<div class="text-center space-y-4">
  <!-- Number Badge — tokens semantic; gold/orange brand palette decorativa -->
  <div
    class="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
    class:bg-primary/10={color === 'blue'}
    class:bg-success/15={color === 'green'}
    class:bg-orange-50={color === 'orange'}
    class:dark:bg-orange-800={color === 'orange'}
    class:bg-brand-gold-50={color === 'gold'}
    class:dark:bg-brand-gold-800={color === 'gold'}
  >
    <span
      class="text-xl font-bold tabular-nums"
      class:text-primary={color === 'blue'}
      class:text-success={color === 'green'}
      class:text-orange-600={color === 'orange'}
      class:dark:text-orange-300={color === 'orange'}
      class:text-brand-gold-600={color === 'gold'}
      class:dark:text-brand-gold-300={color === 'gold'}
    >
      {number}
    </span>
  </div>
  
  <!-- Title -->
  <h4 class="text-lg font-semibold text-foreground">
    {title}
  </h4>
  
  <!-- Description -->
  <p class="text-sm text-muted-foreground leading-relaxed">
    {description}
  </p>
</div>