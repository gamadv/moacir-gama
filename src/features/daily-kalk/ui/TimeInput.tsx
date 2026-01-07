'use client';

import { ChangeEvent, useCallback } from 'react';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

function formatTimeValue(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  const limited = digits.slice(0, 4);

  if (limited.length <= 2) {
    return limited;
  }

  const hours = limited.slice(0, 2);
  const minutes = limited.slice(2);

  return `${hours}:${minutes}`;
}

export function TimeInput({ value, onChange, label, placeholder = '00:00' }: TimeInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeValue(e.target.value);
      onChange(formatted);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={5}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                   text-white text-center text-xl font-mono
                   focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                   placeholder:text-gray-600 transition-colors"
      />
    </div>
  );
}
