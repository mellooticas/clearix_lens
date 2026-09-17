# Anamnese — dúvidas do dono de ótica e respostas do catálogo de lentes (Clearix Lens)

**De:** agente do `clearix_lens` · **16/09/2026**, remedido no palco real em **17/09/2026** · **Para:** eco, que consolida e
entrega ao Geral.
**Pedido:** `Cockpit/comercial/_PEDIDO_2026-09-16_ANAMNESE_DUVIDAS_E_SOLUCOES.md`, no formato da tabela §3 de
`Cockpit/comercial/pitch-20min-anamnese-2026-09-16.md`.
**Fontes:** folha única `verdade-landing-vs-app-2026-09-14.md` (§1 números, §2 capacidades, §3 o que não se diz) e o
código do Lens (`origin/main`). Nenhum dado de cliente. Só leitura: nada foi gravado.

> **Ordem do dono (17/09 00h50, canal do eco):** "trabalhar com nossos dados reais, sempre; o pode tem que ser sempre nos
> dados da tenant real." O palco do pitch é o **tenant Grupo Mello**. A massa sintética da Ótica Olhar Certo está
> **cancelada** (`_PROPOSTA_2026-09-16_MASSA_SINTETICA_DEMO_OLHAR_CERTO.sql`, marcada no topo; nunca aplicada).

## Palco real — Grupo Mello (medido 17/09/2026, só leitura)

### O que a Mello tem hoje

| O que | Hoje (17/09) | Observação |
|---|---|---|
| O Lens abre para o admin? | **sim** (`rpc_iam_can_use_app_feature('clearix_lens')` = true) | pacote enterprise |
| Lentes oftálmicas ativas | **5.569** | 5.252 de laboratório ativo, que é o que as telas mostram (laboratório pausado some) |
| Laboratórios com lente à venda | **6** | Brascor, Braslentes, OPTOTAL HOYA, STYLE PLUS, Sygma, TECHNOPARK |
| Canônicas | 352 standard · 1.843 premium | |
| **Acordos de laboratório** | **319**, todos vigentes hoje | 318 comerciais por SKU + 1 financeiro (laboratório inteiro). **O "381" soma 62 apagados** (`deleted_at`): não usar |
| **Lentes de contato** | **274** não apagadas = **273 ativas** + 1 inativa | das 273: 241 produtos + 32 cópias da B&L na Central Oftálmica; **71 ativas sem custo cadastrado**. **O "286" soma 12 apagadas**: não usar |

Os números da fala continuam os da folha §1, com a data dela: 5.569 lentes + 274 de contato, 319 acordos (14/09/2026).
Os de hoje batem com eles.

### O que cada tela mostra — a régua do Geral ("tela com nome/valor sensível = falar, não abrir")

| Tela | Mostra custo de fornecedor? | Pode abrir com terceiro? |
|---|---|---|
| `/lentes` (lista) | não: fornecedor, SKU, tratamentos e **preço sugerido de venda** | **sim**, com a ressalva de que os nomes reais dos laboratórios aparecem (ver decisão abaixo) |
| `/lentes/[id]` (detalhe) | **sim**: "Custo" e "Margem" | **não clicar** |
| `/standard`, `/premium` (lista de canônicas) | não: nº de lentes, nº de fornecedores, **preço médio de venda** | **sim** |
| `/standard/[id]`, `/premium/[id]` (detalhe da canônica) | **indireto**: preço de venda **e markup** de cada lente (venda ÷ markup = custo), mais "em promoção de laboratório" | **falar, não abrir** |
| `/contato` (lista) | não: marca, fornecedor, SKU, **preço de venda** | **sim** |
| `/contato/[id]` (detalhe) | **sim**: "Custo" e o quadro "Fornecedores" com o custo de cada um | **não clicar** |

**Parece sigilo comercial da casa, e a decisão é do dono.** Os acordos são descontos negociados com laboratórios reais.
Exemplo medido: na Espace Orma 1.50 Trio Easy Clean, o acordo leva o custo de uma das duas fontes para cerca de metade da
tabela. O detalhe da canônica deixa deduzir isso pelo markup. Por isso marquei como "falar, não abrir", nunca como
"mostrar".

**Decisão a levar ao dono:** os **nomes reais dos laboratórios** aparecem em todas as listas (`/lentes`, `/contato`). Se
ele considerar sigilo, as linhas 1 e 5 passam a "falar, não abrir" também.

## Tabela "dúvida → solução" — palco real (formato do §3 do pitch)

