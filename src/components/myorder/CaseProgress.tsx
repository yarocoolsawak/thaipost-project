import React from 'react';
import type { CaseItem, CaseStatus } from '../../types/case';
import { Check } from 'lucide-react';

// Status wording shown to shops (no internal ThaiPost jargon)
export const MERCHANT_STATUS_META: Record<CaseStatus, { label: string; bg: string; color: string; border: string }> = {
  NEW: { label: 'รับเรื่องแล้ว', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  CENTRAL_REVIEWING: { label: 'ปณ.ส่วนกลางกำลังตรวจสอบ', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  SENT_TO_CEC: { label: 'CEC กำลังตรวจสอบ', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  WAITING_CEC_REPLY: { label: 'CEC กำลังตรวจสอบ', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  CEC_REPLIED: { label: 'กำลังตรวจทานคำตอบ', bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
  WAITING_CENTRAL_REVIEW: { label: 'กำลังตรวจทานคำตอบ', bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
  ANSWER_APPROVED: { label: 'ได้รับคำตอบแล้ว', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  ANSWER_SENT_TO_MERCHANT: { label: 'ได้รับคำตอบแล้ว', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  SLA_EXCEEDED: { label: 'เกินกำหนด 3 วัน – กำลังเร่งรัด', bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5' },
  CENTRAL_CONTACT_BRANCH: { label: 'ปณ.ประสานสาขาโดยตรง', bg: '#FFF1F2', color: '#BE123C', border: '#FDA4AF' },
  CLOSED: { label: 'ปิดเคสแล้ว', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' }
};

export const MerchantStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const meta = MERCHANT_STATUS_META[status];
  return (
    <span
      className="order-status-chip"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  );
};

type StepState = 'done' | 'current' | 'waiting' | 'pending';

const hasAnswer = (c: CaseItem) => !!c.centralReview || c.status === 'ANSWER_SENT_TO_MERCHANT' || c.status === 'ANSWER_APPROVED';

export const CaseProgressStepper: React.FC<{ caseItem: CaseItem }> = ({ caseItem: c }) => {
  const cecKnown = c.assignedCecId !== undefined;
  const closed = c.status === 'CLOSED';
  const answered = hasAnswer(c) || closed;
  const cecReplied = !!c.cecReply || answered;

  const steps: { label: string; sub?: string; state: StepState }[] = [
    { label: 'แจ้งปัญหา', sub: 'ส่งเข้าระบบ ปณ.', state: 'done' },
    {
      label: cecKnown ? 'ส่งถึง CEC' : 'รอระบุ CEC',
      sub: cecKnown ? `CEC ${c.assignedCecId}` : 'ส่วนกลางกำลังตรวจ',
      state: cecKnown ? 'done' : 'waiting'
    },
    {
      label: 'ตรวจสอบกับสาขา',
      state: cecReplied ? 'done' : cecKnown ? 'current' : 'pending'
    },
    {
      label: 'ได้รับคำตอบ',
      state: answered ? 'done' : cecReplied ? 'current' : 'pending'
    },
    { label: 'ปิดเคส', state: closed ? 'done' : answered ? 'current' : 'pending' }
  ];

  return (
    <div className="progress-stepper">
      {steps.map((step, i) => (
        <div key={step.label} className={`progress-step ${step.state}`}>
          <div className="progress-dot">{step.state === 'done' ? <Check size={14} /> : i + 1}</div>
          <div className="progress-label">{step.label}</div>
          {step.sub && <div className="progress-sub">{step.sub}</div>}
        </div>
      ))}
    </div>
  );
};

// Most recent activity on a case — what a shop is allowed to see instead of the internal case status
export const latestActivity = (c: CaseItem) =>
  c.activityLogs.reduce<CaseItem['activityLogs'][number] | undefined>(
    (latest, log) => (!latest || log.timestamp > latest.timestamp ? log : latest),
    undefined
  );

export const LatestUpdate: React.FC<{ caseItem: CaseItem; compact?: boolean }> = ({ caseItem, compact = false }) => {
  const log = latestActivity(caseItem);
  if (!log) return null;
  const when = new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  if (compact) {
    return (
      <div style={{ fontSize: '0.75rem', lineHeight: 1.35 }}>
        <div style={{ fontWeight: 600, color: 'var(--myorder-teal-dark)' }}>{log.action}</div>
        <div style={{ color: 'var(--thp-muted)' }}>อัปเดต {when}</div>
      </div>
    );
  }
  return (
    <div
      style={{
        borderLeft: '3px solid var(--myorder-teal)',
        background: 'var(--myorder-teal-light)',
        borderRadius: '0 8px 8px 0',
        padding: '0.5rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.1rem'
      }}
    >
      <span style={{ fontSize: '0.72rem', color: 'var(--thp-muted)' }}>อัปเดตล่าสุด • {when}</span>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--myorder-teal-dark)' }}>{log.action}</span>
    </div>
  );
};
