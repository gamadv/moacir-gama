import {
  type DarfSummary,
  FATOR_R_THRESHOLD,
  INSS_EMPLOYEE_RATE,
  INSS_SALARY_CEILING,
  IRRF_BRACKETS,
  IRRF_DEPENDENT_DEDUCTION,
  MINIMUM_WAGE,
  type MonthSummary,
  type ProLaboreResult,
  SIMPLES_NACIONAL_BRACKETS,
  type TaxBracket,
  type TaxCalculationResult,
} from './tax-tables';

// ---- SIMPLES NACIONAL ----

/** Encontra a faixa aplicável para o RBT12 informado. Retorna null se exceder o limite. */
export function findBracket(rbt12: number): TaxBracket | null {
  if (rbt12 <= 0) return SIMPLES_NACIONAL_BRACKETS[0];
  return SIMPLES_NACIONAL_BRACKETS.find((b) => rbt12 <= b.maxRbt12) ?? null;
}

/**
 * Taxa efetiva: ((RBT12 × Alíquota) - Dedução) / RBT12
 * Retorna a alíquota nominal da faixa 1 (6%) quando RBT12 é 0.
 */
export function calculateEffectiveRate(rbt12: number): number {
  const bracket = findBracket(rbt12);
  if (!bracket) return 0;
  if (rbt12 <= 0) return bracket.rate;
  return (rbt12 * bracket.rate - bracket.deduction) / rbt12;
}

/** Cálculo completo do Simples Nacional para um mês. */
export function calculateSimplesTax(
  monthlyRevenue: number,
  rbt12: number
): TaxCalculationResult | null {
  const bracket = findBracket(rbt12);
  if (!bracket) return null;
  const effectiveRate = calculateEffectiveRate(rbt12);
  const monthlyTax = Math.ceil(monthlyRevenue * effectiveRate);
  return {
    bracket,
    rbt12,
    effectiveRate,
    effectiveRatePercent: formatPercent(effectiveRate),
    monthlyTax,
    monthlyRevenue,
    netRevenue: monthlyRevenue - monthlyTax,
  };
}

// ---- RBT12 ----

/**
 * RBT12 = soma dos 12 meses ANTERIORES ao mês de referência.
 * Para imposto de março/2025, RBT12 = março/2024 até fevereiro/2025.
 */
export function calculateRBT12(
  revenues: Array<{ year: number; month: number; revenue: number }>,
  refYear: number,
  refMonth: number
): number {
  const months = getLast12Months(refYear, refMonth);
  return months.reduce((sum, { year, month }) => {
    const entry = revenues.find((r) => r.year === year && r.month === month);
    return sum + (entry?.revenue ?? 0);
  }, 0);
}

/** Retorna array de {year, month} dos 12 meses anteriores ao mês referência. */
export function getLast12Months(
  refYear: number,
  refMonth: number
): Array<{ year: number; month: number }> {
  const result: Array<{ year: number; month: number }> = [];
  for (let i = 1; i <= 12; i++) {
    let m = refMonth - i;
    let y = refYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    result.push({ year: y, month: m });
  }
  return result;
}

// ---- PRO-LABORE ----

/** INSS contribuição empregado: 11% com teto. Truncado (floor). */
export function calculateINSS(grossProLabore: number): number {
  const base = Math.min(grossProLabore, INSS_SALARY_CEILING);
  return Math.floor(base * INSS_EMPLOYEE_RATE);
}

/**
 * IRRF pela tabela progressiva.
 * Base = bruto - INSS - (dependentes × R$ 189,59).
 * @param irrfBase Base antes de deduzir dependentes (bruto - INSS)
 * @param dependents Número de dependentes (dedução de R$ 189,59 cada)
 */
export function calculateIRRF(irrfBase: number, dependents: number = 0): number {
  const adjustedBase = irrfBase - dependents * IRRF_DEPENDENT_DEDUCTION;
  if (adjustedBase <= 0) return 0;
  const bracket = IRRF_BRACKETS.find((b) => adjustedBase <= b.maxBase);
  if (!bracket || bracket.rate === 0) return 0;
  return Math.round(adjustedBase * bracket.rate - bracket.deduction);
}

/** Cálculo completo do pro-labore: bruto → INSS → IRRF → líquido. */
export function calculateProLabore(grossAmount: number, dependents: number = 0): ProLaboreResult {
  const inssEmployee = calculateINSS(grossAmount);
  const irrfBase = grossAmount - inssEmployee;
  const irrf = calculateIRRF(irrfBase, dependents);
  return {
    grossAmount,
    inssEmployee,
    irrfBase,
    irrf,
    netAmount: grossAmount - inssEmployee - irrf,
  };
}

// ---- FATOR R ----

/**
 * Pro-labore sugerido via Fator R.
 * Fórmula: max(salário mínimo, 28% × RBT12 / 12).
 * Garante Fator R >= 28% para enquadramento no Anexo III.
 */
export function calculateSuggestedProLabore(rbt12: number): number {
  const suggested = Math.round((FATOR_R_THRESHOLD * rbt12) / 12);
  return Math.max(MINIMUM_WAGE, suggested);
}

/**
 * Fator R = (Folha de pagamento 12 meses) / RBT12.
 * Para ME solo, folha = pro-labore × 12.
 * Se Fator R >= 28%, empresa fica no Anexo III (taxas menores).
 */
export function calculateFatorR(monthlyProLabore: number, rbt12: number): number {
  if (rbt12 <= 0) return 0;
  return (monthlyProLabore * 12) / rbt12;
}

