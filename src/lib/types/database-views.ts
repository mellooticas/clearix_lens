/**
 * Clearix Lens — Tipos TypeScript das Views e RPCs do Banco
 * Banco: mhgbuplnxtfgipbemchb (Clearix by DIGIAI)
 *
 * ─── Canonical Engine v2 (migrations 274–278) ───────────────────────────────
 *   CanonicalLensV2          → v_canonical_lenses / v_canonical_lenses_premium
 *   CanonicalWithPricing     → v_canonical_lenses_pricing / _premium_pricing
 *   PrescriptionSearchResult → rpc_canonical_for_prescription (5 params)
 *   CanonicalDetail          → rpc_canonical_detail (2 params)
 *
 * ─── Catálogo (migrations 111, 210, 214) ────────────────────────────────────
 *   VCatalogLens      → public.v_catalog_lenses
 *   VCatalogLensStats → public.v_catalog_lens_stats
 *   VBrand            → public.v_brands (rpc_brands_list)
 *   VContactLens      → public.v_contact_lenses
 *   RpcLensSearchResult     → public.rpc_lens_search
 *   RpcContactLensSearchResult → public.rpc_contact_lens_search
 */

// ============================================================================
// NOVO BANCO — ENUMS  (migration 002_types_and_enums.sql)
// ============================================================================

/** Tipos de lente disponíveis no novo banco */
export type LensType =
  | 'single_vision'
  | 'multifocal'
  | 'bifocal'
  | 'reading'
  | 'occupational';

/** Materiais de lente disponíveis no novo banco */
export type LensMaterialType =
  | 'cr39'
  | 'polycarbonate'
  | 'trivex'
  | 'high_index'
  | 'glass'
  | 'acrylic';

/** Status de registro (inventory.record_status) */
export type RecordStatus = 'active' | 'inactive' | 'archived';

// ============================================================================
// NOVO BANCO — VIEW: public.v_catalog_lenses  (schema real confirmado 2026-02)
// ============================================================================

/**
 * Linha da view pública `public.v_catalog_lenses`.
 * JWT-tenant-filtered via current_tenant_id(); funciona na app com usuário logado.
 * Colunas confirmadas via information_schema — não adicionar campos que não existem.
 *
 * Joins internos da view:
 *   catalog_lenses.lenses ← base (3698 linhas em prod)
 *   catalog_lenses.brands         (INNER JOIN por brand_id)
 *   catalog_lenses.lens_materials (INNER JOIN por material_id)
 *   sales_finance.suppliers       (INNER JOIN por supplier_id)
 *   catalog_lenses.lens_matrices  (LEFT JOIN por matrix_id)
 *   lens_treatment_links lateral  (LEFT JOIN — agrega tratamentos)
 */
export interface VCatalogLens {
  // ── UUIDs (chaves)
  id: string;
  tenant_id: string | null;
  supplier_id: string | null;        // → sales_finance.suppliers.id
  brand_id: string | null;
  material_id: string | null;
  matrix_id: string | null;
  group_id: string | null;

  // ── Marca (via brands JOIN)
  brand_name: string | null;
  brand_slug: string | null;
  brand_is_premium: boolean | null;

  // ── Material (via lens_materials JOIN)
  material_name: string | null;      // ex: "CR39 1.50", "HIGH_INDEX 1.67"
  refractive_index: number | null;   // 1.50 | 1.56 | 1.59 | 1.61 | 1.67 | 1.74

  // ── Fornecedor (via sales_finance.suppliers JOIN)
  supplier_name: string | null;

  // ── Faixas de prescrição (via lens_matrices LEFT JOIN)
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;

  // ── Identificação da lente
  sku: string | null;
  slug: string | null;
  lens_name: string | null;
  normalized_name: string | null;
  lens_type: string | null;          // single_vision | multifocal | bifocal | occupational
  category: string | null;