Nome de uso da folha: **Lentes / comparador de laboratórios** (no Hub, **Clearix Lens**). Dito uma vez no bloco: **"o
catálogo de lentes só vem no pacote Completo."**

| # | Dúvida/dor do dono de ótica (nas palavras dele) | Solução no app (uma frase) | Tela/rota exata | Ressalva honesta (em voz alta) | Demonstração de 60 s — tenant Grupo Mello (o que clicar / **o que não clicar**) | Número da folha que cabe (com data) |
|---|---|---|---|---|---|---|
| 1 | "Cada laboratório me manda uma tabela e eu não consigo comparar." | Catálogo de lentes por fornecedor, com filtro por laboratório, marca, tipo, material, índice e tratamento (verde = com, vermelho = sem). | Clearix Lens › `/lentes` | "O catálogo é carregado na implantação, a partir das tabelas dos seus laboratórios; a loja não sobe tabela sozinha." | `/lentes` → filtro **Laboratório** → escolher um → no bloco de tratamentos, **AR** verde e **Foto** vermelho → mostrar a contagem dos outros filtros mudando. **Não clicar em nenhuma lente** (o detalhe mostra custo e margem). | 5.569 lentes oftálmicas no catálogo (14/09/2026) |
| 2 | "A mesma lente tem um nome em cada laboratório; eu nem sei se é a mesma." | Lente canônica: um conceito (tipo, material, índice, tratamentos; nas de marca, a mesma marca e linha) que reúne a lente real de cada fornecedor. | Clearix Lens › `/premium` (lista) | "Mesma lente aqui quer dizer mesmo tipo, material, índice e tratamentos; lente de marca só se junta com a mesma marca e linha. **Não é equivalência de qualidade.**" | `/premium` → buscar **"Espace Orma 1.50"** → no card **Espace Orma 1.50 — Trio Easy Clean**, ler o rodapé "2 lentes · 2 forn." e o preço médio de venda. **Não abrir o card** (o detalhe mostra markup). | — |
| 3 | "Não sei em qual laboratório esta lente sai mais barata." | Dentro da mesma lente, o preço de cada fornecedor, já com os acordos vigentes. | Clearix Lens › `/premium/[id]`; na hora da compra, com prazo, é o DCL | "Compara **preço** (e o prazo, na tela de compra do laboratório). **Não compara qualidade, atraso, garantia nem refação.** A escolha é sua." | **Falar, não abrir.** O detalhe mostra preço de venda e markup de cada laboratório real; com markup, deduz-se o custo negociado. | — |
| 4 | "Negociei desconto com um laboratório e na hora de comprar ninguém lembra." | O acordo de laboratório entra no custo, e as faixas de preço já saem pelo custo com os acordos vigentes. | Clearix Lens › `/premium/[id]` (bloco "Faixas de Preço") | "Acordo é o custo que **você** negociou, não tabela pública de laboratório. O acordo é cadastrado na implantação; **a loja não tem tela para cadastrar.**" | **Falar, não abrir.** O acordo é desconto real negociado com laboratório real (sigilo comercial da casa, a confirmar com o dono). | 319 acordos de laboratório cadastrados (14/09/2026) |
| 5 | "Lente de contato: a mesma marca em dois fornecedores, preço diferente, e o vendedor pega a errada." | Catálogo de lente de contato com SKU próprio e fornecedor; a mesma lente em dois fornecedores aparece nos dois, e o preço lançado no original passa sozinho para a cópia. | Clearix Lens › `/contato` (lista) | "Parte das lentes de contato ainda está sem custo cadastrado. Lente de contato **não** tem comparação automática: a troca de fornecedor é feita na compra." | `/contato` → buscar **"Ultra para Astigmatismo"** → 2 cards: Bausch & Lomb Brasil (`LC101008`) e Central Oftálmica (`CO-LC101008`), o mesmo preço de venda. **Não abrir o card** (o detalhe mostra custo dos dois fornecedores). Não buscar produto sem preço (71 ativas sem custo aparecem sem valor). | 274 lentes de contato no catálogo (14/09/2026) |

### Régua fail-closed do Geral — dado pessoal por linha (conferido no código em 17/09/2026)

Dado pessoal = nome/CPF/telefone/receita/carnê de cliente real ou nome de funcionário. Nome de laboratório **não** é dado
pessoal (é sigilo comercial, decisão separada do dono).

