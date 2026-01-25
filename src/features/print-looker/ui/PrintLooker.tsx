'use client';

import { Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

import BannerImage from '../assets/PrintBanner.png';
import {
  calculatePrintPrice,
  formatCurrency,
  PRINT_TYPES,
  PrintType,
} from '../model/calculate-price';

interface PrintItem {
  id: string;
  type: PrintType;
  quantity: string;
}

export function PrintLooker() {
  const [items, setItems] = useState<PrintItem[]>([
    { id: '1', type: 'sulfite_color', quantity: '1' },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), type: 'sulfite_color', quantity: '1' },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PrintItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const qty = parseInt(item.quantity) || 0;
      const calculation = calculatePrintPrice(item.type, qty);
      return {
        ...item,
        qty,
        ...calculation,
      };
    });
  }, [items]);

  const totalSum = calculatedItems.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">
          Adicione itens à lista para calcular o orçamento total
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-gray-900 border-gray-800">
              <ImageIcon className="h-4 w-4" />
              Ver Tabela
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-950 border-gray-800 max-w-xl w-full">
            <DialogHeader className="p-4 border-b border-gray-800 bg-gray-900/50">
              <DialogTitle>Tabela de Preços</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[80vh] bg-gray-900">
              <Image
                src={BannerImage}
                alt="Tabela de Preços de Impressão"
                fill
                className="object-contain"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-[1fr_80px_100px_40px] sm:grid-cols-[1fr_100px_120px_40px] gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 font-medium">
          <div>Tipo</div>
          <div className="text-center">Qtd</div>
          <div className="text-right">Total</div>
          <div></div>
        </div>

        <div className="divide-y divide-gray-800">
          {calculatedItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_80px_100px_40px] sm:grid-cols-[1fr_100px_120px_40px] gap-4 p-4 items-center hover:bg-white/5 transition-colors">
              <div className="flex flex-col gap-1">
                <Select
                  value={item.type}
                  onValueChange={(value) => updateItem(item.id, 'type', value as PrintType)}>
                  <SelectTrigger className="h-8 border-transparent bg-transparent p-0 text-white focus:ring-0 shadow-none hover:bg-white/5">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900">
                    {Object.values(PRINT_TYPES).map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-[10px] text-gray-500 pl-0">
                  {formatCurrency(item.unitPriceApplied)}/un
                  {item.isDiscounted && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-4 px-1 text-[10px] bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Desc.
                    </Badge>
                  )}
                </div>
              </div>

              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                className="h-8 text-center bg-transparent border-gray-800 focus:border-blue-500"
              />

              <div className="text-right font-mono font-bold text-white">
                {formatCurrency(item.totalPrice)}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                title="Remover item">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            Nenhum item adicionado. Clique abaixo para começar.
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <Button
          variant="secondary"
          onClick={addItem}
          className="bg-gray-800 text-white hover:bg-gray-700">
          <span className="text-lg leading-none mr-2">+</span> Adicionar Item
        </Button>

        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total Geral</span>
          <span className="text-3xl font-mono font-bold text-green-400">
            {formatCurrency(totalSum)}
          </span>
        </div>
      </div>
    </div>
  );
}
