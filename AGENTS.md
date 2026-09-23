# AGENTS.md — clearix_lens

> **Porta de entrada padronizada** para qualquer agente IA (Claude, Cursor, Cline, Copilot, Aider) entrando neste app. Convenção definida em [ADR-0024](../../Cockpit/ADR/ADR-0024-agents-md-por-app-aguardando-design-system.md).
>
> Criado em 2026-05-25 (replicação do padrão piloto `clearix_hub/AGENTS.md`).

---

## 1. O que é (1 frase)

Catálogo de lentes + pricing engine do ecossistema Clearix — gestão de SKU de lente (tratamento, índice, material, fabricante) + tabela de preço por tenant/fornecedor, alimenta Vendas e DCL.

## 2. Posição na DIGIAI

- **Verdade Canônica que rege:** *"Clearix é a prioridade máxima da DIGIAI"* (MÁXIMO)
- **Fase atual do app:** Produção (catálogo + pricing engine maduros)
- **Prioridade na matriz:** **ALTA** (alimenta Vendas e DCL — sem catálogo a ótica não vende)
- **Categoria portfólio:** PRODUTO-ÂNCORA (parte do Clearix)
- **Pacote comercial:** Crescimento / Completo

## 3. Onde está a verdade (leituras obrigatórias antes de editar)

- **Spec da suíte:** [`../../Cockpit/Spec/clearix_eco_full.md`](../../Cockpit/Spec/clearix_eco_full.md) §2 + §13
- **ADRs aplicáveis:**
  - [ADR-0001 v3](../../Cockpit/ADR/ADR-0001-clearix-db-isolamento.md) — isolamento DB Clearix
  - [ADR-0022](../../Cockpit/ADR/ADR-0022-pricing-clearix-corrigido-4-pacotes.md) — pricing
- **Regras Harness críticas:**
  - **R-003** — não commit sem pedido
  - **R-004** — ação destrutiva exige confirmação
  - **R-005** — UI verificada no navegador
  - **R-009** — banco Clearix isolado
  - **R-010** — Pergunta de Ouro
  - **R-014** — design system Clearix Lens obrigatório (sim, este app **é** o "Lens" mas o **design system** Clearix Lens ainda se aplica — não confundir)
  - **R-018** — experimentos só no `clearix_import`
  - **R-024** — Baseline AppSec (OWASP Top 10): RLS · parametrized queries · webhooks com signature · headers de segurança · `dangerouslySetInnerHTML` e `execute_sql` interpolado bloqueados por hook T-005
- **Documentação do app:** [`docs/`](docs/) ou `clearix_docs/apps/clearix_lens/`

## 4. Stack + dev

- **Stack:** **SvelteKit 2** + Svelte 5 + TypeScript 5 + Tailwind 3.4 + Supabase SSR + Vitest + `@floating-ui/dom` + lucide-svelte + svelte-sonner + pg (cliente Postgres direto via MCP) + supabase CLI
- **Porta dev:** Vite (SvelteKit padrão 5173 — confirmar `vite.config.ts`)
- **URL produção:** **`https://clearixlens.netlify.app`** (padrão da suíte — ⚠️ a confirmar)
- **Como rodar:** `npm run dev` (vite dev)
- **Hospedagem:** Netlify (adapter `@sveltejs/adapter-netlify`)
- **CI/CD:** confirmar via `netlify.toml`

## 5. Banco + permissões

- **Projeto Supabase:** `mhgbuplnxtfgipbemchb`
- **MCP Supabase tem acesso direto?** **✅ Sim** + MCP Postgres próprio (`@modelcontextprotocol/server-postgres` no package)
- **Schemas que o app toca:**
  - `catalog_lenses` (✅ owner) — SKU, índice, tratamento, fabricante, preço base
  - `iam` (read) — tenants/stores/users via JWT
  - `inventory` (cross-app, opcional) — disponibilidade
