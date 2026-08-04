/**
 * Catálogo de Lentes Reais — Server Load
 *
 * Usa RPC pública `rpc_lens_catalog_search` para busca e
 * `rpc_lens_catalog_filter_options` para as opções de filtro.
 *
 * URL params unificados:
 *   - trat=ar,blue,photo (comma-separated, padrão do ecossistema)
 *   - Booleans individuais (ar=true, blue=true) mantidos como fallback
 */
import type { PageServerLoad } from './$types';
import type { VCatalogLens } from '$lib/types/database-views';

const PAGE_SIZE = 24;

export type LenteListItem = Pick<
    VCatalogLens,
    | 'id' | 'lens_name' | 'sku' | 'lens_type' | 'is_premium'
    | 'brand_name' | 'supplier_name' | 'material_name' | 'refractive_index'
    | 'price_cost' | 'price_suggested'
    | 'treatment_names' | 'anti_reflective' | 'blue_light' | 'photochromic' | 'polarized' | 'anti_scratch' | 'uv_filter'
    | 'spherical_min' | 'spherical_max' | 'cylindrical_min' | 'cylindrical_max'
    | 'addition_min' | 'addition_max' | 'status'
>;

export interface FilterOption {
    value: string;
    label?: string;
    count: number;
}

export interface FilterOptions {
    laboratorios:  FilterOption[];
    marcas:        FilterOption[];
    tipos:         FilterOption[];
    materiais:     FilterOption[];
    indices:       FilterOption[];
    coatings:      FilterOption[];
    product_lines: FilterOption[];
    lens_designs:  FilterOption[];
    min_heights:   FilterOption[];
    has_blue_cut:     number;
    has_photochromic: number;
    has_hidrofobic:   number;
    price_min:      number;
    price_max:      number;
    total:          number;
    premium_total:  number;
    standard_total: number;
}

/** Códigos de tratamento válidos */
const TREATMENT_CODES = ['ar', 'scratch', 'uv', 'blue', 'photo', 'pol', 'hidro'] as const;

