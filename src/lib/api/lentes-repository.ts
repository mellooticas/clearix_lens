/**
 * lib/api/lentes-repository.ts — Data access layer unificada do Clearix Lens
 *
 * Motor completo do banco (canonical engine v3 + catálogo + health).
 * Fonte única para DCL, PDV e outros apps que consomem o catálogo de lentes.
 *
 * Views consumidas (public):
 *   - v_canonical_premium  (28 cols, wrapper de catalog_lenses.v_canonical_premium)
 *   - v_canonical_standard (23 cols, wrapper de catalog_lenses.v_canonical_standard)
 *   - v_catalog_lenses, v_catalog_lens_stats, v_contact_lenses
 *   - v_pricing_organism_health, v_global_catalog_summary
 *
 * RPCs consumidas (public):
 *   - rpc_canonical_for_prescription, rpc_canonical_detail
 *   - rpc_premium_filter_options, rpc_premium_search
 *   - rpc_standard_filter_options, rpc_standard_search
 *   - rpc_catalog_summary, rpc_lens_search, rpc_lens_get_alternatives
 *   - rpc_contact_lens_search, rpc_brands_list, rpc_pricing_simulate
 */

import { supabase } from '$lib/supabase';
import type {
  CanonicalForPrescription,
  CanonicalLensOption,
  CatalogLens,
  PrescriptionInput,
  LensSearchFilters,
  LensFilterOptions,
  LensType,
  MaterialClass,
  CanonicalPremiumV3 as CanonicalPremiumV3T,
  CanonicalStandardV3 as CanonicalStandardV3T,
  PremiumFilterOptions as PremiumFilterOptionsT,
  StandardFilterOptions as StandardFilterOptionsT,
  CanonicalSearchResultV3,
  PremiumFilterParamsV3,
  PremiumSearchParamsV3,
  StandardFilterParamsV3,
  StandardSearchParamsV3,
} from '$lib/types/lentes';
import type {
  VContactLens,
  VBrand,
  VCatalogLensStats,
  RpcLensSearchResult,
  RpcContactLensSearchResult,
  PrescriptionSearchResult,
  CanonicalDetail,
  CanonicalPremiumV3,
  CanonicalStandardV3,
  PremiumFilterOptions,
  StandardFilterOptions,
  CanonicalSearchResult,
} from '$lib/types/database-views';
import type { ApiResponse } from '$lib/types/sistema';

// ============================================================================
// CANONICAL ENGINE — Prescrição (motor do wizard)
// ============================================================================

/**
 * Conceitos canônicos que cobrem uma receita oftalmológica.
 * RPC: rpc_canonical_for_prescription
 */
export async function buscarCanonicosPorReceita(
  rx: PrescriptionInput
): Promise<CanonicalForPrescription[]> {
  const { data, error } = await supabase.rpc('rpc_canonical_for_prescription', {
    p_spherical:   rx.spherical   ?? null,
    p_cylindrical: rx.cylindrical ?? null,
    p_addition:    rx.addition    ?? null,
    p_lens_type:   rx.lens_type   ?? null,
    p_is_premium:  rx.is_premium  ?? false,
  });

  if (error) {
    console.error('[LENTES] rpc_canonical_for_prescription error:', error);
    throw error;
  }
  return (data ?? []) as CanonicalForPrescription[];
}

/**
 * Lentes reais mapeadas para um conceito canônico.
 * RPC: rpc_canonical_detail
 */
export async function buscarLentesDoCanonical(
  canonicalId: string,
  isPremium = false
): Promise<CanonicalLensOption[]> {
  const { data, error } = await supabase.rpc('rpc_canonical_detail', {
    p_canonical_id: canonicalId,
    p_is_premium:   isPremium,
  });

  if (error) {
    console.error('[LENTES] rpc_canonical_detail error:', error);
    throw error;
  }
  return (data ?? []) as CanonicalLensOption[];
}

// ============================================================================
// CANONICAL ENGINE v3 — Premium & Standard (filtros estruturados)
// ============================================================================