// ---- RESUMO DO MÊS ----

/**
 * Resumo financeiro completo de um mês.
 * Pro-labore = max(salário mínimo, 28% × RBT12 / 12) via Fator R.
 */
export function calculateMonthSummary(
  revenues: Array<{ year: number; month: number; revenue: number }>,
  targetYear: number,
  targetMonth: number
): MonthSummary {
  const entry = revenues.find((r) => r.year === targetYear && r.month === targetMonth);
  const revenue = entry?.revenue ?? 0;
  const rbt12 = calculateRBT12(revenues, targetYear, targetMonth);
  const effectiveRate = calculateEffectiveRate(rbt12);
  const simplesNacionalTax = Math.ceil(revenue * effectiveRate);
  const suggestedProLabore = calculateSuggestedProLabore(rbt12);
  const proLabore = revenue > 0 ? calculateProLabore(suggestedProLabore) : null;

  return {
    year: targetYear,
    month: targetMonth,
    revenue,
    rbt12,
    effectiveRate,
    simplesNacionalTax,
    proLabore,
    netAfterTaxes: revenue - simplesNacionalTax,
  };
}

// ---- DARF / GUIAS MENSAIS ----

/**
 * Calcula a data de vencimento da DARF/GPS.
 * Regra geral: dia 20 do mês seguinte ao período de apuração.
 * Retorna string "DD/MM/YYYY".
 */
export function getDarfDueDate(refYear: number, refMonth: number): string {
  let dueMonth = refMonth + 1;
  let dueYear = refYear;
  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear += 1;
  }
  const dueDay = 20;
  return `${String(dueDay).padStart(2, '0')}/${String(dueMonth).padStart(2, '0')}/${dueYear}`;
}

/**
 * Monta o resumo de guias mensais: DAS + GPS/INSS + IRRF.
 * DAS = faturamento × taxa efetiva.
 * INSS/IRRF = baseados no pro-labore sugerido (28% × RBT12 / 12).
 * Retorna null se não houver faturamento.
 */
export function calculateDarfSummary(
  monthlyRevenue: number,
  rbt12: number,
  refYear: number,
  refMonth: number
): DarfSummary | null {
  if (monthlyRevenue <= 0) return null;

  const effectiveRate = calculateEffectiveRate(rbt12);
  const das = Math.ceil(monthlyRevenue * effectiveRate);
  const suggestedProLabore = calculateSuggestedProLabore(rbt12);
  const proLabore = calculateProLabore(suggestedProLabore);
  const period = `${String(refMonth).padStart(2, '0')}/${refYear}`;
  const dueDate = getDarfDueDate(refYear, refMonth);
  const items: DarfSummary['items'] = [];

  // DAS - Simples Nacional
  if (das > 0) {
    items.push({
      code: 'DAS',
      description: 'SIMPLES NACIONAL',
      subCode: 'Anexo III',
      subDescription: `Alíquota efetiva ${formatPercent(effectiveRate)}`,
      amount: das,
      period,
      dueDate,
    });
  }

  // GPS - INSS (código 1099)
  if (proLabore.inssEmployee > 0) {
    items.push({
      code: '1099',
      description: 'CP DESCONTADA SEGURADO - CONTRIB INDIVIDUAL',
      subCode: '01',
      subDescription: 'CP SEGURADOS - CONTRIBUINTES INDIVIDUAIS - 11%',
      amount: proLabore.inssEmployee,
      period,
      dueDate,
    });
  }

  // DARF - IRRF (código 0561)
  if (proLabore.irrf > 0) {
    items.push({
      code: '0561',
      description: 'IRRF - RENDIMENTO DO TRABALHO ASSALARIADO',
      subCode: '07',
      subDescription: 'IRRF - RD TRB ASSAL PAÍS/AUS NO EXT A SERV PAÍS',
      amount: proLabore.irrf,
      period,
      dueDate,
    });
  }

  return {
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
    refYear,
    refMonth,
  };
}

// ---- FORMATAÇÃO ----

/** Centavos para string BRL: 1500000 -> "R$ 15.000,00" */
export function formatCentavos(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100);
}

/** Taxa decimal para porcentagem: 0.06 -> "6,00%" */
export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(2).replace('.', ',') + '%';
}

/** Parse input BRL para centavos. Aceita "15.000,00", "R$ 15.000,00", "15000" */
export function parseCurrencyToCentavos(input: string): number | null {
  if (!input || input.trim() === '') return null;
  let cleaned = input
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .trim();
  cleaned = cleaned.replace(',', '.');
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  return Math.round(value * 100);
}

/** Centavos para formato de exibição (sem prefixo R$): 1500000 -> "15.000,00" */
export function centavosToDisplay(centavos: number): string {
  if (!centavos) return '';
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ---- CENTIHOURS (horas em centésimos) ----

/** Centésimos de hora para display: 16050 -> "160,50" */
export function centihoursToDisplay(centihours: number): string {
  if (!centihours) return '';
  return (centihours / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Parse input de horas para centésimos: "160,50" -> 16050, "160" -> 16000 */
export function parseCentihoursFromInput(input: string): number | null {
  if (!input || input.trim() === '') return null;
  const cleaned = input.replace(',', '.').trim();
  const value = parseFloat(cleaned);
  if (isNaN(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Número do mês (1-12) para nome em pt-BR. */
export function getMonthName(month: number): string {
  const names = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return names[month - 1] ?? '';
}
