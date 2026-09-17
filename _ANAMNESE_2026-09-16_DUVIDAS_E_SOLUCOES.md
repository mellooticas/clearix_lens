# Anamnese — dúvidas do dono de ótica e respostas do catálogo de lentes (Clearix Lens)

**De:** agente do `clearix_lens` · **16/09/2026** · **Para:** eco, que consolida e entrega ao Geral.
**Pedido:** `Cockpit/comercial/_PEDIDO_2026-09-16_ANAMNESE_DUVIDAS_E_SOLUCOES.md`, no formato da tabela §3 de
`Cockpit/comercial/pitch-20min-anamnese-2026-09-16.md` (alinhamento do eco, 16/09).
**Fontes:** folha única `verdade-landing-vs-app-2026-09-14.md` (§1 números, §2 capacidades, §3 o que não se diz) e o
código do Lens (commits no `origin/main`). Nenhum dado de cliente. Foi só leitura, sem nenhuma alteração.

## ⚠ Antes de usar: a demonstração no tenant sintético não roda hoje

Medido no banco em 16/09/2026, sem gravar nada:

| O que | Ótica Olhar Certo (sintético) | Controle (Grupo Mello) |
|---|---|---|
| O Lens abre? (`rpc_iam_can_use_app_feature('clearix_lens')`, que o próprio Lens chama na entrada) | **não**: `false` para os 4 usuários (2 admin, manager, staff). Pacote `starter`; o Lens só vem no `enterprise` (Completo) | sim (`true`) |
| O DCL abre? (onde fica a comparação com prazo) | **não**: `false` para os 4 | sim |
| O Vendas abre? | só para os 2 admins (manager e staff: `false`) | sim |
| Acordos de laboratório | **0** | 319 |
| Lentes de contato ativas | **0** | 273 |
| Lentes oftálmicas ativas / fornecedores | 4.610 / 6 | 5.569 / 10 |
| Canônicas com mais de 1 fornecedor | 56 standard · 1.451 premium | — |

**Resultado:** nenhuma linha abaixo pode ser demonstrada no sintético enquanto o Lens não for liberado para esse tenant.
Liberar é mudança de pacote, e a regra da casa é: o digiai libera, com a palavra do dono. **Eu não mexi.** Mesmo depois
de liberar, as linhas 4 e 5 continuam sem massa no sintético (0 acordos, 0 lentes de contato), e o dono tem 3 caminhos:
(a) criar a massa no sintético, com "pode"; (b) só falar a frase, sem abrir a tela; (c) tirar essas linhas do pitch.

## Tabela "dúvida → solução" (formato do §3 do pitch)

Nome de uso da folha: **Lentes / comparador de laboratórios** (no Hub, **Clearix Lens**). Toda ressalva inclui, dita uma
vez no bloco: **"o catálogo de lentes só vem no pacote Completo."**

