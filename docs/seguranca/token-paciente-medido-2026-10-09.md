# Token de paciente no catálogo de lentes — medição (09/10/2026)

**Risco, primeiro (R-046):** com o token do portal do paciente, **11 superfícies do catálogo entregam custo de
compra** da Mello (custo por lente, custo com acordo de laboratório, markup e margem). É dado comercial da
casa, não dado pessoal. Decide o dono; o conserto está desenhado e **não aplicado**.

**Quem pediu:** eco, fase 2 da série do token de paciente (R-043 §4-A: medir antes de aplicar).
**Autorização:** medição somente — leitura, em transação desfeita. Nada foi gravado.
**Projeto/tenant:** `mhgbuplnxtfgipbemchb` · Grupo Mello (`6292c9f0-…`).

## Como medi

- **Token de paciente com o formato real do portal** (confirmado pelo eco em `token-access.ts`):
  `role=authenticated`, `role_code=patient`, `tenant_id` da Mello, `sub` = **id de um paciente real** da
  Mello que **não** colide com `iam.users` (a colisão de UUID é o caso do Clinics, fora do meu escopo).
  Nenhum nome, CPF ou telefone foi lido ou gravado neste documento.
- **Controle positivo:** o mesmo roteiro com o admin da Mello (`role_code` nulo no JWT, linha ativa em
  `iam.users`).
- `SET LOCAL ROLE authenticated` + `set_config('request.jwt.claims', …)`, um `DO` por vez, cada um terminando
  em `RAISE` para desfazer. `LIMIT 2000` por superfície (então "2000" quer dizer "2000 ou mais").

## Resultado — views

| View | Paciente | Admin (controle) | Veredito |
|---|---|---|---|
| `v_contact_lenses` | 274 linhas, **274 com custo** | 274 / 274 | **furo** |
| `v_pricing_book` | 2000+, **com custo, markup e margem** | igual | **furo** |
| `v_pricing_audit_log` | 2000+, **custo antes/depois** | igual | **furo** |
| `v_pricing_curve_verification` | 2000+, **custo** | igual | **furo** |
| `v_catalog_canonical_all` | 2000+, **custo mín/máx** | igual | **furo** |
| `v_canonical_lenses_pricing` | 351, **custo mín/máx/médio** | igual | **furo** |
| `v_canonical_lenses_premium_pricing` | 1.843, **idem** | igual | **furo** |
| `v_pricing_curve_analysis` | 7, **faixa de custo e margem** | igual | **furo** |
| `v_pricing_organism_health` | 4, **custo mín/máx** | igual | **furo** |
| `v_contact_pricing_health` | 1, **custo mín/máx** | igual | **furo** |
| `v_global_catalog_summary` | 2, **markup** | igual | **furo** |
| `v_pricing_profiles` | negado (42501) | negado | ok |
| `v_pricing_stale_entries` | 0 linhas | 0 | ok |
| `v_catalog_lenses` | **0 linhas** | 2000+ com custo | ok (portão da 346) |
| `v_catalog_lenses_full` | **0 linhas** | 2000+ com custo | ok (portão da 346) |
| `v_catalog_contact_lenses` | **0 linhas** | 274 com custo | ok (portão da 346) |

O portão da 346 (`current_role_code() IS NOT NULL`) funciona: as três views que o têm devolvem 0 ao paciente
e tudo ao admin. As 11 com furo não têm portão nenhum — filtram só tenant, e o paciente tem tenant.

## Resultado — RPCs

| RPC | Paciente | Admin (controle) | Veredito |
|---|---|---|---|
| `rpc_contact_lens_detail` | 1 linha **com `price_cost`** | igual | **furo** |
| `rpc_canonical_price_tiers` | faixas **com `base_cost` e `eff_cost`** (custo com acordo) | igual | **furo** |
| `rpc_canonical_best_purchase` | 2 opções **com `eff_cost`** | igual | **furo** |
| `rpc_canonical_detail` | 2 lentes reais **com custo** | igual | **furo** |
| `rpc_lens_search` | 5 lentes **com custo** | igual | **furo** |
| `rpc_pricing_simulate` | simulação completa (custo, markup, piso, margem) | igual | **furo** |
| `rpc_canonical_for_prescription` | 152 conceitos, sem custo | igual | ok (só canônica) |
| `rpc_lens_get_alternatives` | 5 alternativas, sem custo | igual | ok |
| `rpc_catalog_summary` | resumo do catálogo, sem custo | igual | ok |
| `rpc_lens_catalog_search` | **0 no catálogo** | 5.252 | ok (lê a view com portão da 346) |

## Conta final

**26 objetos medidos · 17 furos** (11 views + 6 RPCs) · paciente vê custo em 17/26 · admin vê em todos
(controle positivo passou em 26/26) · 9 objetos já protegidos, sendo 4 pelo portão da 346 e 1 por grant.

O que vaza é **custo de compra, custo com acordo de laboratório, markup e margem** do catálogo da Mello.
Não há dado pessoal nessas superfícies.

## Conserto proposto (desenhado, NÃO aplicado)

1. **Views (11):** `CREATE OR REPLACE` com `AND (SELECT public.fn_e_funcionario())` no corpo — o mesmo
   critério da 346, agora pelo helper canônico de `clearix_lens/supabase/propostas/fn_exige_funcionario.sql`.
   `CREATE OR REPLACE` preserva grants. Para as 3 que `anon` também lê (`v_global_catalog_summary`,
   `v_contact_pricing_health`, `v_contact_lens_etl_reconciliation`): `REVOKE SELECT FROM anon`.
2. **RPCs (6):** `PERFORM public.fn_exige_funcionario();` na 1.ª linha (padrão da fase 1).
3. **Quem usa hoje:** Lens, Vendas e DCL, todos com sessão de funcionário — passam. O site melloeyewear
   (anon) já não recebe catálogo. Nenhum cron nem edge function chama estas superfícies.
4. **Prova exigida na migration:** paciente 0 linhas / 42501 em 17/17 e admin igual a hoje em 26/26.

**Pendente do dono:** o "pode" para aplicar isto (e a fase 1, já ensaiada, nas 17 RPCs que escrevem).
Enquanto não aplicar, qualquer paciente com o token do portal no navegador consegue ler o custo do catálogo
chamando a API direto.
