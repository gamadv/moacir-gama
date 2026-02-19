'use client';

import { Building2, Loader2, Pencil } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button, Dialog, DialogContent, DialogTitle } from '@/shared/ui';

import { useJardani } from '../lib/use-jardani';
import { calculateRBT12 } from '../model/calculate-tax';
import { BulkRevenueInput } from './BulkRevenueInput';
import { CompanySetup } from './CompanySetup';
import { DarfSummary } from './DarfSummary';
import { PjSimulator } from './PjSimulator';
import { ProLaboreCalculator } from './ProLaboreCalculator';
import { RevenueSimulator } from './RevenueSimulator';
import { RevenueTable } from './RevenueTable';
import { TaxSummary } from './TaxSummary';

export function Jardani() {
  const {
    company,
    isLoading,
    error,
    createCompany,
    updateCompanyName,
    upsertRevenue,
    bulkUpsertRevenues,
    deleteRevenue,
    createContract,
    updateContract,
    deleteContract,
  } = useJardani();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleStartEditName = useCallback(() => {
    setNewName(company?.name ?? '');
    setEditingName(true);
  }, [company?.name]);

  const handleSaveName = useCallback(async () => {
    if (!newName.trim()) return;
    await updateCompanyName(newName.trim());
    setEditingName(false);
  }, [newName, updateCompanyName]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const revenues = useMemo(() => company?.revenues ?? [], [company?.revenues]);
  const contracts = useMemo(() => company?.contracts ?? [], [company?.contracts]);

  const currentRevenue = useMemo(() => {
    const entry = revenues.find((r) => r.year === currentYear && r.month === currentMonth);
    return entry?.revenue ?? 0;
  }, [revenues, currentYear, currentMonth]);

  const rbt12 = useMemo(
    () => calculateRBT12(revenues, currentYear, currentMonth),
    [revenues, currentYear, currentMonth]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!company) {
    return <CompanySetup onCreateCompany={createCompany} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header da empresa */}
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-gray-800 p-2">
          <Building2 className="h-4 w-4 text-gray-400" />
        </div>
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg
                         text-white text-sm focus:outline-none focus:border-gray-500"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveName}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-medium text-white">{company.name}</h2>
            <button
              onClick={handleStartEditName}
              className="p-1 text-gray-500 hover:text-gray-300"
              title="Editar nome">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      <TaxSummary revenues={revenues} currentYear={currentYear} currentMonth={currentMonth} />

      <RevenueTable
        revenues={revenues}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onUpsertRevenue={upsertRevenue}
        onDeleteRevenue={deleteRevenue}
        onOpenBulkInput={() => setBulkOpen(true)}
      />

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Importar Histórico</DialogTitle>
          <BulkRevenueInput
            onBulkSave={bulkUpsertRevenues}
            onClose={() => setBulkOpen(false)}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        </DialogContent>
      </Dialog>

      <ProLaboreCalculator monthlyRevenue={currentRevenue} rbt12={rbt12} />

      <DarfSummary revenues={revenues} currentYear={currentYear} currentMonth={currentMonth} />

      <RevenueSimulator revenues={revenues} currentYear={currentYear} currentMonth={currentMonth} />

      <PjSimulator
        contracts={contracts}
        onCreateContract={createContract}
        onUpdateContract={updateContract}
        onDeleteContract={deleteContract}
      />
    </div>
  );
}
