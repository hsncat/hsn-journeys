// ============================================================
// React Query hooks for packing list
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { PackingCategory, PackingItem } from '../types';

const PACKING_KEY = ['packing'] as const;

interface PackingResponse {
  categories: PackingCategory[];
}

export function usePacking() {
  return useQuery<PackingResponse>({
    queryKey: PACKING_KEY,
    queryFn: () => api.get<PackingResponse>('/packing'),
  });
}

export function useCreatePackingCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post<{ id: number }>('/packing/category', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}

export function useUpdatePackingCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PackingCategory> }) =>
      api.put<{ ok: boolean }>(`/packing/category/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}

export function useDeletePackingCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/packing/category/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}

export function useCreatePackingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PackingItem>) => api.post<{ id: number }>('/packing/item', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}

export function useUpdatePackingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PackingItem> }) =>
      api.put<{ ok: boolean }>(`/packing/item/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}

export function useDeletePackingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/packing/item/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PACKING_KEY }); },
  });
}
