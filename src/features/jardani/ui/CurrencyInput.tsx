'use client';

import { X } from 'lucide-react';
import { ChangeEvent, useCallback } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  prefix?: string;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
}

function formatCurrencyValue(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const centavos = parseInt(digits, 10);
  const reais = centavos / 100;

  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CurrencyInput({
  value,
  onChange,
  label,
  prefix = 'R$',
  placeholder = '0,00',
  className,
  clearable,
}: CurrencyInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrencyValue(e.target.value);
      onChange(formatted);
    },
    [onChange]
  );

  const showClear = clearable && value.length > 0;

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {prefix}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 ${showClear ? 'pr-9' : 'pr-4'} py-3 bg-gray-900 border border-gray-700 rounded-lg
                     text-white text-right text-lg font-mono
                     focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                     placeholder:text-gray-600 transition-colors`}
        />
        {showClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            tabIndex={-1}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
