-- #############################################################################
-- ###  CANCELADA 17/09/2026 PELO DONO — palco real; NÃO APLICAR.             ###
-- ###  Ordem (canal do eco, 17/09 00h50): "trabalhar com nossos dados reais, ###
-- ###  sempre; o pode tem que ser sempre nos dados da tenant real."          ###
-- ###  O pitch usa o tenant Grupo Mello. Nada deste arquivo foi aplicado     ###
-- ###  (ensaio revertido; 0 linhas 'demo:' em qualquer tenant, conferido).   ###
-- #############################################################################
-- =============================================================================
-- PROPOSTA — massa sintética do Lens para a demonstração (tenant Ótica Olhar Certo)
-- =============================================================================
-- De: agente do clearix_lens · 16/09/2026 · pedido do eco (pacote "massa sintética de demo")
-- Status: PROPOSTA ENSAIADA — NÃO APLICADA. Aplica só com o "pode" do dono na sessão do Lens.
-- Tenant: 2c72ff48-4d35-449d-b00a-459aebb52306 (Ótica Olhar Certo — Sorocaba/SP, sintético)
--
-- POR QUE
--   O pitch de 20 min (Cockpit/comercial/pitch-20min-anamnese-2026-09-16.md) tem duas linhas do Lens
--   sem massa no sintético: "acordo de laboratório" (0 acordos) e "lente de contato" (0 lentes).
--   Ver clearix_lens/_ANAMNESE_2026-09-16_DUVIDAS_E_SOLUCOES.md.
--
-- O QUE CRIA (só neste tenant, nada mais)
--   catalog_lenses.lab_agreements — 3 acordos, source = 'demo:massa-sintetica-2026-09'
--     1. Cristalvis Óptica · comercial · SKU LS222271 (Varilux Comfort Max Orma 1.50 — Crizal Prevencia)
--        preço de tabela 1.005,30 (base 1.117,00). A MESMA lente na PuroFoco (BR-LS222271) custa
--        1.117,00 → na tela, a mesma lente em 2 laboratórios, e o acordo decide.
--     2. Spectra Óptica · comercial · linha "Sygma Prime 1.67" · -8%. Na canônica
--        "Multifocal Alto Índice 1.67 AR" a Spectra (385,00) passa a 354,20 e fica abaixo da
--        Aurora (370,00).
--     3. PuroFoco Laboratório · financeiro · laboratório inteiro · -3% à vista.
--   catalog_lenses.contact_lenses — 12 linhas
--     8 produtos na Miralens Distribuição (source_system = 'demo:massa-sintetica-2026-09',
--     legacy_key demo-cl-01..08, SKU LC###### gerado pelo gatilho). 4 deles também na
--     OptiNova Distribuidora, no padrão da B&L/Central: SKU 'ON-' || SKU original,
--     source_system 'dup:optinova', legacy_key = id do original → o Lens mostra "onde mais é
--     vendida" e trava a edição na cópia; o gatilho 370 espelha o preço.
--     Custos inventados, em números redondos (não são os da operação); venda = custo × 3,2 (gatilho).
--     Nomes de produto são os comerciais públicos; nenhuma especificação de grau inventada.
--
-- O QUE NÃO FAZ
--   Não cria, altera, pausa nem apaga laboratório, fornecedor, lente oftálmica, canônica ou OS.
--   Usa os 5 fornecedores que já existem no tenant, todos com laboratório ativo
--   (combinado com o DCL: mensagem de 16/09, aguardando confirmação de que a massa dele usa os
--   mesmos laboratórios).
--   Não libera o Lens para o tenant: isso é a proposta do eco (Olhar Certo → enterprise).
--
-- ENSAIO (16/09/2026, DO block terminado em RAISE → revertido; conferido depois: 0 linhas no tenant)
--   fora_do_tenant_alterado = 0
--     antes : acordos Mello 381 · contato Mello 286 · contato 21e939b7… 25
--     depois: os mesmos + acordos Olhar Certo 3 · contato Olhar Certo 12
--   custo efetivo (catalog_lenses.fn_effective_cost), como admin do sintético:
--     Varilux: Cristalvis 1.005,30 · PuroFoco 1.117,00 · PuroFoco à vista 1.083,49
--     Sygma Prime 1.67: Spectra 354,20 · Aurora 370,00
--   rpc_canonical_price_tiers(CPR204420_oc): Cristalvis has_discount=true, eff_cost 1.005,30
--     → a tela /premium/[id] mostra "1 em promoção de laboratório"
--   v_contact_lenses: 12 visíveis · 4 cópias com original achado pela regra do SKU ·
--   rpc_contact_lens_search('Oasys') = 4 · 4 cópias com preço igual ao original
--
-- ACHADO NO CAMINHO (não corrigido aqui)
--   A canônica sintética CST486399_oc "Visão Simples CR39 1.50 Incolor", que a anamnese citava,
--   mistura lente SOLAR (Brasilor Lente Pronta Solar, EXPRESS Solar Plana) com incolor: o
--   sintético foi clonado antes da canonização V4 (317/319). Para a demo, trocar pelas duas
--   canônicas acima (limpas).
-- =============================================================================


-- ─── APLICAÇÃO ───────────────────────────────────────────────────────────────
DO $$
DECLARE
  t            uuid := '2c72ff48-4d35-449d-b00a-459aebb52306';
  tag          text := 'demo:massa-sintetica-2026-09';
  s_cristalvis uuid := '54ca9596-e34f-4272-b2b9-809c9d41153a';
  s_spectra    uuid := 'd16c07ac-b309-4939-8655-cff8fe27795e';
  s_purofoco   uuid := 'f82ec111-289b-4a22-ae9f-306027ca7d13';
  s_miralens   uuid := 'a93b5138-d3ad-45a5-b341-ffefc894c22c';
  s_optinova   uuid := '9617a5f7-e717-46ec-ba2c-42b6056ccc4d';
  nota         text := 'Massa sintética de demonstração (tenant Ótica Olhar Certo) — não é acordo real';
  v_lens_varilux uuid; v_n int;
  v_antes jsonb; v_depois jsonb; v_fora int;
BEGIN
  SELECT jsonb_object_agg(k, v) INTO v_antes FROM (
    SELECT 'acordos:'||tenant_id AS k, count(*) AS v FROM catalog_lenses.lab_agreements GROUP BY tenant_id
    UNION ALL SELECT 'contato:'||tenant_id, count(*) FROM catalog_lenses.contact_lenses GROUP BY tenant_id) x;

  IF EXISTS (SELECT 1 FROM catalog_lenses.lab_agreements WHERE tenant_id=t AND source=tag AND deleted_at IS NULL)
     OR EXISTS (SELECT 1 FROM catalog_lenses.contact_lenses WHERE tenant_id=t AND source_system=tag AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'massa sintética já aplicada neste tenant';
  END IF;

  SELECT count(*) INTO v_n
    FROM sales_finance.suppliers s
    JOIN production.laboratories l ON l.supplier_id=s.id AND l.tenant_id=t AND l.is_active AND l.deleted_at IS NULL
   WHERE s.tenant_id=t AND s.deleted_at IS NULL
     AND s.id IN (s_cristalvis, s_spectra, s_purofoco, s_miralens, s_optinova);
  IF v_n <> 5 THEN RAISE EXCEPTION 'esperava 5 fornecedores com laboratório ativo no tenant, achei %', v_n; END IF;

  SELECT id INTO v_lens_varilux FROM catalog_lenses.lenses
   WHERE tenant_id=t AND supplier_id=s_cristalvis AND sku='LS222271' AND deleted_at IS NULL AND status='active';
  IF v_lens_varilux IS NULL THEN RAISE EXCEPTION 'lente LS222271 (Cristalvis) não encontrada'; END IF;

  INSERT INTO catalog_lenses.lab_agreements
    (tenant_id, supplier_id, agreement_kind, campaign_name, scope_kind, lens_id, lens_sku, product_line,
     override_cost, discount_pct, payment_condition, valid_from, valid_to, source, notes)
  VALUES
    (t, s_cristalvis, 'comercial',  'Campanha Varilux (demo)', 'sku',          v_lens_varilux, 'LS222271', NULL,
     1005.30, NULL, 'qualquer', DATE '2026-09-01', DATE '2026-12-31', tag, nota),
    (t, s_spectra,    'comercial',  'Sygma Prime -8% (demo)',  'product_line', NULL, NULL, 'Sygma Prime 1.67',
     NULL, 8, 'qualquer', DATE '2026-09-01', DATE '2026-12-31', tag, nota),
    (t, s_purofoco,   'financeiro', 'À vista -3% (demo)',      'supplier',     NULL, NULL, NULL,
     NULL, 3, 'avista',   DATE '2026-09-01', DATE '2026-12-31', tag, nota);

  WITH src(ordem, marca, nome, tipo, fin, mat, un, dias, custo, colorida, tambem_optinova) AS (VALUES
      (1, 'Acuvue',     'Acuvue Oasys',                   'quinzenal', 'visao_simples', 'silicone_hidrogel',  6, 14, 118.00, false, true),
      (2, 'Acuvue',     'Acuvue Oasys para Astigmatismo', 'quinzenal', 'torica',        'silicone_hidrogel',  6, 14, 165.00, false, true),
      (3, 'Air Optix',  'Air Optix Plus HydraGlyde',      'mensal',    'visao_simples', 'silicone_hidrogel',  6, 30, 105.00, false, true),
      (4, 'Biofinity',  'Biofinity',                      'mensal',    'visao_simples', 'silicone_hidrogel',  6, 30, 112.00, false, true),
      (5, 'Dailies',    'Dailies Total1',                 'diaria',    'visao_simples', 'silicone_hidrogel', 30,  1, 210.00, false, false),
      (6, 'Soflens',    'Soflens 59',                     'mensal',    'visao_simples', 'hidrogel',           6, 30,  62.00, false, false),
      (7, 'Solflex',    'Solflex Natural Colors',         'mensal',    'cosmetica',     'hidrogel',           2, 30,  48.00, true,  false),
      (8, 'Biotrue',    'Biotrue ONEday',                 'diaria',    'visao_simples', 'hidrogel',          30,  1, 150.00, false, false)
  ), marcas AS (
    SELECT src.*, (SELECT b.id FROM catalog_lenses.brands b
                    WHERE b.tenant_id=t AND b.deleted_at IS NULL AND lower(b.name)=lower(src.marca)
                    ORDER BY b.created_at, b.id LIMIT 1) AS brand_id
      FROM src
  ), ins AS (
    INSERT INTO catalog_lenses.contact_lenses
      (tenant_id, brand_id, product_name, lens_type, purpose, material, units_per_box, usage_days,
       price_cost, is_colored, supplier_id, lead_time_days, status, source_system, legacy_key)
    SELECT t, m.brand_id, m.nome, m.tipo::catalog_lenses.contact_lens_type, m.fin::catalog_lenses.contact_lens_purpose,
           m.mat::catalog_lenses.contact_lens_material, m.un, m.dias, m.custo, m.colorida, s_miralens, 3, 'active',
           tag, 'demo-cl-' || lpad(m.ordem::text, 2, '0')
      FROM marcas m
    RETURNING id, sku, slug, product_name, brand_id, lens_type, purpose, material, units_per_box, usage_days, price_cost, is_colored
  )
  INSERT INTO catalog_lenses.contact_lenses
    (tenant_id, brand_id, product_name, lens_type, purpose, material, units_per_box, usage_days,
     price_cost, is_colored, supplier_id, lead_time_days, status, sku, slug, source_system, legacy_key)
  SELECT t, i.brand_id, i.product_name, i.lens_type, i.purpose, i.material, i.units_per_box, i.usage_days,
         i.price_cost, i.is_colored, s_optinova, 5, 'active', 'ON-' || i.sku, i.slug || '-optinova',
         'dup:optinova', i.id::text
    FROM ins i JOIN src ON src.nome = i.product_name
   WHERE src.tambem_optinova;

  IF EXISTS (SELECT 1 FROM catalog_lenses.contact_lenses WHERE tenant_id=t AND source_system=tag AND brand_id IS NULL) THEN
    RAISE EXCEPTION 'marca não encontrada no tenant';
  END IF;

  -- Prova dentro da aplicação: nenhuma contagem de outro tenant mudou
  SELECT jsonb_object_agg(k, v) INTO v_depois FROM (
    SELECT 'acordos:'||tenant_id AS k, count(*) AS v FROM catalog_lenses.lab_agreements GROUP BY tenant_id
    UNION ALL SELECT 'contato:'||tenant_id, count(*) FROM catalog_lenses.contact_lenses GROUP BY tenant_id) x;
  SELECT count(*) INTO v_fora FROM (
    SELECT d.key FROM jsonb_each(v_depois) d
     WHERE d.key NOT LIKE '%'||t::text AND (v_antes->d.key) IS DISTINCT FROM d.value
    UNION ALL
    SELECT a.key FROM jsonb_each(v_antes) a WHERE NOT (v_depois ? a.key)) z;
  IF v_fora <> 0 THEN RAISE EXCEPTION 'alterou % contagem(ns) fora do tenant sintético — abortado', v_fora; END IF;
  IF (v_depois->>('acordos:'||t))::int IS DISTINCT FROM 3
     OR (v_depois->>('contato:'||t))::int IS DISTINCT FROM 12 THEN
    RAISE EXCEPTION 'contagem inesperada no tenant: %', v_depois;
  END IF;
END $$;


-- ─── CONFERÊNCIA DEPOIS DE APLICAR (só leitura) ─────────────────────────────
-- SELECT scope_kind, agreement_kind, campaign_name, override_cost, discount_pct, payment_condition
--   FROM catalog_lenses.lab_agreements
--  WHERE tenant_id='2c72ff48-4d35-449d-b00a-459aebb52306' AND source='demo:massa-sintetica-2026-09';
-- SELECT sku, product_name, price_cost, price_suggested, source_system
--   FROM catalog_lenses.contact_lenses
--  WHERE tenant_id='2c72ff48-4d35-449d-b00a-459aebb52306' ORDER BY product_name, sku;


-- ─── ROLLBACK (só com "pode"; recusa se alguma OS apontar para a massa) ──────
-- DO $$
-- DECLARE t uuid := '2c72ff48-4d35-449d-b00a-459aebb52306'; tag text := 'demo:massa-sintetica-2026-09';
-- BEGIN
--   IF EXISTS (SELECT 1 FROM production.orders o
--               WHERE o.tenant_id=t AND o.canonical_group_id IN (
--                 SELECT id FROM catalog_lenses.contact_lenses
--                  WHERE tenant_id=t AND (source_system=tag OR source_system='dup:optinova'))) THEN
--     RAISE EXCEPTION 'há OS apontando para lente de contato da massa — inativar em vez de apagar';
--   END IF;
--   DELETE FROM catalog_lenses.contact_lenses d
--    WHERE d.tenant_id=t AND d.source_system='dup:optinova'
--      AND d.legacy_key IN (SELECT id::text FROM catalog_lenses.contact_lenses WHERE tenant_id=t AND source_system=tag);
--   DELETE FROM catalog_lenses.contact_lenses WHERE tenant_id=t AND source_system=tag;
--   DELETE FROM catalog_lenses.lab_agreements WHERE tenant_id=t AND source=tag;
-- END $$;
