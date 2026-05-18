<script lang="ts">
  /**
   * FeatureCard - Card genérico de feature com ícone e destaque
   * Versão mais completa do BenefitCard para landing pages
   */
  
  import Badge from '$lib/components/ui/Badge.svelte';
  
  export let icon = '✨';
  export let badge = '';
  export let title = '';
  export let description = '';
  export let highlighted = false;
</script>

<div 
  class="bg-card rounded-xl border p-6 transition-all duration-base"
  class:border-brand-gold-500={highlighted}
  class:shadow-elevated={highlighted}
  class:border-border={!highlighted}
  class:hover:shadow-card-hover={!highlighted}
>
  <!-- Icon + Badge -->
  <div class="flex items-start justify-between mb-4">
    <div class="text-4xl">
      {icon}
    </div>
    {#if badge}
      <Badge variant="info" size="sm">
        {badge}
      </Badge>
    {/if}
  </div>
  
  <!-- Title -->
  <h3 class="text-lg font-semibold text-foreground mb-2">
    {title}
  </h3>
  
  <!-- Description -->
  <p class="text-sm text-muted-foreground leading-relaxed">
    {description}
  </p>
  
  <!-- Slot para conteúdo adicional -->
  <slot />
</div>