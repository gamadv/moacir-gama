import { describe, expect, it } from 'vitest';

import {
  calculateDarfSummary,
  calculateEffectiveRate,
  calculateFatorR,
  calculateINSS,
  calculateIRRF,
  calculateMonthSummary,
  calculateProLabore,
  calculateRBT12,
  calculateSimplesTax,
  calculateSuggestedProLabore,
  centavosToDisplay,
  findBracket,
  formatCentavos,
  formatPercent,
  getDarfDueDate,
  getLast12Months,
  getMonthName,
  parseCurrencyToCentavos,
} from './calculate-tax';
import {
  FATOR_R_THRESHOLD,
  INSS_SALARY_CEILING,
  IRRF_DEPENDENT_DEDUCTION,
  MINIMUM_WAGE,
} from './tax-tables';

describe('findBracket', () => {
  it('deve retornar faixa 1 para RBT12 até R$ 180.000', () => {
    expect(findBracket(18_000_000)?.id).toBe(1);
    expect(findBracket(10_000_000)?.id).toBe(1);
    expect(findBracket(1)?.id).toBe(1);
  });

  it('deve retornar faixa 2 para RBT12 até R$ 360.000', () => {
    expect(findBracket(18_000_001)?.id).toBe(2);
    expect(findBracket(36_000_000)?.id).toBe(2);
  });

  it('deve retornar faixa 3 para RBT12 até R$ 720.000', () => {
    expect(findBracket(36_000_001)?.id).toBe(3);
    expect(findBracket(72_000_000)?.id).toBe(3);
  });

  it('deve retornar faixa 4 para RBT12 até R$ 1.800.000', () => {
    expect(findBracket(72_000_001)?.id).toBe(4);
    expect(findBracket(180_000_000)?.id).toBe(4);
  });

  it('deve retornar faixa 5 para RBT12 até R$ 3.600.000', () => {
    expect(findBracket(180_000_001)?.id).toBe(5);
    expect(findBracket(360_000_000)?.id).toBe(5);
  });

  it('deve retornar faixa 6 para RBT12 até R$ 4.800.000', () => {
    expect(findBracket(360_000_001)?.id).toBe(6);
    expect(findBracket(480_000_000)?.id).toBe(6);
  });

  it('deve retornar null para RBT12 acima do limite', () => {
    expect(findBracket(480_000_001)).toBeNull();
  });

  it('deve retornar faixa 1 para RBT12 zero ou negativo', () => {
    expect(findBracket(0)?.id).toBe(1);
    expect(findBracket(-100)?.id).toBe(1);
  });
});

describe('calculateEffectiveRate', () => {
  it('deve retornar 6% para faixa 1 (sem dedução)', () => {
    expect(calculateEffectiveRate(10_000_000)).toBeCloseTo(0.06, 4);
    expect(calculateEffectiveRate(18_000_000)).toBeCloseTo(0.06, 4);
  });

  it('deve retornar 6% para RBT12 zero', () => {
    expect(calculateEffectiveRate(0)).toBe(0.06);
  });

  it('deve calcular taxa efetiva corretamente para faixa 2', () => {
    // RBT12 = R$ 360.000 (36_000_000 centavos)
    // ((36_000_000 * 0.112) - 936_000) / 36_000_000 = (4_032_000 - 936_000) / 36_000_000
    const expected = (36_000_000 * 0.112 - 936_000) / 36_000_000;
    expect(calculateEffectiveRate(36_000_000)).toBeCloseTo(expected, 6);
  });

  it('deve calcular taxa efetiva corretamente para faixa 3', () => {
    const rbt12 = 50_000_000; // R$ 500.000
    const expected = (50_000_000 * 0.135 - 1_764_000) / 50_000_000;
    expect(calculateEffectiveRate(rbt12)).toBeCloseTo(expected, 6);
  });

  it('deve retornar 0 para RBT12 acima do limite', () => {
    expect(calculateEffectiveRate(500_000_000)).toBe(0);
  });
});

describe('calculateSimplesTax', () => {
  it('deve calcular imposto do mês corretamente', () => {
    const result = calculateSimplesTax(5_000_000, 10_000_000); // R$ 50k faturamento, R$ 100k RBT12
    expect(result).not.toBeNull();
    expect(result!.bracket.id).toBe(1);
    expect(result!.effectiveRate).toBeCloseTo(0.06, 4);
    expect(result!.monthlyTax).toBe(300_000); // R$ 3.000
    expect(result!.netRevenue).toBe(4_700_000); // R$ 47.000
  });

  it('deve retornar null quando RBT12 excede limite', () => {
    expect(calculateSimplesTax(5_000_000, 500_000_000)).toBeNull();
  });

  it('deve retornar imposto zero para faturamento zero', () => {
    const result = calculateSimplesTax(0, 10_000_000);
    expect(result).not.toBeNull();
    expect(result!.monthlyTax).toBe(0);
  });
});

