import React from 'react';
import type { IssueCategory, UrgencyLevel } from '../../types/case';
import { Clock, AlertTriangle, HelpCircle, PackageX, Compass, AlertCircle } from 'lucide-react';

interface IssueCategoryMeta {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
  border: string;
}

export const ISSUE_CATEGORY_META: Record<IssueCategory, IssueCategoryMeta> = {
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
    label: 'อื่นๆ / ตีกลับ / แก้จ่าหน้า',
    shortLabel: 'ตีกลับ/จ่าหน้า/อื่นๆ',
    icon: <AlertTriangle size={12} />,
    bg: '#EFF6FF',
    color: '#1E40AF',
    border: '#BFDBFE'
  }
};

interface IssueDisplayProps {
  category: IssueCategory;
  urgency?: UrgencyLevel;
  inquiry?: string;
  compact?: boolean;
}

export const IssueDisplay: React.FC<IssueDisplayProps> = ({
  category,
  urgency = 'NORMAL',
  inquiry,
  compact = false
}) => {
  const meta = ISSUE_CATEGORY_META[category] || ISSUE_CATEGORY_META.OTHER;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: compact ? '220px' : '280px' }}>
      {/* Category Pill & Urgency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.12rem 0.45rem',
            borderRadius: '4px',
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.border}`
          }}
          title={meta.label}
        >
          {meta.icon}
          <span>{meta.shortLabel}</span>
        </span>

        {urgency === 'CRITICAL' && (
          <span
            style={{
              fontSize: '0.68rem',
              color: '#DC2626',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              padding: '0.05rem 0.35rem',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            ⚡ ด่วนที่สุด
          </span>
        )}

        {urgency === 'HIGH' && (
          <span
            style={{
              fontSize: '0.68rem',
              color: '#D97706',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              padding: '0.05rem 0.35rem',
              borderRadius: '4px',
              fontWeight: 600
            }}
          >
            ด่วน
          </span>
        )}
      </div>

      {/* Specific problem description (customer inquiry) */}
      {inquiry && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--thp-dark)',
            lineHeight: 1.35,
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={inquiry}
        >
          {inquiry}
        </div>
      )}
    </div>
  );
};
