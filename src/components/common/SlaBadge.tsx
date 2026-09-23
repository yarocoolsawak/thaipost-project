import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface SlaBadgeProps {
  deadlineIso: string;
  isExceeded: boolean;
  status: string;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ deadlineIso, isExceeded, status }) => {
  if (status === 'CLOSED') {
    return (
      <span className="sla-badge normal">
        <Clock size={12} /> ปิดตาม SLA แล้ว
      </span>
    );
  }

  const nowMs = Date.now();
  const deadlineMs = new Date(deadlineIso).getTime();
  const diffHours = Math.round((deadlineMs - nowMs) / (3600 * 1000));

  if (isExceeded || diffHours <= 0) {
    const overdueHours = Math.abs(diffHours);
    return (
      <span className="sla-badge exceeded" title={`เกินกำหนด SLA 3 วัน (${overdueHours} ชม.)`}>
        <AlertCircle size={12} /> เกิน SLA {overdueHours > 0 ? `${overdueHours}h` : 'แล้ว'}
      </span>
    );
  }

  if (diffHours <= 24) {
    return (
      <span className="sla-badge warning" title="เหลือเวลาไม่ถึง 24 ชั่วโมง">
        <AlertTriangle size={12} /> เหลือ {diffHours}h (ใกล้ครบ)
      </span>
    );
  }

  const daysLeft = (diffHours / 24).toFixed(1);
  return (
    <span className="sla-badge normal" title="นับ SLA 3 วันจากวันส่ง">
      <Clock size={12} /> เหลือ {daysLeft} วัน ({diffHours}h)
    </span>
  );
};
