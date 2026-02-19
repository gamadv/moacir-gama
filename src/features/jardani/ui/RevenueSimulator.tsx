'use client';

import { useMemo, useState } from 'react';

import {
  calculateEffectiveRate,
  calculateProLabore,
  calculateRBT12,
  calculateSuggestedProLabore,
  formatCentavos,
  formatPercent,
  getMonthName,
  parseCurrencyToCentavos,
} from '../model/calculate-tax';
import type { RevenueEntry } from '../model/types';
import { CurrencyInput } from './CurrencyInput';

interface RevenueSimulatorProps {
  revenues: RevenueEntry[];
  currentYear: number;
  currentMonth: number;
}

const MONTHS_TO_SIMULATE = 12;

export function RevenueSimulator({ revenues, currentYear, currentMonth }: RevenueSimulatorProps) {
  const [simulatedRevenue, setSimulatedRevenue] = useState('');

  const simulatedCentavos = parseCurrencyToCentavos(simulatedRevenue) ?? 0;

  const projections = useMemo(() => {
    if (simulatedCentavos <= 0) return [];

    let refMonth = currentMonth + 1;
    let refYear = currentYear;
    if (refMonth > 12) {
      refMonth -= 12;
      refYear += 1;
    }

    const allRevenues = [
      ...revenues.map((r) => ({ year: r.year, month: r.month, revenue: r.revenue })),
    ];

    const results: Array<{
      year: number;
      month: number;
      revenue: number;
      rbt12: number;
      effectiveRate: number;
      das: number;
      inss: number;
      irrf: number;
      totalTax: number;
      net: number;
    }> = [];

    for (let i = 0; i < MONTHS_TO_SIMULATE; i++) {
      let m = refMonth + i;
      let y = refYear;
      while (m > 12) {
        m -= 12;
        y += 1;
      }

      if (i > 0) {
        const prev = results[i - 1];
        allRevenues.push({ year: prev.year, month: prev.month, revenue: prev.revenue });
      }

      const rbt12 = calculateRBT12(allRevenues, y, m);
      const effectiveRate = calculateEffectiveRate(rbt12);
      const das = Math.ceil(simulatedCentavos * effectiveRate);
      const suggestedProLabore = calculateSuggestedProLabore(rbt12);
      const proLabore = calculateProLabore(suggestedProLabore);

      results.push({
        year: y,
        month: m,
        revenue: simulatedCentavos,
        rbt12,
        effectiveRate,
        das,
        inss: proLabore.inssEmployee,
        irrf: proLabore.irrf,
        totalTax: das + proLabore.inssEmployee + proLabore.irrf,
        net: simulatedCentavos - das - proLabore.inssEmployee - proLabore.irrf,
      });
    }

    return results;
  }, [revenues, simulatedCentavos, currentYear, currentMonth]);

  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
        Simulação de Faturamento
      </h3>

      <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 mb-4">
        <CurrencyInput
          value={simulatedRevenue}
          onChange={setSimulatedRevenue}
          label="Faturamento mensal estimado"
          placeholder="0,00"
          clearable
        />
        <p className="text-xs text-gray-500 mt-2">
          Simula os próximos {MONTHS_TO_SIMULATE} meses com este valor fixo de faturamento.
        </p>
      </div>

      {projections.length > 0 && (
        <div className="rounded-lg border border-gray-800 overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>Mês</span>
            <span className="text-right">Taxa</span>
            <span className="text-right">DAS</span>
            <span className="text-right">INSS</span>
            <span className="text-right">IRRF</span>
            <span className="text-right">Líquido</span>
          </div>

          {/* Mobile header */}
          <div className="grid sm:hidden grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>Mês</span>
            <span className="text-right">Impostos</span>
            <span className="text-right">Líquido</span>
          </div>

          {projections.map((p) => (
            <div key={`${p.year}-${p.month}`} className="border-b border-gray-800/50">
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2 items-center">
                <span className="text-sm text-gray-300">
                  {getMonthName(p.month).slice(0, 3)}/{p.year}
                </span>
                <span className="text-sm font-mono text-right text-yellow-400/70">
                  {formatPercent(p.effectiveRate)}
                </span>
                <span className="text-sm font-mono text-right text-red-400">
                  {formatCentavos(p.das)}
                </span>
                <span className="text-sm font-mono text-right text-red-400/70">
                  {formatCentavos(p.inss)}
                </span>
                <span className="text-sm font-mono text-right text-red-400/70">
                  {p.irrf > 0 ? formatCentavos(p.irrf) : '—'}
                </span>
                <span className="text-sm font-mono text-right text-green-400">
                  {formatCentavos(p.net)}
                </span>
              </div>

              {/* Mobile row */}
              <div className="grid sm:hidden grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 items-center">
                <span className="text-sm text-gray-300">
                  {getMonthName(p.month).slice(0, 3)}/{p.year}
                </span>
                <span className="text-sm font-mono text-right text-red-400">
                  {formatCentavos(p.totalTax)}
                </span>
                <span className="text-sm font-mono text-right text-green-400">
                  {formatCentavos(p.net)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
