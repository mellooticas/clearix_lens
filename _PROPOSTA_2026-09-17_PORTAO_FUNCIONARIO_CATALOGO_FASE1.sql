-- =============================================================================
-- PROPOSTA 373 (fase 1) — portão de FUNCIONÁRIO nas RPCs que ESCREVEM no catálogo
-- =============================================================================
-- De: agente do clearix_lens · 17/09/2026 · pedido do eco (pendência de 25/08 reaberta pelo Paciente)
-- Status: PROPOSTA ENSAIADA — NÃO APLICADA. Aplica só com o "pode" do dono na sessão do Lens.
--
-- O PROBLEMA (medido 17/09, chamada real revertida, tenant Grupo Mello)
--   Token de paciente = role `authenticated` + claims role_code=paciente + tenant_id da loja; `sub` não existe
--   em iam.users, então current_role_code() = NULL. As RPCs abaixo são SECURITY DEFINER, filtram só por
--   current_tenant_id() e NÃO têm portão de papel. Provado como paciente:
--     rpc_update_contact_lens_price(LC101008)  → {"ok":true,"updated":1}, custo 273,64 → 274,64
--     rpc_lab_campaign_cancel                   → {"canceladas":38} ("Promo Especial 2026 Brascor")
--   (revertido; conferido depois: 273,64 / 875,65 e 38 ativas; acordos ativos 319)
--
-- O QUE A FASE 1 FAZ
--   1. public.fn_exige_funcionario(): nega com 42501 'AUTH_STAFF' quem não é funcionário.
--      Passa: linha ativa em iam.users no tenant do token (current_role_code(), o mesmo portão da 346);
--      JWT service_role; manutenção (session_user postgres/supabase_admin SEM JWT: SQL Editor, cron, migration).
--      NÃO usa current_user: dentro de SECURITY DEFINER ele é sempre o dono (postgres).
--      Allowlist, não blocklist (R-037): token sem claim, sem tenant ou com role_code inventado é negado.
--   2. PERFORM public.fn_exige_funcionario(); na 1ª linha do bloco principal das 17 RPCs de escrita do
--      catálogo. CREATE OR REPLACE preserva os grants (nada de DROP).
--   3. Backup do corpo original em catalog_lenses._fix373_funcs_antes (rollback abaixo).
--
-- AS 17 RPCs
--   preço/cadastro de lente: rpc_update_lens_price, rpc_update_lens_full, rpc_update_lens_prescription_range,
--     rpc_update_lens_treatments, rpc_update_contact_lens_price, rpc_update_contact_lens_specs
--   acordos de laboratório: rpc_lab_agreements_import, rpc_lab_campaign_cancel
--   livro de preço: rpc_pricing_create_discount, rpc_pricing_expire_discount, rpc_pricing_upsert_profile,
--     rpc_pricing_recalc_all, rpc_pricing_recalc_stale
--   cadastro: rpc_brands_upsert_settings, rpc_canonical_upsert_supplier_preference
--   importação: rpc_etl_contact_lenses_from_csv, rpc_etl_populate_supplier_crosswalk
--
-- QUEM CHAMA HOJE (grep no ecossistema + cron.job, 17/09)
--   clearix_lens (telas /lentes/[id], /contato/[id], lentes-repository) e clearix_import (lab-discounts-form):
--   ambos com sessão de funcionário → passam. Nenhum cron, nenhuma edge function.
--
-- ENSAIO (17/09/2026, DO terminado em RAISE → revertido; conferido: helper não existe, 0 funções com portão)
--   PACIENTE bloqueado em 17 de 17 (falhas 0), todas com 42501 AUTH_STAFF
--   PACIENTE rpc_update_contact_lens_price(LC101008): 42501, custo depois 273,64
--   ADMIN Mello rpc_update_contact_lens_price(id inexistente): {"ok":false,"error":"Lente não encontrada"} (passou do portão)
--   ADMIN Mello rpc_lab_campaign_cancel(inexistente): {"canceladas":0} (passou do portão)
--   SERVICE_ROLE: passa · MANUTENÇÃO (session_user=postgres, sem JWT): passa · ANON: 42501
--   grants: nenhuma das 17 ganhou anon nem perdeu authenticated
--
-- RISCO REGISTRADO
--   super_admin impersonando outro tenant (active_tenant_id) não tem linha em iam.users daquele tenant e fica
--   NEGADO nestas 17 — mesmo comportamento que a 346 já tem nas views do catálogo desde 25/08.
--
-- NÃO FAZ (fase 2, proposta separada): RPCs de LEITURA com custo (rpc_contact_lens_detail,
--   rpc_canonical_price_tiers/_best_purchase/_detail/_for_prescription, rpc_lab_agreements_validate,
--   rpc_lens_search, search_lenses, rpc_pricing_simulate*) e views com custo (v_contact_lenses, v_pricing_*,
--   v_catalog_canonical_all, v_canonical_lenses_*_pricing; 3 abertas a anon). Não toca em fn_lens_customer_name,
--   rpc_paciente_warranty_summary, rpc_production_*, rpc_sf_* (outros apps).
-- =============================================================================


