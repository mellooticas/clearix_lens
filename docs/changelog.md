# Changelog — Clearix Lens

## 2026-09-23 — Hospedagem: Netlify → Cloudflare (virada)

- **Endereço oficial:** `https://lenses.clearix.app.br` (Worker `clearix-lenses`). Legado: `https://clearixlens.netlify.app` (Netlify, só até desligar; nada aponta mais para ele).
- **Login:** o Hub oficial passou a ser `https://app.clearix.app.br` — este app troca o ticket de SSO lá (gateway = `PUBLIC_SIS_GATEWAY_URL`); o Hub do Netlify continua aceitando por ter o mesmo segredo, mas é legado.
- **Como foi feito:** build local com as variáveis públicas explícitas no comando + `wrangler deploy` (chave de API do Cloudflare no registro do Windows, `CLOUDFLARE_API_TOKEN`); segredos por `wrangler secret put`, digitados pelo dono (R-042). Stack no Cloudflare: SvelteKit (adapter-cloudflare, DEPLOY_TARGET=cloudflare).
- **Status na virada:** publicado.
- **Onde está tudo:** `Cockpit/infra/virada-cloudflare-2026-09-23.md` (ordem, rollback), `Cockpit/infra/runbook-migrar-app-para-cloudflare.md` (receita e armadilhas), ADR-0059/ADR-0060, `Cockpit/Harness/rules.md` R-042.


## Não lançado

### 2026-10-01 — Tech Vantagens outubro/2026, tabela inteira (migração 375)
- **183 promoções vivas** na campanha "Tech Vantagens 2026 - Outubro" (01/10 a 31/12): 129 substituídas
  (95 no mesmo valor, 34 com valor novo — 17 sobem, 17 descem) e **54 promoções novas**.
- **130 promoções encerradas**, por decisão do dono: o que a tabela nova não traz volta ao custo de tabela.
  Inclui Kodak Network UHD e Unique UHD (só a Precise virou "Precise Next") e as versões com acabamento
  Essilor/Kodak (Crizal, No Reflex) que a grade da Technopark não tem.
- **O que destravou o resto da tabela:** o de-para de acabamento. No catálogo, "Verniz HC" é a coluna
  "Valor" da tabela Technopark (só verniz, sem AR). Confirmado pelos próprios valores: 17 de 17 acordos
  de agosto batem exatamente.
- **Mais duas armadilhas corrigidas antes de gravar:** o "Blue" de "Pro Coat Blue" (acabamento) estava
  sendo lido como lente Blue Cut — o nome do catálogo é `<produto> — <acabamento>` e só a parte da
  esquerda vale para material, fotossensível e blue; e a lente "Technopark Plus Cr-39 1.50 Foto Cinza"
  estava com o preço da linha incolor desde agosto (78,90 → 243,90 e 131,90 → 296,90).
- **6 linhas ficaram de fora por não dar desconto** (promoção ≥ custo de tabela), entre elas
  "Essilor VS Orma 1.50 — Sem AR" (tabela 65,00, tabela promocional 67,90) e as Technopark Blue Cut.
- 5 OS em andamento usam lente que perdeu promoção, todas já compradas (CHEGOU/MONTAGEM/PRONTO): o custo
  gravado na OS não muda; o efeito é só em compra nova.
- **Pendência:** 213 preços da tabela sem lente no catálogo — cores da Pro Design Platinum/Single, Kodak
  Precise Next Short, Pro Design Close, Stellest. São produtos a cadastrar, não promoção a lançar.

### 2026-10-01 — Tech Vantagens outubro/2026 (Technopark): 86 preços atualizados (migração 374)
- Tabela nova do laboratório lida do PDF por coordenadas (129 produtos, 353 preços). As colunas vêm com o
  título girado e há 4 tabelas por página, então o texto corrido não serve — o leitor usa a posição.
- **Aplicado só o que dois caminhos independentes confirmaram:** casamento por regra (família + material +
  acabamento + fotossensível + blue + cilindro estendido) **e** o mapeamento do import de agosto, com o mesmo
  valor nos dois. São 86 lentes: 65 seguem no mesmo valor e 21 mudaram. Campanha "Tech Vantagens 2026 - Outubro",
  vigência 01/10 a 31/12. Backup em `catalog_lenses._fix374_acordos_antes`.
- **Armadilhas que a primeira tentativa de casamento criou** (corrigidas antes de aplicar): "Gen S"
  (fotossensível) lido como a marca "GEN" da Technopark, o que casou Pro Design Away com Wise e Elite;
  "Acclimates" tratado como incolor; e a linha de cilindro estendido casando com a lente normal.
- **Fora desta leva, aguardando conferência do dono** (`Downloads/tech_vantagens_outubro_revisao.csv`):
  154 acordos de agosto que a regra não casou e 248 preços da tabela sem lente correspondente no catálogo —
  entre eles a família Kodak "Precise Next", que substitui a "Precise UHD" (decisão do dono), as cores da
  Pro Design Platinum e a Stellest.

### 2026-09-11 — Lente de contato em mais de um fornecedor
- **A tela passou a entender a duplicação da Bausch & Lomb na Central Oftálmica** (migração 368).
  Antes, `LC…` e `CO-LC…` apareciam como dois cards idênticos, sem dizer de quem era cada um.
- `/contato`: o card mostra o **fornecedor**.
- `/contato/[id]`: mostra o fornecedor, lista **onde mais a lente é vendida** (com custo e link) e,
  na cópia, **esconde a edição de preço e de specs** com link para o original — mexer na cópia a
  desligava do original em silêncio.
- Salvar specs no original grava as mesmas nas cópias. O gatilho da 370 só espelha preço; sem isto
  a cópia ficava com o grau antigo.
- A cópia é reconhecida pelo SKU (`XX-LC…`). Conferido no banco: 32 de 32 seguem o formato, nenhuma
  lente fora da duplicação usa esse formato.

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
