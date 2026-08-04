/**
 * Standard Collection — Server Load v4
 * Filtros técnicos: tipo + material + tratamentos + preço (sem marca!)
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const lens_type   = url.searchParams.get('tipo')     || null;
    const material_id = url.searchParams.get('material') || null;
    const treatments  = url.searchParams.get('trat')?.split(',').filter(Boolean) ?? [];
    const exclude_treatments = url.searchParams.get('sem')?.split(',').filter(Boolean) ?? [];
    const precoMinPar = url.searchParams.get('precoMin');
    const precoMaxPar = url.searchParams.get('precoMax');
    const price_min   = precoMinPar ? parseFloat(precoMinPar) : null;
    const price_max   = precoMaxPar ? parseFloat(precoMaxPar) : null;
    const pagina      = Math.max(1, parseInt(url.searchParams.get('pagina') || '1'));
    const busca       = url.searchParams.get('busca')    || null;
    const excluir     = url.searchParams.get('excluir')  || null;
    return { lens_type, material_id, treatments, exclude_treatments, price_min, price_max, pagina, busca, excluir };
};
