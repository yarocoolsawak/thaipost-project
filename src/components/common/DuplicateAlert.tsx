import React from 'react';
import type { CaseItem } from '../../types/case';
import { AlertTriangle, ExternalLink, Link2 } from 'lucide-react';

interface DuplicateAlertProps {
  existingCase: CaseItem;
  onLinkToExisting: () => void;
  onViewExisting: () => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  existingCase,
  onLinkToExisting,
  onViewExisting
}) => {
  return (
    <div className="duplicate-alert-banner">
      <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#92400E' }}>
          ตรวจพบเคสเดิมที่ยังเปิดอยู่สำหรับเลขพัสดุนี้!
        </div>
        <div style={{ fontSize: '0.84rem', color: '#B45309', lineHeight: 1.4 }}>
          เคสรหัส <strong>{existingCase.id}</strong> (สร้างเมื่อ {new Date(existingCase.createdAt).toLocaleDateString('th-TH')}) 
          สถานะปัจจุบัน: <strong>{existingCase.status}</strong> กำลังอยู่ในการดูแลของ {existingCase.assignedCecName || 'ปณ.ส่วนกลาง'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onLinkToExisting}
            className="btn-warning"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Link2 size={14} /> ผูกข้อความใหม่เข้าเคสเดิม (แนะนำ)
          </button>
          <button
            type="button"
            onClick={onViewExisting}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            <ExternalLink size={14} /> ดูรายละเอียดเคสเดิม
          </button>
        </div>
      </div>
    </div>
  );
};