export async function getPremiumFilterOptionsV3(
  params: PremiumFilterParamsV3 = {}
): Promise<PremiumFilterOptionsT> {
  const { data, error } = await supabase.rpc('rpc_premium_filter_options', {
    p_brand:        params.brand        ?? null,
    p_product_line: params.product_line ?? null,
    p_lens_type:    params.lens_type    ?? null,
    p_material_id:  params.material_id  ?? null,
    p_coating:      params.coating      ?? null,
    p_photochromic: params.photochromic ?? null,
    p_treatments:   params.treatments   ?? null,
  });
  if (error) {
    console.error('[LENTES v3] rpc_premium_filter_options error:', error);
    throw error;
  }
  return data as PremiumFilterOptionsT;
}

export async function searchPremiumV3(
  params: PremiumSearchParamsV3 = {}
): Promise<CanonicalSearchResultV3<CanonicalPremiumV3T>> {
  const { data, error } = await supabase.rpc('rpc_premium_search', {
    p_brand:        params.brand        ?? null,
    p_product_line: params.product_line ?? null,
    p_lens_type:    params.lens_type    ?? null,
    p_material_id:  params.material_id  ?? null,
    p_coating:      params.coating      ?? null,
    p_photochromic: params.photochromic ?? null,
    p_spherical:    params.spherical    ?? null,
    p_cylindrical:  params.cylindrical  ?? null,
    p_addition:     params.addition     ?? null,
    p_limit:        params.limit        ?? 50,
    p_offset:       params.offset       ?? 0,
    p_treatments:   params.treatments   ?? null,
    p_price_min:    params.price_min    ?? null,
    p_price_max:    params.price_max    ?? null,
  });
  if (error) {
    console.error('[LENTES v3] rpc_premium_search error:', error);
    throw error;
  }
  return data as CanonicalSearchResultV3<CanonicalPremiumV3T>;
}

export async function getStandardFilterOptionsV3(
  params: StandardFilterParamsV3 = {}
): Promise<StandardFilterOptionsT> {
  const { data, error } = await supabase.rpc('rpc_standard_filter_options', {
    p_lens_type:   params.lens_type   ?? null,
    p_material_id: params.material_id ?? null,
    p_treatments:  params.treatments  ?? null,
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
  });
  if (error) {
    console.error('[LENTES v3] rpc_standard_filter_options error:', error);
    throw error;
  }
  return data as StandardFilterOptionsT;
}

export async function searchStandardV3(
  params: StandardSearchParamsV3 = {}
): Promise<CanonicalSearchResultV3<CanonicalStandardV3T>> {
  const { data, error } = await supabase.rpc('rpc_standard_search', {
    p_lens_type:   params.lens_type   ?? null,
    p_material_id: params.material_id ?? null,
    p_treatments:  params.treatments  ?? null,
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
    p_limit:       params.limit       ?? 50,
    p_offset:      params.offset      ?? 0,
    p_price_min:   params.price_min   ?? null,
    p_price_max:   params.price_max   ?? null,
  });
  if (error) {
    console.error('[LENTES v3] rpc_standard_search error:', error);
    throw error;
  }
  return data as CanonicalSearchResultV3<CanonicalStandardV3T>;
}

export async function getCatalogSummaryV3(): Promise<unknown> {
  const { data, error } = await supabase.rpc('rpc_catalog_summary');
  if (error) {
    console.error('[LENTES v3] rpc_catalog_summary error:', error);
    throw error;
  }
  return data;
}

// ============================================================================
// CANONICAL ENGINE v3 — Prescrição unificada (premium + standard)
// ============================================================================

export interface PrescriptionSearchV3Params {
  spherical?: number;
  cylindrical?: number;
  addition?: number;
  lens_type?: string;
  limit?: number;
}

export interface PrescriptionSearchV3Result {
  premium: CanonicalPremiumV3T[];
  standard: CanonicalStandardV3T[];
  premium_total: number;
  standard_total: number;
}

