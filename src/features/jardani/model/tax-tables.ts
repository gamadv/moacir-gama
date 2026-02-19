// === TIPOS ===

export interface TaxBracket {
  id: number;
  maxRbt12: number; // Limite superior em centavos
  rate: number; // Alíquota como decimal (ex: 0.06 para 6%)
  deduction: number; // Dedução em centavos
}

export interface TaxCalculationResult {
  bracket: TaxBracket;
  rbt12: number; // centavos
  effectiveRate: number; // decimal
  effectiveRatePercent: string; // "6,00%"
  monthlyTax: number; // centavos
  monthlyRevenue: number; // centavos
  netRevenue: number; // revenue - tax, centavos
}

export interface ProLaboreResult {
  grossAmount: number; // centavos
  inssEmployee: number; // INSS contribuição empregado (11%, com teto)
  irrfBase: number; // Base IRRF = bruto - INSS
  irrf: number; // IRRF calculado
  netAmount: number; // bruto - INSS - IRRF
}

export interface MonthSummary {
  year: number;
  month: number;
  revenue: number; // centavos
  rbt12: number; // centavos
  effectiveRate: number; // decimal
  simplesNacionalTax: number; // centavos
  proLabore: ProLaboreResult | null;
  netAfterTaxes: number; // centavos
}

export interface IrrfBracket {
  maxBase: number; // centavos
  rate: number; // decimal
  deduction: number; // centavos
}

export interface DarfItem {
  code: string; // "1099" (GPS/INSS) ou "0561" (IRRF)
  description: string;
  subCode: string;
  subDescription: string;
  amount: number; // centavos
  period: string; // "MM/YYYY"
  dueDate: string; // "DD/MM/YYYY"
}

export interface DarfSummary {
  items: DarfItem[];
  total: number; // centavos
  refYear: number;
  refMonth: number;
}

// === CONSTANTES ===

/** Simples Nacional - Anexo III (Serviços) */
export const SIMPLES_NACIONAL_BRACKETS: TaxBracket[] = [
  { id: 1, maxRbt12: 18_000_000, rate: 0.06, deduction: 0 },
  { id: 2, maxRbt12: 36_000_000, rate: 0.112, deduction: 936_000 },
  { id: 3, maxRbt12: 72_000_000, rate: 0.135, deduction: 1_764_000 },
  { id: 4, maxRbt12: 180_000_000, rate: 0.16, deduction: 3_564_000 },
  { id: 5, maxRbt12: 360_000_000, rate: 0.21, deduction: 12_564_000 },
  { id: 6, maxRbt12: 480_000_000, rate: 0.33, deduction: 64_800_000 },
];

/** Teto INSS e alíquota do empregado */
export const INSS_SALARY_CEILING = 778_602; // R$ 7.786,02 em centavos
export const INSS_EMPLOYEE_RATE = 0.11; // 11%

/** Fator R mínimo para enquadramento no Anexo III */
export const FATOR_R_THRESHOLD = 0.28; // 28%

/** Salário mínimo vigente (2025) */
export const MINIMUM_WAGE = 151_800; // R$ 1.518,00 em centavos

/** Dedução por dependente no IRRF (R$ 189,59) */
export const IRRF_DEPENDENT_DEDUCTION = 18_959; // centavos

/** Tabela Progressiva IRRF (Lei 14.848/2024, vigente desde fev/2024) */
export const IRRF_BRACKETS: IrrfBracket[] = [
  { maxBase: 225_920, rate: 0, deduction: 0 },
  { maxBase: 282_665, rate: 0.075, deduction: 16_944 },
  { maxBase: 375_105, rate: 0.15, deduction: 38_144 },
  { maxBase: 466_468, rate: 0.225, deduction: 66_277 },
  { maxBase: Infinity, rate: 0.275, deduction: 89_600 },
];
