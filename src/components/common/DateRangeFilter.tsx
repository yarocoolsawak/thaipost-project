import React from 'react';
import { useCases } from '../../context/CaseContext';
import { DATE_PRESET_LABEL, type DatePreset } from '../../utils/dateFilter';
import { CalendarDays } from 'lucide-react';

const todayInput = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "Reported date" filter shown on every case list; state lives in CaseContext
export const DateRangeFilter: React.FC<{ idPrefix?: string }> = ({ idPrefix = 'case-date' }) => {
  const { dateFilter, setDateFilter } = useCases();
  const inputStyle: React.CSSProperties = { padding: '0.25rem 0.45rem', fontSize: '0.8rem' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--thp-muted)', flexWrap: 'wrap' }}>
      <CalendarDays size={14} />
      <label htmlFor={`${idPrefix}-preset`}>วันที่แจ้ง:</label>
      <select
        id={`${idPrefix}-preset`}
        className="form-control"
        style={{ ...inputStyle, width: '150px' }}
        value={dateFilter.preset}
        onChange={e => {
          const preset = e.target.value as DatePreset;
          setDateFilter(preset === 'CUSTOM' ? { preset, from: dateFilter.from || todayInput(), to: dateFilter.to || todayInput() } : { preset });
        }}
      >
        {(Object.keys(DATE_PRESET_LABEL) as DatePreset[]).map(p => (
          <option key={p} value={p}>{DATE_PRESET_LABEL[p]}</option>
        ))}
      </select>
      {dateFilter.preset === 'CUSTOM' && (
        <>
          <input
            id={`${idPrefix}-from`}
            type="date"
            className="form-control"
            style={inputStyle}
            value={dateFilter.from || ''}
            max={dateFilter.to || undefined}
            onChange={e => setDateFilter({ ...dateFilter, from: e.target.value })}
            aria-label="ตั้งแต่วันที่"
          />
          <span>ถึง</span>
          <input
            id={`${idPrefix}-to`}
            type="date"
            className="form-control"
            style={inputStyle}
            value={dateFilter.to || ''}
            min={dateFilter.from || undefined}
            onChange={e => setDateFilter({ ...dateFilter, to: e.target.value })}
            aria-label="ถึงวันที่"
          />
        </>
      )}
    </div>
  );
};
