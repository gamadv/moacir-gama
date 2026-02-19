# Jardani - Controlador Financeiro Simples Nacional

## Visão Geral

Controlador de faturamento para empresas ME (Microempresa) no regime Simples Nacional, com cálculo automático de impostos (DAS + INSS + IRRF) baseado no RBT12. Pro-labore calculado via Fator R (28% × RBT12 / 12). Requer autenticação.

---

## Estrutura

```
src/features/jardani/
├── model/
│   ├── tax-tables.ts           # Constantes: tabelas Simples Nacional, IRRF, INSS
│   ├── calculate-tax.ts        # Funções puras de cálculo
│   ├── calculate-tax.test.ts   # 103 testes unitários
│   └── types.ts                # Tipos compartilhados
├── ui/
│   ├── Jardani.tsx             # Orquestrador principal
│   ├── CompanySetup.tsx        # Form de criação de empresa
│   ├── TaxSummary.tsx          # Cards resumo do mês (faturamento, RBT12, taxa, DAS)
│   ├── RevenueTable.tsx        # Grid 13 meses com numeração ordinal e edição inline
│   ├── BulkRevenueInput.tsx    # Dialog para importar 11 meses históricos
│   ├── ProLaboreCalculator.tsx # Breakdown pro-labore (via Fator R)
│   ├── DarfSummary.tsx         # Guias mensais: DAS + GPS/INSS + IRRF
│   ├── RevenueSimulator.tsx    # Simulação de 12 meses futuros (DAS + INSS + IRRF)
│   ├── PjSimulator.tsx         # Simulador de contratos PJ (persistido no DB)
│   └── CurrencyInput.tsx       # Input formatado BRL com clearable (UI puro)
├── lib/
│   ├── use-jardani.ts          # Hook: SWR + Axios para data fetching e mutações
│   └── cache-keys.ts           # Constantes de cache keys SWR
├── CLAUDE.md
└── index.ts
```

---

## Regras de Negócio

### Simples Nacional - Anexo III

| Faixa | RBT12 (até) | Alíquota | Dedução |
|-------|-------------|----------|---------|
| 1 | R$ 180.000 | 6,00% | R$ 0 |
| 2 | R$ 360.000 | 11,20% | R$ 9.360 |
| 3 | R$ 720.000 | 13,50% | R$ 17.640 |
| 4 | R$ 1.800.000 | 16,00% | R$ 35.640 |
| 5 | R$ 3.600.000 | 21,00% | R$ 125.640 |
| 6 | R$ 4.800.000 | 33,00% | R$ 648.000 |

**Taxa Efetiva**: `((RBT12 × Alíquota) - Dedução) / RBT12`

**Imposto DAS**: `ceil(Faturamento do mês × Taxa Efetiva)` (arredondado para cima)

### RBT12

Receita Bruta Total dos últimos 12 meses. Para o mês X, soma os 12 meses **anteriores** a X (não inclui X).

### Pro-labore (via Fator R)

**Pro-labore = max(salário mínimo, 28% × RBT12 / 12)**. Garante Fator R >= 28% para Anexo III.

Descontos:
- **INSS**: 11% sobre o bruto, limitado ao teto (R$ 7.786,02). **Truncado** (Math.floor).
- **IRRF**: Tabela progressiva sobre (bruto - INSS)

### Fator R

`(proLabore × 12) / RBT12`. Com a fórmula sugerida, Fator R fica em ~28%, garantindo enquadramento no Anexo III.

### IRRF - Tabela Progressiva (Lei 14.848/2024)

| Base de Cálculo | Alíquota | Dedução |
|-----------------|----------|---------|
| Até R$ 2.259,20 | Isento | - |
| R$ 2.259,21 a R$ 2.826,65 | 7,5% | R$ 169,44 |
| R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 381,44 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

### Arredondamento

- **DAS**: `Math.ceil` (arredondamento para cima)
- **INSS**: `Math.floor` (truncamento)
- **IRRF**: `Math.round` (arredondamento padrão)

### Guias Mensais (DAS + GPS + DARF)

Composição mensal de impostos a pagar:
- **DAS**: Simples Nacional (ceil(alíquota efetiva × faturamento))
- **Código 1099** (GPS): INSS Contribuição Individual (11% do pro-labore sugerido, truncado)
- **Código 0561** (DARF): IRRF sobre rendimento do trabalho (pro-labore sugerido)
- **Vencimento**: Dia 20 do mês seguinte ao período de apuração

---

## Valores em Centavos

Todos os valores monetários são armazenados como **inteiros em centavos** para evitar problemas de precisão com ponto flutuante. R$ 15.000,00 = 1.500.000 centavos.

Horas são armazenadas como **inteiros em centésimos** (16050 = 160,50h).

---

## Funções Principais (`calculate-tax.ts`)

