// Filter cases by the date they were reported (createdAt), shared by every case list
export type DatePreset = 'ALL' | 'TODAY' | '7D' | '30D' | 'CUSTOM';

export interface CaseDateFilter {
  preset: DatePreset;
  from?: string; // 'YYYY-MM-DD' (local), CUSTOM only
  to?: string;   // 'YYYY-MM-DD' (local), CUSTOM only, inclusive
}

export const DEFAULT_DATE_FILTER: CaseDateFilter = { preset: 'ALL' };

export const DATE_PRESET_LABEL: Record<DatePreset, string> = {
  ALL: 'ทุกวันที่',
  TODAY: 'วันนี้',
  '7D': '7 วันล่าสุด',
  '30D': '30 วันล่าสุด',
  CUSTOM: 'กำหนดช่วงวันที่เอง'
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parseLocalDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const matchesDateFilter = (createdAtIso: string, f: CaseDateFilter, now = new Date()) => {
  if (f.preset === 'ALL') return true;
  const created = new Date(createdAtIso).getTime();
  const today = startOfDay(now).getTime();
  const day = 24 * 3600 * 1000;
  switch (f.preset) {
    case 'TODAY':
      return created >= today;
    case '7D':
      return created >= today - 6 * day;
    case '30D':
      return created >= today - 29 * day;
    case 'CUSTOM': {
      if (f.from && created < parseLocalDate(f.from).getTime()) return false;
      if (f.to && created >= parseLocalDate(f.to).getTime() + day) return false;
      return true;
    }
  }
};
