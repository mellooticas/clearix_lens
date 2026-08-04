/**
 * Premium Collection — Server Load v4
 * Todos filtros espelham URL. Treatments como CSV.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const brand        = url.searchParams.get('marca')    || null;
    const product_line = url.searchParams.get('linha')    || null;
    const lens_type    = url.searchParams.get('tipo')     || null;
    const coating      = url.searchParams.get('coating')  || null;
    const photochromic = url.searchParams.get('foto')     || null;
    const material_id  = url.searchParams.get('material') || null;
    const tratCsv      = url.searchParams.get('trat')     || null;
    const treatments   = tratCsv ? tratCsv.split(',').map(s => s.trim()).filter(Boolean) : [];
    const semCsv       = url.searchParams.get('sem')      || null;
    const exclude_treatments = semCsv ? semCsv.split(',').map(s => s.trim()).filter(Boolean) : [];
    const precoMinPar  = url.searchParams.get('precoMin');
    const precoMaxPar  = url.searchParams.get('precoMax');
    const price_min    = precoMinPar ? parseFloat(precoMinPar) : null;
    const price_max    = precoMaxPar ? parseFloat(precoMaxPar) : null;
    const pagina       = Math.max(1, parseInt(url.searchParams.get('pagina') || '1'));
    const busca        = url.searchParams.get('busca')    || null;
    const excluir      = url.searchParams.get('excluir')  || null;
    return {
        brand, product_line, lens_type, coating, photochromic, material_id,
        treatments, exclude_treatments, price_min, price_max, pagina, busca, excluir,
    };
};
