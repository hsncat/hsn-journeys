// ============================================================
// React Query hooks for journeys
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Journey } from '../types';

const JOURNEYS_KEY = ['journeys'] as const;

export function useJourneys() {
  return useQuery<Journey[]>({
    queryKey: JOURNEYS_KEY,
    queryFn: () => api.get<Journey[]>('/journeys'),
  });
}

export function useJourney(id: number | string | undefined) {
  return useQuery<Journey>({
    queryKey: ['journeys', id],
    queryFn: () => api.get<Journey>(`/journeys/${id}`),
    enabled: !!id && id !== 'new',
  });
}

export function useCreateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (journey: Partial<Journey>) => api.post<{ id: number }>('/journeys', journey),
    onSuccess: () => { qc.invalidateQueries({ queryKey: JOURNEYS_KEY }); },
  });
}

export function useUpdateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, journey }: { id: number; journey: Partial<Journey> }) =>
      api.put<{ ok: boolean }>(`/journeys/${id}`, journey),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: JOURNEYS_KEY });
      qc.invalidateQueries({ queryKey: ['journeys', vars.id] });
    },
  });
}

export function useDeleteJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/journeys/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: JOURNEYS_KEY }); },
  });
}

export function useCreateSubCard(journeyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subCard: Record<string, unknown>) =>
      api.post<{ id: string }>(`/journeys/${journeyId}/subcards`, subCard),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JOURNEYS_KEY });
      qc.invalidateQueries({ queryKey: ['journeys', journeyId] });
    },
  });
}

export function useUpdateSubCard(journeyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subCardId, subCard }: { subCardId: string; subCard: Record<string, unknown> }) =>
      api.put<{ ok: boolean }>(`/journeys/${journeyId}/subcards/${subCardId}`, subCard),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JOURNEYS_KEY });
      qc.invalidateQueries({ queryKey: ['journeys', journeyId] });
    },
  });
}

export function useDeleteSubCard(journeyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subCardId: string) => api.del(`/journeys/${journeyId}/subcards/${subCardId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JOURNEYS_KEY });
      qc.invalidateQueries({ queryKey: ['journeys', journeyId] });
    },
  });
}
