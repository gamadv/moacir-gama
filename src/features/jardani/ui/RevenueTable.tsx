'use client';

import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/shared/ui';

import {
  calculateEffectiveRate,
  calculateRBT12,
  centavosToDisplay,
  formatCentavos,
  formatPercent,
  getMonthName,
  parseCurrencyToCentavos,
} from '../model/calculate-tax';
import type { RevenueEntry, RevenueInput } from '../model/types';
import { CurrencyInput } from './CurrencyInput';

interface RevenueTableProps {
  revenues: RevenueEntry[];
  currentYear: number;
  currentMonth: number;
  onUpsertRevenue: (input: RevenueInput) => Promise<void>;
  onDeleteRevenue: (id: string) => Promise<void>;
  onOpenBulkInput: () => void;
}

interface MonthRow {
  year: number;
  month: number;
  entry?: RevenueEntry;
}

function generateMonthRows(currentYear: number, currentMonth: number): MonthRow[] {
  const rows: MonthRow[] = [];

  // Mês atual + 12 meses anteriores (13 meses total)
  for (let i = 0; i <= 12; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    rows.push({ year: y, month: m });
  }

  return rows;
}

export function RevenueTable({
  revenues,
  currentYear,
  currentMonth,
  onUpsertRevenue,
  onDeleteRevenue,
  onOpenBulkInput,
}: RevenueTableProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const monthRows = useMemo(() => {
    const rows = generateMonthRows(currentYear, currentMonth);
    return rows.map((row) => ({
      ...row,
      entry: revenues.find((r) => r.year === row.year && r.month === row.month),
    }));
  }, [revenues, currentYear, currentMonth]);

  const startEdit = useCallback((row: MonthRow) => {
    const key = `${row.year}-${row.month}`;
    setEditingKey(key);
    setEditValue(row.entry ? centavosToDisplay(row.entry.revenue) : '');
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditValue('');
  }, []);

  const saveEdit = useCallback(
    async (year: number, month: number) => {
      const centavos = parseCurrencyToCentavos(editValue) ?? 0;
      if (centavos <= 0) return;
      setSaving(true);
      try {
        await onUpsertRevenue({ year, month, revenue: centavos });
        setEditingKey(null);
        setEditValue('');
      } finally {
        setSaving(false);
      }
    },
    [editValue, onUpsertRevenue]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        await onDeleteRevenue(id);
      } finally {
        setSaving(false);
      }
    },
    [onDeleteRevenue]
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">Faturamento Mensal</h3>
        <Button variant="outline" size="sm" onClick={onOpenBulkInput}>
          Importar Histórico
        </Button>
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
          <span>#</span>
          <span>Mês</span>
          <span className="text-right">Faturamento</span>
          <span className="text-right">Taxa Efetiva</span>
          <span className="w-20" />
        </div>

        {/* Mobile header */}
        <div className="grid sm:hidden grid-cols-[1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
          <span>Mês</span>
          <span className="text-right">Faturamento</span>
          <span className="w-16" />
        </div>

        {/* Rows */}
        {monthRows.map((row, index) => {
          const key = `${row.year}-${row.month}`;
          const isEditing = editingKey === key;
          const rbt12 = calculateRBT12(revenues, row.year, row.month);
          const effectiveRate = calculateEffectiveRate(rbt12);

          return (
            <div
              key={key}
              className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 px-4 py-2 items-center">
                <span className="text-xs font-mono text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-gray-300">
                  {getMonthName(row.month).slice(0, 3)}/{row.year}
                </span>

                {isEditing ? (
                  <div className="flex justify-end">
                    <CurrencyInput
                      value={editValue}
                      onChange={setEditValue}
                      className="max-w-[160px]"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-mono text-right text-white">
                    {row.entry ? formatCentavos(row.entry.revenue) : '—'}
                  </span>
                )}

                <span className="text-sm font-mono text-right text-yellow-400/70">
                  {rbt12 > 0 ? formatPercent(effectiveRate) : '—'}
                </span>

                <div className="flex gap-1 w-20 justify-end">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(row.year, row.month)}
                        disabled={saving}
                        className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                        title="Salvar">
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-300"
                        title="Cancelar">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1 text-gray-500 hover:text-gray-300"
                        title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {row.entry && (
                        <button
                          onClick={() => handleDelete(row.entry!.id)}
                          disabled={saving}
                          className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                          title="Remover">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Mobile row */}
              <div className="grid sm:hidden grid-cols-[1fr_1fr_auto] gap-2 px-4 py-2 items-center">
                <span className="text-sm text-gray-300">
                  {getMonthName(row.month).slice(0, 3)}/{row.year}
                </span>

                {isEditing ? (
                  <CurrencyInput
                    value={editValue}
                    onChange={setEditValue}
                    className="[&_input]:py-1.5 [&_input]:text-sm"
                  />
                ) : (
                  <span className="text-sm font-mono text-right text-white">
                    {row.entry ? formatCentavos(row.entry.revenue) : '—'}
                  </span>
                )}

                <div className="flex gap-1 w-16 justify-end">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(row.year, row.month)}
                        disabled={saving}
                        className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                        title="Salvar">
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-300"
                        title="Cancelar">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1 text-gray-500 hover:text-gray-300"
                        title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {row.entry && (
                        <button
                          onClick={() => handleDelete(row.entry!.id)}
                          disabled={saving}
                          className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                          title="Remover">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
