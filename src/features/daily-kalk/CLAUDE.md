# DailyKalk - Calculadora de Horas Diárias

## Objetivo

Calcular horas úteis de trabalho diárias em dois períodos (manhã/tarde), comparando com a meta de 8h e prevendo o horário de saída.

---

## Estrutura

```
daily-kalk/
├── model/
│   ├── calculate-hours.ts       # Lógica de negócio
│   └── calculate-hours.test.ts  # Testes unitários (~20 testes)
├── ui/
│   ├── DailyKalk.tsx            # Componente principal (client)
│   ├── TimeInput.tsx            # Input de horário formatado (client)
│   └── TimeInput.test.tsx       # Testes do input (~13 testes)
└── index.ts                     # Exporta apenas DailyKalk
```

---

## Model (`calculate-hours.ts`)

### Constantes

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `TARGET_MINUTES` | 480 | Meta de 8h em minutos |
| `DEFAULT_LUNCH_BREAK` | 60 | Intervalo padrão de 1h |

### Tipos

```typescript
interface WorkHoursResult {
  totalMinutes: number;
  totalFormatted: string;        // Ex: "8h 30min"
  remainingMinutes: number;      // Diferença absoluta da meta
  remainingFormatted: string;
  status: 'exact' | 'under' | 'over';
}
```

### Funções

| Função | Entrada | Saída | Descrição |
|--------|---------|-------|-----------|
| `timeToMinutes(time)` | `"HH:MM"` | `number \| null` | Converte horário para minutos. Valida formato, horas (0-23) e minutos (0-59) |
| `minutesToTimeString(min)` | `number` | `"HH:MM"` | Converte minutos para horário. Faz wrap em 24h |
| `formatMinutesToDisplay(min)` | `number` | `string` | Formato legível: "8h", "30min", "8h 30min". Suporta negativos |
| `calculateWorkHours(e1, s1, e2, s2)` | 4x `string` | `WorkHoursResult \| null` | Calcula total de dois períodos. Aceita períodos parciais. Retorna null se nenhum período completo |
| `calculateEndTime(e1, s1, e2, _s2)` | 4x `string` | `string \| null` | Prevê horário de saída: `entrada + 8h + almoço`. Detecta almoço customizado se s1 e e2 preenchidos |

### Regras de Negócio

- Um período é "completo" quando tem entrada E saída preenchidas
- Cálculo funciona com apenas 1 período completo (parcial)
- Retorna `null` se nenhum período tiver entrada e saída
- `calculateEndTime` usa intervalo padrão (1h) se almoço não informado
- Almoço customizado = `entry2 - exit1` (quando ambos válidos)

---

## UI

### DailyKalk.tsx

**Estado**: 4 strings (`entry1`, `exit1`, `entry2`, `exit2`)

**Valores computados (useMemo)**:
- `result` → `calculateWorkHours(...)` com os 4 inputs
- `endTime` → `calculateEndTime(...)` com os 4 inputs
- `hasMorningPeriod`, `hasAfternoonPeriod` → verificam se campo tem 5 chars
- `isPartialCalculation` → apenas 1 período completo

**Feedback visual por status**:
- `exact` (verde): "Meta atingida!"
- `under` (laranja): "Abaixo da meta" + "Faltam Xh Xmin"
- `over` (azul): "Acima da meta" + "Horas Extras Xh Xmin"

**Checkmarks verdes** aparecem quando um período está completo.

### TimeInput.tsx

**Props**: `{ value, onChange, label, placeholder? }`

**Formatação automática**:
- Remove não-numéricos
- Insere `:` após 2 dígitos (ex: "0830" → "08:30")
- Limita a 4 dígitos
- `inputMode="numeric"`, `maxLength={5}`

---

## Testes

### calculate-hours.test.ts

- `timeToMinutes`: conversões válidas, inputs inválidos, edge cases
- `minutesToTimeString`: conversões, wrap 24h
- `formatMinutesToDisplay`: formato legível, negativos
- `calculateWorkHours`: dia completo, parcial, under/over/exact
- `calculateEndTime`: almoço padrão, customizado, wrap meia-noite

### TimeInput.test.tsx

- Renderização (label, placeholder, atributos)
- Formatação (auto-colon, strip não-numérico, paste, clear)
- **Não testado**: navegação teclado, blur/focus, validação de hora
