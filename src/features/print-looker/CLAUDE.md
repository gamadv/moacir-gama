# PrintLooker - Calculadora de Preços de Impressão

## Objetivo

Calcular orçamentos de impressão com descontos por volume, gerenciando múltiplos itens e 9 tipos de impressão.

---

## Estrutura

```
print-looker/
├── assets/
│   └── PrintBanner.png          # Imagem da tabela de preços (exibida em modal)
├── model/
│   └── calculate-price.ts       # Lógica de preços e descontos
├── ui/
│   └── PrintLooker.tsx          # Componente principal (client)
└── index.ts                     # Exporta apenas PrintLooker
```

---

## Model (`calculate-price.ts`)

### Tipos

```typescript
type PrintType =
  | 'sulfite_color' | 'sulfite_pb'
  | 'copy_color' | 'copy_pb'
  | 'photo_a4' | 'photo_12x17' | 'photo_10x15'
  | 'label_a4_pb' | 'label_a4_color';

interface PricingRule {
  minQuantity: number;
  unitPrice: number;
}

interface PrintTypeInfo {
  id: PrintType;
  label: string;           // Nome em pt-BR
  basePrice: number;        // Preço base por unidade
  rules: PricingRule[];     // Faixas de desconto
}

interface PriceResult {
  totalPrice: number;
  unitPriceApplied: number;
  isDiscounted: boolean;
  savings?: number;
}
```

### Tabela de Preços (PRINT_TYPES)

| Tipo | Label | Preço Base | Descontos |
|------|-------|-----------|-----------|
| `sulfite_color` | Sulfite Colorido | R$ 3,00 | 20+ → R$ 1,00; 100+ → R$ 0,80 |
| `sulfite_pb` | Sulfite P&B | R$ 2,50 | 20+ → R$ 0,50 |
| `copy_color` | Cópia Colorida (Xerox) | R$ 2,50 | 20+ → R$ 1,00; 100+ → R$ 0,80 |
| `copy_pb` | Cópia P&B (Xerox) | R$ 2,00 | 20+ → R$ 0,50 |
| `photo_a4` | Foto A4 | R$ 10,00 | Sem desconto |
| `label_a4_pb` | Etiqueta A4 P&B | R$ 8,00 | Sem desconto |
| `label_a4_color` | Etiqueta A4 Colorida | R$ 6,00 | Sem desconto |
| `photo_10x15` | Foto 10x15 | R$ 4,00 | Sem desconto |
| `photo_12x17` | Foto 12x17 | R$ 6,00 | Sem desconto |

### Funções

| Função | Descrição |
|--------|-----------|
| `calculatePrintPrice(type, quantity)` | Aplica maior faixa de desconto aplicável. Retorna `PriceResult` |
| `formatCurrency(value)` | Formata para BRL: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` |

### Algoritmo de Desconto

1. Ordena regras por `minQuantity` decrescente
2. Encontra primeira regra onde `quantity >= minQuantity`
3. Aplica preço dessa faixa (ou `basePrice` se nenhuma)
4. `savings = (basePrice × qty) - totalPrice`

---

## UI (`PrintLooker.tsx`)

### Estado

```typescript
interface PrintItem {
  id: string;              // Math.random().toString(36).substr(2, 9)
  type: PrintType;
  quantity: string;         // String para preservar input do usuário
}

// Estado: PrintItem[] — inicia com 1 item (sulfite_color, qty 1)
```

### Comportamento

- **addItem()**: Adiciona novo item com tipo padrão sulfite_color e qty 1
- **removeItem(id)**: Remove item da lista
- **updateItem(id, field, value)**: Atualiza type ou quantity
- **calculatedItems (useMemo)**: Mapeia items → calculatePrintPrice para cada
- **totalSum**: Soma de todos os totalPrice

### Layout

1. **Header**: Texto descritivo + botão "Ver Tabela" (abre Dialog com PrintBanner.png)
2. **Grid de itens**: 4 colunas — Select tipo, Input quantidade, Total, Botão remover
3. **Badge "Desc."**: Aparece em verde quando desconto aplicado
4. **Preço unitário**: Exibido em texto 10px abaixo do select
5. **Footer**: Botão "+ Adicionar Item" + Total Geral (verde, 3xl, monospace)
6. **Empty state**: Mensagem quando lista vazia

### Componentes UI utilizados

`Button`, `Input`, `Select` (Radix), `Dialog` (Radix), `Badge`, `Image` (Next.js)

---

## Sem Testes

Esta feature não possui testes. Candidatas a teste:
- `calculatePrintPrice` com diferentes quantidades e tipos
- Algoritmo de desconto por faixas
- `formatCurrency` com valores diversos
