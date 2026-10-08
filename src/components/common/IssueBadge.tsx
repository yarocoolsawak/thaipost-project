import React from 'react';
import type { IssueCategory, UrgencyLevel } from '../../types/case';
import { HoverTip } from './HoverTip';
import { Clock, AlertTriangle, HelpCircle, PackageX, Compass, AlertCircle, Zap, CheckCircle2, RotateCcw, Undo2 } from 'lucide-react';

interface IssueCategoryMeta {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
  border: string;
}

export const ISSUE_CATEGORY_META: Record<IssueCategory, IssueCategoryMeta> = {
  EXPEDITE_REQUEST: {
    label: 'เร่งนำส่ง (ขอเร่งรัดนำจ่าย)',
    shortLabel: 'เร่งนำส่ง',
    icon: <Zap size={12} />,
    bg: '#FFF7ED',
    color: '#C2410C',
    border: '#FED7AA'
  },
  CLOSE_WORK_REQUEST: {
    label: 'แจ้งปิดงาน (ปลายทางได้รับสินค้าแล้วแต่สถานะยังไม่สำเร็จ)',
    shortLabel: 'แจ้งปิดงาน',
    icon: <CheckCircle2 size={12} />,
    bg: '#ECFDF5',
    color: '#047857',
    border: '#A7F3D0'
  },
  REDELIVERY_REQUEST: {
    label: 'เร่งนำจ่ายใหม่อีกครั้ง / นำจ่ายใหม่',
    shortLabel: 'เร่งนำจ่ายใหม่',
    icon: <RotateCcw size={12} />,
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#BFDBFE'
  },
  RETURN_OR_REVERSE: {
    label: 'แจ้งตีกลับ / ถอยสถานะตีกลับและแจ้งนำส่งใหม่',
    shortLabel: 'แจ้งตีกลับ/ถอยสถานะ',
    icon: <Undo2 size={12} />,
    bg: '#FEF2F2',
    color: '#B91C1C',
    border: '#FECACA'
  },
  DELAYED_DELIVERY: {
    label: 'พัสดุล่าช้าเกินกำหนด',
    shortLabel: 'พัสดุล่าช้า',
    icon: <Clock size={12} />,
    bg: '#FEF3C7',
    color: '#92400E',
    border: '#FDE68A'
  },
  NOT_RECEIVED: {
    label: 'จ่ายสำเร็จแต่ไม่ได้รับของ',
    shortLabel: 'ไม่ได้รับของ',
    icon: <AlertCircle size={12} />,
    bg: '#FEE2E2',
    color: '#991B1B',
    border: '#FECACA'
  },
  WRONG_BRANCH: {
    label: 'ส่งผิดสาขา / ผิดพื้นที่',
    shortLabel: 'ส่งผิดสาขา',
    icon: <Compass size={12} />,
    bg: '#EDE9FE',
    color: '#5B21B6',
    border: '#DDD6FE'
  },
  DAMAGED_PARCEL: {
    label: 'พัสดุชำรุดเสียหาย',
    shortLabel: 'พัสดุชำรุด',
    icon: <PackageX size={12} />,
    bg: '#FFE4E6',
    color: '#9F1239',
    border: '#FECDD3'
  },
  CANNOT_LOCATE: {
    label: 'ค้นหาพัสดุไม่พบในระบบ',
    shortLabel: 'หาพัสดุไม่พบ',
    icon: <HelpCircle size={12} />,
    bg: '#F1F5F9',
    color: '#334155',
    border: '#CBD5E1'
  },
  OTHER: {
    label: 'อื่นๆ / จ่าหน้า / ข้อสอบถาม',
    shortLabel: 'อื่นๆ',
    icon: <AlertTriangle size={12} />,
    bg: '#F8FAFC',
    color: '#475569',
    border: '#E2E8F0'
  }
};

// Urgency is its own column: ปกติ / ด่วน / ด่วนมาก
export const URGENCY_META: Record<UrgencyLevel, { label: string; rank: number; bg: string; color: string; border: string }> = {
  CRITICAL: { label: 'ด่วนมาก', rank: 2, bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  HIGH: { label: 'ด่วน', rank: 1, bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  NORMAL: { label: 'ปกติ', rank: 0, bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' }
};

export const UrgencyBadge: React.FC<{ urgency?: UrgencyLevel }> = ({ urgency = 'NORMAL' }) => {
  const meta = URGENCY_META[urgency] || URGENCY_META.NORMAL;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        whiteSpace: 'nowrap',
        fontSize: '0.72rem',
        fontWeight: urgency === 'NORMAL' ? 500 : 700,
        padding: '0.1rem 0.45rem',
        borderRadius: '4px',
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`
      }}
    >
      {urgency === 'CRITICAL' && <Zap size={11} />}
      {meta.label}
    </span>
  );
};

interface IssueDisplayProps {
  category: IssueCategory;
  inquiry?: string;
}

// Problem column: just the problem name; hovering shows the full problem type and what the shop wrote
export const IssueDisplay: React.FC<IssueDisplayProps> = ({ category, inquiry }) => {
  const meta = ISSUE_CATEGORY_META[category] || ISSUE_CATEGORY_META.OTHER;
  const pill = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        whiteSpace: 'nowrap',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
        cursor: 'help'
      }}
    >
      {meta.icon}
      <span>{meta.shortLabel}</span>
    </span>
  );
  return (
    <HoverTip
      content={
        <>
          <div style={{ fontWeight: 700, marginBottom: inquiry ? '0.3rem' : 0 }}>{meta.label}</div>
          {inquiry && <div>{inquiry}</div>}
        </>
      }
    >
      {pill}
    </HoverTip>
  );
};
