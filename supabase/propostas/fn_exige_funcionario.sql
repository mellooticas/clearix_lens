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
-- DUAS FUNÇÕES, UM CRITÉRIO (ajuste do eco, 17/09)
--   fn_e_funcionario()     boolean → WHERE das views: (SELECT public.fn_e_funcionario())
--   fn_exige_funcionario() void    → 1ª linha das RPCs: PERFORM public.fn_exige_funcionario();
--   A segunda só chama a primeira; o critério mora num lugar só.
--   Substitui o fn_portao_funcionario do DCL (o DCL troca para este nome).
--
-- O QUE FAZ
--   Nega com 42501 e mensagem 'AUTH_STAFF: …' quem não é funcionário da ótica. Allowlist (R-037): passa só
--     1. manutenção: session_user postgres/supabase_admin SEM JWT (SQL Editor, cron, migration);
--     2. chave de serviço: JWT com role = service_role (assinado; não se forja do navegador);
--     3. funcionário: public.current_role_code() não nulo = linha não apagada (deleted_at nulo; status NÃO
--        conferido) em iam.users no tenant do token, casando auth_id ou id (o mesmo portão da 346, desde 25/08);
--        ANTES disso, token com role_code 'patient'/'paciente' é negado (colisão de UUID medida pelo Clinics, 17/09).
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

-- 1) BOOLEANO — para o WHERE das views (padrão 346: quem não é funcionário vê 0 linhas).
--    Nas views, chamar como subconsulta para avaliar uma vez só:  WHERE ... AND (SELECT public.fn_e_funcionario())
CREATE OR REPLACE FUNCTION public.fn_e_funcionario()
 RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $f$
BEGIN
  -- Contexto de manutenção (SQL Editor, cron, migration): sem JWT e conectado como dono.
  IF session_user IN ('postgres', 'supabase_admin')
     AND COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}') = '{}' THEN
    RETURN true;
  END IF;
  -- Chave de serviço (servidor da casa). Claim assinado; não dá para forjar do navegador.
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN true;
  END IF;
  -- Token do portal do paciente nunca é funcionário, mesmo que o sub colida com um id de iam.users.
  -- Caso medido pelo Clinics (17/09): 1 paciente da Mello tem o MESMO UUID de um usuário owner;
  -- current_role_code() casa u.id = auth.uid() e devolveria 'owner'. Esta linha só RESTRINGE:
  -- claim nenhum eleva ninguém (a liberação continua vindo do banco, abaixo).
  IF lower(COALESCE(auth.jwt() ->> 'role_code', '')) IN ('patient', 'paciente') THEN
    RETURN false;
  END IF;
  -- Funcionário = linha NÃO APAGADA (deleted_at nulo) em iam.users no tenant do token, casando auth_id ou id
  -- com auth.uid() (mesmo portão da 346). O status do usuário NÃO é conferido aqui.
  -- Anon, token sem linha e tenant ausente: false.
  RETURN public.current_role_code() IS NOT NULL;
END;
$f$;

REVOKE ALL ON FUNCTION public.fn_e_funcionario() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_e_funcionario() TO authenticated, service_role;

-- 2) EXIGÊNCIA — para a 1.ª linha das RPCs:  PERFORM public.fn_exige_funcionario();
CREATE OR REPLACE FUNCTION public.fn_exige_funcionario()
 RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $f$
BEGIN
  IF NOT public.fn_e_funcionario() THEN
    RAISE EXCEPTION 'AUTH_STAFF: acesso restrito a funcionário da ótica' USING ERRCODE = '42501';
  END IF;
END;
$f$;

REVOKE ALL ON FUNCTION public.fn_exige_funcionario() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_exige_funcionario() TO authenticated, service_role;