export async function buscarCanonicosPorReceitaV3(
  params: PrescriptionSearchV3Params = {}
): Promise<PrescriptionSearchV3Result> {
  const { data, error } = await supabase.rpc('rpc_canonical_for_prescription_v3', {
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
    p_lens_type:   params.lens_type   ?? null,
    p_limit:       params.limit       ?? 20,
  });
  if (error) {
    console.error('[LENTES v3] rpc_canonical_for_prescription_v3 error:', error);
    throw error;
  }
  return data as PrescriptionSearchV3Result;
}

// ============================================================================
// CATÁLOGO REAL — Busca unificada via RPC (rpc_lens_catalog_search)
// ============================================================================

export interface LensCatalogSearchParams {
  search?: string;
  lens_type?: string;
  is_premium?: boolean;
  supplier_id?: string;
  brand_id?: string;
  material_id?: string;
  refractive_index?: number;
  coating?: string;
  product_line?: string;
  lens_design?: string;
  min_height_mm?: string;
  price_min?: number;
  price_max?: number;
  treatments?: string[];
  limit?: number;
  offset?: number;
}

export interface LensCatalogSearchResult {
  total: number;
  items: import('$lib/types/database-views').VCatalogLens[];
}

export async function searchLensCatalog(
  params: LensCatalogSearchParams = {}
): Promise<LensCatalogSearchResult> {
  const { data, error } = await supabase.rpc('rpc_lens_catalog_search', {
    p_search:           params.search           ?? null,
    p_lens_type:        params.lens_type        ?? null,
    p_is_premium:       params.is_premium       ?? null,
    p_supplier_id:      params.supplier_id      ?? null,
    p_brand_id:         params.brand_id         ?? null,
    p_material_id:      params.material_id      ?? null,
    p_refractive_index: params.refractive_index ?? null,
    p_coating:          params.coating          ?? null,
    p_product_line:     params.product_line     ?? null,
    p_lens_design:      params.lens_design      ?? null,
    p_min_height_mm:    params.min_height_mm    ?? null,
    p_price_min:        params.price_min        ?? null,
    p_price_max:        params.price_max        ?? null,
    p_treatments:       params.treatments       ?? null,
    p_limit:            params.limit            ?? 24,
    p_offset:           params.offset           ?? 0,
  });
  if (error) {
    console.error('[LENTES] rpc_lens_catalog_search error:', error);
    throw error;
  }
  return data as LensCatalogSearchResult;
}

// ============================================================================
// CATÁLOGO REAL — Lentes físicas (rpc_lens_search)
// ============================================================================

