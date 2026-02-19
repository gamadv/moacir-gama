'use client';

import { useCallback } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/shared/lib/swr';

import type { CompanyData, PjContractInput, RevenueInput } from '../model/types';
import { apiMutate } from './api-mutate';
import { JARDANI_KEYS } from './cache-keys';

interface UseJardaniReturn {
  company: CompanyData | null;
  isLoading: boolean;
  error: string | null;
  createCompany: (name: string) => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
  upsertRevenue: (input: RevenueInput) => Promise<void>;
  bulkUpsertRevenues: (inputs: RevenueInput[]) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  createContract: (input: PjContractInput) => Promise<void>;
  updateContract: (id: string, input: Partial<PjContractInput>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useJardani(): UseJardaniReturn {
  const {
    data: company,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<CompanyData | null>(JARDANI_KEYS.company, fetcher);

  const error = swrError ? swrError.message : null;

  const createCompany = useCallback(
    async (name: string) => {
      await apiMutate('/api/jardani/company', { method: 'POST', body: { name } });
      await mutate();
    },
    [mutate]
  );

  const updateCompanyName = useCallback(
    async (name: string) => {
      await apiMutate('/api/jardani/company', { method: 'PUT', body: { name } });
      await mutate();
    },
    [mutate]
  );

  const upsertRevenue = useCallback(
    async (input: RevenueInput) => {
      await apiMutate('/api/jardani/revenue', { method: 'POST', body: input });
      await mutate();
    },
    [mutate]
  );

  const bulkUpsertRevenues = useCallback(
    async (inputs: RevenueInput[]) => {
      await apiMutate('/api/jardani/revenue', {
        method: 'PUT',
        body: { revenues: inputs },
      });
      await mutate();
    },
    [mutate]
  );

  const deleteRevenue = useCallback(
    async (id: string) => {
      await apiMutate(`/api/jardani/revenue?id=${id}`, { method: 'DELETE' });
      await mutate();
    },
    [mutate]
  );

  const createContract = useCallback(
    async (input: PjContractInput) => {
      await apiMutate('/api/jardani/contract', { method: 'POST', body: input });
      await mutate();
    },
    [mutate]
  );

  const updateContract = useCallback(
    async (id: string, input: Partial<PjContractInput>) => {
      await apiMutate('/api/jardani/contract', { method: 'PUT', body: { id, ...input } });
      await mutate();
    },
    [mutate]
  );

  const deleteContract = useCallback(
    async (id: string) => {
      await apiMutate(`/api/jardani/contract?id=${id}`, { method: 'DELETE' });
      await mutate();
    },
    [mutate]
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    company: company ?? null,
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
    refresh,
  };
}
