/**
 * 多地点拆分（从 legacy/data.js generateLocations 提炼）
 * - 国际多国：country 含 "·" → 拆国家
 * - 国内跨省：province 含 "&" → 拆省
 * - 国内跨市：city 含 "&" → 拆市
 * - 单地点：兜底
 */

import type { JourneyDTO } from '@/server/db';

export interface Location {
  name: string;
  type: 'country' | 'province' | 'city';
  country?: string;
  province?: string;
}

export function generateLocations(j: Pick<JourneyDTO, 'country' | 'province' | 'city'>): Location[] {
  if (j.country && j.country.includes('·')) {
    return j.country.split('·').map(name => ({ name: name.trim(), type: 'country' }));
  }
  if (j.province && j.province.includes('&')) {
    return j.province.split('&').map(name => ({
      name: name.trim(),
      type: 'province',
      country: j.country,
    }));
  }
  if (j.city && j.city.includes('&')) {
    return j.city.split('&').map(name => ({
      name: name.trim(),
      type: 'city',
      country: j.country,
      province: j.province,
    }));
  }
  return [{
    name: j.city,
    type: 'city',
    country: j.country,
    province: j.province,
  }];
}

export function isDomestic(country: string | null | undefined): boolean {
  if (!country) return true;
  return country === '中国' || country === '国内';
}
