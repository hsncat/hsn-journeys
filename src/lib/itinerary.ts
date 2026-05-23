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

  if (subCards.length === 1) {
    const s = subCards[0];
    return {
      ...existing,
      province: s.province ?? existing.province ?? '',
      city: s.city ?? existing.city ?? '',
      country: s.country ?? existing.country ?? '',
      date: s.date ?? existing.date ?? '',
      endDate: s.endDate ?? existing.endDate ?? '',
      emoji: s.emoji ?? existing.emoji ?? null,
      highlights: s.highlights.length ? s.highlights : existing.highlights ?? [],
      story: s.story ?? existing.story ?? null,
      cost: s.cost,
      photoUrl: s.photoUrl ?? existing.photoUrl ?? null,
    };
  }

  const cities = unique(subCards.map(s => s.city).filter((v): v is string => !!v));
  const provinces = unique(subCards.map(s => s.province).filter((v): v is string => !!v));
  const countries = unique(subCards.map(s => s.country).filter((v): v is string => !!v));
  const allHighlights = unique(subCards.flatMap(s => s.highlights || [])).slice(0, 12);

  return {
    ...existing,
    province: provinces.length > 1 ? provinces.join('&') : (provinces[0] || existing.province || ''),
    city: cities.length > 1 ? cities.join('&') : (cities[0] || existing.city || ''),
    country: countries.length > 1 ? countries.join('·') : (countries[0] || existing.country || ''),
    date: firstDate,
    endDate: lastEnd,
    highlights: allHighlights.length ? allHighlights : (existing.highlights ?? []),
    cost: sumCost(...subCards.map(s => s.cost)),
    photoUrl: subCards.find(s => s.photoUrl)?.photoUrl ?? existing.photoUrl ?? null,
  };
}
