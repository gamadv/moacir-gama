'use client';

import { Building2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/ui';

interface CompanySetupProps {
  onCreateCompany: (name: string) => Promise<void>;
}

export function CompanySetup({ onCreateCompany }: CompanySetupProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateCompany(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-800 p-4">
        <Building2 className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">Configure sua empresa</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-400">
        Informe o nome da sua empresa para começar a controlar o faturamento e os impostos.
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da empresa"
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg
                     text-white text-sm
                     focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                     placeholder:text-gray-600 transition-colors"
        />
        <Button type="submit" disabled={!name.trim() || isSubmitting} size="sm">
          {isSubmitting ? 'Salvando...' : 'Criar'}
        </Button>
      </form>
    </div>
  );
}
