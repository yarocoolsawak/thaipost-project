import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import {
  Mail,
  X,
  Paperclip,
  Send,
  FileCheck,
  RotateCcw,
  MapPin,
  FileText
} from 'lucide-react';

interface EmailDispatchModalProps {
  caseItem: CaseItem;
  onClose: () => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({ caseItem, onClose }) => {
  const { sendOfficialEmail } = useCases();

  const [requestType, setRequestType] = useState<'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS'>('RETURN_PARCEL');
  const [recipientEmail, setRecipientEmail] = useState('thp_returns@thailandpost.com');
  const [ccEmail, setCcEmail] = useState(`cs@${caseItem.companyName.toLowerCase().replace(/\s+/g, '')}.com`);
  const [subject, setSubject] = useState(
    `[คำร้องทางการ] ขอระงับการจ่ายและส่งคืนต้นทาง พัสดุ ${caseItem.trackingNumber} (${caseItem.companyName})`
  );
  const [emailBody, setEmailBody] = useState(
    `เรียน แผนกบริการลูกค้าและส่งต่อสิ่งของ บริษัท ไปรษณีย์ไทย จำกัด\n\nทางบริษัท ${caseItem.companyName} มีความประสงค์ขอระงับการนำจ่ายพัสดุหมายเลข ${caseItem.trackingNumber} และขอให้ดำเนินการตีกลับสิ่งของส่งคืนผู้ส่งต้นทาง เนื่องจากผู้รับขอยกเลิกคำสั่งซื้อ\n\nต้นทาง: ${caseItem.parcelInfo.originPostOffice}\nปลายทางเดิม: ${caseItem.parcelInfo.destPostOffice}\nผู้รับ: ${caseItem.parcelInfo.receiverName}\n\nเอกสารแนบยืนยันตัวตนและใบแจ้งความประสงค์ได้แนบมาพร้อมกับอีเมลฉบับนี้แล้ว รบกวนประสานที่ทำการปลายทางระงับการจ่ายโดยด่วนครับ\n\nขอแสดงความนับถือ,\nฝ่ายประสานงานขนส่ง ${caseItem.companyName}`
  );

  const [attachments, setAttachments] = useState<string[]>([
    `หนังสือแจ้งคำร้อง_${caseItem.trackingNumber}.pdf`,
    `สำเนาใบเสร็จรับฝาก_ปณท.jpg`
  ]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const handleTypeChange = (type: 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS') => {
    setRequestType(type);
    if (type === 'RETURN_PARCEL') {
      setSubject(`[คำร้องทางการ] ขอระงับการจ่ายและส่งคืนต้นทาง พัสดุ ${caseItem.trackingNumber} (${caseItem.companyName})`);
      setEmailBody(
        `เรียน แผนกบริการลูกค้าและส่งต่อสิ่งของ บริษัท ไปรษณีย์ไทย จำกัด\n\nทางบริษัท ${caseItem.companyName} มีความประสงค์ขอระงับการนำจ่ายพัสดุหมายเลข ${caseItem.trackingNumber} และขอให้ดำเนินการตีกลับสิ่งของส่งคืนผู้ส่งต้นทาง\n\nต้นทาง: ${caseItem.parcelInfo.originPostOffice}\nปลายทางเดิม: ${caseItem.parcelInfo.destPostOffice}\nผู้รับ: ${caseItem.parcelInfo.receiverName}\n\nได้แนบเอกสารคำร้องมาพร้อมนี้ รบกวนระงับการนำจ่ายและส่งกลับตามที่อยู่ผู้ส่งต้นทางครับ\n\nขอแสดงความนับถือ,\n${caseItem.contactPerson}`
      );
    } else if (type === 'CHANGE_ADDRESS') {
      setSubject(`[คำร้องทางการ] ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่ พัสดุ ${caseItem.trackingNumber} (${caseItem.companyName})`);
      setEmailBody(
        `เรียน เจ้าหน้าที่ไปรษณีย์ไทย ส่วนงานนำจ่าย\n\nเนื่องด้วยพัสดุหมายเลข ${caseItem.trackingNumber} มีข้อมูลจ่าหน้าคลาดเคลื่อน ทางผู้ส่งขอแจ้งแก้ไขข้อมูลผู้รับและที่อยู่จัดส่งใหม่ ดังนี้:\n\nชื่อผู้รับใหม่: [ระบุชื่อผู้รับ]\nเบอร์โทรศัพท์: [ระบุเบอร์โทร]\nที่อยู่จัดส่งใหม่: [ระบุที่อยู่ใหม่ พร้อมรหัสไปรษณีย์]\n\n(ที่อยู่เดิม: ${caseItem.parcelInfo.receiverAddress})\n\nได้แนบหนังสือยืนยันจากผู้ส่งมาพร้อมนี้ ขอความกรุณาส่งต่อพัสดุตามที่อยู่ใหม่ครับ\n\nขอแสดงความนับถือ,\n${caseItem.contactPerson}`
      );
    } else {
      setSubject(`[เอกสารเพิ่มเติม] ส่งหลักฐานประกอบเคส ${caseItem.id} พัสดุ ${caseItem.trackingNumber}`);
      setEmailBody(
        `เรียน เจ้าหน้าที่ไปรษณีย์ไทย\n\nทางบริษัทได้แนบเอกสารหลักฐานเพิ่มเติม สำหรับเคส ${caseItem.id} (เลขพัสดุ ${caseItem.trackingNumber}) ตามที่เจ้าหน้าที่ส่วนกลางได้แจ้งขอข้อมูลเพิ่มเติมครับ\n\nขอแสดงความนับถือ,\n${caseItem.contactPerson}`
      );
    }
  };

  const handleAddAttachment = () => {
    if (newAttachmentName.trim()) {
      setAttachments([...attachments, newAttachmentName.trim()]);
      setNewAttachmentName('');
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !emailBody.trim()) {
      alert('กรุณากรอกหัวข้อและเนื้อหาอีเมล');
      return;
    }

    sendOfficialEmail(caseItem.id, {
      to: recipientEmail,
      cc: ccEmail,
      subject: subject.trim(),
      requestType,
      body: emailBody.trim(),
      attachments,
      senderName: caseItem.contactPerson || 'Admin บริษัทคู่ค้า'
    });

    alert('ส่งอีเมลคำร้องทางการและแนบหลักฐานเข้าสู่ระบบเรียบร้อยแล้ว');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Mail size={20} color="var(--thp-red)" />
            <span>ส่งอีเมลคำร้องทางการถึง ปณท (ตีกลับ / เปลี่ยนจ่าหน้า / แนบหลักฐาน)</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} className="modal-body">
          {/* Quick Request Type Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--thp-slate)' }}>
              ประเภทคำร้อง:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn-secondary ${requestType === 'RETURN_PARCEL' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  background: requestType === 'RETURN_PARCEL' ? '#FEF2F2' : '#FFFFFF',
                  borderColor: requestType === 'RETURN_PARCEL' ? 'var(--thp-red)' : 'var(--thp-border)',
                  color: requestType === 'RETURN_PARCEL' ? 'var(--thp-red)' : 'inherit',
                  fontWeight: requestType === 'RETURN_PARCEL' ? 700 : 500
                }}
                onClick={() => handleTypeChange('RETURN_PARCEL')}
              >
                <RotateCcw size={14} /> แจ้งตีกลับพัสดุ
              </button>

              <button
                type="button"
                className={`btn-secondary ${requestType === 'CHANGE_ADDRESS' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  background: requestType === 'CHANGE_ADDRESS' ? '#EFF6FF' : '#FFFFFF',
                  borderColor: requestType === 'CHANGE_ADDRESS' ? '#3B82F6' : 'var(--thp-border)',
                  color: requestType === 'CHANGE_ADDRESS' ? '#1D4ED8' : 'inherit',
                  fontWeight: requestType === 'CHANGE_ADDRESS' ? 700 : 500
                }}
                onClick={() => handleTypeChange('CHANGE_ADDRESS')}
              >
                <MapPin size={14} /> เปลี่ยนจ่าหน้า/ที่อยู่
              </button>

              <button
                type="button"
                className={`btn-secondary ${requestType === 'SUBMIT_DOCS' ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  background: requestType === 'SUBMIT_DOCS' ? '#ECFDF5' : '#FFFFFF',
                  borderColor: requestType === 'SUBMIT_DOCS' ? '#10B981' : 'var(--thp-border)',
                  color: requestType === 'SUBMIT_DOCS' ? '#047857' : 'inherit',
                  fontWeight: requestType === 'SUBMIT_DOCS' ? 700 : 500
                }}
                onClick={() => handleTypeChange('SUBMIT_DOCS')}
              >
                <FileCheck size={14} /> ส่งหลักฐานยืนยัน
              </button>
            </div>
          </div>

          {/* Email Header Fields */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>ส่งถึง (To - แผนก ปณท):</label>
              <input
                type="email"
                className="form-control"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>สำเนาถึง (CC):</label>
              <input
                type="email"
                className="form-control"
                value={ccEmail}
                onChange={e => setCcEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>หัวข้ออีเมล (Subject):</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>เนื้อหาอีเมล (Email Body):</label>
            <textarea
              className="form-control"
              rows={5}
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              required
            />
          </div>

          {/* Attachments Section */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Paperclip size={14} /> เอกสารแนบ (Attachments):
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                {attachments.length} ไฟล์
              </span>
            </label>

            {/* List of current attachments */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <FileText size={12} color="#0284C7" />
                  <span>{file}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#EF4444',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add attachment simulation */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                placeholder="พิมพ์ชื่อไฟล์หรือเลือกหลักฐาน เช่น บัตรประชาชน.pdf"
                value={newAttachmentName}
                onChange={e => setNewAttachmentName(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                onClick={handleAddAttachment}
              >
                + แนบไฟล์
              </button>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              <Send size={15} /> ส่งอีเมลทางการ & บันทึกเข้าระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
