'use client';

import { Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/shared/ui';

import { useInvestments } from '../lib/use-investments';
import { formatCentavos } from '../model/calculate-tax';
import type { FinancialAssetEntry } from '../model/types';
import { AssetFormDialog } from './AssetFormDialog';
import { AssetTable } from './AssetTable';

export function PfInvestments() {
  const { assets, isLoading, error, createAsset, updateAsset, deleteAsset } = useInvestments();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FinancialAssetEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rendaVariavel = useMemo(
    () => assets.filter((a) => a.category === 'renda_variavel'),
    [assets]
  );
  const rendaFixa = useMemo(() => assets.filter((a) => a.category === 'renda_fixa'), [assets]);

  const totalGeral = useMemo(() => assets.reduce((sum, a) => sum + a.valueBrl, 0), [assets]);

  const handleEdit = useCallback((asset: FinancialAssetEntry) => {
    setEditingAsset(asset);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(true);
      try {
        await deleteAsset(id);
      } finally {
        setDeleting(false);
      }
    },
    [deleteAsset]
  );

  const handleOpenNew = useCallback(() => {
    setEditingAsset(null);
    setFormOpen(true);
  }, []);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">Acompanhamento de ativos financeiros</p>
        <Button variant="outline" size="sm" onClick={handleOpenNew}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Renda Variável */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Renda Variável</h3>
        <AssetTable
          assets={rendaVariavel}
          category="renda_variavel"
          onEdit={handleEdit}
          onDelete={handleDelete}
          disabled={deleting}
        />
      </div>

      {/* Renda Fixa */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Renda Fixa</h3>
        <AssetTable
          assets={rendaFixa}
          category="renda_fixa"
          onEdit={handleEdit}
          onDelete={handleDelete}
          disabled={deleting}
        />
      </div>

      {/* Total Geral */}
      {assets.length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-white">Patrimônio Total</span>
          <span className="font-mono text-base font-bold text-white">
            {formatCentavos(totalGeral)}
          </span>
        </div>
      )}

      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={createAsset}
        onUpdate={updateAsset}
        editingAsset={editingAsset}
      />
    </div>
  );
}
