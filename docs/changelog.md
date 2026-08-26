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
