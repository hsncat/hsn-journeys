// ============================================================
// SSG Data Loader — reads legacy data at build time
// Transforms legacy format → v2 types for static page generation
// ============================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Journey, WishlistItem, PackingCategory, CityCoordinate, Cost, Highlight, ItineraryItem, SubCard } from './types';

// Path to legacy data — resolve from cwd (project root during astro build)
const LEGACY_DATA = join(process.cwd(), 'legacy', 'data', 'journeys.json');

// ============================================================
// Raw legacy types (matching data/journeys.json format)
// ============================================================

interface LegacyJourney {
  id: number;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate?: string;
  title: string;
  emoji: string;
  description: string;
  story: string;
  highlights: string[];
  cost?: LegacyCost;
  itinerary?: LegacyItineraryItem[];
  subCards?: LegacySubCard[];
  photo?: string;
}

interface LegacyCost {
  package?: number;
  transport?: number;
  accommodation?: number;
  food?: number;
  shopping?: number;
  ticket?: number;
}

interface LegacyItineraryItem {
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
  note: string;
}

interface LegacySubCard {
  id?: string | number;
  name: string;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate?: string;
  emoji: string;
  story: string;
  highlights?: string[];
  cost?: LegacyCost;
  itineraryTable?: {
    headers: string[];
    rows: string[][];
  };
  photo?: string;
}

// ============================================================
// Mappers: legacy → v2 types
// ============================================================

function mapLegacyCost(lc: LegacyCost | undefined): Cost {
  return {
    packageFee: lc?.package || 0,
    transportFee: lc?.transport || 0,
    accommodationFee: lc?.accommodation || 0,
    foodFee: lc?.food || 0,
    shoppingFee: lc?.shopping || 0,
    ticketFee: lc?.ticket || 0,
  };
}

function mapLegacyHighlights(hl: string[], journeyId: number): Highlight[] {
  return hl.map((text, i) => ({
    id: i + 1,
    journeyId,
    text,
    sortOrder: i,
  }));
}

function mapLegacyItinerary(it: LegacyItineraryItem[], journeyId: number): ItineraryItem[] {
  return it.map((item, i) => ({
    id: i + 1,
    journeyId,
    date: item.date || '',
    morning: item.morning || '',
    afternoon: item.afternoon || '',
    evening: item.evening || '',
    note: item.note || '',
    sortOrder: i,
  }));
}

function mapLegacySubCards(subs: LegacySubCard[], journeyId: number): SubCard[] {
  return subs.map((sub, i) => {
    const subId: string = sub.id != null ? String(sub.id) : String(i + 1);
    return {
      id: subId,
      journeyId,
      name: sub.name || '',
      province: sub.province || '',
      city: sub.city || '',
      country: sub.country || '中国',
      date: sub.date || '',
      endDate: sub.endDate || '',
      emoji: sub.emoji || '📍',
      story: sub.story || '',
      photoKey: sub.photo || null,
      sortOrder: i,
      highlights: (sub.highlights || []).map((text, hi) => ({
        id: hi + 1,
        subCardId: subId,
        text,
        sortOrder: hi,
    })),
    costs: mapLegacyCost(sub.cost),
    itineraryTable: sub.itineraryTable || { headers: [], rows: [] },
    };
  });
}

function mapLegacyJourney(lj: LegacyJourney): Journey {
  return {
    id: lj.id,
    province: lj.province || '',
    city: lj.city || '',
    country: lj.country || '中国',
    date: lj.date || '',
    endDate: lj.endDate || '',
    title: lj.title || '',
    emoji: lj.emoji || '📍',
    description: lj.description || '',
    story: lj.story || '',
    photoKey: lj.photo || null,
    sortOrder: lj.id,
    highlights: mapLegacyHighlights(lj.highlights || [], lj.id),
    costs: mapLegacyCost(lj.cost),
    itinerary: mapLegacyItinerary(lj.itinerary || [], lj.id),
    subCards: mapLegacySubCards(lj.subCards || [], lj.id),
    createdAt: '',
    updatedAt: '',
  };
}

// ============================================================
// Public API
// ============================================================

let _journeys: Journey[] | null = null;

