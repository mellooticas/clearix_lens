/**
 * Detalhes Conceito Canônico Premium — Server Load
 * Canonical Engine v3: public.v_canonical_premium (wrapper de catalog_lenses)
 *                    + rpc_canonical_detail (lentes reais)
 *                    + v_catalog_lenses (enrichment técnico).
 */
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { CanonicalDetail, CanonicalDetailEnriched, CanonicalPremiumV3, CanonicalPriceTiers } from '$lib/types/database-views';

export const load: PageServerLoad = async ({ params, locals }) => {
    const conceitoId = params.id;
    const { supabase } = locals;

    if (!conceitoId) {
        throw error(400, 'ID do conceito não encontrado');
    }

    // 1) Conceito canônico premium (v3) — single query, já traz pricing agregado
    const { data: conceito, error: erroConceito } = await supabase
        .from('v_canonical_premium')
        .select('*')
        .eq('id', conceitoId)
        .maybeSingle();

    if (erroConceito) {
        console.error('[premium/detail] v_canonical_premium error:', erroConceito);
        throw error(500, 'Erro ao carregar conceito premium');
    }
    if (!conceito) {
        throw error(404, 'Conceito premium não encontrado');
    }

    // 2) Lentes reais mapeadas via rpc_canonical_detail
    const { data: lentes, error: erroLentes } = await supabase
        .rpc('rpc_canonical_detail', {
            p_canonical_id: conceitoId,
            p_is_premium: true,
        });

    if (erroLentes) {
        console.error('[premium/detail] rpc_canonical_detail error (non-fatal):', erroLentes);
    }

    const lentesBase = (lentes ?? []) as CanonicalDetail[];

    // 2b) Faixas de preço por custo efetivo (tiers de 30% — doc 14)
    const { data: tiersData, error: erroTiers } = await supabase.rpc('rpc_canonical_price_tiers', {
        p_canonical_id: conceitoId,
        p_is_premium: true,
    });
    if (erroTiers) {
        console.error('[premium/detail] rpc_canonical_price_tiers error (non-fatal):', erroTiers);
    }

    // 3) Enriquecer com dados técnicos de v_catalog_lenses
    let lentesEnriquecidas: CanonicalDetailEnriched[] = lentesBase;
    const lensIds = lentesBase.map((l) => l.lens_id).filter(Boolean);

    if (lensIds.length > 0) {
        const { data: detalhes } = await supabase
            .from('v_catalog_lenses')
            .select('id, sku, anti_reflective, anti_scratch, uv_filter, blue_light, photochromic, polarized, refractive_index, material_name')
            .in('id', lensIds);

        const mapa = new Map<string, Record<string, unknown>>(
            (detalhes ?? []).map((d: Record<string, unknown>) => [d.id as string, d])
        );

        lentesEnriquecidas = lentesBase.map((l) => {
            const d = mapa.get(l.lens_id);
            if (!d) return l;
            return {
                ...l,
                lens_sku: l.lens_sku ?? (d.sku as string | null) ?? null,
                anti_reflective: d.anti_reflective as boolean | undefined,
                anti_scratch: d.anti_scratch as boolean | undefined,
                uv_filter: d.uv_filter as boolean | undefined,
                blue_light: d.blue_light as boolean | undefined,
                photochromic: d.photochromic as boolean | undefined,
                polarized: d.polarized as boolean | undefined,
                refractive_index: d.refractive_index as number | null | undefined,
                material_name: d.material_name as string | null | undefined,
            };
        });
    }

    return {
        conceito: conceito as CanonicalPremiumV3,
        lentes: lentesEnriquecidas,
        tiers: (tiersData ?? null) as CanonicalPriceTiers | null,
        isPremium: true as const,
    };
};
