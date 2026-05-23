// ============================================================
// Admin-specific types — re-exports + form types
// ============================================================

export type {
  Journey,
  SubCard,
  SubCardHighlight,
  Highlight,
  Cost,
  ItineraryItem,
  ItineraryTable,
  WishlistItem,
  WishlistHighlight,
  PackingCategory,
  PackingItem,
  CityCoordinate,
  SiteSettings,
  PageStats,
  Location,
  User,
} from '../lib/types';

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  inviteCode: string;
}

export interface JourneyForm {
  province: string;
  city: string;
  country: string;
  title: string;
  emoji: string;
  description: string;
  date: string;
  endDate: string;
  story: string;
  highlights: string[];
  costs: {
    packageFee: number;
    transportFee: number;
    accommodationFee: number;
    foodFee: number;
    shoppingFee: number;
    ticketFee: number;
  };
  itinerary: {
    date: string;
    morning: string;
    afternoon: string;
    evening: string;
    note: string;
  }[];
  photoKey: string | null;
  photoUrl: string;
  subCards: SubCardForm[];
}

export interface SubCardForm {
  id?: number;
  name: string;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate: string;
  emoji: string;
  story: string;
  highlights: string[];
  costs: {
    packageFee: number;
    transportFee: number;
    accommodationFee: number;
    foodFee: number;
    shoppingFee: number;
    ticketFee: number;
  };
  itineraryTable: {
    headers: string[];
    rows: string[][];
  };
  photoKey: string | null;
  photoUrl: string;
}

export function emptyCost() {
  return { packageFee: 0, transportFee: 0, accommodationFee: 0, foodFee: 0, shoppingFee: 0, ticketFee: 0 };
}

export function emptyJourneyForm(): JourneyForm {
  return {
    province: '',
    city: '',
    country: '',
    title: '',
    emoji: '',
    description: '',
    date: '',
    endDate: '',
    story: '',
    highlights: [],
    costs: emptyCost(),
    itinerary: [{ date: '', morning: '', afternoon: '', evening: '', note: '' }],
    photoKey: null,
    photoUrl: '',
    subCards: [],
  };
}

export function emptySubCardForm(): SubCardForm {
  return {
    name: '',
    province: '',
    city: '',
    country: '',
    date: '',
    endDate: '',
    emoji: '',
    story: '',
    highlights: [],
    costs: emptyCost(),
    itineraryTable: { headers: ['上午', '下午'], rows: [['', '']] },
    photoKey: null,
    photoUrl: '',
  };
}
