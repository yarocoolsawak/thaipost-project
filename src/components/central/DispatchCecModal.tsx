import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { CEC_REGIONS } from '../../data/cecRegions';
import { useCases } from '../../context/CaseContext';
import { Send, X, MapPin, CheckCircle2 } from 'lucide-react';

interface DispatchCecModalProps {
  caseItem: CaseItem;
  onClose: () => void;
}

export const DispatchCecModal: React.FC<DispatchCecModalProps> = ({ caseItem, onClose }) => {
  const { dispatchToCec } = useCases();
  const [selectedCecId, setSelectedCecId] = useState<number>(caseItem.assignedCecId || 1);

  const handleDispatch = () => {
    dispatchToCec(caseItem.id, selectedCecId);
    onClose();
  };

  const currentCec = CEC_REGIONS.find(c => c.id === selectedCecId) || CEC_REGIONS[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Send size={20} color="var(--thp-red)" />
            <span>จ่ายงานเคสไปยังกลุ่ม CEC ประจำพื้นที่ (Route to CEC)</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--thp-border)',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <div><strong>Case ID:</strong> {caseItem.id} ({caseItem.trackingNumber})</div>
            <div><strong>ปลายทาง:</strong> {caseItem.parcelInfo.destPostOffice} (รหัส {caseItem.parcelInfo.destZipCode})</div>
            <div style={{ color: '#0284C7' }}>
              <strong>ระบบแนะนำอัตโนมัติตามรหัสไปรษณีย์:</strong> {caseItem.assignedCecName || 'CEC 1'}
            </div>
          </div>

          <div className="form-group">
            <label>เลือกกลุ่ม CEC ที่ต้องการมอบหมาย (14 กลุ่ม):</label>
            <select
              className="form-control"
              value={selectedCecId}
              onChange={e => setSelectedCecId(Number(e.target.value))}
            >
              {CEC_REGIONS.map(cec => (
                <option key={cec.id} value={cec.id}>
                  {cec.code} : {cec.name} - ({cec.memberCount} สมาชิกในกลุ่ม LINE)
                </option>
              ))}
            </select>
          </div>

          {/* Details of chosen CEC */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '0.85rem',
              color: '#1E3A8A',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <MapPin size={16} />
              <span>พื้นที่รับผิดชอบ: {currentCec.regionName}</span>
            </div>
            <div>เบอร์ประสานงาน: {currentCec.phone} | อีเมล: {currentCec.contactEmail}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              จังหวัดในเขต: {currentCec.provinces.join(', ')}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className="btn-primary" onClick={handleDispatch}>
            <CheckCircle2 size={16} /> ยืนยันจ่ายงานไปยัง {currentCec.code}
          </button>
        </div>
      </div>
    </div>
  );
};
