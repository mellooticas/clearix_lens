<script lang="ts">
    // Grade de disponibilidade simulada (vinda do banco)
    export let ranges = [
        { esf_min: -6, esf_max: 4, cil_max: -2 }, // Faixa principal
        { esf_min: -4, esf_max: 2, cil_max: -4 }, // Faixa astigmatismo médio
    ];

    export let userPrescription = {
        esferico: -2.5,
        cilindrico: -1.0,
    };

    // Configuração do Grid
    const MIN_ESF = -10;
    const MAX_ESF = 8;
    const MIN_CIL = -6; // Cilíndrico é negativo
    const MAX_CIL = 0;

    // Gerar passos para o grid
    let esfericos = [];
    for (let i = MIN_ESF; i <= MAX_ESF; i += 2) esfericos.push(i);

    let cilindricos = [];
    for (let i = MAX_CIL; i >= MIN_CIL; i -= 1) cilindricos.push(i);

    function checkAvailability(esf: number, cil: number) {
        // Verifica se o ponto está dentro de algum range
        return ranges.some(
            (r) => esf >= r.esf_min && esf <= r.esf_max && cil >= r.cil_max, // Cilíndrico é negativo, então -1 >= -2
        );
    }

    function isUserPoint(esf: number, cil: number) {
        // Aproximação visual para marcar o ponto do usuário
        return (
            Math.abs(esf - userPrescription.esferico) < 1.5 &&
            Math.abs(cil - userPrescription.cilindrico) < 0.8
        );
    }
</script>

<div class="bg-card p-4 rounded-xl border border-border inline-block">
    <h4 class="text-sm font-bold font-heading text-foreground mb-2">
        Grade de Disponibilidade
    </h4>

    <div class="flex">
        <!-- Eixo Y (Cilíndrico) -->
        <div
            class="flex flex-col justify-between pr-2 text-xs text-muted-foreground font-mono py-6"
        >
            {#each cilindricos as cil}
                <span>{cil.toFixed(2)}</span>
            {/each}
            <span class="text-micro -rotate-90 mt-4">CYL</span>
        </div>

        <!-- O Grid -->
        <div class="relative">
            <div
                class="grid gap-1"
                style="grid-template-columns: repeat({esfericos.length}, 1fr); grid-template-rows: repeat({cilindricos.length}, 1fr);"
            >
                {#each cilindricos as cil}
                    {#each esfericos as esf}
                        {@const available = checkAvailability(esf, cil)}
                        {@const selected = isUserPoint(esf, cil)}

                        <div
                            class="w-6 h-6 rounded-sm text-[8px] flex items-center justify-center transition-all
              {selected
                                ? 'bg-blue-600 ring-2 ring-blue-300 z-10 scale-125'
                                : available
                                  ? 'bg-green-100 hover:bg-green-200'
                                  : 'bg-muted opacity-50'}"
                            title="Esf {esf} / Cil {cil}"
                        >
                            {#if selected}
                                <span class="w-2 h-2 bg-white rounded-full"
                                ></span>
                            {/if}
                        </div>
                    {/each}
                {/each}
            </div>

            <!-- Label Eixo X (Esférico) -->
            <div
                class="flex justify-between pt-2 text-xs text-muted-foreground font-mono px-1"
            >
                {#each esfericos.filter((_, i) => i % 2 === 0) as esf}
                    <span>{esf > 0 ? "+" : ""}{esf}</span>
                {/each}
            </div>
            <div class="text-center text-micro text-muted-foreground mt-1">
                SPH (Esférico)
            </div>
        </div>
    </div>

    <div class="flex items-center justify-center gap-4 mt-4 text-xs">
        <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-green-100 rounded-sm"></div>
            <span class="text-muted-foreground">Disponível</span>
        </div>
        <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-muted rounded-sm"></div>
            <span class="text-muted-foreground">Indisponível</span>
        </div>
        <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-blue-600 rounded-sm"></div>
            <span class="font-medium text-blue-700">Sua Receita</span>
        </div>
    </div>
</div>