-- ─── APLICAÇÃO ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_lenses._fix373_funcs_antes (
  assinatura text PRIMARY KEY,
  definicao  text NOT NULL,
  salvo_em   timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON catalog_lenses._fix373_funcs_antes FROM PUBLIC, anon, authenticated;

-- Helper: colar AQUI, idêntico, o bloco de clearix_lens/supabase/propostas/fn_exige_funcionario.sql
-- (fn_e_funcionario boolean + fn_exige_funcionario void, com os grants). Fonte única; não duplicar o corpo neste arquivo.
-- O ensaio de 17/09 rodou com a versão de uma função só; o critério é o mesmo (a void passou a chamar a boolean).
-- (na aplicação o bloco é colado inline: apply_migration não entende \ir do psql)

DO $aplica$
DECLARE
  alvos text[] := ARRAY['rpc_etl_contact_lenses_from_csv','rpc_lab_agreements_import','rpc_update_contact_lens_price','rpc_update_lens_full','rpc_update_lens_price',
   'rpc_brands_upsert_settings','rpc_canonical_upsert_supplier_preference','rpc_etl_populate_supplier_crosswalk','rpc_lab_campaign_cancel',
   'rpc_pricing_create_discount','rpc_pricing_expire_discount','rpc_pricing_upsert_profile','rpc_update_contact_lens_specs',
   'rpc_update_lens_prescription_range','rpc_update_lens_treatments','rpc_pricing_recalc_all','rpc_pricing_recalc_stale'];
  f record; v_def text; v_new text; v_n int;
BEGIN
  FOR f IN SELECT p.oid, p.proname, p.oid::regprocedure::text AS assinatura
             FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
            WHERE n.nspname='public' AND p.proname = ANY(alvos) LOOP
    v_def := pg_get_functiondef(f.oid);
    IF v_def ~ 'fn_exige_funcionario' THEN CONTINUE; END IF;
    INSERT INTO catalog_lenses._fix373_funcs_antes (assinatura, definicao) VALUES (f.assinatura, v_def)
      ON CONFLICT (assinatura) DO NOTHING;
    v_new := regexp_replace(v_def, '(\n\s*BEGIN\s*\n)', E'\\1  PERFORM public.fn_exige_funcionario();\n', 'i');
    IF v_new = v_def THEN RAISE EXCEPTION 'não achei o BEGIN de %', f.proname; END IF;
    EXECUTE v_new;
  END LOOP;

  -- Prova dentro da migration: 17 com portão, nenhuma aberta a anon, nenhuma sem authenticated.
  SELECT count(*) INTO v_n FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname = ANY(alvos) AND p.prosrc ~ 'fn_exige_funcionario';
  IF v_n <> array_length(alvos, 1) THEN RAISE EXCEPTION 'portão em % de % funções', v_n, array_length(alvos, 1); END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
              WHERE n.nspname='public' AND p.proname = ANY(alvos)
                AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR NOT has_function_privilege('authenticated', p.oid, 'EXECUTE'))) THEN
    RAISE EXCEPTION 'grant alterado em alguma das funções';
  END IF;
  IF has_function_privilege('anon', 'public.fn_exige_funcionario()', 'EXECUTE')
     OR has_function_privilege('anon', 'public.fn_e_funcionario()', 'EXECUTE') THEN
    RAISE EXCEPTION 'helper de funcionário executável por anon';
  END IF;
END $aplica$;


-- ─── PROVA DEPOIS DE APLICAR (DO que termina em RAISE: nada grava) ───────────
-- DO $$ DECLARE j json; BEGIN
--   PERFORM set_config('request.jwt.claims', json_build_object('role','authenticated','role_code','paciente',
--     'tenant_id','6292c9f0-0291-4b9e-a7ea-04caf2ef3140','sub',gen_random_uuid())::text, true);
--   EXECUTE 'SET LOCAL ROLE authenticated';
--   BEGIN j := public.rpc_update_contact_lens_price(gen_random_uuid(), 1, 1); RAISE EXCEPTION 'PASSOU: %', j;
--   EXCEPTION WHEN insufficient_privilege THEN RAISE EXCEPTION 'OK: paciente negado'; END;
-- END $$;


-- ─── ROLLBACK (só com "pode") ────────────────────────────────────────────────
-- DO $$ DECLARE r record; BEGIN
--   FOR r IN SELECT definicao FROM catalog_lenses._fix373_funcs_antes LOOP EXECUTE r.definicao; END LOOP;
-- END $$;
-- DROP FUNCTION IF EXISTS public.fn_exige_funcionario();   -- só se nenhuma outra função usar