describe('getLast12Months', () => {
  it('deve retornar 12 meses anteriores para março/2025', () => {
    const months = getLast12Months(2025, 3);
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ year: 2025, month: 2 }); // fev/2025
    expect(months[11]).toEqual({ year: 2024, month: 3 }); // mar/2024
  });

  it('deve cruzar a fronteira do ano corretamente', () => {
    const months = getLast12Months(2025, 1); // jan/2025
    expect(months[0]).toEqual({ year: 2024, month: 12 }); // dez/2024
    expect(months[11]).toEqual({ year: 2024, month: 1 }); // jan/2024
  });

  it('deve funcionar para fevereiro', () => {
    const months = getLast12Months(2025, 2);
    expect(months[0]).toEqual({ year: 2025, month: 1 });
    expect(months[1]).toEqual({ year: 2024, month: 12 });
    expect(months[11]).toEqual({ year: 2024, month: 2 });
  });
});

describe('calculateRBT12', () => {
  it('deve somar receitas dos 12 meses anteriores', () => {
    const revenues = [
      { year: 2024, month: 3, revenue: 1_000_000 },
      { year: 2024, month: 4, revenue: 1_000_000 },
      { year: 2024, month: 5, revenue: 1_000_000 },
      { year: 2024, month: 6, revenue: 1_000_000 },
      { year: 2024, month: 7, revenue: 1_000_000 },
      { year: 2024, month: 8, revenue: 1_000_000 },
      { year: 2024, month: 9, revenue: 1_000_000 },
      { year: 2024, month: 10, revenue: 1_000_000 },
      { year: 2024, month: 11, revenue: 1_000_000 },
      { year: 2024, month: 12, revenue: 1_000_000 },
      { year: 2025, month: 1, revenue: 1_000_000 },
      { year: 2025, month: 2, revenue: 1_000_000 },
    ];
    // Referência março/2025 -> soma fev/2025 até mar/2024
    expect(calculateRBT12(revenues, 2025, 3)).toBe(12_000_000);
  });

  it('deve retornar 0 quando não há dados', () => {
    expect(calculateRBT12([], 2025, 3)).toBe(0);
  });

  it('deve ignorar meses fora da janela de 12 meses', () => {
    const revenues = [
      { year: 2025, month: 3, revenue: 5_000_000 }, // mês atual, não conta
      { year: 2023, month: 2, revenue: 5_000_000 }, // muito antigo
      { year: 2025, month: 2, revenue: 2_000_000 }, // dentro da janela
    ];
    expect(calculateRBT12(revenues, 2025, 3)).toBe(2_000_000);
  });

  it('deve considerar meses parciais (sem dados = 0)', () => {
    const revenues = [
      { year: 2025, month: 1, revenue: 3_000_000 },
      { year: 2025, month: 2, revenue: 4_000_000 },
    ];
    // Referência março/2025 -> só tem jan e fev com dados
    expect(calculateRBT12(revenues, 2025, 3)).toBe(7_000_000);
  });
});

describe('calculateINSS', () => {
  it('deve calcular 11% para valor abaixo do teto (truncado)', () => {
    const gross = 500_000; // R$ 5.000
    expect(calculateINSS(gross)).toBe(Math.floor(500_000 * 0.11));
  });

  it('deve truncar centavos (não arredondar)', () => {
    // R$ 3.679,41 × 11% = R$ 404,7351 → trunca para R$ 404,73 (não R$ 404,74)
    expect(calculateINSS(367_941)).toBe(Math.floor(367_941 * 0.11));
    expect(calculateINSS(367_941)).toBe(40_473); // Verificação com holerite real
  });

  it('deve respeitar o teto salarial', () => {
    const gross = 1_000_000; // R$ 10.000 (acima do teto)
    const expected = Math.floor(INSS_SALARY_CEILING * 0.11);
    expect(calculateINSS(gross)).toBe(expected);
  });

  it('deve retornar 0 para valor zero', () => {
    expect(calculateINSS(0)).toBe(0);
  });
});

