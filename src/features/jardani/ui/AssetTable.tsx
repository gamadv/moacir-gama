'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { formatCentavos } from '../model/calculate-tax';
import type { FinancialAssetEntry } from '../model/types';

interface AssetTableProps {
  assets: FinancialAssetEntry[];
  category: 'renda_variavel' | 'renda_fixa';
  onEdit: (asset: FinancialAssetEntry) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function AssetTable({ assets, category, onEdit, onDelete, disabled }: AssetTableProps) {
  const total = useMemo(() => assets.reduce((sum, a) => sum + a.valueBrl, 0), [assets]);

  if (assets.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 text-center">
        <p className="text-xs text-gray-500">
          {category === 'renda_variavel'
            ? 'Nenhum ativo de renda variável cadastrado.'
            : 'Nenhum ativo de renda fixa cadastrado.'}
        </p>
      </div>
    );
  }

  if (category === 'renda_variavel') {
    return (
      <div className="rounded-lg border border-gray-800 overflow-hidden">
        {/* Header — desktop */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
          <span>Carteira</span>
          <span>Tipo</span>
          <span className="text-right">Valor (R$)</span>
          <span className="text-right">Valor Ext.</span>
          <span className="w-16" />
        </div>

        {assets.map((asset) => (
          <div key={asset.id} className="px-4 py-3 border-b border-gray-800/50 sm:py-2">
            {/* Mobile */}
            <div className="flex flex-col gap-1.5 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{asset.institution}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(asset)}
                    disabled={disabled}
                    className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                    title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(asset.id)}
                    disabled={disabled}
                    className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                    title="Remover">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-xs text-gray-500">{asset.assetType}</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono text-white">
                  {formatCentavos(asset.valueBrl)}
                </span>
                {asset.valueForeign && (
                  <span className="text-xs font-mono text-gray-400">
                    {asset.foreignCurrency || 'USD'}{' '}
                    {formatCentavos(asset.valueForeign).replace('R$', '').trim()}
                  </span>
                )}
              </div>
              {asset.notes && <span className="text-xs text-gray-600">{asset.notes}</span>}
            </div>

            {/* Desktop */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <span className="text-sm text-white truncate" title={asset.institution}>
                {asset.institution}
              </span>
              <span className="text-sm text-gray-300 truncate" title={asset.assetType}>
                {asset.assetType}
              </span>
              <span className="text-sm font-mono text-right text-white">
                {formatCentavos(asset.valueBrl)}
              </span>
              <span className="text-sm font-mono text-right text-gray-400">
                {asset.valueForeign
                  ? `${asset.foreignCurrency || 'USD'} ${formatCentavos(asset.valueForeign).replace('R$', '').trim()}`
                  : '—'}
              </span>
              <div className="flex gap-1 justify-end">
                <button
                  onClick={() => onEdit(asset)}
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                  title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(asset.id)}
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                  title="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-900/80 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Total</span>
          <span className="font-mono text-sm font-bold text-white">
            {total > 0 ? formatCentavos(total) : '—'}
          </span>
        </div>
      </div>
    );
  }

  // Renda Fixa
  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      {/* Header — desktop */}
      <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
        <span>Instituição</span>
        <span>Tipo</span>
        <span>Taxa</span>
        <span className="text-right">Valor (R$)</span>
        <span className="w-16" />
      </div>

      {assets.map((asset) => (
        <div key={asset.id} className="px-4 py-3 border-b border-gray-800/50 sm:py-2">
          {/* Mobile */}
          <div className="flex flex-col gap-1.5 sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{asset.institution}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(asset)}
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                  title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(asset.id)}
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                  title="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{asset.assetType}</span>
              {asset.yieldRate && (
                <>
                  <span className="text-gray-700">•</span>
                  <span>{asset.yieldRate}</span>
                </>
              )}
            </div>
            <span className="text-sm font-mono text-white">{formatCentavos(asset.valueBrl)}</span>
            {asset.notes && <span className="text-xs text-gray-600">{asset.notes}</span>}
          </div>

          {/* Desktop */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
            <span className="text-sm text-white truncate" title={asset.institution}>
              {asset.institution}
            </span>
            <span className="text-sm text-gray-300 truncate" title={asset.assetType}>
              {asset.assetType}
            </span>
            <span className="text-sm text-gray-400">{asset.yieldRate || '—'}</span>
            <span className="text-sm font-mono text-right text-white">
              {formatCentavos(asset.valueBrl)}
            </span>
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => onEdit(asset)}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                title="Editar">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(asset.id)}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                title="Remover">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-900/80 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">Total</span>
        <span className="font-mono text-sm font-bold text-white">
          {total > 0 ? formatCentavos(total) : '—'}
        </span>
      </div>
    </div>
  );
}
