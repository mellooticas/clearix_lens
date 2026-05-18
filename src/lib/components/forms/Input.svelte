<script lang="ts">
  /**
   * Componente Input Clearix Lens
   * Input field padronizado
   */
  
  export let value = '';
  export let placeholder = '';
  export let type: 'text' | 'email' | 'password' | 'number' = 'text';
  export let disabled = false;
  export let error = '';
  export let icon: 'search' | 'none' = 'none';
  
  const baseClasses = 'w-full rounded-lg border bg-card px-4 py-2 text-sm transition-all duration-base focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed';
  
  $: inputClasses = `${baseClasses} ${error ? 'border-error' : 'border-border'} ${icon === 'search' ? 'pl-10' : ''}`;
</script>

<div class="relative">
  {#if icon === 'search'}
    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  {/if}
  
  <input
    {type}
    {placeholder}
    {disabled}
    bind:value
    class={inputClasses}
    on:input
    on:change
    on:focus
    on:blur
    on:keydown
    {...$$restProps}
  />
  
  {#if error}
    <p class="mt-1 text-xs text-error">{error}</p>
  {/if}
</div>