export function loadJourneys(): Journey[] {
  if (_journeys) return _journeys;
  try {
    const raw = readFileSync(LEGACY_DATA, 'utf-8');
    const legacy: LegacyJourney[] = JSON.parse(raw);
    _journeys = legacy.map(mapLegacyJourney);
  } catch {
    _journeys = [];
  }
  return _journeys;
}

export function loadJourneyById(id: number): Journey | null {
  const all = loadJourneys();
  return all.find(j => j.id === id) || null;
}

export function loadJourneyIds(): number[] {
  return loadJourneys().map(j => j.id);
}

// Hard-coded wishlist (from legacy wishlist.js)
let _wishlist: WishlistItem[] | null = null;

export function loadWishlist(): WishlistItem[] {
  if (_wishlist) return _wishlist;
  _wishlist = [
    { id: 1, title: '西藏 · 拉萨', city: '拉萨', emoji: '🏔️', duration: '7-10天', season: '夏季', description: '布达拉宫、大昭寺、纳木错', sortOrder: 0, highlights: [{ id: 1, wishlistId: 1, text: '布达拉宫', sortOrder: 0 }, { id: 2, wishlistId: 1, text: '大昭寺', sortOrder: 1 }, { id: 3, wishlistId: 1, text: '纳木错', sortOrder: 2 }] },
    { id: 2, title: '新疆 · 喀纳斯', city: '喀纳斯', emoji: '🌲', duration: '5-7天', season: '秋季', description: '喀纳斯湖、禾木村、白哈巴', sortOrder: 1, highlights: [{ id: 4, wishlistId: 2, text: '喀纳斯湖', sortOrder: 0 }, { id: 5, wishlistId: 2, text: '禾木村', sortOrder: 1 }] },
    { id: 3, title: '云南 · 大理丽江', city: '大理&丽江', emoji: '🏯', duration: '5-7天', season: '春/秋季', description: '洱海、古城、玉龙雪山', sortOrder: 2, highlights: [{ id: 6, wishlistId: 3, text: '洱海', sortOrder: 0 }, { id: 7, wishlistId: 3, text: '玉龙雪山', sortOrder: 1 }] },
    { id: 4, title: '日本 · 北海道', city: '北海道', emoji: '⛄', duration: '7-10天', season: '冬季', description: '滑雪、温泉、札幌雪祭', sortOrder: 3, highlights: [{ id: 8, wishlistId: 4, text: '滑雪', sortOrder: 0 }, { id: 9, wishlistId: 4, text: '温泉', sortOrder: 1 }] },
    { id: 5, title: '冰岛 · 环岛自驾', city: '冰岛', emoji: '🌋', duration: '10-14天', season: '夏季', description: '极光、蓝湖、黄金圈', sortOrder: 4, highlights: [{ id: 10, wishlistId: 5, text: '极光', sortOrder: 0 }, { id: 11, wishlistId: 5, text: '蓝湖温泉', sortOrder: 1 }] },
    { id: 6, title: '新西兰 · 南北岛', city: '新西兰', emoji: '🐑', duration: '14天', season: '春/秋季', description: '霍比屯、皇后镇、峡湾', sortOrder: 5, highlights: [{ id: 12, wishlistId: 6, text: '霍比屯', sortOrder: 0 }, { id: 13, wishlistId: 6, text: '皇后镇', sortOrder: 1 }] },
  ];
  return _wishlist;
}

// Hard-coded packing list (from legacy index.html)
let _packing: PackingCategory[] | null = null;

