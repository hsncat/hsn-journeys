/**
 * 格式化工具：日期、金额、天数
 */

export function fmtDate(d: string | null | undefined, opts: { short?: boolean } = {}): string {
  if (!d) return '';
  const m = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return d;
  const year = m[1];
  const month = String(Number(m[2])).padStart(opts.short ? 0 : 2, '0');
  const day = String(Number(m[3])).padStart(opts.short ? 0 : 2, '0');
  return opts.short ? `${month}.${day}` : `${year}-${month}-${day}`;
}

export function fmtDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return '';
  if (!end || start === end) return fmtDate(start);
  return `${fmtDate(start)} ~ ${fmtDate(end)}`;
}

export function daysBetween(start: string | null | undefined, end: string | null | undefined): number {
  if (!start) return 0;
  const a = new Date(start);
  const b = end ? new Date(end) : new Date(start);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
}

export function fmtMoney(n: number | null | undefined): string {
  if (!n) return '0';
  return Math.round(Number(n)).toLocaleString('zh-CN');
}

export function fmtYear(d: string | null | undefined): string {
  if (!d) return '';
  return d.slice(0, 4);
}
