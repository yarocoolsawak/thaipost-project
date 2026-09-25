import React from 'react';
import type { CaseItem } from '../../types/case';
import { latestActivity } from '../myorder/CaseProgress';
import { AlertTriangle, Eye, PlusCircle } from 'lucide-react';

interface DuplicateAlertProps {
  existingCase: CaseItem;
  onFollowExisting: () => void;
  onCreateNew: () => void;
}

// Shown when a parcel already has a case that is not closed yet: follow that case, or open a new one anyway
export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ existingCase, onFollowExisting, onCreateNew }) => {
  const lastUpdate = latestActivity(existingCase);
  return (
    <div className="duplicate-alert-banner">
      <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#92400E' }}>
          เลขพัสดุนี้เคยสร้างเคสแล้ว และเคสยังไม่ปิด
        </div>
        <div style={{ fontSize: '0.84rem', color: '#B45309', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div>
            เคส <strong>{existingCase.id}</strong> • แจ้งเมื่อ{' '}
            {new Date(existingCase.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
          {lastUpdate && (
            <div>
              อัปเดตล่าสุด: {lastUpdate.action} ({new Date(lastUpdate.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })})
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#92400E' }}>ต้องการไปติดตามเคสเดิม หรือสร้างเคสใหม่?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={onFollowExisting} className="btn-myorder" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Eye size={14} /> ไปติดตามเคส {existingCase.id} (แนะนำ)
          </button>
          <button type="button" onClick={onCreateNew} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <PlusCircle size={14} /> สร้างเคสใหม่
          </button>
        </div>
      </div>
    </div>
  );
};