export function loadPacking(): PackingCategory[] {
  if (_packing) return _packing;
  _packing = [
    {
      id: 1, name: '证件类', sortOrder: 0, items: [
        { id: 1, categoryId: 1, item: '身份证', note: '随身携带，高铁/飞机必备', checked: true, sortOrder: 0 },
        { id: 2, categoryId: 1, item: '护照', note: '出国必带，检查有效期', checked: true, sortOrder: 1 },
        { id: 3, categoryId: 1, item: '银行卡/现金', note: '少量现金备用', checked: false, sortOrder: 2 },
      ],
    },
    {
      id: 2, name: '衣物类', sortOrder: 1, items: [
        { id: 4, categoryId: 2, item: '换洗衣物', note: '根据天数准备', checked: true, sortOrder: 0 },
        { id: 5, categoryId: 2, item: '外套/冲锋衣', note: '山区温差大', checked: false, sortOrder: 1 },
        { id: 6, categoryId: 2, item: '舒适运动鞋', note: '', checked: true, sortOrder: 2 },
        { id: 7, categoryId: 2, item: '拖鞋', note: '酒店/民宿使用', checked: false, sortOrder: 3 },
      ],
    },
    {
      id: 3, name: '电子设备', sortOrder: 2, items: [
        { id: 8, categoryId: 3, item: '手机 + 充电器', note: '', checked: true, sortOrder: 0 },
        { id: 9, categoryId: 3, item: '充电宝', note: '20000mAh以内可上飞机', checked: true, sortOrder: 1 },
        { id: 10, categoryId: 3, item: '相机', note: '记录旅途美好瞬间', checked: false, sortOrder: 2 },
        { id: 11, categoryId: 3, item: '转换插头', note: '出国必备', checked: false, sortOrder: 3 },
      ],
    },
    {
      id: 4, name: '日用品', sortOrder: 3, items: [
        { id: 12, categoryId: 4, item: '洗漱用品', note: '牙刷/牙膏/毛巾', checked: false, sortOrder: 0 },
        { id: 13, categoryId: 4, item: '防晒霜', note: '', checked: false, sortOrder: 1 },
        { id: 14, categoryId: 4, item: '雨伞/雨衣', note: '', checked: false, sortOrder: 2 },
        { id: 15, categoryId: 4, item: '常用药品', note: '感冒药/创可贴/晕车药', checked: false, sortOrder: 3 },
      ],
    },
  ];
  return _packing;
}

// City coordinates — ported from legacy/map.js
let _coordinates: CityCoordinate[] | null = null;

