import React from 'react';
import type { CaseItem } from '../../types/case';
import { getCecLabel } from '../../data/cecRegions';
import { POST_OFFICE_SOURCE, findPostOffice } from '../../data/postOffices';
import { formatPostalStatus } from './StatusBadge';
import { RoutingAlertChip } from './RoutingAlert';
import { HelpCircle, ShoppingBag, Mail, Copy } from 'lucide-react';

// CEC line: the CEC from the recipient's postal code, plus a marker when QMS shows the parcel somewhere else
export const CecCell: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => (
  <>
    {caseItem.assignedCecId === undefined ? (
      <span className="cec-blank-chip" title="รหัสไปรษณีย์ผู้รับไม่มีในตาราง ปณ.ส่วนกลางต้องเลือก CEC">
        <HelpCircle size={11} /> ยังไม่ระบุ CEC
      </span>
    ) : (
      <div style={{ fontSize: '0.75rem', color: '#4338CA', fontWeight: 600 }}>{getCecLabel(caseItem.assignedCecId)}</div>
    )}
    <RoutingAlertChip caseItem={caseItem} />
  </>
);

// Office names sometimes already carry the zip, e.g. "ปณ.เมืองขอนแก่น (40000)" — show it once, on its own line
const stripZip = (name: string) => name.replace(/\s*\(\d{5}\)\s*$/, '').trim();

// "ปลายทาง & กลุ่ม CEC" column: destination office, its postal code, and the CEC (short form)
export const DestinationCell: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
    <div style={{ fontWeight: 600, color: 'var(--thp-navy)' }}>
      {stripZip(caseItem.assignedBranchName || caseItem.parcelInfo.destPostOffice)}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }} title={findPostOffice(caseItem.assignedBranchCode || caseItem.parcelInfo.destZipCode) ? `ที่มา ${POST_OFFICE_SOURCE.filename} · ${POST_OFFICE_SOURCE.asOfLabel}` : 'ไม่พบรหัสในตารางที่ทำการ ต้องตรวจสอบสาขา'}>
      รหัส{' '}
      <span style={{ fontFamily: 'var(--font-en)', fontWeight: 600, color: 'var(--thp-slate)' }}>{caseItem.assignedBranchCode || caseItem.parcelInfo.destZipCode}</span>
    </div>
    {caseItem.assignedBranchCode && caseItem.assignedBranchCode !== caseItem.parcelInfo.destZipCode && (
      <div style={{ fontSize: '0.7rem', color: 'var(--thp-muted)' }}>รหัสผู้รับ {caseItem.parcelInfo.destZipCode}</div>
    )}
    <CecCell caseItem={caseItem} />
  </div>
);

// The MyOrder order this case was raised from
export const OrderRefChip: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => (
  <span className="source-chip" title={`แจ้งจากร้านค้าผ่าน MyOrder คำสั่งซื้อ ${caseItem.myOrderRef.orderId}`}>
    <ShoppingBag size={10} /> {caseItem.myOrderRef.orderId}
  </span>
);

// Number of official request emails the shop has sent for this case
export const EmailCountChip: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => {
  const count = caseItem.emails?.length || 0;
  if (count === 0) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        fontSize: '0.7rem',
        color: '#1D4ED8',
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        padding: '0.05rem 0.35rem',
        borderRadius: '4px',
        fontWeight: 600
      }}
      title={`มีอีเมลคำร้องทางการ ${count} ฉบับ`}
    >
      <Mail size={10} /> {count}
    </span>
  );
};

// Marks cases opened again for a parcel that still had an open case (and the other way round)
export const DuplicateChip: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => {
  const related = caseItem.duplicateOfCaseId
    ? `ซ้ำกับ ${caseItem.duplicateOfCaseId}`
    : caseItem.linkedDuplicateCaseIds?.length
    ? `มีเคสซ้ำ ${caseItem.linkedDuplicateCaseIds.join(', ')}`
    : '';
  if (!related) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: '#92400E',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        padding: '0.05rem 0.35rem',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        marginTop: '2px'
      }}
      title="เลขพัสดุเดียวกันถูกแจ้งหลายเคส"
    >
      <Copy size={10} /> {related}
    </span>
  );
};

// "วันเวลาที่แจ้ง" column: when the shop reported the case, plus how long ago
const relativeAge = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return mins <= 1 ? 'เมื่อสักครู่' : `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
};

export const ReportedAtCell: React.FC<{ iso: string }> = ({ iso }) => {
  const d = new Date(iso);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ fontWeight: 600, color: 'var(--thp-navy)', fontSize: '0.82rem' }}>
        {d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
      </span>
      <span style={{ fontSize: '0.78rem', color: 'var(--thp-slate)' }}>
        {d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--thp-muted)' }}>{relativeAge(iso)}</span>
    </div>
  );
};

// First column of every case list: tracking number, then case ID and its email / duplicate markers
export const TrackingCell: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => (
  <>
    <div className="tracking-pill">{caseItem.trackingNumber}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
      <span className="case-id-sub">{caseItem.id}</span>
      <EmailCountChip caseItem={caseItem} />
    </div>
    <DuplicateChip caseItem={caseItem} />
  </>
);

// "สถานะล่าสุด" column: the parcel's latest QMS status; clicking it opens the parcel status tab of the case
export const LatestStatusCell: React.FC<{ caseItem: CaseItem; onOpen: () => void }> = ({ caseItem, onOpen }) => {
  const latest = caseItem.parcelInfo.events.reduce<(typeof caseItem.parcelInfo.events)[number] | undefined>(
    (acc, ev) => (!acc || ev.timestamp > acc.timestamp ? ev : acc),
    undefined
  );
  return (
    <button type="button" className="latest-status-btn" onClick={onOpen} title="ดูสถานะพัสดุทั้งหมดจาก QMS">
      <span className="latest-status-text">{formatPostalStatus(caseItem.parcelInfo.currentPostalStatus)}</span>
      {latest && (
        <span className="latest-status-meta">
          {new Date(latest.timestamp).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {latest.location ? ` • ${latest.location}` : ''}
        </span>
      )}
    </button>
  );
};
