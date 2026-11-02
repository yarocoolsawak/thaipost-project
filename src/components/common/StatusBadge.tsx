import React from 'react';
import type { CaseStatus, IssueCategory } from '../../types/case';

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  NEW: 'เคสใหม่',
  CENTRAL_REVIEWING: 'ส่วนกลางตรวจ',
  SENT_TO_CEC: 'ส่ง CEC แล้ว',
  WAITING_CEC_REPLY: 'รอ CEC ตอบ',
  CEC_REPLIED: 'CEC ตอบแล้ว',
  WAITING_CENTRAL_REVIEW: 'รอตรวจคำตอบ',
  ANSWER_APPROVED: 'อนุมัติแล้ว',
  ANSWER_SENT_TO_MERCHANT: 'รอร้านค้ายืนยัน',
  SLA_EXCEEDED: 'เกิน SLA',
  CENTRAL_CONTACT_BRANCH: 'โทรตามสาขา',
  CLOSED: 'Archived · ปิดเคสแล้ว'
};

export const ISSUE_CATEGORY_SHORT_LABELS: Record<IssueCategory, string> = {
  EXPEDITE_REQUEST: 'เร่งนำส่ง',
  CLOSE_WORK_REQUEST: 'แจ้งปิดงาน',
  REDELIVERY_REQUEST: 'นำจ่ายใหม่',
  RETURN_OR_REVERSE: 'แจ้งตีกลับ',
  CHANGE_ADDRESS_REQUEST: 'เปลี่ยนที่อยู่/เบอร์',
  DELAYED_DELIVERY: 'พัสดุล่าช้า',
  NOT_RECEIVED: 'ไม่ได้รับของ',
  WRONG_BRANCH: 'ส่งผิดสาขา',
  DAMAGED_PARCEL: 'ชำรุดเสียหาย',
  CANNOT_LOCATE: 'หาไม่พบ',
  OTHER: 'อื่นๆ'
};

export const getCaseStatusLabel = (status: CaseStatus | string): string => {
  if (status in CASE_STATUS_LABELS) {
    return CASE_STATUS_LABELS[status as CaseStatus];
  }
  return status;
};

export const getCategoryShortLabel = (category: IssueCategory | string): string => {
  if (category in ISSUE_CATEGORY_SHORT_LABELS) {
    return ISSUE_CATEGORY_SHORT_LABELS[category as IssueCategory];
  }
  return category;
};

/**
 * Remove status code prefixes like '501 - ', '401 - ', '301 - '
 * to make postal status clean and readable without redundant numbers.
 */
export const formatPostalStatus = (statusStr?: string | null): string => {
  if (!statusStr) return 'ยังไม่มีสถานะ';
  return statusStr.replace(/^\d{3}\s*[-–]\s*/, '').trim();
};

interface CaseStatusBadgeProps {
  status: CaseStatus | string;
  className?: string;
  style?: React.CSSProperties;
}

export const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({ status, className = '', style }) => {
  const label = getCaseStatusLabel(status);
  return (
    <span className={`status-badge ${status} ${className}`.trim()} style={style}>
      {label}
    </span>
  );
};