export function loadCoordinates(): CityCoordinate[] {
  if (_coordinates) return _coordinates;
  _coordinates = [
    { id: 1, name: '杭州', country: '中国', lat: 30.2741, lng: 120.1551, type: 'domestic' },
    { id: 2, name: '上海', country: '中国', lat: 31.2304, lng: 121.4737, type: 'domestic' },
    { id: 3, name: '南京', country: '中国', lat: 32.0603, lng: 118.7969, type: 'domestic' },
    { id: 4, name: '苏州', country: '中国', lat: 31.2990, lng: 120.5853, type: 'domestic' },
    { id: 5, name: '厦门', country: '中国', lat: 24.4798, lng: 118.0894, type: 'domestic' },
    { id: 6, name: '北京', country: '中国', lat: 39.9042, lng: 116.4074, type: 'domestic' },
    { id: 7, name: '成都', country: '中国', lat: 30.5728, lng: 104.0668, type: 'domestic' },
    { id: 8, name: '西安', country: '中国', lat: 34.3416, lng: 108.9398, type: 'domestic' },
    { id: 9, name: '重庆', country: '中国', lat: 29.4316, lng: 106.9123, type: 'domestic' },
    { id: 10, name: '广州', country: '中国', lat: 23.1291, lng: 113.2644, type: 'domestic' },
    { id: 11, name: '深圳', country: '中国', lat: 22.5431, lng: 114.0579, type: 'domestic' },
    { id: 12, name: '桂林', country: '中国', lat: 25.2736, lng: 110.2900, type: 'domestic' },
    { id: 13, name: '贵阳', country: '中国', lat: 26.6470, lng: 106.6302, type: 'domestic' },
    { id: 14, name: '昆明', country: '中国', lat: 25.0389, lng: 102.7183, type: 'domestic' },
    { id: 15, name: '漠河', country: '中国', lat: 53.4800, lng: 122.3620, type: 'domestic' },
    { id: 16, name: '三亚', country: '中国', lat: 18.2528, lng: 109.5120, type: 'domestic' },
    { id: 17, name: '泉州', country: '中国', lat: 24.8748, lng: 118.6748, type: 'domestic' },
    { id: 18, name: '南平', country: '中国', lat: 26.6416, lng: 118.1772, type: 'domestic' },
    { id: 19, name: '龙岩', country: '中国', lat: 25.0751, lng: 117.0175, type: 'domestic' },
    { id: 20, name: '婺源', country: '中国', lat: 29.2479, lng: 117.8622, type: 'domestic' },
    { id: 21, name: '秦皇岛', country: '中国', lat: 39.9354, lng: 119.6005, type: 'domestic' },
    { id: 22, name: '北海', country: '中国', lat: 21.4733, lng: 109.1192, type: 'domestic' },
    { id: 23, name: '丽江', country: '中国', lat: 26.8721, lng: 100.2299, type: 'domestic' },
    { id: 24, name: '香格里拉', country: '中国', lat: 27.8230, lng: 99.7008, type: 'domestic' },
    { id: 25, name: '庐山', country: '中国', lat: 29.5722, lng: 115.9730, type: 'domestic' },
    { id: 26, name: '景德镇', country: '中国', lat: 29.2708, lng: 117.1785, type: 'domestic' },
    { id: 27, name: '南昌', country: '中国', lat: 28.6820, lng: 115.8582, type: 'domestic' },
    { id: 28, name: '大理', country: '中国', lat: 25.6065, lng: 100.2676, type: 'domestic' },
    { id: 29, name: '平潭', country: '中国', lat: 25.5020, lng: 119.7904, type: 'domestic' },
    { id: 30, name: '汕头', country: '中国', lat: 23.3533, lng: 116.6819, type: 'domestic' },
    { id: 31, name: '法国', country: '法国', lat: 46.6034, lng: 1.8883, type: 'international' },
    { id: 32, name: '瑞士', country: '瑞士', lat: 46.8182, lng: 8.2275, type: 'international' },
    { id: 33, name: '意大利', country: '意大利', lat: 41.8719, lng: 12.5674, type: 'international' },
    { id: 34, name: '泰国', country: '泰国', lat: 15.8700, lng: 100.9925, type: 'international' },
    { id: 35, name: '马来西亚', country: '马来西亚', lat: 4.2105, lng: 101.9758, type: 'international' },
    { id: 36, name: '新加坡', country: '新加坡', lat: 1.3521, lng: 103.8198, type: 'international' },
    { id: 37, name: '印度尼西亚', country: '印度尼西亚', lat: -0.7893, lng: 113.9213, type: 'international' },
    { id: 38, name: '巴黎', country: '法国', lat: 48.8566, lng: 2.3522, type: 'international' },
    { id: 39, name: '琉森', country: '瑞士', lat: 47.0502, lng: 8.3093, type: 'international' },
    { id: 40, name: '威尼斯', country: '意大利', lat: 45.4408, lng: 12.3155, type: 'international' },
    { id: 41, name: '罗马', country: '意大利', lat: 41.9028, lng: 12.4964, type: 'international' },
    { id: 42, name: '佛罗伦萨', country: '意大利', lat: 43.7696, lng: 11.2558, type: 'international' },
    { id: 43, name: '米兰', country: '意大利', lat: 45.4642, lng: 9.1900, type: 'international' },
    { id: 44, name: '曼谷', country: '泰国', lat: 13.7563, lng: 100.5018, type: 'international' },
    { id: 45, name: '吉隆坡', country: '马来西亚', lat: 3.1390, lng: 101.6869, type: 'international' },
    { id: 46, name: '巴厘岛', country: '印度尼西亚', lat: -8.3405, lng: 115.0920, type: 'international' },
    { id: 47, name: '瑞士少女峰', country: '瑞士', lat: 46.5369, lng: 7.9620, type: 'international' },
    { id: 48, name: '因特拉肯', country: '瑞士', lat: 46.6863, lng: 7.8632, type: 'international' },
  ];
  return _coordinates;
}

// Compute stats from loaded journeys
export function getSSGStats() {
  const journeys = loadJourneys();
  const citySet = new Set(journeys.map(j => j.city));
  const countrySet = new Set(journeys.map(j => j.country).filter(c => c && c !== '中国'));
  const totalCost = journeys.reduce((sum, j) => {
    const c = j.costs;
    return sum + c.packageFee + c.transportFee + c.accommodationFee + c.foodFee + c.shoppingFee + c.ticketFee;
  }, 0);

  return {
    journeyCount: journeys.length,
    cityCount: citySet.size,
    photoCount: journeys.filter(j => j.photoKey).length,
    totalCost,
    countryCount: countrySet.size,
  };
}

// Group journeys by city for the cities page
export function getCityGroups() {
  const journeys = loadJourneys();
  const groups = new Map<string, Journey[]>();
  for (const j of journeys) {
    const key = j.city || j.province || '其他';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(j);
  }
  return Array.from(groups.entries()).map(([city, list]) => ({ city, list }));
}
