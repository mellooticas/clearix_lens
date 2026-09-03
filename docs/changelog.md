# Changelog — Clearix Lens

## Não lançado

### 2026-08-25 — Header de app, ADR-0024 e higiene do repo
- **`x-clearix-app: clearix_lens` em todas as chamadas ao Supabase.** Novo módulo
  `src/lib/supabase-app-headers.ts` com constante única (`CLEARIX_APP`,
  `supabaseAppHeaders`, helper `withAppHeaders`), aplicado nos **4** pontos de
  criação de client: `lib/supabase.ts` (browser singleton), `routes/+layout.ts`
  (universal — browser e server), `hooks.server.ts` (server/cookies) e
  `routes/auth/callback/+server.ts` (SSO). Padrão do ecossistema, espelhando
  `clearix_marketing` e `clearix_estoque`. Nunca escrever o literal do app solto:
  importar do módulo.
- **ADR-0024 concluído**: `README.md` removido; `AGENTS.md` (10 seções) é a porta
  de entrada única do app para agentes.
- **`.claude/settings.local.json` deixa de ser versionado** (`git rm --cached`):
  é configuração por máquina. O `.gitignore` já cobria `.claude/`, mas o arquivo
  estava rastreado de antes — o ignore não vale para o que já está no índice.
  Mesmo padrão aplicado hoje por Finance e Estoque.

### 2026-08-31 — Laboratório pausado some do catálogo (migrações 355–359)
- **Regra única do ecossistema**: lente de laboratório pausado não aparece em
  busca, filtro, canônica, resumo nem sugestão por receita. Vale para Lens,
  Vendas, DCL e AR Vision. Detalhe em
  `clearix_docs/padroes/18_LAB_PAUSADO_NAO_APARECE.md`.
- **Corrigia mais que a lista: corrigia o preço.** 47 canônicas exibiam um
  mínimo que não dava para comprar (pior caso: R$ 760 exibido × R$ 2.006 real),
  porque o preço agregava lentes de lab pausado.
- **A tela de canônicas ficou 14× mais rápida** (3.951 ms → 282 ms): as views
  juntavam `pricing_book` e `lens_treatment_links` só por `lens_id`, mas o
  índice é `(tenant_id, lens_id)` — o índice nunca era usado. Problema antigo,
  encontrado ao medir esta mudança.
- Ligar/desligar laboratório testado de ponta a ponta, com o estado restaurado.
- Tela `/lentes` passou a esconder lente de lab pausado, revertendo o argumento
  contrário que eu havia registrado na migração 354.
- **OSs destravadas (360/361)**: 18 OSs vivas corrigidas — 8 tinham venda e
  produção apontando para canônicas diferentes, 10 estavam travadas em PENDENTE
  sem opção comprável. Nenhum preço de cliente alterado, nenhuma lente física
  mexida. Backups em `catalog_lenses._fix360_*` e `_fix361_*`.

### Catálogo (banco — schema `catalog_lenses`, documentado em `clearix_docs`)
- Segurança: catálogo (custo e laboratório) fechado ao paciente — o portão exige
  funcionário confirmado em `iam.users` via `current_role_code()`.
- Lente **pronta** separada de **surfaçada** na canonização (199 lentes estavam
  no balde errado).
- Pro Design deixou de ser premium (367 canônicas de uma lente eliminadas).
- Fornecedores/laboratórios: Polylux e PAX habilitados como lab (151 lentes
  destravadas), labs excluídos somem da lista, duplicados consolidados.
- Divisão por faixa de custo foi aplicada e **revertida** no mesmo dia — a régua
  v1 rasgava variantes de diâmetro do mesmo produto. Régua v2 em desenho.

### Anterior
- Estrutura `docs/` criada (scaffold padrão DIGIAI).
