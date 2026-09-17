# Medição — o que um token de paciente lê e escreve no banco (17/09/2026)

**De:** agente do `clearix_lens` · **Para:** dono, via eco · **Pedido:** eco, pendência de 25/08
(`Cockpit/Spec/_prompts/lens-fechar-catalogo-fisico-ao-paciente.md`) reaberta pelo Paciente.
**Projeto:** `mhgbuplnxtfgipbemchb` · **Tenant:** Grupo Mello (`6292c9f0-…`).
**Nada foi gravado:** todo teste rodou dentro de um DO terminado em `RAISE`, que desfaz tudo; o estado foi conferido depois.

## Como medi

- **Token de paciente, simulado com chamada real** (não superusuário): `SET LOCAL ROLE authenticated` + claims
  `role=authenticated`, `role_code=paciente`, `tenant_id` da Mello e `sub` que não existe em `iam.users`.
  O eco confirmou no código do portal (`token-access.ts`) o formato real: `role: 'authenticated'`, `role_code: 'patient'`,
  `tenant_id`. A diferença `paciente`×`patient` não muda nada: nenhuma superfície abaixo olha `role_code`, e o portão
  proposto nega pela ausência em `iam.users`, não pelo nome do papel.
- Resultado: `current_tenant_id()` = tenant da Mello; `current_role_code()` = NULL.
- **Controles:** o mesmo teste com o admin da Mello (vê tudo) e com `anon` (sem tenant).
- **Views:** todas as de `public` com SELECT para `authenticated` que leem `catalog_lenses` ou têm nome de lente, preço ou
  canônica (48). Contagem com `LIMIT 3000` por view, então "3000" quer dizer "3000 ou mais".
- **Via direta à tabela:** morta. O schema `catalog_lenses` não está exposto no PostgREST
  (`pgrst.db_schemas = public, graphql_public, agency`); só `public` é superfície.

## 1. ESCRITA — o mais grave

| RPC chamada como paciente | Resposta | Efeito (desfeito) |
|---|---|---|
| `rpc_update_contact_lens_price(LC101008, custo+1, 999,99)` | `{"ok":true,"updated":1}` | custo 273,64 → **274,64** |
| `rpc_lab_campaign_cancel(Brascor, "Promo Especial 2026 Brascor")` | `{"canceladas":38}` | **38 acordos cancelados** |

Conferido depois: LC101008 continua 273,64 / 875,65; a promoção Brascor tem 38 ativas; acordos ativos 319.

**Causa:** 17 funções de `public` que escrevem em `catalog_lenses` são SECURITY DEFINER, filtram só por
`current_tenant_id()` e **não têm portão de papel**:
- preço e cadastro de lente: `rpc_update_lens_price`, `rpc_update_lens_full`, `rpc_update_lens_prescription_range`,
  `rpc_update_lens_treatments`, `rpc_update_contact_lens_price`, `rpc_update_contact_lens_specs`;
- acordos de laboratório: `rpc_lab_agreements_import`, `rpc_lab_campaign_cancel`;
- livro de preço: `rpc_pricing_create_discount`, `rpc_pricing_expire_discount`, `rpc_pricing_upsert_profile`,
  `rpc_pricing_recalc_all`, `rpc_pricing_recalc_stale`;
- cadastro: `rpc_brands_upsert_settings`, `rpc_canonical_upsert_supplier_preference`;
- importação: `rpc_etl_contact_lenses_from_csv`, `rpc_etl_populate_supplier_crosswalk`.

`anon` não executa nenhuma (fechado na 372).

## 2. LEITURA de custo por RPC (como paciente)

| RPC | O que devolveu ao paciente |
|---|---|
| `rpc_contact_lens_detail` | a lente de contato inteira, com `price_cost` |
| `rpc_canonical_price_tiers` | `base_cost` e `eff_cost` por laboratório (ex.: TECHNOPARK 249 → 127 com acordo) |
| `rpc_canonical_best_purchase` | opções de compra com `eff_cost` |
| `rpc_canonical_detail` | lentes reais da canônica (2 linhas) |

Pela varredura estática, também tocam custo sem portão: `rpc_canonical_for_prescription`, `rpc_lab_agreements_validate`,
`rpc_lens_search`, `search_lenses`, `rpc_pricing_simulate`, `rpc_pricing_simulate_curve`.

## 3. LEITURA por view — lista completa medida

