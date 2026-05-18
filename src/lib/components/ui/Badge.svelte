<script lang="ts">
  /**
   * Badge — Clearix Lens Component Contract
   * Core variants: default, secondary, destructive, outline
   * Domain variants: melhor-opcao, promocao, entrega-expressa, success, warning, info, gold, orange, neutral
   */
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'outline'
      | 'success'
      | 'warning'
      | 'info'
      | 'gold'
      | 'orange'
      | 'neutral'
      | 'melhor-opcao'
      | 'promocao'
      | 'entrega-expressa'
      | 'primary';
    size?: 'sm' | 'md';
    children?: Snippet;
  }

  let {
    variant = 'default',
    size = 'md',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const baseClasses = 'inline-flex items-center gap-1 rounded-full font-semibold';

  // Variants alinhadas aos tokens canonicos DS 2026-05-18.
  // Dark mode adapta via CSS vars; gold/orange/melhor-opcao/promocao sao
  // brand palette intencional (preserva identidade comercial Lens).
  const variantClasses: Record<string, string> = {
    // Core contract variants
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-border text-foreground bg-transparent',

    // Semantic (tokens canonicos)
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-info/15 text-info',
    neutral: 'bg-muted text-muted-foreground',

    // Brand palette (decorativos, NAO semantic — preservados)
    gold: 'bg-brand-gold-100 text-brand-gold-700 dark:bg-brand-gold-900/30 dark:text-brand-gold-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'melhor-opcao': 'bg-brand-gold-500 text-white font-semibold shadow-md',
    promocao: 'bg-orange-500 text-white',
    'entrega-expressa': 'bg-success text-success-foreground'
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  };

  let classes = $derived(
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
  );
</script>

<span class={classes} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</span>