export interface LensSearchParams {
  query?: string;
  lens_type?: string;
  material_id?: string;
  price_min?: number;
  price_max?: number;
  has_ar?: boolean;
  has_blue?: boolean;
  supplier_id?: string;
  brand_name?: string;
  is_premium?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Busca lentes oftálmicas reais via rpc_lens_search.
 */
export async function searchLenses(
  params: LensSearchParams = {}
): Promise<RpcLensSearchResult[]> {
  const { data, error } = await supabase.rpc('rpc_lens_search', {
    p_lens_type:   params.lens_type   ?? null,
    p_material_id: params.material_id ?? null,
    p_price_min:   params.price_min   ?? null,
    p_price_max:   params.price_max   ?? null,
    p_has_ar:      params.has_ar      ?? null,
    p_has_blue:    params.has_blue    ?? null,
    p_supplier_id: params.supplier_id ?? null,
    p_brand_name:  params.brand_name  ?? null,
    p_limit:       params.limit       ?? 50,
    p_offset:      params.offset      ?? 0,
  });

  if (error) throw error;

  let results = (data as RpcLensSearchResult[]) ?? [];

  if (params.is_premium !== undefined) {
    results = results.filter((r) => r.is_premium === params.is_premium);
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter((r) =>
      r.lens_name?.toLowerCase().includes(q) ||
      r.brand_name?.toLowerCase().includes(q) ||
      r.supplier_name?.toLowerCase().includes(q)
    );
  }
  return results;
}

/**
 * Alternativas para uma lente (mesmas specs, outros fornecedores).
 */
export async function getLensAlternatives(
  lensId: string,
  limit = 5
): Promise<RpcLensSearchResult[]> {
  const { data, error } = await supabase.rpc('rpc_lens_get_alternatives', {
    p_lens_id:   lensId,
    p_limit:     limit,
  });
  if (error) throw error;
  return (data as RpcLensSearchResult[]) ?? [];
}

/**
 * Busca direta do catálogo — assinatura v2 (compat com código antigo).
 */
export async function buscarLentes(
  filtros?: LensSearchFilters
): Promise<CatalogLens[]> {
  const { data, error } = await supabase.rpc('rpc_lens_search', {
    p_lens_type:   filtros?.lens_type   ?? null,
    p_material_id: null,
    p_supplier_id: filtros?.supplier_id ?? null,
    p_brand_name:  filtros?.brand_name  ?? null,
    p_price_min:   filtros?.price_min   ?? null,
    p_price_max:   filtros?.price_max   ?? null,
    p_has_ar:      filtros?.has_ar      ?? null,
    p_has_blue:    filtros?.has_blue    ?? null,
    p_limit:       filtros?.limit       ?? 50,
    p_offset:      filtros?.offset      ?? 0,
  });

  if (error) {
    console.error('[LENTES] rpc_lens_search error:', error);
    throw error;
  }
  return (data ?? []) as CatalogLens[];
}

// ============================================================================
// FORNECEDORES — distinct suppliers do catálogo
// ============================================================================

export interface LensSupplier {
  supplier_id: string;
  supplier_name: string;
  lens_count: number;
}

export async function buscarFornecedoresLentes(): Promise<LensSupplier[]> {
  const { data, error } = await supabase
    .from('v_catalog_lenses')
    .select('supplier_id, supplier_name');

  if (error) {
    console.error('[LENTES] supplier query error:', error);
    throw error;
  }

  const map = new Map<string, { name: string; count: number }>();
  for (const row of data ?? []) {
    if (!row.supplier_id) continue;
    const existing = map.get(row.supplier_id);
    if (existing) {
      existing.count++;
    } else {
      map.set(row.supplier_id, { name: row.supplier_name || 'Sem nome', count: 1 });
    }
  }

  return Array.from(map.entries())
    .map(([id, d]) => ({ supplier_id: id, supplier_name: d.name, lens_count: d.count }))
    .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name));
}

// ============================================================================
// FILTROS DINÂMICOS — LensType / Material / Refractive Index
// ============================================================================

/**
 * Opções de filtro derivadas das views canônicas v3 (union standard + premium).
 */
export async function buscarFiltrosDisponiveis(): Promise<LensFilterOptions> {
  const [{ data: standard, error: errStd }, { data: premium, error: errPrm }] = await Promise.all([
    supabase.from('v_canonical_standard').select('lens_type, material_class, refractive_index'),
    supabase.from('v_canonical_premium').select('lens_type, material_class, refractive_index'),
  ]);

  if (errStd || errPrm) {
    console.error('[LENTES] filter options error:', errStd ?? errPrm);
    return { lens_types: [], material_classes: [], refractive_indices: [] };
  }

  const rows = [...(standard ?? []), ...(premium ?? [])];
  return {
    lens_types: Array.from(
      new Set(rows.map((r) => r.lens_type as LensType))
    ).filter(Boolean).sort() as LensType[],
    material_classes: Array.from(
      new Set(rows.map((r) => r.material_class as MaterialClass))
    ).filter(Boolean).sort() as MaterialClass[],
    refractive_indices: Array.from(
      new Set(rows.map((r) => r.refractive_index as number))
    )
      .filter((v) => v != null)
      .sort((a, b) => a - b),
  };
}

// ============================================================================
// CONCEITOS CANÔNICOS — browse com pricing (v_canonical_premium / _standard)
// ============================================================================

export interface CanonicalBrowseParams {
  lens_type?: string;
  material_class?: string;
  refractive_index?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lista conceitos canônicos PREMIUM com pricing agregado (v_canonical_premium).
 */
export async function browseCanonicalPremium(
  params: CanonicalBrowseParams = {}
): Promise<CanonicalPremiumV3[]> {
  let query = supabase
    .from('v_canonical_premium')
    .select('*')
    .order('canonical_name', { ascending: true });

  if (params.lens_type)        query = query.eq('lens_type', params.lens_type);
  if (params.material_class)   query = query.eq('material_class', params.material_class);
  if (params.refractive_index) query = query.eq('refractive_index', params.refractive_index);
  if (params.search)           query = query.ilike('canonical_name', `%${params.search}%`);
  if (params.limit)            query = query.limit(params.limit);
  if (params.offset)           query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data as CanonicalPremiumV3[]) ?? [];
}

