import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { notify } from '../../utils/dialog';
import { CheckCircle2, Edit3, RotateCcw, X, Send } from 'lucide-react';

interface AnswerReviewModalProps {
  caseItem: CaseItem;
  onClose: () => void;
}

export const AnswerReviewModal: React.FC<AnswerReviewModalProps> = ({ caseItem, onClose }) => {
  const { centralReviewAnswer } = useCases();
  const rawCecAnswer = caseItem.cecReply?.answer || '';

  const [mode, setMode] = useState<'APPROVE' | 'EDIT' | 'REQUEST_INFO'>('APPROVE');
  const [editedAnswer, setEditedAnswer] = useState(rawCecAnswer);
  const [reviewNotes, setReviewNotes] = useState('');
  const [requestMoreInfoText, setRequestMoreInfoText] = useState('');

  const handleConfirm = () => {
    if (mode === 'REQUEST_INFO') {
      if (!requestMoreInfoText.trim()) {
        notify('กรุณากรอกข้อมูลที่ต้องการให้ CEC ตรวจสอบเพิ่มเติม', { title: 'ข้อมูลยังไม่ครบ' });
        return;
      }
      centralReviewAnswer(caseItem.id, 'REQUESTED_MORE_INFO', '', requestMoreInfoText.trim());
      onClose();
      return;
    }

    if (mode === 'EDIT') {
      if (!editedAnswer.trim()) {
        notify('กรุณากรอกคำตอบที่แก้ไขแล้ว', { title: 'ข้อมูลยังไม่ครบ' });
        return;
      }
      centralReviewAnswer(caseItem.id, 'EDITED', editedAnswer.trim(), reviewNotes.trim());
      onClose();
      return;
    }

    // Default APPROVE
    centralReviewAnswer(caseItem.id, 'APPROVED', rawCecAnswer, reviewNotes.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <CheckCircle2 size={20} color="#0284C7" />
            <span>ตรวจสอบคำตอบจาก CEC</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose} title="ปิด">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Case Info Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--thp-border)',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <strong>Case:</strong> {caseItem.id} ({caseItem.trackingNumber})
            </div>
            <div>
              <strong>ร้านค้า:</strong> {caseItem.companyName} ({caseItem.myOrderRef.orderId})
            </div>
            <div>
              <strong>ศูนย์ CEC:</strong> {caseItem.assignedCecName || 'CEC'}
            </div>
          </div>

          {/* Original CEC Reply */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>คำตอบที่ CEC ส่งกลับมา:</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                ผู้ตอบ: {caseItem.cecReply?.repliedBy || 'เจ้าหน้าที่ CEC'} ({caseItem.cecReply?.repliedAt ? new Date(caseItem.cecReply.repliedAt).toLocaleTimeString('th-TH') : ''})
              </span>
            </label>
            <div
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: 'var(--thp-dark)'
              }}
            >
              {rawCecAnswer || 'ยังไม่มีข้อความคำตอบ'}
            </div>
            {caseItem.cecReply?.branchNotes && (
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                * หมายเหตุจากสาขาปลายทาง: {caseItem.cecReply.branchNotes}
              </div>
            )}
          </div>

          {/* Action Choice Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--thp-slate)' }}>
              เลือกการดำเนินการของ ปณ.ส่วนกลาง:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                className={`btn-secondary ${mode === 'APPROVE' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  background: mode === 'APPROVE' ? '#ECFDF5' : '#FFFFFF',
                  borderColor: mode === 'APPROVE' ? '#10B981' : 'var(--thp-border)',
                  color: mode === 'APPROVE' ? '#065F46' : 'inherit',
                  fontWeight: mode === 'APPROVE' ? 700 : 500
                }}
                onClick={() => setMode('APPROVE')}
              >
                <CheckCircle2 size={16} /> อนุมัติคำตอบเดิม
              </button>

              <button
                type="button"
                className={`btn-secondary ${mode === 'EDIT' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  background: mode === 'EDIT' ? '#EFF6FF' : '#FFFFFF',
                  borderColor: mode === 'EDIT' ? '#3B82F6' : 'var(--thp-border)',
                  color: mode === 'EDIT' ? '#1D4ED8' : 'inherit',
                  fontWeight: mode === 'EDIT' ? 700 : 500
                }}
                onClick={() => setMode('EDIT')}
              >
                <Edit3 size={16} /> แก้ไขข้อความก่อนส่ง
              </button>

              <button
                type="button"
                className={`btn-secondary ${mode === 'REQUEST_INFO' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  background: mode === 'REQUEST_INFO' ? '#FEF2F2' : '#FFFFFF',
                  borderColor: mode === 'REQUEST_INFO' ? '#EF4444' : 'var(--thp-border)',
                  color: mode === 'REQUEST_INFO' ? '#B91C1C' : 'inherit',
                  fontWeight: mode === 'REQUEST_INFO' ? 700 : 500
                }}
                onClick={() => setMode('REQUEST_INFO')}
              >
                <RotateCcw size={16} /> ส่งกลับให้ CEC ขอข้อมูลเพิ่ม
              </button>
            </div>
          </div>

          {/* Mode Form Content */}
          {mode === 'EDIT' && (
            <div className="form-group">
              <label>ข้อความคำตอบที่ปรับแต่ง (จะส่งกลับร้านค้าผ่าน MyOrder):</label>
              <textarea
                className="form-control"
                rows={4}
                value={editedAnswer}
                onChange={e => setEditedAnswer(e.target.value)}
                placeholder="ปรับข้อความให้สุภาพและชัดเจนตามมาตรฐานไปรษณีย์ไทย..."
              />
            </div>
          )}

          {mode === 'REQUEST_INFO' && (
            <div className="form-group">
              <label style={{ color: '#B91C1C' }}>
                ระบุประเด็นที่ต้องการให้ CEC ตรวจสอบเพิ่มเติม (จะย้ายเคสกลับไป Waiting CEC):
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={requestMoreInfoText}
                onChange={e => setRequestMoreInfoText(e.target.value)}
                placeholder="เช่น ข้อมูลภาพถ่ายลายเซ็นไม่ชัดเจน รบกวนประสาน ปณ.ปลายทาง ถ่ายรูปสำเนาใบรับมาใหม่..."
              />
            </div>
          )}

          {mode !== 'REQUEST_INFO' && (
            <div className="form-group">
              <label>บันทึกภายในของ ปณ.ส่วนกลาง:</label>
              <input
                type="text"
                className="form-control"
                placeholder="บันทึกข้อคิดเห็นเพื่อการตรวจสอบย้อนหลัง (ถ้ามี)..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className={mode === 'REQUEST_INFO' ? 'btn-danger' : 'btn-success'}
            onClick={handleConfirm}
          >
            {mode === 'REQUEST_INFO' ? (
              <>
                <RotateCcw size={16} /> ยืนยันตีกลับให้ CEC
              </>
            ) : (
              <>
                <Send size={16} /> ยืนยันและส่งคำตอบให้ร้านค้า
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
