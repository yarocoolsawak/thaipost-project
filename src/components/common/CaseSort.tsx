import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { URGENCY_META } from './IssueBadge';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

// Column sorting shared by every case table. Default: reported date, oldest on top.
export type CaseSortKey = 'reportedAt' | 'urgency' | 'sla';
type SortDir = 'asc' | 'desc';

const sortValue: Record<CaseSortKey, (c: CaseItem) => number> = {
  reportedAt: c => new Date(c.createdAt).getTime(),
  urgency: c => URGENCY_META[c.urgency]?.rank ?? 0,
  // Closest deadline first; closed cases have no running SLA, so they go last
  sla: c => (c.status === 'CLOSED' ? Number.MAX_SAFE_INTEGER : new Date(c.slaDeadline).getTime())
};

// First click on a column sorts the way that is most useful for it
const FIRST_DIR: Record<CaseSortKey, SortDir> = { reportedAt: 'asc', urgency: 'desc', sla: 'asc' };

const DIR_HINT: Record<CaseSortKey, Record<SortDir, string>> = {
  reportedAt: { asc: 'แจ้งก่อนอยู่บน', desc: 'แจ้งล่าสุดอยู่บน' },
  urgency: { asc: 'ปกติอยู่บน', desc: 'ด่วนมากอยู่บน' },
  sla: { asc: 'ใกล้ครบกำหนดอยู่บน', desc: 'เหลือเวลามากอยู่บน' }
};

export const useCaseSort = () => {
  const [sort, setSort] = useState<{ key: CaseSortKey; dir: SortDir }>({ key: 'reportedAt', dir: 'asc' });

  const sortCases = (list: CaseItem[]) => {
    const sign = sort.dir === 'asc' ? 1 : -1;
    const byDate = sortValue.reportedAt;
    return [...list].sort((a, b) => sign * (sortValue[sort.key](a) - sortValue[sort.key](b)) || byDate(a) - byDate(b));
  };

  const toggle = (key: CaseSortKey) =>
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: FIRST_DIR[key] }));

  return { sort, sortCases, toggle };
};

interface SortThProps {
  label: string;
  sortKey: CaseSortKey;
  sort: { key: CaseSortKey; dir: SortDir };
  onSort: (key: CaseSortKey) => void;
}

// Clickable column header showing the current sort direction
export const SortTh: React.FC<SortThProps> = ({ label, sortKey, sort, onSort }) => {
  const active = sort.key === sortKey;
  const nextDir = active ? (sort.dir === 'asc' ? 'desc' : 'asc') : FIRST_DIR[sortKey];
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`sort-th-btn ${active ? 'active' : ''}`}
        onClick={() => onSort(sortKey)}
        title={`เรียง: ${DIR_HINT[sortKey][nextDir]}`}
      >
        <span>{label}</span>
        {active ? sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
      </button>
    </th>
  );
};