/**
 * Busca um conceito canônico PREMIUM por id (v_canonical_premium).
 */
export async function getCanonicalPremiumById(
  id: string
): Promise<CanonicalPremiumV3 | null> {
  const { data, error } = await supabase
    .from('v_canonical_premium')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as CanonicalPremiumV3 | null) ?? null;
}

/**
 * Lista conceitos canônicos STANDARD com pricing agregado (v_canonical_standard).
 */
export async function browseCanonicalStandard(
  params: CanonicalBrowseParams = {}
): Promise<CanonicalStandardV3[]> {
  let query = supabase
    .from('v_canonical_standard')
    .select('*')
    .order('canonical_name', { ascending: true });

  if (params.lens_type)        query = query.eq('lens_type', params.lens_type);
  if (params.material_class)   query = query.eq('material_class', params.material_class);
  if (params.refractive_index) query = query.eq('refractive_index', params.refractive_index);
  if (params.search)           query = query.ilike('canonical_name', `%${params.search}%`);
  if (params.limit)            query = query.limit(params.limit);
  if (params.offset)           query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data as CanonicalStandardV3[]) ?? [];
}

/**
 * Busca um conceito canônico STANDARD por id (v_canonical_standard).
 */
export async function getCanonicalStandardById(
  id: string
): Promise<CanonicalStandardV3 | null> {
  const { data, error } = await supabase
    .from('v_canonical_standard')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as CanonicalStandardV3 | null) ?? null;
}

// ============================================================================
// LENTES DE CONTATO
// ============================================================================

export interface ContactLensSearchParams {
  query?: string;
  brand_id?: string;
  lens_type?: string;
  purpose?: string;
  material?: string;
  is_colored?: boolean;
  can_sleep_with?: boolean;
  premium_only?: boolean;
  spherical_needed?: number;
  cylindrical_needed?: number;
  limit?: number;
  offset?: number;
}

export async function searchContactLenses(
  params: ContactLensSearchParams = {}
): Promise<RpcContactLensSearchResult[]> {
  const { data, error } = await supabase.rpc('rpc_contact_lens_search', {
    p_brand_id:           params.brand_id           ?? null,
    p_lens_type:          params.lens_type          ?? null,
    p_purpose:            params.purpose            ?? null,
    p_material:           params.material           ?? null,
    p_is_colored:         params.is_colored         ?? null,
    p_can_sleep_with:     params.can_sleep_with     ?? null,
    p_premium_only:       params.premium_only       ?? false,
    p_spherical_needed:   params.spherical_needed   ?? null,
    p_cylindrical_needed: params.cylindrical_needed ?? null,
    p_search:             params.query              ?? null,
    p_limit:              params.limit              ?? 50,
    p_offset:             params.offset             ?? 0,
  });
  if (error) throw error;
  return (data as RpcContactLensSearchResult[]) ?? [];
}

export async function getContactLensById(id: string): Promise<VContactLens | null> {
  const { data, error } = await supabase
    .from('v_contact_lenses')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as VContactLens;
}

// ============================================================================
// MARCAS & ESTATÍSTICAS
// ============================================================================

/**
 * Lista marcas (rpc_brands_list). Assinatura real: (p_search text, p_limit int).
 */
export async function getBrands(params: {
  search?: string;
  limit?: number;
} = {}): Promise<VBrand[]> {
  const { data, error } = await supabase.rpc('rpc_brands_list', {
    p_search: params.search ?? null,
    p_limit:  params.limit  ?? 100,
  });
  if (error) throw error;
  return (data as VBrand[]) ?? [];
}

/**
 * Estatísticas globais do catálogo (v_catalog_lens_stats).
 */
