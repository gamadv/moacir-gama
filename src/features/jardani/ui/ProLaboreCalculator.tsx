'use client';

import { useMemo } from 'react';

import {
  calculateFatorR,
  calculateProLabore,
  calculateSuggestedProLabore,
  formatCentavos,
  formatPercent,
} from '../model/calculate-tax';

interface ProLaboreCalculatorProps {
  monthlyRevenue: number; // centavos — faturamento do mês
  rbt12: number; // centavos
}

export function ProLaboreCalculator({ monthlyRevenue, rbt12 }: ProLaboreCalculatorProps) {
  const suggestedProLabore = useMemo(() => calculateSuggestedProLabore(rbt12), [rbt12]);

  const result = useMemo(() => {
    if (monthlyRevenue <= 0) return null;
    return calculateProLabore(suggestedProLabore);
  }, [monthlyRevenue, suggestedProLabore]);

  const fatorR = useMemo(
    () => calculateFatorR(suggestedProLabore, rbt12),
    [suggestedProLabore, rbt12]
  );

  if (!result) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Pro-labore</h3>

      <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
        <p className="text-xs text-gray-500 mb-3">
          Pro-labore sugerido via Fator R (28% × RBT12 / 12).
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Bruto</span>
            <span className="font-mono text-white">{formatCentavos(result.grossAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">INSS (11%)</span>
            <span className="font-mono text-red-400">-{formatCentavos(result.inssEmployee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">IRRF</span>
            <span className="font-mono text-red-400">
              {result.irrf > 0 ? `-${formatCentavos(result.irrf)}` : formatCentavos(0)}
            </span>
          </div>
          <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
            <span className="text-gray-300 font-medium">Líquido</span>
            <span className="font-mono font-bold text-green-400">
              {formatCentavos(result.netAmount)}
            </span>
          </div>
        </div>

        {rbt12 > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fator R</span>
              <span
                className={`font-mono font-medium ${fatorR >= 0.28 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(fatorR)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