export const load: PageServerLoad = async ({ url, locals }) => {
    const { supabase } = locals;

    // ── URL params ───────────────────────────────────────────────────────────
    const busca       = url.searchParams.get('busca')   || '';
    const excluir     = url.searchParams.get('excluir') || '';
    const tipo        = url.searchParams.get('tipo')  || null;
    const premiumPar  = url.searchParams.get('premium');
    const isPremium   = premiumPar === 'true' ? true
                      : premiumPar === 'false' ? false
                      : null;
    const fornecedor  = url.searchParams.get('fornecedor') || null;
    const marca       = url.searchParams.get('marca')      || null;
    const material    = url.searchParams.get('material')   || null;
    const indiceParam = url.searchParams.get('indice');
    const indice      = indiceParam ? parseFloat(indiceParam) : null;

    // Novos filtros via attributes
    const coating     = url.searchParams.get('coating')     || null;
    const linha       = url.searchParams.get('linha')       || null;
    const design      = url.searchParams.get('design')      || null;
    const altura      = url.searchParams.get('altura')      || null;

    // Faixa de preço
    const precoMinParam = url.searchParams.get('precoMin');
    const precoMaxParam = url.searchParams.get('precoMax');
    const precoMin = precoMinParam ? parseFloat(precoMinParam) : null;
    const precoMax = precoMaxParam ? parseFloat(precoMaxParam) : null;

    // Tratamentos — padrão unificado: trat=ar,blue,photo (comma-separated)
    // Fallback: booleans individuais (ar=true, blue=true) para backwards compat
    const tratParam = url.searchParams.get('trat');
    let treatments: string[] = [];
    if (tratParam) {
        treatments = tratParam.split(',').filter(t => TREATMENT_CODES.includes(t as any));
    } else {
        // Fallback: ler booleans individuais
        for (const code of TREATMENT_CODES) {
            if (url.searchParams.get(code) === 'true') treatments.push(code);
        }
    }

    // Booleans derivados dos treatments (para manter filtros state na UI)
    const ar      = treatments.includes('ar');
    const scratch = treatments.includes('scratch');
    const uv      = treatments.includes('uv');
    const blue    = treatments.includes('blue');
    const photo   = treatments.includes('photo');
    const pol     = treatments.includes('pol');
    const hidro   = treatments.includes('hidro');

    const pagina  = Math.max(1, parseInt(url.searchParams.get('pagina') || '1'));
    const offset  = (pagina - 1) * PAGE_SIZE;

    // ── Fetch paralelo via RPCs ─────────────────────────────────────────────
    const [searchResult, filterOptionsResult] = await Promise.all([
        supabase.rpc('rpc_lens_catalog_search', {
            p_search:           busca || null,
            p_lens_type:        tipo,
            p_is_premium:       isPremium,
            p_supplier_id:      fornecedor,
            p_brand_id:         marca,
            p_material_id:      material,
            p_refractive_index: indice,
            p_coating:          coating,
            p_product_line:     linha,
            p_lens_design:      design,
            p_min_height_mm:    altura,
            p_price_min:        precoMin,
            p_price_max:        precoMax,
            p_treatments:       treatments.length > 0 ? treatments : null,
            p_limit:            PAGE_SIZE,
            p_offset:           offset,
            p_search_exclude:   excluir || null,
        }),
        supabase.rpc('rpc_lens_catalog_filter_options'),
    ]);

    if (searchResult.error) {
        console.error('[lentes] rpc_lens_catalog_search error:', searchResult.error);
    }
    if (filterOptionsResult.error) {
        console.error('[lentes] filterOptions error:', filterOptionsResult.error);
    }

    const searchData = (searchResult.data ?? { total: 0, items: [] }) as { total: number; items: unknown[] };

    const rawOpts = (filterOptionsResult.data ?? {}) as Record<string, unknown>;
    const filterOptions: FilterOptions = {
        laboratorios:    (rawOpts.laboratorios  as FilterOption[]) ?? [],
        marcas:          (rawOpts.marcas        as FilterOption[]) ?? [],
        tipos:           applyTipoLabels((rawOpts.tipos as FilterOption[]) ?? []),
        materiais:       (rawOpts.materiais     as FilterOption[]) ?? [],
        indices:         toIndicesOptions((rawOpts.indices as FilterOption[]) ?? []),
        coatings:        (rawOpts.coatings      as FilterOption[]) ?? [],
        product_lines:   (rawOpts.product_lines as FilterOption[]) ?? [],
        lens_designs:    (rawOpts.lens_designs  as FilterOption[]) ?? [],
        min_heights:     toHeightOptions((rawOpts.min_heights as FilterOption[]) ?? []),
        has_blue_cut:     Number(rawOpts.has_blue_cut     ?? 0),
        has_photochromic: Number(rawOpts.has_photochromic ?? 0),
        has_hidrofobic:   Number(rawOpts.has_hidrofobic   ?? 0),
        price_min:        Number(rawOpts.price_min ?? 0),
        price_max:        Number(rawOpts.price_max ?? 0),
        total:            Number(rawOpts.total          ?? 0),
        premium_total:    Number(rawOpts.premium_total  ?? 0),
        standard_total:   Number(rawOpts.standard_total ?? 0),
    };

    return {
        lentes: (searchData.items ?? []) as unknown as LenteListItem[],
        total:  searchData.total ?? 0,
        premiumTotal:  filterOptions.premium_total,
        standardTotal: filterOptions.standard_total,
        filtros: {
            busca, excluir, tipo, isPremium, fornecedor, marca, material, indice,
            coating, linha, design, altura,
            precoMin, precoMax,
            ar, scratch, uv, blue, photo, pol, hidro,
        },
        filterOptions,
        pagina,
        pageSize: PAGE_SIZE,
    };
};

// ── helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
    single_vision: 'Visão Simples',
    multifocal:    'Multifocal',
    bifocal:       'Bifocal',
    occupational:  'Ocupacional',
};

function applyTipoLabels(opts: FilterOption[]): FilterOption[] {
    return opts.map(o => ({ ...o, label: TIPO_LABELS[o.value] ?? o.value }));
}

function toIndicesOptions(opts: FilterOption[]): FilterOption[] {
    return opts.map(o => ({ ...o, label: `n = ${o.value}` }));
}

function toHeightOptions(opts: FilterOption[]): FilterOption[] {
    return opts.map(o => ({ ...o, label: `${o.value} mm` }));
}
