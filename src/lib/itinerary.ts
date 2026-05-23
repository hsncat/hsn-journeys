/**
 * Itinerary 与 SubCards 父子同步逻辑
 * 在前后台共享，保持行为一致。
 */

import type { CostObject, ItineraryTable, SubCardDTO, JourneyDTO } from '@/server/db';
import { emptyCost, emptyItinerary } from '@/server/db';

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function normalizeItineraryTable(t: ItineraryTable | null | undefined): ItineraryTable {
  if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) {
    return emptyItinerary();
  }
  const headers = t.headers.length > 0 ? [...t.headers] : ['日期', '上午', '下午', '备注'];
  // 过滤"晚上"列（如果存在），保持当前 UI 的列顺序
  const eveningIdx = headers.indexOf('晚上');
  if (eveningIdx >= 0) {
    headers.splice(eveningIdx, 1);
  }
  const rows = t.rows.map(r => {
    const arr = Array.isArray(r) ? [...r] : [];
    if (eveningIdx >= 0 && arr.length > eveningIdx) arr.splice(eveningIdx, 1);
    while (arr.length < headers.length) arr.push('');
    return arr.slice(0, headers.length);
  });
  return { headers, rows };
}

export function sumCost(...costs: (CostObject | null | undefined)[]): CostObject {
  const result = emptyCost();
  for (const c of costs) {
    if (!c) continue;
    result.package += Number(c.package) || 0;
    result.transport += Number(c.transport) || 0;
    result.accommodation += Number(c.accommodation) || 0;
    result.food += Number(c.food) || 0;
    result.shopping += Number(c.shopping) || 0;
    result.ticket += Number(c.ticket) || 0;
  }
  return result;
}

export function totalCost(c: CostObject | null | undefined): number {
  if (!c) return 0;
  return (c.package || 0) + (c.transport || 0) + (c.accommodation || 0)
    + (c.food || 0) + (c.shopping || 0) + (c.ticket || 0);
}

export function formatMoney(value: number | null | undefined): string {
  return (Number(value) || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseMoney(value: string): number {
  const normalized = value.replace(/[,\s￥¥]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function dateRangeFromItinerary(t: ItineraryTable): { date: string; endDate: string } | null {
  const dateIdx = t.headers.indexOf('日期') >= 0 ? t.headers.indexOf('日期') : 0;
  const dates = t.rows
    .map(row => normalizeDate(String(row[dateIdx] ?? '').trim()))
    .filter((v): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v))
    .sort();
  if (dates.length === 0) return null;
  return { date: dates[0], endDate: dates[dates.length - 1] };
}

export function extractHighlightsFromItinerary(t: ItineraryTable): string[] {
  const result: string[] = [];
  const morningIdx = t.headers.indexOf('上午');
  const afternoonIdx = t.headers.indexOf('下午');
  for (const row of t.rows) {
    for (const idx of [morningIdx, afternoonIdx]) {
      if (idx < 0) continue;
      const cell = String(row[idx] ?? '').trim();
      if (!cell) continue;
      cell.split(/[、，,；;]/).forEach(part => {
        const trimmed = part.trim();
        if (trimmed) result.push(trimmed);
      });
    }
  }
  return unique(result);
}

export function buildJourneyTitle(province: string | null | undefined, city: string | null | undefined): string {
  const p = (province ?? '').trim();
  const c = (city ?? '').trim();
  if (p && c) return `${p}·${c}`;
  return p || c;
}

function normalizeDate(s: string): string | null {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function countryTypeFromSubCards(subCards: SubCardDTO[], fallback: string | undefined): string {
  const countries = subCards.map(s => (s.country ?? '').trim()).filter(Boolean);
  if (countries.length === 0) return fallback || '国内';
  return countries.some(c => c !== '中国' && c !== '国内') ? '国外' : '国内';
}

/**
 * 从 sub_cards 数组聚合 journey 字段。
 * - 单 sub_card：所有字段同步到 journey
 * - 多 sub_card：date 取最早，end_date 取最晚，city/province 用 & 拼，cost 求和
 */
export function aggregateFromSubCards(subCards: SubCardDTO[], existing: Partial<JourneyDTO>): Partial<JourneyDTO> {
  if (subCards.length === 0) return existing;

  const sorted = [...subCards].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const firstDate = sorted[0].date;
  const lastEnd = sorted.reduce((max, s) => {
    const v = s.endDate || s.date;
    return v && v > max ? v : max;
  }, sorted[0].endDate || sorted[0].date);
  const cities = unique(sorted.map(s => s.city).filter((v): v is string => !!v));
  const provinces = unique(sorted.map(s => s.province).filter((v): v is string => !!v));
  const province = provinces.length > 1 ? provinces.join('&') : (provinces[0] || existing.province || '');
  const city = cities.length > 1 ? cities.join('&') : (cities[0] || existing.city || '');
  const title = buildJourneyTitle(province, city);
  const highlightsBySubCard = sorted
    .map(s => {
      const explicit = (s.highlights || []).map(h => h.trim()).filter(Boolean);
      const fallback = explicit.length ? explicit : extractHighlightsFromItinerary(s.itineraryTable);
      return fallback.join('、');
    })
    .filter(Boolean);

  if (subCards.length === 1) {
    const s = subCards[0];
    return {
      ...existing,
      province,
      city,
      country: countryTypeFromSubCards(subCards, existing.country),
      date: s.date ?? existing.date ?? '',
      endDate: s.endDate ?? existing.endDate ?? '',
      title: title || existing.title || '',
      emoji: s.emoji ?? existing.emoji ?? null,
      highlights: highlightsBySubCard.length ? highlightsBySubCard : existing.highlights ?? [],
      story: s.story ?? existing.story ?? null,
      cost: s.cost,
      photoUrl: s.photoUrl ?? existing.photoUrl ?? null,
    };
  }

  return {
    ...existing,
    province,
    city,
    country: countryTypeFromSubCards(subCards, existing.country),
    date: firstDate,
    endDate: lastEnd,
    title: title || existing.title || '',
    highlights: highlightsBySubCard.length ? highlightsBySubCard : (existing.highlights ?? []),
    cost: sumCost(...subCards.map(s => s.cost)),
    photoUrl: subCards.find(s => s.photoUrl)?.photoUrl ?? existing.photoUrl ?? null,
  };
}
