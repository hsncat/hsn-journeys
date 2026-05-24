/**
 * 后台 fetch 封装
 */

import type { JourneyDTO, SubCardDTO, WishlistDTO, CityCoordRow, PackingRow } from '@/server/db';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error === 'too_large_500kb' ? '图片压缩后仍超过 500KB，请换一张图片' : (body.error || `HTTP ${res.status}`));
  }
  return res.json() as Promise<T>;
}

// Auth
export const logout = () => request('/api/auth/logout', { method: 'POST' });
export const changePassword = (oldPassword: string, newPassword: string) =>
  request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });

// Journeys
export const listJourneysApi = () =>
  request<{ journeys: JourneyDTO[] }>('/api/journeys').then(r => r.journeys);
export const getJourneyApi = (id: number | string) =>
  request<{ journey: JourneyDTO }>(`/api/journeys/${id}`).then(r => r.journey);
export const createJourneyApi = (data: Partial<JourneyDTO>) =>
  request<{ journey: JourneyDTO }>('/api/journeys', { method: 'POST', body: JSON.stringify(data) }).then(r => r.journey);
export const updateJourneyApi = (id: number, data: Partial<JourneyDTO>) =>
  request<{ journey: JourneyDTO }>(`/api/journeys/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.journey);
export const deleteJourneyApi = (id: number) =>
  request(`/api/journeys/${id}`, { method: 'DELETE' });
export const resyncJourneyApi = (id: number) =>
  request<{ journey: JourneyDTO }>(`/api/journeys/${id}/resync`, { method: 'POST' }).then(r => r.journey);
export const updateFeaturedJourneysApi = (ids: number[]) =>
  request<{ ok: boolean; featuredIds: number[] }>('/api/journeys/featured', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });

// SubCards
export const listSubCardsApi = (journeyId?: number) =>
  request<{ subCards: SubCardDTO[] }>(
    journeyId ? `/api/sub-cards?journeyId=${journeyId}` : '/api/sub-cards'
  ).then(r => r.subCards);
export const getSubCardApi = (id: string) =>
  request<{ subCard: SubCardDTO }>(`/api/sub-cards/${id}`).then(r => r.subCard);
export const createSubCardApi = (data: Partial<SubCardDTO> & { journeyId: number; syncJourneyPhoto?: boolean }) =>
  request<{ subCard: SubCardDTO }>('/api/sub-cards', { method: 'POST', body: JSON.stringify(data) }).then(r => r.subCard);
export const updateSubCardApi = (id: string, data: Partial<SubCardDTO> & { syncJourneyPhoto?: boolean }) =>
  request<{ subCard: SubCardDTO }>(`/api/sub-cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.subCard);
export const deleteSubCardApi = (id: string) =>
  request(`/api/sub-cards/${id}`, { method: 'DELETE' });

// Wishlist
export const listWishlistApi = () =>
  request<{ wishlist: WishlistDTO[] }>('/api/wishlist').then(r => r.wishlist);
export const createWishlistApi = (data: Partial<WishlistDTO>) =>
  request<{ wishlist: WishlistDTO }>('/api/wishlist', { method: 'POST', body: JSON.stringify(data) }).then(r => r.wishlist);
export const updateWishlistApi = (id: number, data: Partial<WishlistDTO>) =>
  request<{ wishlist: WishlistDTO }>(`/api/wishlist/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.wishlist);
export const deleteWishlistApi = (id: number) =>
  request(`/api/wishlist/${id}`, { method: 'DELETE' });

// Coords
export const listCoordsApi = () =>
  request<{ coords: CityCoordRow[] }>('/api/coords').then(r => r.coords);
export const upsertCoordApi = (name: string, data: Omit<CityCoordRow, 'name' | 'updated_at'>) =>
  request<{ coord: CityCoordRow }>(`/api/coords/${encodeURIComponent(name)}`, {
    method: 'PUT', body: JSON.stringify(data),
  }).then(r => r.coord);
export const deleteCoordApi = (name: string) =>
  request(`/api/coords/${encodeURIComponent(name)}`, { method: 'DELETE' });

// Packing
export const listPackingApi = () =>
  request<{ items: PackingRow[] }>('/api/packing').then(r => r.items);
export const createPackingApi = (data: Partial<PackingRow>) =>
  request<{ item: PackingRow }>('/api/packing', { method: 'POST', body: JSON.stringify(data) }).then(r => r.item);
export const updatePackingApi = (id: number, data: Partial<PackingRow>) =>
  request<{ item: PackingRow }>(`/api/packing/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.item);
export const deletePackingApi = (id: number) =>
  request(`/api/packing/${id}`, { method: 'DELETE' });

// Photo upload
export async function uploadPhoto(file: File, folder = 'journeys'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const res = await fetch('/api/photos', {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const { key } = await res.json() as { key: string };
  return key;
}