describe('calculateIRRF', () => {
  it('deve ser isento para base até R$ 2.259,20', () => {
    expect(calculateIRRF(225_920)).toBe(0);
    expect(calculateIRRF(200_000)).toBe(0);
  });

  it('deve calcular para faixa de 7,5%', () => {
    const base = 250_000; // R$ 2.500
    const expected = Math.round(250_000 * 0.075 - 16_944);
    expect(calculateIRRF(base)).toBe(expected);
  });

  it('deve calcular para faixa de 27,5%', () => {
    const base = 500_000; // R$ 5.000
    const expected = Math.round(500_000 * 0.275 - 89_600);
    expect(calculateIRRF(base)).toBe(expected);
  });

  it('deve retornar 0 para base zero ou negativa', () => {
    expect(calculateIRRF(0)).toBe(0);
    expect(calculateIRRF(-100)).toBe(0);
  });

  it('deve deduzir dependentes da base antes do cálculo', () => {
    const base = 300_000; // R$ 3.000
    // Sem dependentes: faixa 15% → 300_000 * 0.15 - 38_144 = 6_856
    expect(calculateIRRF(base, 0)).toBe(Math.round(300_000 * 0.15 - 38_144));
    // Com 2 dependentes: base ajustada = 300_000 - 2 * 18_959 = 262_082
    // Faixa 7,5% → 262_082 * 0.075 - 16_944 = 2_712
    const adjustedBase = 300_000 - 2 * IRRF_DEPENDENT_DEDUCTION;
    expect(calculateIRRF(base, 2)).toBe(Math.round(adjustedBase * 0.075 - 16_944));
  });

  it('deve isentar quando dependentes reduzem base abaixo do limite', () => {
    const base = 250_000; // R$ 2.500
    // 2 dependentes: 250_000 - 2 * 18_959 = 212_082 → isento
    expect(calculateIRRF(base, 2)).toBe(0);
  });

  it('deve retornar 0 se dependentes tornarem base negativa', () => {
    expect(calculateIRRF(100_000, 10)).toBe(0);
  });
});

describe('calculateProLabore', () => {
  it('deve calcular cadeia completa corretamente', () => {
    const result = calculateProLabore(500_000); // R$ 5.000 bruto
    expect(result.grossAmount).toBe(500_000);
    expect(result.inssEmployee).toBe(Math.floor(500_000 * 0.11));
    expect(result.irrfBase).toBe(500_000 - result.inssEmployee);
    expect(result.netAmount).toBe(500_000 - result.inssEmployee - result.irrf);
  });

  it('deve respeitar teto INSS no pro-labore alto', () => {
    const result = calculateProLabore(1_500_000); // R$ 15.000
    expect(result.inssEmployee).toBe(Math.floor(INSS_SALARY_CEILING * 0.11));
  });
});

describe('calculateSuggestedProLabore', () => {
  it('deve retornar salário mínimo quando RBT12 é zero', () => {
    expect(calculateSuggestedProLabore(0)).toBe(MINIMUM_WAGE);
  });

  it('deve retornar salário mínimo quando Fator R dá valor menor', () => {
    // 0.28 × 5.000.000 / 12 = 116.667 < 151.800 (mínimo)
    expect(calculateSuggestedProLabore(5_000_000)).toBe(MINIMUM_WAGE);
  });

  it('deve retornar 28% × RBT12 / 12 quando acima do mínimo', () => {
    // 0.28 × 12.000.000 / 12 = 280.000
    expect(calculateSuggestedProLabore(12_000_000)).toBe(280_000);
  });

  it('deve bater com exemplo real: RBT12 R$ 157.689,00 → R$ 3.679,41', () => {
    expect(calculateSuggestedProLabore(15_768_900)).toBe(367_941);
  });

  it('deve usar constantes FATOR_R_THRESHOLD e MINIMUM_WAGE', () => {
    const rbt12 = 20_000_000; // R$ 200.000
    const expected = Math.round((FATOR_R_THRESHOLD * rbt12) / 12);
    expect(calculateSuggestedProLabore(rbt12)).toBe(expected);
  });
});

