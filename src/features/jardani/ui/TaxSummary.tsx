'use client';

import { useMemo } from 'react';

import {
  calculateMonthSummary,
  formatCentavos,
  formatPercent,
  getMonthName,
} from '../model/calculate-tax';
import type { RevenueEntry } from '../model/types';

interface TaxSummaryProps {
  revenues: RevenueEntry[];
  currentYear: number;
  currentMonth: number;
}

export function TaxSummary({ revenues, currentYear, currentMonth }: TaxSummaryProps) {
  const summary = useMemo(
    () => calculateMonthSummary(revenues, currentYear, currentMonth),
    [revenues, currentYear, currentMonth]
  );

  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
        Resumo {getMonthName(currentMonth)}/{currentYear}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Faturamento"
          value={formatCentavos(summary.revenue)}
          color="text-white"
        />
        <SummaryCard label="RBT12" value={formatCentavos(summary.rbt12)} color="text-gray-400" />
        <SummaryCard
          label="Taxa Efetiva"
          value={formatPercent(summary.effectiveRate)}
          color="text-yellow-400"
        />
        <SummaryCard
          label="Imposto DAS"
          value={formatCentavos(summary.simplesNacionalTax)}
          color="text-red-400"
        />
        <SummaryCard
          label="Líquido (pós-DAS)"
          value={formatCentavos(summary.netAfterTaxes)}
          color="text-green-400"
        />
        {summary.proLabore && (
          <SummaryCard
            label="Pro-labore Líq."
            value={formatCentavos(summary.proLabore.netAmount)}
            color="text-blue-400"
          />
        )}
      </div>

      {summary.proLabore && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MiniCard
            label="Pro-labore Bruto"
            value={formatCentavos(summary.proLabore.grossAmount)}
          />
          <MiniCard
            label="INSS (11%)"
            value={`-${formatCentavos(summary.proLabore.inssEmployee)}`}
          />
          <MiniCard label="IRRF" value={`-${formatCentavos(summary.proLabore.irrf)}`} />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-4 py-3 rounded-lg border border-gray-800 bg-gray-900/50">
      <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">{label}</span>
      <span className={`text-lg font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-gray-800/50 bg-gray-900/30">
      <span className="text-xs text-gray-500 block">{label}</span>
      <span className="text-sm font-mono text-gray-300">{value}</span>
    </div>
  );
}
