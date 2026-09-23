import React from 'react';
import type { CaseItem } from '../../types/case';
import { HelpCircle, ShoppingBag, Mail, Copy } from 'lucide-react';

// CEC column: shows the assigned CEC, or a blank placeholder until the destination is confirmed
export const CecCell: React.FC<{ caseItem: CaseItem; showHint?: boolean }> = ({ caseItem, showHint = false }) => {
  if (caseItem.assignedCecId === undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span className="cec-blank-chip" title="ยังระบุ CEC ไม่ได้ ระบบจะใส่ให้อัตโนมัติเมื่อสถานะพัสดุยืนยันพื้นที่ปลายทาง">
          <HelpCircle size={11} /> รอระบุ CEC
        </span>
        {showHint && (
          <span style={{ fontSize: '0.68rem', color: 'var(--thp-muted)' }}>
            พัสดุ: {caseItem.parcelInfo.currentPostalStatus}
          </span>
        )}
      </div>
    );
  }
  return (
    <div style={{ fontSize: '0.75rem', color: '#4338CA', fontWeight: 500 }}>
      {caseItem.assignedCecName || `CEC ${caseItem.assignedCecId}`}
    </div>
  );
};

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