**Achado que vale para todas as linhas:** o **conteúdo** das telas do Lens é só catálogo (lente, marca, laboratório,
preço), sem cliente e sem funcionário. A **moldura** do app, que aparece em toda tela, mostra **quem está logado**:
- o primeiro nome e o papel, no cabeçalho (`lib/components/layout/Header.svelte:87`) e no rodapé da barra lateral
  (`lib/components/sidebar/AppSidebar.svelte:104,190`);
- o **nome completo ou o e-mail** e a empresa, no menu do usuário (`Header.svelte:98`), que abre ao clicar no nome.

Não existe modo de apresentação que esconda isso sem mudar código. Pela regra fail-closed, marquei "sim (moldura)".

| # | `dado_pessoal_na_tela` (tela + registro indicados) | `vista_sem_dado` |
|---|---|---|
| 1 | **sim, só na moldura** (nome de quem está logado). Conteúdo de `/lentes`, filtrado por laboratório + AR/Foto: **não** | Demonstrar logado com a **conta do próprio dono**, porque o nome na moldura passa a ser o de quem apresenta, não de funcionário. **Não clicar no nome** no cabeçalho (o menu mostra nome completo/e-mail). Não clicar em nenhuma lente |
| 2 | **sim, só na moldura**. Conteúdo de `/premium`, buscando "Espace Orma 1.50" (cards de canônica): **não** | Igual à linha 1. Não abrir o card |
| 3 | **não** no conteúdo (moldura como acima). **Link desligado por sigilo comercial, não por LGPD:** o detalhe `/premium/[id]` mostra preço de venda e markup de cada laboratório real, e dá para deduzir o custo negociado | Falar, não abrir |
| 4 | **não** no conteúdo (moldura como acima). **Link desligado por sigilo comercial, não por LGPD:** o bloco "Faixas de Preço" expõe o efeito do acordo com laboratório real (ex.: custo de 249 para 127 na Espace Orma 1.50) | Falar, não abrir |
| 5 | **sim, só na moldura**. Conteúdo de `/contato`, buscando "Ultra para Astigmatismo" (2 cards de produto): **não** | Igual à linha 1. Não abrir o card (o detalhe mostra custo: sigilo comercial, não LGPD) |

**Se o Geral quiser "não" puro na linha 1, 2 e 5**, falta uma coisa que não existe hoje: esconder o nome de quem está
logado numa sessão de demonstração. É obra de código no Lens (e provavelmente no Hub), fora desta rodada; só com pedido.

## Isso o Clearix não faz (catálogo de lentes)

| Dúvida do dono de ótica (nas palavras dele) | Resposta em voz alta |
|---|---|
| "Qual é o melhor laboratório?" | "O sistema não responde isso: ele mostra preço e prazo, e você escolhe." (frase do roteiro de 14/09) — o Clearix não avalia qualidade, histórico de atraso, garantia nem refação. |
| "Quero que a tabela nova do laboratório entre sozinha." | "A atualização de tabela é serviço, feito por nós; o sistema não lê a tabela do laboratório sozinho." — não há tela para a loja importar tabela. |

## Bastidor para o eco e o Geral (não vai para a fala)

- **Nada acima é "em breve".** Todas as telas estão no `origin/main` do Lens (conferido em 16/09).
- **Não citei números fora da §1 da folha.** A tabela "O que a Mello tem hoje" é medição para o eco, não para a fala.
- **Existe e roda, mas não está na §2, então ficou fora da tabela.** Candidatas, se o Geral quiser:
  (a) laboratório pausado some da busca, dos filtros e do preço em todos os apps (migrações 355–359);
  (b) simulador de receita que lista as lentes que atendem o grau (`/simulador/receita`);
  (c) livro de preço por perfil (`pricing_book`).
- **Linha 5, a quem for demonstrar no Vendas:** a mesma lente de contato em dois fornecedores aparece hoje como **dois
  cards iguais** no PDV (só muda o SKU). A decisão "1 card × 2 cards" está com o dono (plano A6 do eco).
- **Perguntas de apoio (opcional), depois da P4 do pitch:** linhas 1–3 → "Quantos laboratórios você usa e quem escolhe o
  de cada OS, olhando o quê?"; linha 4 → "Você tem desconto ou campanha combinada com algum laboratório? Onde isso fica
  anotado?"; linha 5 → "Você vende lente de contato? Compra sempre do mesmo fornecedor?"
- **Histórico:** a versão de 16/09 usava o tenant sintético Ótica Olhar Certo (Lens e DCL fechados para os 4 usuários,
  0 acordos, 0 lentes de contato, canônica CST486399_oc misturando solar com incolor). Cancelada pela ordem de 17/09.
