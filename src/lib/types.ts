// ============================================================
// Shared TypeScript interfaces for HSN Journeys v2
// ============================================================

export interface Journey {
  id: number;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate: string;
  title: string;
  emoji: string;
  description: string;
  story: string;
  photoKey: string | null;
  photoUrl?: string;
  sortOrder: number;
  highlights: Highlight[];
  costs: Cost;
  itinerary: ItineraryItem[];
  subCards: SubCard[];
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: number;
  journeyId: number;
  text: string;
  sortOrder: number;
}

export interface Cost {
  packageFee: number;
  transportFee: number;
  accommodationFee: number;
  foodFee: number;
  shoppingFee: number;
  ticketFee: number;
}

export interface ItineraryItem {
  id: number;
  journeyId: number;
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
  note: string;
  sortOrder: number;
}

export interface SubCard {
  id: string;
  journeyId: number;
  name: string;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate: string;
  emoji: string;
  story: string;
  photoKey: string | null;
  photoUrl?: string;
  sortOrder: number;
  highlights: SubCardHighlight[];
  costs: Cost;
  itineraryTable: ItineraryTable;
}

export interface SubCardHighlight {
  id: number;
  subCardId: string;
  text: string;
  sortOrder: number;
}

export interface ItineraryTable {
  headers: string[];
  rows: string[][];
}

export interface WishlistItem {
  id: number;
  title: string;
  city: string;
  emoji: string;
  duration: string;
  season: string;
  description: string;
  highlights: WishlistHighlight[];
  sortOrder: number;
}

export interface WishlistHighlight {
  id: number;
  wishlistId: number;
  text: string;
  sortOrder: number;
}

export interface PackingCategory {
  id: number;
  name: string;
  sortOrder: number;
  items: PackingItem[];
}

export interface PackingItem {
  id: number;
  categoryId: number;
  item: string;
  note: string;
  checked: boolean;
  sortOrder: number;
}

export interface CityCoordinate {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'domestic' | 'international';
}

export interface SiteSettings {
  [key: string]: string;
}

export interface PageStats {
  cityCount: number;
  journeyCount: number;
  photoCount: number;
  totalCost: number;
  countryCount: number;
}

export interface Location {
  name: string;
  type: 'country' | 'province' | 'city';
  country: string;
  province: string;
  emoji: string;
  count: number;
  journeys: Journey[];
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
}
