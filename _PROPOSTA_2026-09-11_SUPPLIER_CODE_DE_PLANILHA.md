# Proposta — `supplier_code` de lente de contato que é número de linha de planilha

**De:** Lens · **Para:** orquestrador do ecossistema e dono · **11/09/2026**
**Origem:** plano de ordem de 11/09, fila do Lens, item 3 ("limpar ou marcar, proposta antes de aplicar").
**Estado:** só medição. **Nada foi alterado.** Aplicar exige o "pode" do dono.

---

## 1. O que está medido (tenant Grupo Mello, produtos vivos)

```
lentes de contato vivas ....................... 274
supplier_code de 1 a 3 dígitos ................ 77   (nenhum de 4 dígitos)
   dos quais originais scraper:lentenet ....... 63   (de 64 linhas vivas da Lentenet)
   dos quais cópias CO- (Central Oftálmica) ... 14
```

**Bate com o DCL:** ele mediu 78 de 275; depois disso a migração 369b removeu
`CO-LC100196`, que tinha código "20". 78 − 1 = 77 e 275 − 1 = 274.

## 2. De onde vem

A Lentenet **não é fornecedor, é loja online**. As linhas guardam
`attributes.url_original` apontando para a página do produto na loja
(ex.: `lentedecontato.lentenet.com.br/produto/lunare-tri-kolor-mensal-graduada-unidade/`).
O número em `supplier_code` é a **posição do produto na listagem raspada** — não
identifica nada no fornecedor, e **não há código real escondido nessas linhas
para recuperar**.

Exceção: 5 produtos Solótica guardam `attributes.solotica_sku`
(LC100091→329, LC100161→353, LC100651→301, LC101316→310, LC101225→6353).
Podem ser o código real, mas **não conferi** — ficam para conferência humana, não
para preenchimento automático.

## 3. Por que não "herdar do gêmeo"

Buscar um produto de nome parecido que tenha código real parece tentador e erra:
`Biofinity Toric` casa com o código do Biofinity comum; `Air Optix Hydraglyde
Multifocal` casa com o do Air Optix comum; `Clariti 1 Day Multifocal` com o do
Clariti comum. Isso colocaria **referência errada no pedido ao fornecedor**.
Descartado.

## 4. Quem é afetado hoje

| App | Comportamento com o código de planilha |
|---|---|
| DCL | já **esconde** (`TrocarLenteContato.tsx`, regex `^\d{1,4}$`) |
| Vendas | não exibe `supplier_code` |
| Lens | **exibe** "cód. fornecedor 20" em `/contato/[id]` — enganoso — e **busca** por ele |
| `rpc_contact_lens_search` (367) | busca por ele: procurar "3" traz 134, **16 só pelo código lixo** |

## 5. Risco de limpar — verificado

`rpc_etl_contact_lenses_from_csv` reconhece produto existente por **`legacy_key`**
(`-- Skip if already exists (by legacy_key)` + `ON CONFLICT DO NOTHING`).
`supplier_code` só aparece na lista de colunas do INSERT. **Limpar o campo não
causa duplicata em importação futura.** Nenhuma outra função usa o campo para
identificar produto.

## 6. Opções

**A — Limpar (recomendada).** `supplier_code = NULL` nas 77, guardando o valor
antigo em `attributes.lentenet_posicao`. Some da tela e da busca em todos os apps
**sem mudar código de app**; a regex do DCL vira redundante. Reversível.

**B — Marcar.** Manter o número e acrescentar `attributes.supplier_code_confiavel = false`.
Exige que Lens, Vendas, DCL e a busca aprendam a ler a marca — e até todos
ajustarem o lixo segue na busca. É o formato "arruma um lado, esquece o outro".

**C — Recuperar do gêmeo.** Descartada (item 3).

### Ensaio da opção A (não executado)

```sql
CREATE TABLE catalog_lenses._fix371_supplier_code_planilha_antes AS
SELECT id, sku, supplier_code, source_system, attributes, now() AS backup_em
FROM catalog_lenses.contact_lenses
WHERE tenant_id = '6292c9f0-0291-4b9e-a7ea-04caf2ef3140'
  AND deleted_at IS NULL
  AND supplier_code ~ '^[0-9]{1,3}$'
  AND (source_system = 'scraper:lentenet' OR source_system LIKE 'dup:%');   -- esperado: 77

UPDATE catalog_lenses.contact_lenses
SET attributes    = attributes || jsonb_build_object('lentenet_posicao', supplier_code),
    supplier_code = NULL
WHERE <mesmo filtro>;                                                        -- esperado: 77 linhas

-- rollback
UPDATE catalog_lenses.contact_lenses
SET supplier_code = attributes->>'lentenet_posicao',
    attributes    = attributes - 'lentenet_posicao'
WHERE attributes ? 'lentenet_posicao';
```

Não toca preço, SKU, status nem OS. As 11 linhas removidas com o mesmo lixo ficam
como estão.

## 7. Achado ao lado, maior que o item 3 — muda a A6 do plano

A A6 fala em **14 B&L sem custo**. O número real é outro:

```
lentes de contato vivas com custo 0,00 ......... 71
   sem contar as cópias CO- .................... 57
   ativas, ou seja, À VENDA a R$ 0 ............. 57
```

Além das 14 B&L: Alcon 10, CooperVision 18, J&J 13, Natural Vision 1, Optolentes 1.
Quase todas são as mesmas linhas da Lentenet — o scraper trouxe nome e posição,
não preço.

A trava "custo zero confirmado" do DCL (A3) protege a **compra**; a **venda** ainda
sai a R$ 0. Caminhos para o dono:
1. lançar preço nas **57** (não 14) — as CO- acompanham sozinhas desde a 370;
2. inativar as de custo zero até ter preço — só tira do balcão depois do push do
   Vendas com o filtro de status (despacho de 11/09);
3. manter e confiar na conferência do balcão.

---

## Decisão do dono

- Item 3 (`supplier_code`): **A / B / nenhuma** →
- Achado 7 (57 a custo zero): **1 / 2 / 3** →
