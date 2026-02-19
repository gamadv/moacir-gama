'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui';

import { getMonthName, parseCurrencyToCentavos } from '../model/calculate-tax';
import type { RevenueInput } from '../model/types';
import { CurrencyInput } from './CurrencyInput';

interface BulkRevenueInputProps {
  onBulkSave: (revenues: RevenueInput[]) => Promise<void>;
  onClose: () => void;
  currentYear: number;
  currentMonth: number;
}

interface MonthField {
  year: number;
  month: number;
  value: string;
}

function generateBulkMonths(currentYear: number, currentMonth: number): MonthField[] {
  const months: MonthField[] = [];

  // 11 meses anteriores ao mês atual (não inclui o mês atual)
  for (let i = 1; i <= 11; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    months.push({ year: y, month: m, value: '' });
  }

  return months;
}

export function BulkRevenueInput({
  onBulkSave,
  onClose,
  currentYear,
  currentMonth,
}: BulkRevenueInputProps) {
  const [months, setMonths] = useState<MonthField[]>(() =>
    generateBulkMonths(currentYear, currentMonth)
  );
  const [averageValue, setAverageValue] = useState('');
  const [saving, setSaving] = useState(false);

  function updateMonth(index: number, value: string) {
    setMonths((prev) => prev.map((m, i) => (i === index ? { ...m, value } : m)));
  }

  function applyAverage() {
    const centavos = parseCurrencyToCentavos(averageValue) ?? 0;
    if (centavos <= 0) return;
    const formatted = (centavos / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setMonths((prev) => prev.map((m) => (m.value ? m : { ...m, value: formatted })));
  }

  async function handleSave() {
    const revenues: RevenueInput[] = months
      .filter((m) => (parseCurrencyToCentavos(m.value) ?? 0) > 0)
      .map((m) => ({
        year: m.year,
        month: m.month,
        revenue: parseCurrencyToCentavos(m.value)!,
      }));

    if (revenues.length === 0) return;

    setSaving(true);
    try {
      await onBulkSave(revenues);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const filledCount = months.filter((m) => (parseCurrencyToCentavos(m.value) ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-1">Importar Histórico de Faturamento</h3>
        <p className="text-xs text-gray-400">
          Informe o faturamento dos últimos 11 meses para cálculo do RBT12.
        </p>
      </div>

      {/* Valor médio */}
      <div className="p-3 rounded-lg border border-gray-800 bg-gray-900/50">
        <label className="text-xs text-gray-400 block mb-2">
          Preencher meses vazios com valor médio:
        </label>
        <div className="flex gap-2">
          <CurrencyInput
            value={averageValue}
            onChange={setAverageValue}
            placeholder="0,00"
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={applyAverage}
            disabled={!averageValue}
            className="self-end">
            Aplicar
          </Button>
        </div>
      </div>

      {/* Grid de meses */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {months.map((m, i) => (
          <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-24 shrink-0">
              {getMonthName(m.month).slice(0, 3)}/{m.year}
            </span>
            <CurrencyInput value={m.value} onChange={(v) => updateMonth(i, v)} className="flex-1" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <span className="text-xs text-gray-500">{filledCount} de 11 meses preenchidos</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={filledCount === 0 || saving}>
            {saving ? 'Salvando...' : 'Salvar Todos'}
          </Button>
        </div>
      </div>
    </div>
  );
}
