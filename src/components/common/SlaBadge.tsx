import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import type { SlaRouteType } from '../../types/case';
import { formatThaiDate } from '../../utils/slaCalculator';

interface SlaBadgeProps {
  deadlineIso: string;
  isExceeded: boolean;
  status: string;
  bagOpenedAt?: string;
  targetDays?: number;
  routeType?: SlaRouteType;
  retentionDeadline?: string;
  retentionDaysLeft?: number;
  showRouteTag?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({
  deadlineIso,
  isExceeded,
  status,
  bagOpenedAt,
  targetDays = 3,
  routeType,
  retentionDeadline,
  retentionDaysLeft,
  showRouteTag = false
}) => {
  if (status === 'CLOSED') {
    return (
      <span className="sla-badge normal" title="เคสได้รับการตรวจสอบและปิดตาม SLA แล้ว">
        <Clock size={12} /> ปิดแล้ว
      </span>
    );
  }

  const nowMs = Date.now();
  const deadlineMs = new Date(deadlineIso).getTime();
  const diffHours = Math.round((deadlineMs - nowMs) / (3600 * 1000));

  const routeLabel =
    routeType === 'CROSS_PROVINCE'
      ? 'ข้ามจังหวัด (SLA 3-5 วัน)'
      : 'ใน กทม./ภาคเดียวกัน (SLA 3 วัน)';

  const bagDateTh = bagOpenedAt ? formatThaiDate(bagOpenedAt, 'short') : '-';
  const retentionDateTh = retentionDeadline ? formatThaiDate(retentionDeadline, 'short') : '-';
  const tooltipText = `นับ SLA จากวันเปิดถุง: ${bagDateTh}\nเกณฑ์: ${routeLabel}\nเก็บพัสดุ: 7 วันหลังเปิดถุง (ถึง ${retentionDateTh})${
    retentionDaysLeft !== undefined ? ` (เหลือ ${retentionDaysLeft} วัน)` : ''
  }`;

  if (isExceeded || diffHours <= 0) {
    const overdueHours = Math.abs(diffHours);
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={tooltipText}>
        <span className="sla-badge exceeded">
          <AlertCircle size={12} /> เกิน{overdueHours > 0 ? ` ${overdueHours} ชม.` : 'กำหนด'}
        </span>
        {showRouteTag && (
          <span style={{ fontSize: '0.68rem', color: '#B91C1C', fontWeight: 600 }}>
            {targetDays}d
          </span>
        )}
      </div>
    );
  }

  if (diffHours <= 24) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={tooltipText}>
        <span className="sla-badge warning">
          <AlertTriangle size={12} /> เหลือ {diffHours} ชม.
        </span>
      </div>
    );
  }

  const daysLeft = (diffHours / 24).toFixed(1);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={tooltipText}>
      <span className="sla-badge normal">
        <Clock size={12} /> เหลือ {daysLeft} วัน
      </span>
    </div>
  );
};
