'use client';

import { useCallback } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/shared/lib/swr';

import type { FinancialAssetEntry, FinancialAssetInput } from '../model/types';
import { apiMutate } from './api-mutate';
import { JARDANI_KEYS } from './cache-keys';

interface UseInvestmentsReturn {
  assets: FinancialAssetEntry[];
  isLoading: boolean;
  error: string | null;
  createAsset: (input: FinancialAssetInput) => Promise<void>;
  updateAsset: (id: string, input: Partial<FinancialAssetInput>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInvestments(): UseInvestmentsReturn {
  const {
    data: assets,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<FinancialAssetEntry[]>(JARDANI_KEYS.assets, fetcher);

  const error = swrError ? swrError.message : null;

  const createAsset = useCallback(
    async (input: FinancialAssetInput) => {
      await apiMutate('/api/jardani/asset', { method: 'POST', body: input });
      await mutate();
    },
    [mutate]
  );

  const updateAsset = useCallback(
    async (id: string, input: Partial<FinancialAssetInput>) => {
      await apiMutate('/api/jardani/asset', { method: 'PUT', body: { id, ...input } });
      await mutate();
    },
    [mutate]
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      await apiMutate(`/api/jardani/asset?id=${id}`, { method: 'DELETE' });
      await mutate();
    },
    [mutate]
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    assets: assets ?? [],
    isLoading,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    refresh,
  };
}