export async function getCatalogStats(): Promise<VCatalogLensStats | null> {
  const { data, error } = await supabase
    .from('v_catalog_lens_stats')
    .select('*')
    .single();
  if (error) throw error;
  return data as VCatalogLensStats;
}

/**
 * Simulador de precificação (rpc_pricing_simulate).
 */
export async function simulatePricing(params: {
  cost: number;
  supplier_id?: string;
  category?: string;
}): Promise<{ sell_price: number; effective_markup: number }> {
  const { data, error } = await supabase.rpc('rpc_pricing_simulate', {
    p_cost:        params.cost,
    p_supplier_id: params.supplier_id ?? null,
    p_category:    params.category    ?? null,
  });
  if (error) throw error;
  return data as { sell_price: number; effective_markup: number };
}

// ============================================================================
// SAÚDE DO MOTOR ÓPTICO
// ============================================================================

export interface PricingOrganismZone {
  zona_comercial: string;
  qtd_lentes: number;
  markup_medio: number | null;
}

export interface GlobalCatalogSummaryRow {
  tipo: string;
  total: number;
  markup: number | null;
}

export interface SystemHealthRow {
  table_name: string;
  row_count: number;
  health_status: 'healthy' | 'warning' | 'critical';
}

export async function getSystemHealthAudit(): Promise<SystemHealthRow[]> {
  const { data, error } = await supabase
    .from('v_system_health_audit')
    .select('*');
  if (error) throw error;
  return (data as SystemHealthRow[]) ?? [];
}

export async function getPricingOrganismHealth(): Promise<PricingOrganismZone[]> {
  const { data, error } = await supabase
    .from('v_pricing_organism_health')
    .select('*');
  if (error) throw error;
  return (data as PricingOrganismZone[]) ?? [];
}

export async function getGlobalCatalogSummary(): Promise<GlobalCatalogSummaryRow[]> {
  const { data, error } = await supabase
    .from('v_global_catalog_summary')
    .select('*');
  if (error) throw error;
  return (data as GlobalCatalogSummaryRow[]) ?? [];
}

// ============================================================================
// LensOracleAPI — Façade de backwards compatibility
// Mantém a API de classe usada em 17+ consumidores. Internamente delega às
// funções acima. Toda a lógica vive nas funções — a classe é só um wrapper.
// ============================================================================

export interface PrescriptionSearchParams {
  spherical: number;
  cylindrical?: number;
  addition?: number;
  lens_type?: string;
  is_premium?: boolean;
  limit?: number;
}