  // ── Tratamentos (lateral aggregate)
  treatment_names: string[] | null;  // ex: ["Anti-Reflexo", "Filtro UV"]
  treatment_ids: string[] | null;

  // ── Flags booleanos de tratamento (derivados do lateral)
  anti_reflective: boolean | null;
  anti_scratch: boolean | null;
  uv_filter: boolean | null;
  blue_light: boolean | null;
  photochromic: boolean | null;      // boolean (não string)
  polarized: boolean | null;

  // ── Preços
  price_cost: number | null;
  price_suggested: number | null;

  // ── Estoque
  stock_available: number | null;
  stock_minimum: number | null;
  lead_time_days: number | null;

  // ── Metadados
  is_premium: boolean | null;
  status: string | null;
  attributes: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_catalog_lens_groups (derived)
// ============================================================================

/**
 * Grupo canônico de lentes — view public.v_catalog_lens_groups (migration 076).
 * Campos reais: id, tenant_id, name, lens_type, material, refractive_index,
 *               is_premium, supplier_lab_id, created_at, updated_at
 * NOTA: is_active NÃO existe na view (já filtra deleted_at IS NULL).
 */
export interface VCatalogLensGroup {
  id: string;
  tenant_id: string;
  name: string;
  lens_type: string | null;
  material: string | null;
  refractive_index: number | null;
  is_premium: boolean;
  supplier_lab_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_brands (migration 210)
// ============================================================================

export interface VBrand {
  brand_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  manufacturer_name: string | null;
  is_premium: boolean;
  brand_scope: 'ophthalmic' | 'contact' | 'both';
  is_active: boolean;
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_contact_lenses (migration 214)
// ============================================================================

export interface VContactLens {
  id: string;
  tenant_id: string;
  brand_id: string;
  brand_name: string;
  manufacturer_name: string | null;
  product_name: string;
  slug: string;
  sku: string | null;
  lens_type: string;
  purpose: string;
  material: string;
  diameter: number | null;
  base_curve: number | null;
  dk_t: number | null;
  water_content: number | null;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  uv_protection: boolean;
  is_colored: boolean;
  available_colors: string[] | null;
  usage_days: number | null;
  units_per_box: number;
  price_cost: number;
  price_suggested: number;
  stock_available: number;
  lead_time_days: number;
  is_premium: boolean;
  status: string;
  created_at: string;
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_canonical_lenses (migration 212)
// ============================================================================

export interface VCanonicalLens {
  canonical_lens_id: string;
  canonical_name: string;
  fingerprint: string;
  is_premium: boolean;
  slug: string | null;
  lens_type: string;
  material: string;
  refractive_index: number;
  category: string | null;
  anti_reflective: boolean;
  anti_scratch: boolean;
  uv_filter: boolean;
  blue_light: boolean;
  photochromic: string | null;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  global_mapped_count: number;
  global_supplier_count: number;
  has_premium_mapping: boolean;
  tenant_mapped_count: number;
  tenant_min_price: number | null;
  tenant_max_price: number | null;
  created_at: string;
}

export interface VCanonicalLensOption {
  canonical_lens_id: string;
  canonical_name: string;
  lens_id: string;
  lens_name: string;
  brand_name: string | null;
  is_premium: boolean;
  supplier_id: string;
  supplier_name: string | null;
  price_cost: number;
  final_price: number;
  lead_time_days: number;
  stock_available: number;
  confidence_score: number;
  match_method: string;
  lens_type: string;
  material: string;
  refractive_index: number;
  anti_reflective: boolean;
  blue_light: boolean;
  photochromic: string | null;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  is_preferred: boolean;
  effective_markup: number | null;
  margin_percent: number | null;
  has_discount: boolean;
  mapped_at: string;
}

// ============================================================================
// CANONICAL ENGINE v2 — Views e RPCs (migrations 274–278)
// ============================================================================

/**
 * Linha da view public.v_canonical_lenses ou v_canonical_lenses_premium.
 * Motor Canônico v2 — SKU legível, sem categoria no fingerprint.
 * Standard: CST + 6 dígitos | Premium: CPR + 6 dígitos.
 */
export interface CanonicalLensV2 {
  id: string;
  sku: string;                     // ex: "CST847392" | "CPR319204"
  fingerprint: string;
  canonical_name: string;
  lens_type: string;               // single_vision | multifocal | bifocal | ...
  material_class: string;          // cr39 | polycarbonate | high_index | trivex
  refractive_index: number;        // 1.50 | 1.56 | 1.67 | ...
  material_display: string;        // ex: "CR39 1.50" | "Policarbonato 1.59"
  treatment_codes: string[];       // ex: ["ar", "scratch", "blue"]
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  mapped_lens_count: number;       // total de lentes mapeadas neste conceito
  mapped_supplier_count: number;
  mapped_brand_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Views v_canonical_lenses_pricing / v_canonical_lenses_premium_pricing.
 * Junta conceitos canônicos com pricing_book — inclui faixas de preço e markup.
 */
export interface CanonicalWithPricing extends CanonicalLensV2 {
  price_min: number | null;        // menor sell_price entre lentes do conceito
  price_max: number | null;        // maior sell_price
  price_avg: number | null;        // média de sell_price
  cost_min: number | null;         // menor cost_price
  cost_max: number | null;         // maior cost_price
  cost_avg: number | null;         // média de cost_price
  markup_min: number | null;       // menor effective_markup
  markup_max: number | null;       // maior effective_markup
}

/**
 * Resultado de rpc_canonical_for_prescription (migration 278).
 * Conceitos canônicos que cobrem uma determinada receita oftalmológica.
 */
export interface PrescriptionSearchResult {
  id: string;
  sku: string;
  canonical_name: string;
  lens_type: string;
  material_class: string;
  refractive_index: number;
  material_display: string;
  treatment_codes: string[];
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  tenant_lens_count: number;       // qtd de lentes do tenant neste conceito
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
  cost_min: number | null;
  cost_max: number | null;
  markup_min: number | null;
  markup_max: number | null;
}

/**
 * Resultado de rpc_canonical_detail (migration 278).
 * Lentes reais mapeadas para um conceito canônico, com preços do tenant.
 */
export interface CanonicalDetail {
  lens_id: string;
  lens_sku: string | null;
  lens_name: string;
  brand_name: string | null;
  supplier_name: string | null;
  sell_price: number;
  cost_price: number;
  final_price: number;
  effective_markup: number | null;
  is_preferred: boolean;
  match_method: string;
}

/**
 * CanonicalDetail enriquecido com dados técnicos reais de v_catalog_lenses.
 * Gerado no server load ao cruzar rpc_canonical_detail + v_catalog_lenses.
 */
export interface CanonicalDetailEnriched extends CanonicalDetail {
  anti_reflective?: boolean;
  anti_scratch?: boolean;
  uv_filter?: boolean;
  blue_light?: boolean;
  photochromic?: boolean;        // boolean — confirmado via information_schema
  polarized?: boolean;
  refractive_index?: number | null;
  material_name?: string | null;  // coluna real em v_catalog_lenses (não "material")
}

// ============================================================================
// NOVO BANCO — RPC: public.rpc_contact_lens_search (migration 214)
// ============================================================================

export interface RpcContactLensSearchResult {
  id: string;
  brand_name: string;
  manufacturer_name: string | null;
  is_premium: boolean;
  product_name: string;
  slug: string;
  lens_type: string;
  purpose: string;
  material: string;
  is_colored: boolean;
  available_colors: string[] | null;
  units_per_box: number;
  price_suggested: number;
  usage_days: number | null;
  dk_t: number | null;
  stock_available: number;
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_catalog_lens_stats  (migration 271 + 280)
// ============================================================================

/**
 * Campos REAIS da view public.v_catalog_lens_stats (migration 271).
 * Confirmados via curl em 2026-02-26.
 * Tenant filter corrigido com COALESCE na migration 280.
 */
export interface VCatalogLensStats {
  total: number;
  premium: number;
  economica: number;
  with_ar: number;
  with_blue: number;
  with_uv: number;
  with_photochromic: number;
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
  suppliers_count: number;
  brands_count: number;
  materials_count: number;
}

// ============================================================================
// NOVO BANCO — RPC: public.rpc_lens_search (assinatura real confirmada 2026-02)
// ============================================================================

/**
 * Resultado de public.rpc_lens_search.
 * Retorno confirmado via pg_get_function_result:
 *   id, lens_name, lens_type, brand_name, material_name, refractive_index,
 *   supplier_name, spherical_min/max, cylindrical_min/max, addition_min/max,
 *   treatment_names text[], anti_reflective, blue_light,
 *   price_cost, price_suggested, lead_time_days, is_premium, category
 *
 * Parâmetros aceitos:
 *   p_lens_type text, p_material_id uuid, p_price_min/max numeric,
 *   p_has_ar boolean, p_has_blue boolean, p_supplier_id uuid,
 *   p_brand_name text, p_limit int, p_offset int, p_tenant_id uuid
 */
export interface RpcLensSearchResult {
  id: string;
  lens_name: string;
  lens_type: string | null;
  brand_name: string | null;
  material_name: string | null;      // era "material" — campo real é material_name
  refractive_index: number | null;
  supplier_name: string | null;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  treatment_names: string[] | null;
  anti_reflective: boolean | null;
  blue_light: boolean | null;
  price_cost: number | null;
  price_suggested: number | null;
  lead_time_days: number | null;
  is_premium: boolean | null;
  category: string | null;
}

// ============================================================================
// CANONICAL ENGINE v3 — Filtros Estruturados (migration 0074)
// ============================================================================

/** Item de filtro retornado pelas RPCs de filter_options */
export interface FilterOption {
  value: string;
  count: number;
}

/** Item de material retornado pelas RPCs de filter_options */
export interface MaterialFilterOption {
  id: string;
  name: string;
  index: number;
  count: number;
  class?: string;
}

/** Item de tratamento retornado pelas RPCs de filter_options */
export interface TreatmentFilterOption {
  code: string;
  count: number;
}

/** Faixa de preço retornada pelas RPCs de filter_options */
export interface PriceRange {
  min: number;
  max: number;
  avg: number;
}

/** Resposta da rpc_premium_filter_options */
export interface PremiumFilterOptions {
  brands: FilterOption[] | null;
  product_lines: FilterOption[] | null;
  lens_types: FilterOption[] | null;
  materials: MaterialFilterOption[] | null;
  coatings: FilterOption[] | null;
  photochromics: FilterOption[] | null;
  treatments: TreatmentFilterOption[] | null;
  price_range: PriceRange | null;
  total_count: number;
}

/** Resposta da rpc_standard_filter_options */
export interface StandardFilterOptions {
  lens_types: FilterOption[] | null;
  materials: MaterialFilterOption[] | null;
  treatments: TreatmentFilterOption[] | null;
  supplier_range: { min_suppliers: number; max_suppliers: number } | null;
  prescription_ranges: {
    sph_min: number; sph_max: number;
    cyl_min: number; cyl_max: number;
    add_min: number | null; add_max: number | null;
  } | null;
  price_range: PriceRange | null;
  total_count: number;
}

/**
 * Item da public.v_canonical_premium (wrapper v3 para catalog_lenses.v_canonical_premium).
 * 28 colunas — inclui brand/product_line/coating_name/photochromic_type e pricing agregado.
 */
export interface CanonicalPremiumV3 {
  id: string;
  canonical_name: string;
  sku: string | null;
  brand: string;
  product_line: string | null;
  coating_name: string | null;
  photochromic_type: string | null;
  lens_type: string;
  canonical_material_id: string;
  material_name: string;
  material_class: string;
  refractive_index: number;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  treatment_codes: string[];
  mapped_lens_count: number;
  mapped_supplier_count: number;
  mapped_brand_count: number;
  fingerprint: string;
  created_at: string;
  updated_at: string;
  // Pricing agregado (sales_finance.pricing_book)
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
}

/**
 * Item da public.v_canonical_standard (wrapper v3 para catalog_lenses.v_canonical_standard).
 * 23 colunas — sem marca por design; inclui pricing agregado.
 */
export interface CanonicalStandardV3 {
  id: string;
  canonical_name: string;
  sku: string | null;
  lens_type: string;
  canonical_material_id: string;
  material_name: string;
  material_class: string;
  refractive_index: number;
  spherical_min: number | null;
  spherical_max: number | null;
  cylindrical_min: number | null;
  cylindrical_max: number | null;
  addition_min: number | null;
  addition_max: number | null;
  treatment_codes: string[];
  mapped_lens_count: number;
  mapped_supplier_count: number;
  fingerprint: string;
  created_at: string;
  updated_at: string;
  // Pricing agregado
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
}

/** Resposta genérica de busca com paginação */
export interface CanonicalSearchResult<T> {
  total: number;
  items: T[];
}

// ============================================================================
// NOVO BANCO — VIEW: public.v_canonical_lens_mapping (N:1 lens → canonical)
// ============================================================================

/**
 * Mapping N:1 — toda lente real pertence a EXATAMENTE UM conceito canônico.
 * View pública combina catalog_lenses.canonical_lens_mappings (standard) e
 * canonical_lens_mappings_premium sob uma única flag is_premium.
 */
export interface VCanonicalLensMapping {
  lens_id: string;
  canonical_lens_id: string;
  tenant_id: string | null;
  confidence_score: number | null;
  match_method: string | null;
  is_preferred: boolean | null;
  is_premium: boolean;
}

// =====================================================================
// rpc_lens_edit_options — payload do form de edição de lente real
// =====================================================================

export interface LensEditBrand {
  id: string;
  name: string;
  is_global_premium: boolean | null;
}

export interface LensEditMaterial {
  id: string;
  name: string;
  refractive_index: number | null;
}

export interface LensEditSupplier {
  id: string;
  name: string;
  category: string | null;
}

export interface LensEditTreatment {
  id: string;
  name: string;
  code: string | null;
  additional_price: number | null;
}

export interface LensEditEnumOption {
  value: string;
  label: string;
}

export interface LensEditOptions {
  brands: LensEditBrand[];
  materials: LensEditMaterial[];
  suppliers: LensEditSupplier[];
  treatments: LensEditTreatment[];
  lens_types: LensEditEnumOption[];
  statuses: LensEditEnumOption[];
}

// =====================================================================
// rpc_canonical_price_tiers — faixas de preço por custo efetivo (doc 14)
// Tiers de ~30% de spread sobre o custo COM acordos de laboratório vigentes.
// =====================================================================

export interface CanonicalPriceTierLens {
  lens_id: string;
  lens_name: string;
  sku: string | null;
  supplier: string | null;
  eff_cost: number;
  base_cost: number;
  sell_price: number | null;
  is_preferred: boolean;
  has_discount: boolean;
}

export interface CanonicalPriceTier {
  tier: number;
  lens_count: number;
  cost_min: number;
  cost_max: number;
  sell_min: number | null;
  sell_max: number | null;
  lenses: CanonicalPriceTierLens[];
}

export interface CanonicalPriceTiers {
  canonical_id: string;
  is_premium: boolean;
  payment: string;
  spread_pct: number;
  tier_count: number;
  tiers: CanonicalPriceTier[];
}