| # | Dúvida/dor do dono de ótica (nas palavras dele) | Solução no app (uma frase) | Tela/rota exata | Ressalva honesta (em voz alta) | Demonstração de 60 s (o que clicar, o que mostrar) | Número da folha que cabe (com data) |
|---|---|---|---|---|---|---|
| 1 | "Cada laboratório me manda uma tabela e eu não consigo comparar." | Catálogo de lentes por fornecedor, com filtro por laboratório, marca, tipo, material, índice e tratamento (verde = com, vermelho = sem). | Clearix Lens › `/lentes` | "O catálogo é carregado na implantação, a partir das tabelas dos seus laboratórios; a loja não sobe tabela sozinha." | *(depois de liberar o Lens no sintético)* `/lentes` → escolher um laboratório → no bloco de tratamentos, deixar **AR** verde e **Foto** vermelho → mostrar as outras listas oferecendo só o que ainda existe | 5.569 lentes oftálmicas no catálogo (14/09/2026) |
| 2 | "A mesma lente tem um nome em cada laboratório; eu nem sei se é a mesma." | Lente canônica: um conceito (tipo, material, índice, tratamentos) que reúne a lente real de cada fornecedor. | Clearix Lens › `/standard` → `/standard/[id]` (marcas: `/premium/[id]`) | "Mesma lente aqui quer dizer mesmo tipo, material, índice e tratamentos; lente de marca só se junta com a mesma marca e linha. **Não é equivalência de qualidade.**" | `/standard` → abrir **Visão Simples CR39 1.50 Incolor** → bloco "Lentes Mapeadas": o nome de cada laboratório, lado a lado, com o preço | — |
| 3 | "Não sei em qual laboratório esta lente sai mais barata." | Dentro da mesma lente, o preço de cada fornecedor, com mínimo, máximo e médio. | Clearix Lens › `/standard/[id]` (lateral "Preços Agregados"); a comparação **com prazo**, na hora de comprar, é do DCL | "Compara **preço** (e o prazo, na tela de compra do laboratório). **Não compara qualidade, atraso, garantia nem refação.** A escolha é sua." | Na mesma tela da linha 2: ler o mínimo e o máximo da lateral e apontar na lista de qual laboratório é cada um | — |
| 4 | "Negociei desconto com um laboratório e na hora de comprar ninguém lembra." | O acordo de laboratório entra no custo, e as faixas de preço já saem pelo custo com os acordos vigentes. | Clearix Lens › `/standard/[id]` (bloco "Faixas de Preço") | "Acordo é o custo que **você** negociou, não tabela pública de laboratório. O acordo é cadastrado na implantação; **a loja não tem tela para cadastrar.**" | **Não demonstrar no sintético hoje** (0 acordos): falar a frase, sem abrir a tela | 319 acordos de laboratório cadastrados (14/09/2026) |
| 5 | "Lente de contato: a mesma marca em dois fornecedores, preço diferente, e o vendedor pega a errada." | Catálogo de lente de contato com SKU próprio, fornecedor e "onde mais esta lente é vendida"; o preço lançado no produto original passa sozinho para a mesma lente no outro fornecedor. | Clearix Lens › `/contato` → `/contato/[id]` | "Parte das lentes de contato ainda está sem custo cadastrado. Lente de contato **não** tem comparação automática: a troca de fornecedor é feita na compra." | **Não demonstrar no sintético hoje** (0 lentes de contato): falar a frase, sem abrir a tela | 274 lentes de contato no catálogo (14/09/2026) |

## Isso o Clearix não faz (catálogo de lentes)

| Dúvida do dono de ótica (nas palavras dele) | Resposta em voz alta |
|---|---|
| "Qual é o melhor laboratório?" | "O sistema não responde isso: ele mostra preço e prazo, e você escolhe." (frase do roteiro de 14/09) — o Clearix não avalia qualidade, histórico de atraso, garantia nem refação. |
| "Quero que a tabela nova do laboratório entre sozinha." | "A atualização de tabela é serviço, feito por nós; o sistema não lê a tabela do laboratório sozinho." — não há tela para a loja importar tabela. |

## Bastidor para o eco e o Geral (não vai para a fala)

- **Nada acima é "em breve".** Todas as telas estão no `origin/main` do Lens, sem nenhum commit pendente de envio (conferido
  em 16/09).
- **Não citei números fora da §1 da folha.** Ficaram de fora (medidos, não autorizados para a fala): 910 canônicas, 57
  lentes de contato à venda por R$ 0 (a folha usa 71 de 275, medição anterior; por isso escrevi "parte"), 56 standard e
  1.451 premium com mais de um fornecedor no sintético.
- **Existe e roda, mas não está na §2, então ficou fora da tabela.** Candidatas a entrar, se o Geral quiser:
  (a) laboratório pausado some da busca, dos filtros e do preço em todos os apps (migrações 355–359);
  (b) simulador de receita que lista as lentes que atendem o grau (`/simulador/receita`);
  (c) livro de preço por perfil (`pricing_book`: 7.074 linhas na operação, 5.404 no sintético).
- **Vale para a linha 5, a quem for demonstrar no Vendas:** a mesma lente de contato em dois fornecedores aparece hoje
  como **dois cards iguais** no PDV (só muda o SKU). A decisão "1 card × 2 cards" está com o dono (plano A6 do eco).
- **A coluna "pergunta da anamnese" (opcional no alinhamento)** fica aqui, para o dono usar como pergunta de apoio depois
  da P4 do pitch ("Como vai a OS para o laboratório…"): linhas 1–3 → "Quantos laboratórios você usa e quem escolhe o de
  cada OS, olhando o quê?"; linha 4 → "Você tem desconto ou campanha combinada com algum laboratório? Onde isso fica
  anotado?"; linha 5 → "Você vende lente de contato? Compra sempre do mesmo fornecedor?"
