// ============================================================
// React Query hooks for wishlist
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { WishlistItem } from '../types';

const WISHLIST_KEY = ['wishlist'] as const;

export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: WISHLIST_KEY,
    queryFn: () => api.get<WishlistItem[]>('/wishlist'),
  });
}

export function useCreateWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Partial<WishlistItem>) => api.post<{ id: number }>('/wishlist', item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: WISHLIST_KEY }); },
  });
}

export function useUpdateWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item }: { id: number; item: Partial<WishlistItem> }) =>
      api.put<{ ok: boolean }>(`/wishlist/${id}`, item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: WISHLIST_KEY }); },
  });
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/wishlist/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: WISHLIST_KEY }); },
  });
}