| Função | Descrição |
|--------|-----------|
| `findBracket(rbt12)` | Encontra faixa do Simples Nacional |
| `calculateEffectiveRate(rbt12)` | Calcula taxa efetiva |
| `calculateSimplesTax(revenue, rbt12)` | Imposto DAS completo |
| `calculateRBT12(revenues, year, month)` | Soma 12 meses anteriores |
| `getLast12Months(year, month)` | Array dos 12 meses anteriores |
| `calculateINSS(gross)` | INSS empregado com teto (truncado) |
| `calculateIRRF(base, dependents?)` | IRRF progressivo |
| `calculateProLabore(gross, dependents?)` | Cadeia completa pro-labore |
| `calculateSuggestedProLabore(rbt12)` | Pro-labore via Fator R: max(mínimo, 28%×RBT12/12) |
| `calculateFatorR(monthlyProLabore, rbt12)` | Calcula Fator R (folha/RBT12) |
| `calculateMonthSummary(revenues, year, month)` | Resumo financeiro (pro-labore via Fator R) |
| `calculateDarfSummary(revenue, rbt12, year, month)` | Guias: DAS(ceil) + INSS(floor) + IRRF |
| `getDarfDueDate(year, month)` | Data de vencimento (dia 20 do mês seguinte) |
| `formatCentavos(centavos)` | Formata para BRL |
| `formatPercent(decimal)` | Formata decimal para porcentagem |
| `centavosToDisplay(centavos)` | Formata centavos sem prefixo R$ |
| `parseCurrencyToCentavos(input)` | Parse BRL para centavos |
| `centihoursToDisplay(centihours)` | Formata centésimos de hora para display |
| `parseCentihoursFromInput(input)` | Parse input de horas para centésimos |
| `getMonthName(month)` | Nome do mês em pt-BR |

---

## API Routes

### `/api/jardani/company`
- **GET** — Empresa do usuário com receitas e contratos
- **POST** — Cria empresa (`{ name }`)
- **PUT** — Atualiza campos (`{ name?, dependents?, proLabore? }`)

### `/api/jardani/revenue`
- **GET** — Todas as receitas da empresa
- **POST** — Upsert mês (`{ year, month, revenue }`)
- **PUT** — Bulk upsert (`{ revenues: [...] }`)
- **DELETE** — Remove entrada (`?id=xxx`)

### `/api/jardani/contract`
- **GET** — Todos os contratos PJ da empresa
- **POST** — Cria contrato (`{ valorHora, horasMes }`)
- **PUT** — Atualiza contrato (`{ id, valorHora?, horasMes? }`)
- **DELETE** — Remove contrato (`?id=xxx`)

---

## Banco de Dados

### Company
- `id` (CUID), `name`, `userId` (unique), `dependents`, `proLabore`, `createdAt`, `updatedAt`
- Relação 1:1 com User
- Relação 1:N com MonthlyRevenue e PjContract

### MonthlyRevenue
- `id` (CUID), `companyId`, `year`, `month`, `revenue` (centavos)
- Unique: `[companyId, year, month]`

### PjContract
- `id` (CUID), `companyId`, `valorHora` (centavos), `horasMes` (centésimos de hora)
- Cascade delete com Company

---

## Tab com Autenticação

A aba Jardani usa `isAuthRequired: true` no sistema de tabs. Quando o usuário não está logado, mostra o componente `AuthLockedMessage` com ícone de cadeado e botão de login. O trigger da tab exibe um ícone `Lock` ao lado do nome.

---

## Responsividade Mobile

- **Breakpoint**: `sm:` (640px) — layout compacto abaixo, expandido acima
- **RevenueTable**: Mobile esconde coluna # e Taxa Efetiva (3 colunas)
- **RevenueSimulator**: Mobile mostra Mês | Total Impostos | Líquido (3 colunas)
- **PjSimulator**: Mobile usa layout vertical (card) por contrato
- **TaxSummary**: `grid-cols-2 sm:grid-cols-3`, MiniCards `grid-cols-1 sm:grid-cols-3`
- **Sticky Tab**: IntersectionObserver mostra nome da tab ativa quando tab bar sai da viewport

---

## Data Fetching (SWR + Axios)

### Hook `useJardani()`

Usa `useSWR` com fetcher Axios (`@/shared/lib/swr`) para busca de dados e `mutate()` para revalidação após mutações.

**Cache key**: `JARDANI_KEYS.company` (`/api/jardani/company`) — única key, a rota retorna empresa + receitas + contratos.

**Mutações**: Helper privado `apiMutate()` (Axios) executa POST/PUT/DELETE e chama `mutate()` para revalidar o cache.

**Interface pública** (`UseJardaniReturn`):
- `company` — dados da empresa ou null
- `isLoading` — true apenas no carregamento inicial
- `error` — mensagem de erro ou null
- Funções: `createCompany`, `updateCompanyName`, `upsertRevenue`, `bulkUpsertRevenues`, `deleteRevenue`, `createContract`, `updateContract`, `deleteContract`, `refresh`

**Benefícios do SWR**: cache automático, deduplicação de requests, revalidação no focus, retry com backoff.

---

## Padrões FSD

- **Orquestrador**: `Jardani.tsx` calcula `currentYear`/`currentMonth` uma vez e passa como props para todos os filhos (single source of truth)
- **CurrencyInput**: UI puro com `clearable` prop — funções de conversão estão no model (`parseCurrencyToCentavos`, `centavosToDisplay`)
- **Funções geradoras**: `generateMonthRows()`, `generateBulkMonths()` recebem `currentYear`/`currentMonth` como parâmetros (puras)
- **Persistência PJ**: Contratos salvos no DB via API, PjSimulator recebe callbacks como props
