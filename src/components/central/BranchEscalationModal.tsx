import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { PhoneForwarded, X, Save, AlertTriangle } from 'lucide-react';

interface BranchEscalationModalProps {
  caseItem: CaseItem;
  onClose: () => void;
}

export const BranchEscalationModal: React.FC<BranchEscalationModalProps> = ({
  caseItem,
  onClose
}) => {
  const { escalateToBranch } = useCases();

  const [branchName, setBranchName] = useState(caseItem.assignedBranchName || caseItem.parcelInfo.destPostOffice || 'ปณ.ปลายทาง');
  const [officerName, setOfficerName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [contactReason, setContactReason] = useState(
    caseItem.isSlaExceeded
      ? 'เคสเกินกำหนด SLA 3 วัน (72 ชม.) ยังไม่ได้รับคำตอบจาก CEC จึงยกระดับโทรสายตรงหาหัวหน้าสาขา'
      : 'เคสเร่งด่วนพิเศษ ปณ.ส่วนกลาง โทรติดตามสาขาปลายทางโดยตรง'
  );
  const [outcome, setOutcome] = useState('');
  const [recordedBy, setRecordedBy] = useState('เจ้าหน้าที่ ปณ.ส่วนกลาง (สายด่วน)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim() || !outcome.trim()) {
      alert('กรุณากรอกชื่อผู้รับสายและผลการประสานงานให้ครบถ้วน');
      return;
    }

    escalateToBranch(caseItem.id, {
      timestamp: new Date().toISOString(),
      branchName,
      officerName: officerName.trim(),
      officerPhone: officerPhone.trim() || 'สายตรง ปณ.',
      contactReason,
      outcome: outcome.trim(),
      recordedBy: recordedBy.trim()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <PhoneForwarded size={20} color="#BE123C" />
            <span>ยกระดับติดต่อสาขาปลายทางโดยตรง (Branch Escalation)</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {caseItem.isSlaExceeded && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#991B1B',
                fontSize: '0.85rem'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>เคสนี้เกินกำหนด SLA 3 วัน (72 ชั่วโมง)</strong> ตามระเบียบข้อบังคับ ปณ.ส่วนกลางต้องตัดตอนการรอ CEC และโทรสายตรงติดต่อสาขาปลายทางทันที
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: '#F8FAFC',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--thp-border)',
              fontSize: '0.85rem'
            }}
          >
            <div><strong>Case ID:</strong> {caseItem.id}</div>
            <div><strong>เลขพัสดุ:</strong> {caseItem.trackingNumber}</div>
            <div><strong>บริษัทคู่ค้า:</strong> {caseItem.companyName}</div>
            <div><strong>ปลายทาง:</strong> {caseItem.parcelInfo.destPostOffice}</div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>ชื่อสาขา / ที่ทำการไปรษณีย์ปลายทาง:</label>
              <input
                type="text"
                className="form-control"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>ชื่อ-นามสกุล / ตำแหน่ง เจ้าหน้าที่ผู้รับสาย:</label>
              <input
                type="text"
                className="form-control"
                placeholder="เช่น นายประสิทธิ์ (หน.งานนำจ่าย)"
                value={officerName}
                onChange={e => setOfficerName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>เบอร์โทรติดต่อสาขา / เบอร์ต่อ:</label>
              <input
                type="text"
                className="form-control"
                placeholder="เช่น 053-123-456 ต่อ 12 หรือ 081-xxx-xxxx"
                value={officerPhone}
                onChange={e => setOfficerPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>ผู้บันทึกข้อมูล (เจ้าหน้าที่ส่วนกลาง):</label>
              <input
                type="text"
                className="form-control"
                value={recordedBy}
                onChange={e => setRecordedBy(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>เหตุผลการติดต่อ:</label>
            <input
              type="text"
              className="form-control"
              value={contactReason}
              onChange={e => setContactReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>ผลการประสานงานและข้อตกลงแก้ไขปัญหา (Outcome):</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="ระบุข้อเท็จจริง เช่น สาขาแจ้งว่าพัสดุอยู่ที่คลังเตรียมจัดส่งรอบบ่ายสอง เจ้าหน้าที่ชื่อ... จะโทรหาลูกค้าโดยตรง..."
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              required
            />
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-danger">
              <Save size={16} /> บันทึก Branch Contact Log & ยกระดับสถานะ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