### Com dado pessoal ou financeiro (fora do Lens: DCL, Finance, BI)

| View | Paciente lê | Colunas sensíveis | Dono |
|---|---|---|---|
| `v_production_orders_kanban` | **3000+** | `customer_name`, `customer_phone`, `customer_cpf`, `customer_name_snapshot`, `frame_cost`, `lens_cost`, `lenses_total_cost`, `service_cost`, `assembly_cost`, `accessory_unit_cost`, `custo_sem_compra` | DCL |
| `v_sf_transactions_consolidated` | **3000+** | lançamentos financeiros (`cost_center_*`; colunas não detalhadas por mim) | Finance |
| `v_bi_lente_desalinhada` | 619 | `lenses_total_cost` | BI |

### Catálogo e preço, com custo (Lens)

| View | Paciente lê | Colunas de custo | anon lê? |
|---|---|---|---|
| `v_contact_lenses` | 274 | `price_cost` | não |
| `v_pricing_book` | 3000+ | `cost_price`, `effective_markup`, `margin_absolute`, `margin_percent` | grant sim, 0 linhas sem tenant |
| `v_pricing_audit_log` | 3000+ | `cost_price_before/after`, `effective_markup_before/after` | grant sim, 0 linhas |
| `v_pricing_curve_verification` | 3000+ | `custo`, `markup` | grant sim, 0 linhas |
| `v_catalog_canonical_all` | 2.195 | `cost_min`, `cost_max` | não |
| `v_canonical_lenses_premium_pricing` | 1.843 | `cost_min`, `cost_max`, `cost_avg`, `markup_min`, `markup_max` | grant sim, 0 linhas |
| `v_canonical_lenses_pricing` | 351 | idem | grant sim, 0 linhas |
| `v_pricing_curve_analysis` | 7 | `cost_band`, `cost_min`, `cost_max`, `markup_*`, `avg_margin_pct` | grant sim, 0 linhas |
| `v_pricing_organism_health` | 4 | `custo_min`, `custo_max`, `markup_medio` | grant sim, 0 linhas |
| `v_global_catalog_summary` | 2 | `markup` | **SIM, 2 linhas** |
| `v_contact_pricing_health` | 1 | `custo_min`, `custo_max`, `markup_real_medio` | **SIM, 1 linha** |

### Catálogo sem custo (Lens) — o paciente lê, mas o que expõe é catálogo e preço de venda

`v_canonical_lens_mapping` (3000+), `v_catalog_strategy_map` (3000+), `v_catalog_canonical_groups` (2.132),
`v_catalog_canonical_groups_by_prescription` (2.132), `v_catalog_canonical_groups_complete` (2.132),
`v_catalog_canonicas_sem_opcao` (2.022), `v_canonical_lenses_premium` (1.843), `v_canonical_premium` (1.841),
`v_catalog_canonical_groups_premium` (1.841), `v_canonical_lenses` (352), `v_canonical_standard` (291),
`v_production_assembler_pricing` (71), `v_brands_by_manufacturer` (32), `v_catalog_contact_lens_brands` (30),
`v_contact_lens_brand_stats` (30), `v_contact_lens_brand_mapping` (29), `v_lens_distribution` (27),
`v_catalog_lens_materials` (13), `v_sf_payment_method_fees_canonical` (12), `v_catalog_lens_treatments` (8),
`v_system_health_audit` (8), `v_contact_lens_etl_reconciliation` (3; **anon também lê**), `v_catalog_lens_stats` (1).

### Já fechadas (paciente lê 0; portão da 346, 25/08)

`v_catalog_lenses`, `v_catalog_lenses_full`, `v_catalog_contact_lenses`.

## 4. O que já está em andamento

- **Fase 1, escrita (Lens):** `_PROPOSTA_2026-09-17_PORTAO_FUNCIONARIO_CATALOGO_FASE1.sql`, ensaiada e não aplicada.
  Paciente bloqueado em 17 de 17; admin passa; anon 42501. Aguarda o "pode" do dono na sessão do Lens.
- **Fase 2, leitura (Lens):** RPCs e views com custo acima, no padrão 346, fechando também `anon` nas 3 views de saúde.
  Em montagem.
- **DCL, Finance, BI:** o eco mandou medir e fechar as suas no padrão 346.
- **Estrutural (Paciente):** papel de banco próprio de paciente, só com o que o portal usa.
