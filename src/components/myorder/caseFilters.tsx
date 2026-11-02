import React from 'react';
import type { CaseItem } from '../../types/case';
import { Layers, Send, CheckCircle2, AlertTriangle, CheckCircle } from 'lucide-react';

// Case status filters shared by the MyOrder side (shop + MyOrder admin): sidebar card and page tabs
export type MyOrderCaseFilter = 'ALL' | 'AT_CEC' | 'ANSWERED' | 'SLA' | 'CLOSED';

export const MYORDER_CASE_FILTERS: {
  key: MyOrderCaseFilter;
  label: string;
  icon: React.ReactNode;
  badge?: 'warning' | 'info' | 'danger';
}[] = [
  { key: 'ALL', label: 'อยู่ระหว่างดำเนินการทั้งหมด', icon: <Layers size={16} /> },
  { key: 'AT_CEC', label: 'CEC กำลังตรวจสอบ', icon: <Send size={16} />, badge: 'warning' },
  { key: 'ANSWERED', label: 'รอร้านค้ายืนยัน', icon: <CheckCircle2 size={16} />, badge: 'info' },
  { key: 'SLA', label: 'เกิน SLA 3 วัน', icon: <AlertTriangle size={16} color="var(--thp-danger)" />, badge: 'danger' },
  { key: 'CLOSED', label: 'Archived · ปิดเคสแล้ว', icon: <CheckCircle size={16} /> }
];

export const matchesCaseFilter = (c: CaseItem, f: MyOrderCaseFilter) => {
  switch (f) {
    case 'AT_CEC':
      return c.assignedCecId !== undefined && !c.centralReview && c.status !== 'CLOSED';
    case 'ANSWERED':
      return c.status === 'ANSWER_SENT_TO_MERCHANT';
    case 'SLA':
      return c.isSlaExceeded && c.status !== 'CLOSED';
    case 'CLOSED':
      return c.status === 'CLOSED';
    default:
      return c.status !== 'CLOSED'; // ALL = everything still in progress
  }
};
