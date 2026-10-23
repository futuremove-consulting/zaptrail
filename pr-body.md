## Objetivo

Incluir o sufixo **CC (Cliente Compra)** no filtro de privacidade/relevância do WhatsApp, mantendo a lista original completa:

```
LC, PP, LV, LL, CV, CL, CO, LD, CC
```

## Alterações

- `privacy-filter.ts`
  - `VALID_COMMERCIAL_SUFFIXES` inclui `CC`
  - `extractCommercialSuffix` aceita o formato de colchetes gerado pelo promotion-engine (ex.: nome salvo `Roberto Investidor [CC]`) — tambem passa a aceitar `[LC]` etc.
- `contact-analyzer.ts`
  - branch explicita: `CC` classifica como `cliente_compra` (nao cai no default `lead_compra`)
  - `cleanContactName` remove sufixo entre colchetes
  - union `declaredRole` inclui `cliente_compra`
- `taxonomy-formatter.ts`
  - `normalizeToCanonicalSuffix(CC) -> LC` (precedente de `CV`)
  - `isBuyerSuffix(CC) = true`
  - `getSuffixDescription(CC)` com descricao propria
  - regex de `formatCanonicalContactName` aceita `CC` e colchetes
- strings de display (`analysis-engine`, `turn-reporter`) listam o conjunto completo

## Validacao

- 37 testes passando (privacy-filter, contact-analyzer, taxonomy, turn-reporter, e2e_business_flows)
- typecheck (`tsc --noEmit`) verde
- lint sem erros novos (2 erros de lint pre-existentes na main nao sao deste PR)

## Risco

Baixo: filtro de sufixo e taxonomia sao deterministicos; consumidores de `declaredRole` (`analysis-engine`, `turn-reporter`, `contact-persistence`) toleram o novo valor via union.
