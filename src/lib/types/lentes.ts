// lib/types/lentes.ts — Types for unified bank lens catalog (EN column names)
// All property names match view/RPC columns in the unified Supabase bank.
// Schema: catalog_lenses | Views: v_canonical_* | RPCs: rpc_canonical_*

/**
 * Lens type enum — matches catalog_lenses.lens_type
 */
export type LensType = 'single_vision' | 'multifocal' | 'bifocal' | 'occupational'

/**
 * Material class enum — matches canonical_lens_materials.material_class
 */
export type MaterialClass = 'cr39' | 'polycarbonate' | 'trivex' | 'high_index'

/**
 * Treatment codes — array stored in canonical_lenses.treatment_codes
 */
export type TreatmentCode = 'ar' | 'scratch' | 'uv' | 'blue' | 'photo' | 'pol'

// ========== RPC RESULTS ==========

/**
 * Result from rpc_canonical_for_prescription
 * Each row is a canonical concept that covers the given prescription
 */
export interface CanonicalForPrescription {
  id: string
  sku: string
  canonical_name: string
  lens_type: LensType
  material_class: MaterialClass
  refractive_index: number
  material_display: string
  treatment_codes: TreatmentCode[]
  spherical_min: number
  spherical_max: number
  cylindrical_min: number
  cylindrical_max: number
  addition_min: number | null
  addition_max: number | null
  tenant_lens_count: number
  price_min: number
  price_max: number
  price_avg: number
  cost_min: number
  cost_max: number
  markup_min: number
  markup_max: number
}

/**
 * Result from rpc_canonical_detail
 * Each row is a real lens mapped to a canonical concept
 */
export interface CanonicalLensOption {
  lens_id: string
  lens_sku: string
  lens_name: string
  brand_name: string
  supplier_name: string
  sell_price: number
  cost_price: number
  final_price: number
  effective_markup: number
  is_preferred: boolean
  match_method: string
}

// ========== VIEW RESULTS ==========

/**
 * Row from v_canonical_lenses view
 */
export interface CanonicalLens {
  canonical_lens_id: string
  canonical_name: string
  fingerprint: string
  is_premium: boolean
  lens_type: LensType
  material: string
  refractive_index: number
  category: string | null
  anti_reflective: boolean
  anti_scratch: boolean
  uv_filter: boolean
  blue_light: boolean
  photochromic: string
  spherical_min: number
  spherical_max: number
  cylindrical_min: number
  cylindrical_max: number
  addition_min: number | null
  addition_max: number | null
  global_mapped_count: number
  global_supplier_count: number
  has_premium_mapping: boolean
  tenant_mapped_count: number
  tenant_min_price: number | null
  tenant_max_price: number | null
  created_at: string
}

/**
 * Row from v_catalog_lenses view (real lenses)
 */
export interface CatalogLens {
  id: string
  slug: string
  lens_name: string
  normalized_name: string
  lens_type: LensType
  category: string
  brand_name: string
  brand_slug: string
  brand_is_premium: boolean
  supplier_id: string
  supplier_name: string
  material_name: string
  refractive_index: number
  anti_reflective: boolean
  blue_light: boolean
  photochromic: string
  price_cost: number
  price_suggested: number
  lead_time_days: number
  stock_available: number
  is_premium: boolean
  status: string
}

// ========== FILTER TYPES ==========

/**
 * Filters for canonical lens search (UI state)
 */
export interface CanonicalFilters {
  lens_type?: LensType
  material_class?: MaterialClass
  refractive_index?: number
  is_premium?: boolean
  price_min?: number
  price_max?: number
  search?: string
  treatments?: TreatmentCode[]
}

/**
 * Prescription input for rpc_canonical_for_prescription
 */
export interface PrescriptionInput {
  spherical?: number
  cylindrical?: number
  addition?: number
  lens_type?: LensType
  is_premium?: boolean
}

/**
 * Filters for direct lens search (rpc_lens_search)
 */
export interface LensSearchFilters {
  lens_type?: LensType
  supplier_id?: string
  brand_name?: string
  price_min?: number
  price_max?: number
  has_ar?: boolean
  has_blue?: boolean
  limit?: number
  offset?: number
}

/**
 * Available filter options for the UI (dynamic from DB)
 */
export interface LensFilterOptions {
  lens_types: LensType[]
  material_classes: MaterialClass[]
  refractive_indices: number[]
}

// ============================================================================
// CANONICAL ENGINE v3 — Filtros Estruturados (migration 0074)
// RPCs no schema catalog_lenses
// ============================================================================

