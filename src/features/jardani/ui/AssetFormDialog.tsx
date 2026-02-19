'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

import { useExchangeRate } from '../lib/use-exchange-rate';
import { centavosToDisplay, parseCurrencyToCentavos } from '../model/calculate-tax';
import type { FinancialAssetEntry, FinancialAssetInput } from '../model/types';
import { CurrencyInput } from './CurrencyInput';

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: FinancialAssetInput) => Promise<void>;
  onUpdate?: (id: string, input: Partial<FinancialAssetInput>) => Promise<void>;
  editingAsset?: FinancialAssetEntry | null;
}

interface FormState {
  category: 'renda_variavel' | 'renda_fixa';
  institution: string;
  assetType: string;
  value: string;
  foreignCurrency: string;
  yieldRate: string;
  notes: string;
}

const emptyForm: FormState = {
  category: 'renda_variavel',
  institution: '',
  assetType: '',
  value: '',
  foreignCurrency: 'USD',
  yieldRate: '',
  notes: '',
};

function assetToForm(asset: FinancialAssetEntry): FormState {
  const isUsd = asset.foreignCurrency === 'USD' && asset.valueForeign;
  return {
    category: asset.category,
    institution: asset.institution,
    assetType: asset.assetType,
    value: isUsd
      ? centavosToDisplay(asset.valueForeign!)
      : asset.valueBrl > 0
        ? centavosToDisplay(asset.valueBrl)
        : '',
    foreignCurrency: asset.foreignCurrency || 'BRL',
    yieldRate: asset.yieldRate || '',
    notes: asset.notes || '',
  };
}

export function AssetFormDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  editingAsset,
}: AssetFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { rate, isLoading: rateLoading } = useExchangeRate();

  useEffect(() => {
    if (open) {
      setForm(editingAsset ? assetToForm(editingAsset) : emptyForm);
    }
  }, [open, editingAsset]);

  const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isUsd = form.category === 'renda_variavel' && form.foreignCurrency === 'USD';
  const inputCentavos = parseCurrencyToCentavos(form.value);
  const convertedBrl = isUsd && inputCentavos && rate ? Math.round(inputCentavos * rate) : null;

  const handleSave = useCallback(async () => {
    const centavos = parseCurrencyToCentavos(form.value);
    if (!form.institution.trim() || !form.assetType.trim() || centavos === null) return;

    const isVariavelUsd = form.category === 'renda_variavel' && form.foreignCurrency === 'USD';

    const input: FinancialAssetInput = {
      category: form.category,
      institution: form.institution.trim(),
      assetType: form.assetType.trim(),
      valueBrl: isVariavelUsd && rate ? Math.round(centavos * rate) : centavos,
      valueForeign: isVariavelUsd ? centavos : null,
      foreignCurrency: isVariavelUsd ? 'USD' : null,
      yieldRate:
        form.category === 'renda_fixa' && form.yieldRate.trim() ? form.yieldRate.trim() : null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (editingAsset && onUpdate) {
        await onUpdate(editingAsset.id, input);
      } else {
        await onSave(input);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }, [form, rate, editingAsset, onSave, onUpdate, onOpenChange]);

  const isValid =
    form.institution.trim() && form.assetType.trim() && inputCentavos !== null && (!isUsd || rate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
            <Select
              value={form.category}
              onValueChange={(v) => updateField('category', v as FormState['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Instituição / Carteira</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => updateField('institution', e.target.value)}
              placeholder="Ex: Nomad, C6, BTG"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tipo do Ativo</label>
            <input
              type="text"
              value={form.assetType}
              onChange={(e) => updateField('assetType', e.target.value)}
              placeholder="Ex: Stocks, Crypto, CDB, LCA"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
            />
          </div>

          {form.category === 'renda_variavel' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moeda</label>
              <Select
                value={form.foreignCurrency}
                onValueChange={(v) => updateField('foreignCurrency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                </SelectContent>
              </Select>
              {form.foreignCurrency === 'USD' && (
                <p className="text-xs text-gray-500 mt-1">
                  {rateLoading
                    ? 'Buscando cotação...'
                    : rate
                      ? `Cotação: R$ ${rate.toFixed(4)}`
                      : 'Cotação indisponível'}
                </p>
              )}
            </div>
          )}

          <div>
            <CurrencyInput
              value={form.value}
              onChange={(v) => updateField('value', v)}
              label={isUsd ? 'Valor (USD)' : 'Valor (R$)'}
              prefix={isUsd ? 'US$' : 'R$'}
              clearable
              className="[&_input]:py-2 [&_input]:text-sm"
            />
            {isUsd && convertedBrl && (
              <p className="text-xs text-gray-400 mt-1 text-right font-mono">
                ≈ R$ {centavosToDisplay(convertedBrl)}
              </p>
            )}
          </div>

          {form.category === 'renda_fixa' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Taxa / Rendimento</label>
              <input
                type="text"
                value={form.yieldRate}
                onChange={(e) => updateField('yieldRate', e.target.value)}
                placeholder="Ex: 100%, IPCA + 9,01%"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Observações</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !isValid}>
            {saving ? 'Salvando...' : editingAsset ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
