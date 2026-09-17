-- =============================================================================
-- public.fn_exige_funcionario() — CORPO CANÔNICO (fonte única para todos os apps)
-- =============================================================================
-- Dono do arquivo: clearix_lens · 17/09/2026 · distribuição: eco
-- Status: PROPOSTA — ainda não aplicada no banco.
--
-- REGRA DE USO (eco, 17/09)
--   Quem aplicar primeiro cria a função. Os demais repetem ESTE bloco idêntico (CREATE OR REPLACE, mesmo nome,
--   mesmo corpo, mesmos grants). Nunca uma segunda versão. Mudou algo aqui? Muda para todos, pelo eco.
--
-- COMO USAR NUMA RPC
--   Primeira linha do bloco principal da função:  PERFORM public.fn_exige_funcionario();
--
-- O QUE FAZ
--   Nega com 42501 e mensagem 'AUTH_STAFF: …' quem não é funcionário da ótica. Allowlist (R-037): passa só
--     1. manutenção: session_user postgres/supabase_admin SEM JWT (SQL Editor, cron, migration);
--     2. chave de serviço: JWT com role = service_role (assinado; não se forja do navegador);
--     3. funcionário: public.current_role_code() não nulo = linha ativa em iam.users no tenant do token
--        (o mesmo portão da migração 346, desde 25/08).
--   Todo o resto é negado: paciente (token do portal: role authenticated, role_code 'patient', sem linha em
--   iam.users), token sem tenant, token com role_code inventado.
--
-- POR QUE NÃO current_user
--   Dentro de SECURITY DEFINER, current_user é o dono da função (postgres) → liberaria todo mundo.
--
-- PONTO EM ABERTO (não resolvido neste corpo)
--   super_admin impersonando outro tenant (active_tenant_id) não tem linha em iam.users daquele tenant →
--   current_role_code() = NULL → NEGADO. É o mesmo comportamento das views da 346. A medição de quem é
--   super_admin e onde tem linha ficou parada (banco sem conexão, fila do eco). Se o dono quiser a exceção,
--   ela deve vir do BANCO (linha super_admin ativa para auth.uid() em iam.users), nunca do claim role_code do
--   JWT — o portal do paciente assina o próprio token e escreve role_code nele.
--
-- ENSAIO (17/09, revertido): paciente 42501 em 17 de 17 RPCs de escrita do catálogo; admin da Mello passa;
--   service_role passa; manutenção passa; anon 42501. Ver
--   clearix_lens/_PROPOSTA_2026-09-17_PORTAO_FUNCIONARIO_CATALOGO_FASE1.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_exige_funcionario()
 RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $f$
BEGIN
  -- Contexto de manutenção (SQL Editor, cron, migration): sem JWT e conectado como dono.
  IF session_user IN ('postgres', 'supabase_admin')
     AND COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}') = '{}' THEN
    RETURN;
  END IF;
  -- Chave de serviço (servidor da casa). Claim assinado; não dá para forjar do navegador.
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN;
  END IF;
  -- Funcionário = linha ativa em iam.users no tenant do token (mesmo portão da 346).
  -- Paciente, token sem linha e tenant ausente caem aqui: nega.
  IF public.current_role_code() IS NULL THEN
    RAISE EXCEPTION 'AUTH_STAFF: acesso restrito a funcionário da ótica' USING ERRCODE = '42501';
  END IF;
END;
$f$;

REVOKE ALL ON FUNCTION public.fn_exige_funcionario() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_exige_funcionario() TO authenticated, service_role;