- **RLS por `tenant_id`:** parcial — catálogo MASTER pode ser global, mas tabela de preço é por tenant
- **JWT custom claims:** `tenant_id`
- **Auth provider:** SSO via Clearix Hub
- **Comandos Supabase locais:** `supabase` CLI presente (`db:push`, `db:reset`, `db:diff`)

### Preço de lente de contato — comportamentos automáticos (não é bug)

- **Markup automático × 3,2** (`trg_contact_pricing_sync`): ao inserir, e ao alterar **só o custo**,
  o preço de venda vira custo × 3,2. Preço de venda **digitado** no mesmo salvamento prevalece
  (migração 369 — antes era descartado em silêncio).
- **Cópia `dup:` acompanha o original até ganhar preço próprio** (`trg_espelha_preco_contato_para_copias`,
  migração 370). Produto duplicado em outro fornecedor (ex.: `CO-LC…` na Central Oftálmica, cópia
  de `LC…` da Bausch & Lomb) recebe sozinho o custo e o preço do original. **Se o preço da Central
  mudou sem ninguém mexer nela, foi o original que mudou.** Se a cópia receber preço diferente, deixa
  de acompanhar e fica com o dela; para voltar a acompanhar, igualar os preços.
- Lente de contato **não tem canônica**: o produto duplicado aparece duas vezes na venda, uma por
  fornecedor, e a troca de fornecedor é feita no DCL (migração 368).
- **A tela respeita isso** (`/contato/[id]`): a cópia é reconhecida pelo SKU (`XX-LC…`, conferido no
  banco: 32 de 32, nenhuma falsa), mostra o fornecedor e onde mais a lente é vendida, e **não deixa
  editar preço nem specs na cópia** — manda para o original. Salvar specs no original grava as
  mesmas nas cópias pela própria tela (o gatilho 370 só espelha preço).

## 6. Comandos

### ✅ Verde (rodar sem confirmar)

- `npm run dev` — vite dev
- `npm run build` — build SvelteKit
- `npm run preview` — preview build
- `npm run check` — svelte-check
- `npm run check:watch` — watch
- `npm run lint` — prettier + eslint
- `npm run format` — prettier write
- `npm run test` — vitest run
- `npm run test:watch` — vitest watch
- `npm run db:start` — supabase local start
- `npm run db:stop` — supabase local stop
- `npm run db:diff` — diff schema local vs remoto

### 🟡 Confirma antes

- `npm install <pacote>` — nova dependência
- `npm run db:push` — aplica migrations no remoto (banco compartilhado!)
- `npm run db:reset` — reset local (não afeta remoto, mas estado local)
- `npm run test:db` — test db dentro de `database/`
- DDL em `catalog_lenses` via Management API

### 🔴 Nunca sem permissão explícita (R-003, R-004, R-011)

- `git push` / `git commit`
- `npm run db:push` em produção sem revisão da migration
- DROP em `catalog_lenses` (afeta Vendas e DCL)
- Alterar preço master sem trilha de auditoria
- `db:reset` em ambiente remoto (não há comando direto, mas evitar erros)
- `dangerouslySetInnerHTML` sem DOMPurify (hook T-005 bloqueia — R-024)
- `execute_sql` com template literal interpolado (hook T-005 bloqueia — R-024)

## 7. Design System Clearix Lens (obrigatório por R-014)

**Cor canônica deste app:** `#8B5CF6` (violet-500) — sotaque visual do Lens

⚠ **Pegadinha de nome:** este app se chama `clearix_lens` mas o **design system** que ele segue chama-se **Clearix Lens v1.0** (homônimo). NÃO confundir — o app é consumidor do DS, não o DS em si.

**Antes de criar/editar UI, leia:**
- [`../../Cockpit/clearix_design/assets/AGENT_GUIDE.md`](../../Cockpit/clearix_design/assets/AGENT_GUIDE.md)
- Tokens: [`../../Cockpit/clearix_design/assets/tokens/`](../../Cockpit/clearix_design/assets/tokens/) — formato `tokens.css` é o mais natural para Svelte

