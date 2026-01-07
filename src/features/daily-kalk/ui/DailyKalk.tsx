'use client';

import { useMemo, useState } from 'react';

import { calculateEndTime, calculateWorkHours, WorkHoursResult } from '../model/calculate-hours';
import { TimeInput } from './TimeInput';

const STATUS_STYLES = {
  exact: 'text-green-400 border-green-400/30 bg-green-400/10',
  under: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  over: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
} as const;

const STATUS_LABELS = {
  exact: 'Meta atingida!',
  under: 'Abaixo da meta',
  over: 'Acima da meta',
} as const;

export function DailyKalk() {
  const [entry1, setEntry1] = useState('');
  const [exit1, setExit1] = useState('');
  const [entry2, setEntry2] = useState('');
  const [exit2, setExit2] = useState('');

  const result: WorkHoursResult | null = useMemo(() => {
    return calculateWorkHours(entry1, exit1, entry2, exit2);
  }, [entry1, exit1, entry2, exit2]);

  const endTime = useMemo(() => {
    return calculateEndTime(entry1, exit1, entry2, exit2);
  }, [entry1, exit1, entry2, exit2]);

  const hasMorningPeriod = entry1.length === 5 && exit1.length === 5;
  const hasAfternoonPeriod = entry2.length === 5 && exit2.length === 5;
  const hasAnyInput =
    entry1.length === 5 || exit1.length === 5 || entry2.length === 5 || exit2.length === 5;
  const isPartialCalculation =
    (hasMorningPeriod || hasAfternoonPeriod) && !(hasMorningPeriod && hasAfternoonPeriod);

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-gray-400 text-sm mb-6 text-center">
        Calcule suas horas úteis diárias de trabalho
      </p>

      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Período da Manhã
          {hasMorningPeriod && <span className="ml-2 text-green-500">✓</span>}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <TimeInput label="Entrada" value={entry1} onChange={setEntry1} placeholder="08:00" />
          <TimeInput label="Saída (Almoço)" value={exit1} onChange={setExit1} placeholder="12:00" />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Período da Tarde
          {hasAfternoonPeriod && <span className="ml-2 text-green-500">✓</span>}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <TimeInput label="Retorno" value={entry2} onChange={setEntry2} placeholder="13:00" />
          <TimeInput label="Saída" value={exit2} onChange={setExit2} placeholder="17:00" />
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        {endTime && (
          <div className="text-center mb-6 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-gray-300 text-sm">
              🕐 Sua jornada finaliza às{' '}
              <span className="font-mono font-bold text-white">{endTime}</span>
            </p>
            {!exit1 && !entry2 && (
              <p className="text-gray-500 text-xs mt-1">(considerando 1h de intervalo)</p>
            )}
          </div>
        )}

        {result ? (
          <>
            {isPartialCalculation && (
              <p className="text-center text-yellow-500/70 text-xs mb-4">
                ⚠ Cálculo parcial - preencha ambos os períodos para resultado completo
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div
                className={`flex flex-col items-center px-6 py-4 rounded-lg border transition-all ${STATUS_STYLES[result.status]}`}>
                <span className="text-xs uppercase tracking-wider opacity-70 mb-1">
                  Total Trabalhado
                </span>
                <span className="text-3xl font-mono font-bold">{result.totalFormatted}</span>
                <span className="text-xs mt-1">{STATUS_LABELS[result.status]}</span>
              </div>

              {result.status !== 'exact' && (
                <div className="flex flex-col items-center px-6 py-4 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-400 transition-all">
                  <span className="text-xs uppercase tracking-wider opacity-70 mb-1">
                    {result.status === 'under' ? 'Faltam' : 'Horas Extras'}
                  </span>
                  <span className="text-3xl font-mono font-bold">{result.remainingFormatted}</span>
                  <span className="text-xs mt-1">
                    {result.status === 'under' ? 'para completar 8h' : 'além da meta'}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-6 py-4 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-500">
            <span className="text-xs uppercase tracking-wider opacity-70 mb-1">
              Total Trabalhado
            </span>
            <span className="text-3xl font-mono font-bold">0h</span>
            <span className="text-xs mt-1">
              {hasAnyInput
                ? 'Complete um período para calcular'
                : 'Preencha os horários para começar'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