/** Item de filtro retornado pelas RPCs v3 de filter_options */
export interface FilterOptionV3 {
  value: string
  count: number
}

/** Item de material retornado pelas RPCs v3 de filter_options */
export interface MaterialFilterOptionV3 {
  id: string
  name: string
  index: number
  count: number
  class?: string
}

/** Resposta da rpc_premium_filter_options */
export interface PremiumFilterOptions {
  brands: FilterOptionV3[] | null
  product_lines: FilterOptionV3[] | null
  lens_types: FilterOptionV3[] | null
  materials: MaterialFilterOptionV3[] | null
  coatings: FilterOptionV3[] | null
  photochromics: FilterOptionV3[] | null
  total_count: number
}

/** Resposta da rpc_standard_filter_options */
export interface StandardFilterOptions {
  lens_types: FilterOptionV3[] | null
  materials: MaterialFilterOptionV3[] | null
  treatments: FilterOptionV3[] | null
  supplier_range: { min_suppliers: number; max_suppliers: number } | null
  prescription_ranges: {
    sph_min: number; sph_max: number
    cyl_min: number; cyl_max: number
    add_min: number | null; add_max: number | null
  } | null
  total_count: number
}

/** Item da v_canonical_premium com colunas estruturadas v3 */
export interface CanonicalPremiumV3 {
  id: string
  canonical_name: string
  sku: string | null
  brand: string
  product_line: string | null
  coating_name: string | null
  photochromic_type: string | null
  lens_type: string
  canonical_material_id: string
  material_name: string
  material_class: string
  refractive_index: number
  spherical_min: number | null
  spherical_max: number | null
  cylindrical_min: number | null
  cylindrical_max: number | null
  addition_min: number | null
  addition_max: number | null
  treatment_codes: string[]
  mapped_lens_count: number
  mapped_supplier_count: number
  mapped_brand_count: number
  price_min: number | null
  price_max: number | null
  price_avg: number | null
  fingerprint: string
  created_at: string
  updated_at: string
}

/** Item da v_canonical_standard (sem marca, commodity) */
export interface CanonicalStandardV3 {
  id: string
  canonical_name: string
  sku: string | null
  lens_type: string
  canonical_material_id: string
  material_name: string
  material_class: string
  refractive_index: number
  spherical_min: number | null
  spherical_max: number | null
  cylindrical_min: number | null
  cylindrical_max: number | null
  addition_min: number | null
  addition_max: number | null
  treatment_codes: string[]
  mapped_lens_count: number
  mapped_supplier_count: number
  price_min: number | null
  price_max: number | null
  price_avg: number | null
  fingerprint: string
  created_at: string
  updated_at: string
}

/** Resposta genérica de busca v3 com paginação */
export interface CanonicalSearchResultV3<T> {
  total: number
  items: T[]
}

/** Parâmetros de filtro premium v3 */
export interface PremiumFilterParamsV3 {
  brand?: string
  product_line?: string
  lens_type?: string
  material_id?: string
  coating?: string
  photochromic?: string
  treatments?: string[]
  /** Tratamentos a EXCLUIR (tri-state "sem" — padrão Vendas) */
  exclude_treatments?: string[]
}

/** Parâmetros de busca premium v3 */
export interface PremiumSearchParamsV3 extends PremiumFilterParamsV3 {
  spherical?: number
  cylindrical?: number
  addition?: number
  price_min?: number
  price_max?: number
  limit?: number
  offset?: number
  /** Busca textual: nome, marca, material, SKU canônico (CPR) ou SKU de lente real membro. Vírgula = E (todos os termos) */
  search?: string
  /** Não contém: nenhum termo (vírgula) pode casar */
  search_exclude?: string
}

/** Parâmetros de filtro standard v3 */
export interface StandardFilterParamsV3 {
  lens_type?: string
  material_id?: string
  treatments?: string[]
  /** Tratamentos a EXCLUIR (tri-state "sem" — padrão Vendas) */
  exclude_treatments?: string[]
  spherical?: number
  cylindrical?: number
  addition?: number
}

/** Parâmetros de busca standard v3 */
export interface StandardSearchParamsV3 extends StandardFilterParamsV3 {
  price_min?: number
  price_max?: number
  limit?: number
  offset?: number
  /** Busca textual: nome, material, SKU canônico (CST) ou SKU de lente real membro. Vírgula = E (todos os termos) */
  search?: string
  /** Não contém: nenhum termo (vírgula) pode casar */
  search_exclude?: string
}