**5 regras inegociáveis:**
1. action-primary = **blue-500** light / **blue-300** dark (**NUNCA roxo** — apesar do sotaque violet decorativo)
2. Só **Inter** + **JetBrains Mono**
3. Filtros multi-valor SEMPRE tri-state
4. **PT-BR 100%** + tom humano
5. WCAG AA mínimo

**Como importar tokens em SvelteKit:**
```svelte
<!-- src/app.css ou +layout.svelte -->
@import '../../../Cockpit/clearix_design/assets/tokens/tokens.css';
```

## 8. NÃO fazer (antipatterns específicos deste app)

- Alterar preço sem manter snapshot histórico (Vendas pode estar referenciando preço antigo em pedido aberto)
- Permitir SKU duplicado por tenant/fornecedor
- Auth custom — sempre SSO Hub
- Esquecer R-014 e usar Skeleton, Flowbite ou outra lib Svelte sem tokens
- Misturar Svelte 4 e Svelte 5 (este app já está em Svelte 5)
- `db:push` sem `db:diff` antes (impacto na suíte)
- Lançar ou alterar preço na **cópia** `CO-…`/`dup:` esperando que o original mude — é o contrário:
  lança no original `LC…` e a cópia acompanha; mexer na cópia a desliga do original
- Apagar (`deleted_at`) lente de contato que tem OS apontando — o DCL deixa de abrir a OS
  (`rpc_contact_lens_detail` só lê não removidas). Para tirar do catálogo, **inativar** (migração 369c)
- Tratar `supplier_code` de 1–3 dígitos como referência de fornecedor — em linhas `scraper:lentenet`
  é a posição na listagem da loja (proposta de limpeza em `_PROPOSTA_2026-09-11_SUPPLIER_CODE_DE_PLANILHA.md`)

## 9. Secrets

- **Onde:** `.env`
- **Variáveis exigidas:**
  - `PUBLIC_SUPABASE_URL` (convenção SvelteKit)
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PUBLIC_SIS_GATEWAY_URL`
  - `SSO_EXCHANGE_SHARED_SECRET`
- **NUNCA commitar `.env*`** (já em `.gitignore`)

## 10. Pendências conhecidas

- [x] Confirmar URL produção — `https://clearixlens.netlify.app`, cadastrada no Hub (confirmado pelo orquestrador, 08/09)
- [ ] Documentar schema completo de `catalog_lenses` (SKU, índice, tratamento)
- [ ] Política de versionamento de preço (snapshot por pedido vs config global)
- [ ] Validar pricing engine com base real do Mello (1.716 SKUs ativos)

---

## Notas para quem mantém este arquivo

- **Última atualização:** 2026-09-11
- **Owner deste arquivo:** quem mantém Lens (app)

> Em caso de dúvida, **pause e pergunte ao humano**. Lens alimenta o preço que aparece pro cliente — erro aqui é direto financeiro.

## Hospedagem e variáveis (R-042 §4 — desde 23/09/2026)

- **Onde roda:** Cloudflare Worker `clearix-lenses` → `https://lenses.clearix.app.br` (custom domain no `wrangler.jsonc`). Netlify (`clearixlens.netlify.app`) é legado: não configurar nada lá.
- **Publicar:** build local com as variáveis públicas no comando (ver `Cockpit/infra/runbook-migrar-app-para-cloudflare.md`) e `npx wrangler deploy` na pasta do app. Conferir o hostname do Supabase no bundle antes de publicar (runbook §20).
- **Gateway de SSO:** `PUBLIC_SIS_GATEWAY_URL` = `https://app.clearix.app.br` (build). Endereço deste app no lançador do Hub vem do banco: `iam.clearix_apps.url_production` (ADR-0060) — mudar endereço é UPDATE nessa linha, não deploy do Hub.
- **Variáveis e segredos:** Segredos: SSO_EXCHANGE_SHARED_SECRET. Segredo só entra por `wrangler secret put`, digitado pelo dono; nunca no repo, nunca no chat.
- **Registro da virada:** `Cockpit/infra/virada-cloudflare-2026-09-23.md`.
