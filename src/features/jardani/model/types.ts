export interface RevenueEntry {
  id: string;
  companyId: string;
  year: number;
  month: number;
  revenue: number; // centavos
}

export interface PjContractEntry {
  id: string;
  companyId: string;
  valorHora: number; // centavos
  horasMes: number; // centésimos de hora (16050 = 160,50h)
}

export interface PjContractInput {
  valorHora: number; // centavos
  horasMes: number; // centésimos de hora
}

export interface CompanyData {
  id: string;
  name: string;
  userId: string;
  dependents: number;
  proLabore: number; // centavos
  revenues: RevenueEntry[];
  contracts: PjContractEntry[];
}

export interface RevenueInput {
  year: number;
  month: number;
  revenue: number; // centavos
}

export interface FinancialAssetEntry {
  id: string;
  userId: string;
  category: 'renda_variavel' | 'renda_fixa';
  institution: string;
  assetType: string;
  valueBrl: number; // centavos
  valueForeign: number | null;
  foreignCurrency: string | null;
  yieldRate: string | null;
  notes: string | null;
}

export interface FinancialAssetInput {
  category: 'renda_variavel' | 'renda_fixa';
  institution: string;
  assetType: string;
  valueBrl: number; // centavos
  valueForeign?: number | null;
  foreignCurrency?: string | null;
  yieldRate?: string | null;
  notes?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
