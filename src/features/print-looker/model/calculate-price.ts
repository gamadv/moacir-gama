export type PrintType =
  | 'sulfite_color'
  | 'sulfite_pb'
  | 'copy_color'
  | 'copy_pb'
  | 'photo_a4'
  | 'label_a4_pb'
  | 'label_a4_color'
  | 'photo_12x17'
  | 'photo_10x15';

export interface PricingRule {
  minQuantity: number;
  unitPrice: number;
}

export interface PrintTypeInfo {
  id: PrintType;
  label: string;
  basePrice: number;
  rules: PricingRule[];
}

export const PRINT_TYPES: Record<PrintType, PrintTypeInfo> = {
  sulfite_color: {
    id: 'sulfite_color',
    label: 'Sulfite Colorido',
    basePrice: 3.0,
    rules: [
      { minQuantity: 20, unitPrice: 1.0 },
      { minQuantity: 100, unitPrice: 0.8 }, // Assuming a higher tier based on text
    ],
  },
  sulfite_pb: {
    id: 'sulfite_pb',
    label: 'Sulfite P&B',
    basePrice: 2.5,
    rules: [{ minQuantity: 20, unitPrice: 0.5 }],
  },
  copy_color: {
    id: 'copy_color',
    label: 'Cópia Colorida (Xerox)',
    basePrice: 2.5,
    rules: [
      { minQuantity: 20, unitPrice: 1.0 },
      { minQuantity: 100, unitPrice: 0.8 },
    ],
  },
  copy_pb: {
    id: 'copy_pb',
    label: 'Cópia P&B (Xerox)',
    basePrice: 2.0,
    rules: [{ minQuantity: 20, unitPrice: 0.5 }],
  },
  photo_a4: {
    id: 'photo_a4',
    label: 'Foto A4',
    basePrice: 10.0,
    rules: [],
  },
  label_a4_pb: {
    id: 'label_a4_pb',
    label: 'Etiqueta A4 P&B',
    basePrice: 8.0,
    rules: [],
  },
  label_a4_color: {
    id: 'label_a4_color',
    label: 'Etiqueta A4 Colorida',
    basePrice: 6.0,
    rules: [],
  },
  photo_10x15: {
    id: 'photo_10x15',
    label: 'Foto 10x15',
    basePrice: 4.0,
    rules: [],
  },
  photo_12x17: {
    id: 'photo_12x17',
    label: 'Foto 12x17',
    basePrice: 6.0,
    rules: [],
  },
};

export interface PriceResult {
  totalPrice: number;
  unitPriceApplied: number;
  isDiscounted: boolean;
  savings?: number;
}

export function calculatePrintPrice(type: PrintType, quantity: number): PriceResult {
  const typeInfo = PRINT_TYPES[type];

  const sortedRules = [...typeInfo.rules].sort((a, b) => b.minQuantity - a.minQuantity);

  const applicableRule = sortedRules.find((rule) => quantity >= rule.minQuantity);

  const unitPriceApplied = applicableRule ? applicableRule.unitPrice : typeInfo.basePrice;
  const totalPrice = unitPriceApplied * quantity;

  const isDiscounted = unitPriceApplied < typeInfo.basePrice;
  const standardTotal = typeInfo.basePrice * quantity;
  const savings = isDiscounted ? standardTotal - totalPrice : 0;

  return {
    totalPrice,
    unitPriceApplied,
    isDiscounted,
    savings,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
