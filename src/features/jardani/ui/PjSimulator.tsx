'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/shared/ui';

import {
  centavosToDisplay,
  centihoursToDisplay,
  formatCentavos,
  parseCentihoursFromInput,
  parseCurrencyToCentavos,
} from '../model/calculate-tax';
import type { PjContractEntry, PjContractInput } from '../model/types';
import { CurrencyInput } from './CurrencyInput';

interface PjSimulatorProps {
  contracts: PjContractEntry[];
  onCreateContract: (input: PjContractInput) => Promise<void>;
  onUpdateContract: (id: string, input: Partial<PjContractInput>) => Promise<void>;
  onDeleteContract: (id: string) => Promise<void>;
}

const MAX_CONTRACTS = 4;

interface EditState {
  valorHora: string;
  horasMes: string;
}

function contractToEditState(contract: PjContractEntry): EditState {
  return {
    valorHora: centavosToDisplay(contract.valorHora),
    horasMes: centihoursToDisplay(contract.horasMes),
  };
}

function calculateContractTotal(valorHora: number, horasMes: number): number {
  return Math.round((valorHora * horasMes) / 100);
}

export function PjSimulator({
  contracts,
  onCreateContract,
  onUpdateContract,
  onDeleteContract,
}: PjSimulatorProps) {
  const [editStates, setEditStates] = useState<Record<string, EditState>>({});
  const [saving, setSaving] = useState(false);

  const getEditState = useCallback(
    (contract: PjContractEntry): EditState => {
      return editStates[contract.id] ?? contractToEditState(contract);
    },
    [editStates]
  );

  const updateEditField = useCallback(
    (id: string, contract: PjContractEntry, field: 'valorHora' | 'horasMes', value: string) => {
      setEditStates((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? contractToEditState(contract)),
          [field]: value,
        },
      }));
    },
    []
  );

  const clearEditField = useCallback(
    (id: string, contract: PjContractEntry, field: 'valorHora' | 'horasMes') => {
      setEditStates((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? contractToEditState(contract)),
          [field]: '',
        },
      }));
    },
    []
  );

  const handleBlur = useCallback(
    async (contract: PjContractEntry, field: 'valorHora' | 'horasMes') => {
      const editState = editStates[contract.id];
      if (!editState) return;

      const update: Partial<PjContractInput> = {};
      if (field === 'valorHora') {
        const centavos = parseCurrencyToCentavos(editState.valorHora);
        if (centavos !== null && centavos !== contract.valorHora) {
          update.valorHora = centavos;
        }
      } else {
        const centihours = parseCentihoursFromInput(editState.horasMes);
        if (centihours !== null && centihours !== contract.horasMes) {
          update.horasMes = centihours;
        }
      }

      if (Object.keys(update).length > 0) {
        setSaving(true);
        try {
          await onUpdateContract(contract.id, update);
          setEditStates((prev) => {
            const next = { ...prev };
            delete next[contract.id];
            return next;
          });
        } finally {
          setSaving(false);
        }
      }
    },
    [editStates, onUpdateContract]
  );

  const handleAdd = useCallback(async () => {
    if (contracts.length >= MAX_CONTRACTS) return;
    setSaving(true);
    try {
      await onCreateContract({ valorHora: 0, horasMes: 0 });
    } finally {
      setSaving(false);
    }
  }, [contracts.length, onCreateContract]);

  const handleDelete = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        await onDeleteContract(id);
        setEditStates((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } finally {
        setSaving(false);
      }
    },
    [onDeleteContract]
  );

  const totals = useMemo(
    () =>
      contracts.map((c) => {
        const edit = editStates[c.id];
        if (edit) {
          const centavos = parseCurrencyToCentavos(edit.valorHora) ?? c.valorHora;
          const centihours = parseCentihoursFromInput(edit.horasMes) ?? c.horasMes;
          return calculateContractTotal(centavos, centihours);
        }
        return calculateContractTotal(c.valorHora, c.horasMes);
      }),
    [contracts, editStates]
  );

  const grandTotal = useMemo(() => totals.reduce((sum, t) => sum + t, 0), [totals]);

  if (contracts.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Simulador PJ</h3>
        <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Simule o faturamento baseado em contratos por valor/hora.
          </p>
          <Button variant="outline" size="sm" onClick={handleAdd} disabled={saving}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar contrato
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">Simulador PJ</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={contracts.length >= MAX_CONTRACTS || saving}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        {/* Header — desktop only */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
          <span>V.Hora</span>
          <span>H/Mês</span>
          <span className="text-right">Total</span>
          <span className="w-8" />
        </div>

        {/* Contract rows */}
        {contracts.map((contract, index) => {
          const edit = getEditState(contract);
          return (
            <div key={contract.id} className="px-4 py-3 border-b border-gray-800/50 sm:py-2">
              {/* Mobile layout */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Contrato {index + 1}</span>
                  <button
                    onClick={() => handleDelete(contract.id)}
                    disabled={saving}
                    className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                    title="Remover">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">V.Hora</label>
                    <CurrencyInput
                      value={edit.valorHora}
                      onChange={(v) => updateEditField(contract.id, contract, 'valorHora', v)}
                      placeholder="0,00"
                      clearable
                      className="[&_input]:py-1.5 [&_input]:text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">H/Mês</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={edit.horasMes}
                        onChange={(e) =>
                          updateEditField(contract.id, contract, 'horasMes', e.target.value)
                        }
                        onBlur={() => handleBlur(contract, 'horasMes')}
                        placeholder="0"
                        className={`w-full px-3 ${edit.horasMes ? 'pr-8' : 'pr-3'} py-1.5 bg-gray-900 border border-gray-700 rounded-lg
                                   text-white text-sm font-mono text-right
                                   focus:outline-none focus:border-gray-500 placeholder:text-gray-600`}
                      />
                      {edit.horasMes && (
                        <button
                          type="button"
                          onClick={() => clearEditField(contract.id, contract, 'horasMes')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          tabIndex={-1}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-mono text-white">
                    {totals[index] > 0 ? formatCentavos(totals[index]) : '—'}
                  </span>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <CurrencyInput
                  value={edit.valorHora}
                  onChange={(v) => updateEditField(contract.id, contract, 'valorHora', v)}
                  placeholder="0,00"
                  clearable
                  className="[&_input]:py-1.5 [&_input]:text-sm"
                />
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={edit.horasMes}
                    onChange={(e) =>
                      updateEditField(contract.id, contract, 'horasMes', e.target.value)
                    }
                    onBlur={() => handleBlur(contract, 'horasMes')}
                    placeholder="0"
                    className={`w-full px-3 ${edit.horasMes ? 'pr-8' : 'pr-3'} py-1.5 bg-gray-900 border border-gray-700 rounded-lg
                               text-white text-sm font-mono text-right
                               focus:outline-none focus:border-gray-500 placeholder:text-gray-600`}
                  />
                  {edit.horasMes && (
                    <button
                      type="button"
                      onClick={() => clearEditField(contract.id, contract, 'horasMes')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      tabIndex={-1}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-sm font-mono text-right text-white">
                  {totals[index] > 0 ? formatCentavos(totals[index]) : '—'}
                </span>
                <button
                  onClick={() => handleDelete(contract.id)}
                  disabled={saving}
                  className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                  title="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Footer — Grand Total */}
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-900/80 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Total</span>
          <span className="font-mono text-sm font-bold text-white">
            {grandTotal > 0 ? formatCentavos(grandTotal) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