describe('calculateMonthSummary', () => {
  it('deve usar pro-labore via Fator R (salário mínimo quando RBT12 = 0)', () => {
    const revenues = [
      { year: 2025, month: 2, revenue: 367_941 }, // R$ 3.679,41
    ];
    const summary = calculateMonthSummary(revenues, 2025, 2);
    expect(summary.revenue).toBe(367_941);
    expect(summary.rbt12).toBe(0);
    expect(summary.effectiveRate).toBe(0.06);
    expect(summary.simplesNacionalTax).toBe(Math.ceil(367_941 * 0.06));
    // Pro-labore = salário mínimo (RBT12 = 0)
    expect(summary.proLabore).not.toBeNull();
    expect(summary.proLabore!.grossAmount).toBe(MINIMUM_WAGE);
  });

  it('deve retornar proLabore null quando faturamento é zero', () => {
    const revenues = [{ year: 2025, month: 1, revenue: 500_000 }];
    const summary = calculateMonthSummary(revenues, 2025, 2); // mês sem faturamento
    expect(summary.revenue).toBe(0);
    expect(summary.proLabore).toBeNull();
  });

  it('deve calcular pro-labore via Fator R com RBT12', () => {
    const revenues = [
      ...Array.from({ length: 11 }, (_, i) => ({
        year: 2024,
        month: i + 2,
        revenue: 1_000_000,
      })),
      { year: 2025, month: 1, revenue: 1_000_000 },
      { year: 2025, month: 2, revenue: 1_500_000 },
    ];

    const summary = calculateMonthSummary(revenues, 2025, 2);
    expect(summary.rbt12).toBe(12_000_000);
    // Pro-labore = 0.28 × 12.000.000 / 12 = R$ 2.800,00
    expect(summary.proLabore!.grossAmount).toBe(280_000);
  });
});

describe('formatCentavos', () => {
  it('deve formatar centavos para BRL', () => {
    expect(formatCentavos(1_500_000)).toBe('R$\u00a015.000,00');
    expect(formatCentavos(100)).toBe('R$\u00a01,00');
    expect(formatCentavos(0)).toBe('R$\u00a00,00');
  });

  it('deve formatar valores negativos', () => {
    expect(formatCentavos(-500_000)).toBe('-R$\u00a05.000,00');
  });
});

describe('formatPercent', () => {
  it('deve formatar taxa para porcentagem', () => {
    expect(formatPercent(0.06)).toBe('6,00%');
    expect(formatPercent(0.112)).toBe('11,20%');
    expect(formatPercent(0)).toBe('0,00%');
  });
});

describe('parseCurrencyToCentavos', () => {
  it('deve parsear formato BRL completo', () => {
    expect(parseCurrencyToCentavos('R$ 15.000,00')).toBe(1_500_000);
    expect(parseCurrencyToCentavos('15.000,00')).toBe(1_500_000);
  });

  it('deve parsear número simples', () => {
    expect(parseCurrencyToCentavos('15000')).toBe(1_500_000);
  });

  it('deve parsear com vírgula decimal', () => {
    expect(parseCurrencyToCentavos('1.500,50')).toBe(150_050);
  });

  it('deve retornar null para input vazio ou inválido', () => {
    expect(parseCurrencyToCentavos('')).toBeNull();
    expect(parseCurrencyToCentavos('abc')).toBeNull();
    expect(parseCurrencyToCentavos('   ')).toBeNull();
  });
});

describe('centavosToDisplay', () => {
  it('deve converter centavos para formato de exibição sem prefixo R$', () => {
    expect(centavosToDisplay(1_500_000)).toBe('15.000,00');
    expect(centavosToDisplay(100)).toBe('1,00');
    expect(centavosToDisplay(150_050)).toBe('1.500,50');
  });

  it('deve retornar string vazia para zero', () => {
    expect(centavosToDisplay(0)).toBe('');
  });
});

describe('getMonthName', () => {
  it('deve retornar nome correto do mês', () => {
    expect(getMonthName(1)).toBe('Janeiro');
    expect(getMonthName(6)).toBe('Junho');
    expect(getMonthName(12)).toBe('Dezembro');
  });

  it('deve retornar string vazia para mês inválido', () => {
    expect(getMonthName(0)).toBe('');
    expect(getMonthName(13)).toBe('');
  });
});

describe('getDarfDueDate', () => {
  it('deve retornar dia 20 do mês seguinte', () => {
    expect(getDarfDueDate(2025, 11)).toBe('20/12/2025');
    expect(getDarfDueDate(2025, 1)).toBe('20/02/2025');
  });

  it('deve cruzar o ano quando PA é dezembro', () => {
    expect(getDarfDueDate(2025, 12)).toBe('20/01/2026');
  });
});

describe('calculateFatorR', () => {
  it('deve calcular Fator R corretamente', () => {
    // Pro-labore R$ 3.000/mês, RBT12 R$ 120.000
    // Fator R = (3.000 * 12) / 120.000 = 36.000 / 120.000 = 0.30
    expect(calculateFatorR(300_000, 12_000_000)).toBeCloseTo(0.3, 4);
  });

  it('deve retornar 0 para RBT12 zero', () => {
    expect(calculateFatorR(300_000, 0)).toBe(0);
  });

  it('deve dar ~28% quando usa pro-labore sugerido', () => {
    // Pro-labore sugerido = 0.28 × RBT12 / 12
    // Fator R = (suggestedProLabore × 12) / RBT12 ≈ 0.28
    const rbt12 = 12_000_000;
    const suggested = calculateSuggestedProLabore(rbt12); // 280_000
    expect(calculateFatorR(suggested, rbt12)).toBeCloseTo(0.28, 4);
  });
});

