-- ============================================================
-- 2026-10-15 — R-031 (rodada mensal, script corrigido pelo Geral em 8b344da): duas views de custo/markup do catálogo
--   de lentes eram legíveis por anon e DEVOLVIAM linhas (teste real como anon, 15/10):
--   public.v_contact_pricing_health (estrategia, custo_min, custo_max, markup_real_medio, preco_venda_medio) — sem consumidor no código;
--   public.v_global_catalog_summary (tipo, total, markup) — consumida só pelo clearix_lens, com sessão.
-- Custo e markup não são dado público. Revoga anon; authenticated continua. Nada muda para o app Lens (logado).
-- Regras: [x] R-031 [x] R-043 [x] prova dentro — Reversão: grant select ... to anon (não recomendado).
-- ============================================================
begin;
revoke select on public.v_contact_pricing_health from anon;
revoke select on public.v_global_catalog_summary from anon;

do $$
begin
  if has_table_privilege('anon', 'public.v_contact_pricing_health', 'select') or has_table_privilege('anon', 'public.v_global_catalog_summary', 'select') then
    raise exception 'prova falhou: anon ainda lê';
  end if;
  if not has_table_privilege('authenticated', 'public.v_global_catalog_summary', 'select') then
    raise exception 'prova falhou: authenticated perdeu o select (o Lens usa)';
  end if;
end $$;
commit;
