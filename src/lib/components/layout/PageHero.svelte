 <script lang="ts">
  /**
   * PageHero - Hero section para topo de páginas
   * Badge + Título + Subtítulo + Destaque opcional
   */
  
  import Badge from '$lib/components/ui/Badge.svelte';
  
  export let badge = '';
  export let title = '';
  export let subtitle = '';
  export let highlight = '';
  export let alignment: 'center' | 'left' = 'center';
  export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-full'
  };
</script>

<section 
  class="space-y-4 mx-auto {maxWidthClasses[maxWidth]}"
  class:text-center={alignment === 'center'}
  class:text-left={alignment === 'left'}
>
  {#if badge}
    <div class:flex={alignment === 'left'} class:justify-center={alignment === 'center'}>
      <Badge variant="info" size="md">
        {badge}
      </Badge>
    </div>
  {/if}
  
  {#if title}
    <h1 class="text-4xl md:text-5xl font-bold text-foreground">
      {title}
    </h1>
  {/if}
  
  {#if subtitle}
    <p class="text-xl text-muted-foreground">
      {subtitle}
    </p>
  {/if}
  
  {#if highlight}
    <p class="text-lg text-warning font-medium">
      {highlight}
    </p>
  {/if}
  
  <!-- Slot para conteúdo adicional (CTAs, etc) -->
  <slot />
</section>