describe('calculateDarfSummary', () => {
  it('deve retornar null para faturamento zero', () => {
    expect(calculateDarfSummary(0, 12_000_000, 2025, 12)).toBeNull();
  });

  it('deve calcular DAS com ceil (arredondamento para cima)', () => {
    // Faturamento R$ 14.482,40 × 6% = 868,944 → ceil → R$ 868,95
    const result = calculateDarfSummary(1_448_240, 10_000_000, 2025, 12);
    expect(result).not.toBeNull();
    const das = result!.items.find((i) => i.code === 'DAS');
    expect(das).toBeDefined();
    expect(das!.amount).toBe(Math.ceil(1_448_240 * 0.06)); // 86895
    expect(das!.period).toBe('12/2025');
    expect(das!.dueDate).toBe('20/01/2026');
  });

  it('deve calcular INSS sobre pro-labore sugerido, não faturamento', () => {
    // RBT12 = R$ 157.689,00 → proLabore = 0.28 × 15768900 / 12 = R$ 3.679,41
    const result = calculateDarfSummary(1_448_240, 15_768_900, 2025, 1);
    expect(result).not.toBeNull();
    const gps = result!.items.find((i) => i.code === '1099');
    expect(gps).toBeDefined();
    // INSS = floor(367941 × 0.11) = R$ 404,73
    expect(gps!.amount).toBe(Math.floor(367_941 * 0.11));
    expect(gps!.amount).toBe(40_473); // Verificação com holerite real
    expect(gps!.period).toBe('01/2025');
    expect(gps!.dueDate).toBe('20/02/2025');
  });

  it('deve gerar IRRF (0561) quando pro-labore sugerido gera imposto', () => {
    // RBT12 = R$ 150.000 → proLabore = 0.28 × 15000000 / 12 = R$ 3.500
    const result = calculateDarfSummary(500_000, 15_000_000, 2025, 11);
    expect(result).not.toBeNull();
    const irrf = result!.items.find((i) => i.code === '0561');
    expect(irrf).toBeDefined();
    expect(irrf!.amount).toBeGreaterThan(0);
    expect(irrf!.period).toBe('11/2025');
    expect(irrf!.dueDate).toBe('20/12/2025');
  });

  it('deve omitir IRRF quando pro-labore sugerido gera base isenta', () => {
    // RBT12 = R$ 100.000 → proLabore = 0.28 × 10000000 / 12 ≈ R$ 2.333
    // INSS = floor(233333 × 0.11) = 25666 → base IRRF = 207667 → isento
    const result = calculateDarfSummary(500_000, 10_000_000, 2025, 11);
    expect(result).not.toBeNull();
    const codes = result!.items.map((i) => i.code);
    expect(codes).toContain('DAS');
    expect(codes).toContain('1099');
    expect(codes).not.toContain('0561');
  });

  it('deve incluir DAS + INSS + IRRF e calcular total corretamente', () => {
    // RBT12 alto o suficiente para gerar IRRF
    const result = calculateDarfSummary(500_000, 15_000_000, 2025, 12);
    expect(result).not.toBeNull();
    expect(result!.items.length).toBeGreaterThanOrEqual(3);
    const sum = result!.items.reduce((s, i) => s + i.amount, 0);
    expect(result!.total).toBe(sum);
  });

  it('deve calcular DAS com RBT12 zero (taxa efetiva 6%)', () => {
    const result = calculateDarfSummary(300_000, 0, 2025, 12);
    expect(result).not.toBeNull();
    const das = result!.items.find((i) => i.code === 'DAS');
    expect(das).toBeDefined();
    expect(das!.amount).toBe(Math.ceil(300_000 * 0.06));
  });

  it('deve validar exemplo real completo (Jan/2026)', () => {
    // Faturamento R$ 14.482,40, RBT12 R$ 157.689,00
    const result = calculateDarfSummary(1_448_240, 15_768_900, 2026, 1);
    expect(result).not.toBeNull();
    // DAS = ceil(1448240 × 0.06) = R$ 868,95
    const das = result!.items.find((i) => i.code === 'DAS');
    expect(das!.amount).toBe(86_895);
    // INSS = floor(367941 × 0.11) = R$ 404,73
    const gps = result!.items.find((i) => i.code === '1099');
    expect(gps!.amount).toBe(40_473);
  });
});
