'use client';

import { FileText } from 'lucide-react';
import { useMemo } from 'react';

import {
  calculateDarfSummary,
  calculateRBT12,
  formatCentavos,
  getMonthName,
} from '../model/calculate-tax';
import type { RevenueEntry } from '../model/types';

interface DarfSummaryProps {
  revenues: RevenueEntry[];
  currentYear: number;
  currentMonth: number;
}

export function DarfSummary({ revenues, currentYear, currentMonth }: DarfSummaryProps) {
  const darf = useMemo(() => {
    const entry = revenues.find((r) => r.year === currentYear && r.month === currentMonth);
    const monthlyRevenue = entry?.revenue ?? 0;
    const rbt12 = calculateRBT12(revenues, currentYear, currentMonth);
    return calculateDarfSummary(monthlyRevenue, rbt12, currentYear, currentMonth);
  }, [revenues, currentYear, currentMonth]);

  if (!darf || darf.items.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
        Guias Mensais — {getMonthName(currentMonth)}/{currentYear}
      </h3>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Composição do Documento de Arrecadação
          </span>
        </div>

        <div className="divide-y divide-gray-800/50">
          {darf.items.map((item) => (
            <div key={item.code} className="px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">{item.code}</span>
                    <span className="text-sm text-gray-300 truncate">{item.description}</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-4 space-y-0.5">
                    <div>
                      {item.subCode} {item.subDescription}
                    </div>
                    <div>
                      PA:{item.period} &nbsp; Vencimento:{item.dueDate}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm font-medium text-white whitespace-nowrap">
                  {formatCentavos(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-700 bg-gray-900/80 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Totais</span>
          <span className="font-mono text-sm font-bold text-white">
            {formatCentavos(darf.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
