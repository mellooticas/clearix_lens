<script lang="ts">
  /**
   * ActionCard - Card com ícone, título, descrição e CTA
   * Usado para ações principais (Buscar, Ranking, Histórico)
   */

  import Button from "$lib/components/ui/Button.svelte";
  import { createEventDispatcher } from "svelte";

  export let icon = "📄";
  export let title = "";
  export let description = "";
  export let actionLabel = "Acessar";
  export let color: "blue" | "green" | "orange" | "gold" = "blue";
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (!disabled) {
      dispatch("click");
    }
  }
</script>

<div
  class="bg-card border border-border rounded-xl p-6 hover:shadow-card-hover transition-all duration-300"
  class:opacity-50={disabled}
>
  <!-- Header -->
  <div class="flex items-center gap-3 mb-4">
    <!-- Icon Container — tokens semantic (blue→primary, green→success); gold/orange decorativos -->
    <div
      class="p-3 rounded-lg"
      class:bg-primary/10={color === "blue"}
      class:bg-success/15={color === "green"}
      class:bg-orange-50={color === "orange"}
      class:dark:bg-orange-800={color === "orange"}
      class:bg-brand-gold-50={color === "gold"}
      class:dark:bg-brand-gold-800={color === "gold"}
    >
      <span class="text-2xl">{icon}</span>
    </div>
    <h3 class="text-lg font-semibold text-foreground">
      {title}
    </h3>
  </div>

  <!-- Description -->
  <p
    class="text-sm text-muted-foreground leading-relaxed mb-6"
  >
    {description}
  </p>

  <!-- CTA Button -->
  <Button
    variant="primary"
    size="md"
    fullWidth
    {disabled}
    onclick={handleClick}
  >
    {actionLabel}
  </Button>
</div>