export class LensOracleAPI {
  // ── Lentes oftálmicas reais ─────────────────────────────────────────────
  static async searchLenses(
    params: LensSearchParams
  ): Promise<ApiResponse<RpcLensSearchResult[]>> {
    try {
      const data = await searchLenses(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getAlternatives(
    lensId: string,
    limit = 5
  ): Promise<ApiResponse<RpcLensSearchResult[]>> {
    try {
      const data = await getLensAlternatives(lensId, limit);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Canonical Engine (prescrição + detail) ──────────────────────────────
  static async searchByPrescriptionV2(
    params: PrescriptionSearchParams
  ): Promise<ApiResponse<PrescriptionSearchResult[]>> {
    try {
      const { data, error } = await supabase.rpc('rpc_canonical_for_prescription', {
        p_spherical:   params.spherical,
        p_cylindrical: params.cylindrical ?? null,
        p_addition:    params.addition    ?? null,
        p_lens_type:   params.lens_type   ?? null,
        p_is_premium:  params.is_premium  ?? false,
      });
      if (error) throw error;
      return { data: (data as PrescriptionSearchResult[]) ?? [] };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getCanonicalDetail(
    canonicalId: string,
    isPremium = false
  ): Promise<ApiResponse<CanonicalDetail[]>> {
    try {
      const { data, error } = await supabase.rpc('rpc_canonical_detail', {
        p_canonical_id: canonicalId,
        p_is_premium:   isPremium,
      });
      if (error) throw error;
      return { data: (data as CanonicalDetail[]) ?? [] };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Conceitos canônicos (browse) ────────────────────────────────────────
  static async getCanonicalStandardWithPricing(
    params: CanonicalBrowseParams = {}
  ): Promise<ApiResponse<CanonicalStandardV3[]>> {
    try {
      const data = await browseCanonicalStandard(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getCanonicalPremiumWithPricing(
    params: CanonicalBrowseParams = {}
  ): Promise<ApiResponse<CanonicalPremiumV3[]>> {
    try {
      const data = await browseCanonicalPremium(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Lentes de contato ───────────────────────────────────────────────────
  static async searchContactLenses(
    params: ContactLensSearchParams
  ): Promise<ApiResponse<RpcContactLensSearchResult[]>> {
    try {
      const data = await searchContactLenses(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getContactLensById(id: string): Promise<ApiResponse<VContactLens>> {
    try {
      const data = await getContactLensById(id);
      return { data: data as VContactLens };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Marcas, estatísticas, simulador ─────────────────────────────────────
  static async getBrands(params: {
    search?: string;
    limit?: number;
  } = {}): Promise<ApiResponse<VBrand[]>> {
    try {
      const data = await getBrands(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getCatalogStats(): Promise<ApiResponse<VCatalogLensStats>> {
    try {
      const data = await getCatalogStats();
      return { data: data as VCatalogLensStats };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async simulatePricing(params: {
    cost: number;
    supplier_id?: string;
    category?: string;
  }): Promise<ApiResponse<{ sell_price: number; effective_markup: number }>> {
    try {
      const data = await simulatePricing(params);
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  /**
   * Rankings — wrapper sobre searchLenses com ordenação client-side.
   */
  static async getRankings(params: {
    category?: 'expensive' | 'popular' | 'premium';
    limit?: number;
  }): Promise<ApiResponse<RpcLensSearchResult[]>> {
    try {
      const isPremium = params.category === 'premium' ? true : undefined;
      const res = await LensOracleAPI.searchLenses({ is_premium: isPremium, limit: params.limit ?? 10 });
      if (res.error) return res;
      let results = res.data ?? [];
      if (params.category === 'expensive') {
        results = [...results].sort((a, b) => (b.price_suggested ?? 0) - (a.price_suggested ?? 0));
      }
      return { data: results };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Saúde do motor óptico ───────────────────────────────────────────────
  static async getSystemHealthAudit(): Promise<ApiResponse<SystemHealthRow[]>> {
    try {
      const data = await getSystemHealthAudit();
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getPricingOrganismHealth(): Promise<ApiResponse<PricingOrganismZone[]>> {
    try {
      const data = await getPricingOrganismHealth();
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getGlobalCatalogSummary(): Promise<ApiResponse<GlobalCatalogSummaryRow[]>> {
    try {
      const data = await getGlobalCatalogSummary();
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  // ── Canonical Engine v3 (filtros estruturados) ──────────────────────────
  static async getPremiumFilterOptions(
    params: PremiumFilterParamsV3 = {}
  ): Promise<ApiResponse<PremiumFilterOptions>> {
    try {
      const data = await getPremiumFilterOptionsV3(params);
      return { data: data as PremiumFilterOptions };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async searchPremium(
    params: PremiumSearchParamsV3 = {}
  ): Promise<ApiResponse<CanonicalSearchResult<CanonicalPremiumV3>>> {
    try {
      const data = await searchPremiumV3(params);
      return { data: data as CanonicalSearchResult<CanonicalPremiumV3> };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getStandardFilterOptions(
    params: StandardFilterParamsV3 = {}
  ): Promise<ApiResponse<StandardFilterOptions>> {
    try {
      const data = await getStandardFilterOptionsV3(params);
      return { data: data as StandardFilterOptions };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async searchStandard(
    params: StandardSearchParamsV3 = {}
  ): Promise<ApiResponse<CanonicalSearchResult<CanonicalStandardV3>>> {
    try {
      const data = await searchStandardV3(params);
      return { data: data as CanonicalSearchResult<CanonicalStandardV3> };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }

  static async getCatalogSummaryV3(): Promise<ApiResponse<unknown>> {
    try {
      const data = await getCatalogSummaryV3();
      return { data };
    } catch (e: any) {
      return { error: { code: e.code, message: e.message } };
    }
  }
}
