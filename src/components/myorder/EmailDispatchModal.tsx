import React, { useState } from 'react';
import type { CaseItem, EmailRequestType } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { buildEmailDraft, DEFAULT_REQUEST_EMAIL_TO, EMAIL_REQUEST_TYPE_LABEL } from '../../utils/emailTemplates';
import { Mail, X, Paperclip, Send, FileCheck, RotateCcw, MapPin, FileText, AlertTriangle, History, Truck } from 'lucide-react';

interface EmailDispatchModalProps {
  caseItem: CaseItem;
  onClose: () => void;
  onSent?: () => void;
}

const draftFor = (type: EmailRequestType, c: CaseItem, signature: string) =>
  buildEmailDraft(type, {
    trackingNumber: c.trackingNumber,
    shopName: c.companyName,
    contactPerson: signature,
    caseId: c.id,
    originPostOffice: c.parcelInfo.originPostOffice,
    destPostOffice: c.parcelInfo.destPostOffice,
    receiverName: c.parcelInfo.receiverName,
    receiverAddress: c.parcelInfo.receiverAddress
  });

const TYPE_BUTTONS: { type: EmailRequestType; label: string; icon: React.ReactNode; bg: string; border: string; color: string }[] = [
  { type: 'RETURN_PARCEL', label: 'แจ้งตีกลับพัสดุ', icon: <RotateCcw size={14} />, bg: '#FEF2F2', border: 'var(--thp-red)', color: 'var(--thp-red)' },
  { type: 'CHANGE_ADDRESS', label: 'เปลี่ยนจ่าหน้า/ที่อยู่', icon: <MapPin size={14} />, bg: '#EFF6FF', border: '#3B82F6', color: '#1D4ED8' },
  { type: 'REDELIVER', label: 'ยกเลิกตีกลับ นำจ่ายต่อ', icon: <Truck size={14} />, bg: '#F0FDF4', border: '#22C55E', color: '#166534' },
  { type: 'SUBMIT_DOCS', label: 'ส่งหลักฐานยืนยัน', icon: <FileCheck size={14} />, bg: '#ECFDF5', border: '#10B981', color: '#047857' }
];

// Shop (or MyOrder admin on its behalf) sends an official request email to ThaiPost for a case
export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({ caseItem: initialCase, onClose, onSent }) => {
  const { sendOfficialEmail, role, cases } = useCases();
  const caseItem = cases.find(c => c.id === initialCase.id) || initialCase;
  const byAdmin = role === 'MYORDER_ADMIN';
  const senderName = byAdmin ? 'แอดมิน MyOrder' : caseItem.contactPerson;
  const signature = byAdmin ? `แอดมิน MyOrder (ในนามร้าน ${caseItem.companyName})` : caseItem.contactPerson;
  const sentBefore = caseItem.emails || [];

  const [requestType, setRequestType] = useState<EmailRequestType>('RETURN_PARCEL');
  const [recipientEmail, setRecipientEmail] = useState(DEFAULT_REQUEST_EMAIL_TO);
  const [ccEmail, setCcEmail] = useState('');
  const [subject, setSubject] = useState(() => draftFor('RETURN_PARCEL', caseItem, signature).subject);
  const [emailBody, setEmailBody] = useState(() => draftFor('RETURN_PARCEL', caseItem, signature).body);
  const [attachments, setAttachments] = useState<string[]>([
    `หนังสือแจ้งคำร้อง_${caseItem.trackingNumber}.pdf`,
    'สำเนาใบเสร็จรับฝาก_ปณท.jpg'
  ]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const handleTypeChange = (type: EmailRequestType) => {
    setRequestType(type);
    const draft = draftFor(type, caseItem, signature);
    setSubject(draft.subject);
    setEmailBody(draft.body);
  };

  const handleAddAttachment = () => {
    if (newAttachmentName.trim()) {
      setAttachments([...attachments, newAttachmentName.trim()]);
      setNewAttachmentName('');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !emailBody.trim()) return;

    sendOfficialEmail(caseItem.id, {
      to: recipientEmail,
      cc: ccEmail || undefined,
      subject: subject.trim(),
      requestType,
      body: emailBody.trim(),
      attachments,
      senderName,
      sentByRole: byAdmin ? 'MYORDER_ADMIN' : 'MERCHANT'
    });
    onSent?.();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Mail size={20} color="var(--myorder-teal)" />
            <span>ส่งอีเมลคำร้องทางการถึง ปณท (ตีกลับ / เปลี่ยนจ่าหน้า / แนบหลักฐาน)</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} style={{ display: 'contents' }}>
          <div className="modal-body">
            <div style={{ fontSize: '0.82rem', color: 'var(--thp-muted)' }}>
              เคส <strong>{caseItem.id}</strong> • ร้าน {caseItem.companyName} • คำสั่งซื้อ {caseItem.myOrderRef.orderId} • พัสดุ{' '}
              <span className="tracking-pill">{caseItem.trackingNumber}</span>
              {byAdmin && (
                <span className="source-chip" style={{ marginLeft: '0.4rem' }}>ส่งโดยแอดมิน MyOrder แทนร้านค้า</span>
              )}
            </div>

            {/* Emails already sent for this case, so nobody sends the same request twice */}
            {sentBefore.length > 0 && (
              <div style={{ background: '#F8FAFC', border: '1px solid var(--thp-border)', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <History size={13} /> ส่งไปแล้ว {sentBefore.length} ฉบับในเคสนี้
                </div>
                {sentBefore.map(email => (
                  <div key={email.id} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', color: 'var(--thp-slate)' }}>
                    <span style={{ fontFamily: 'var(--font-en)', color: 'var(--thp-muted)' }}>
                      {new Date(email.sentAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <strong>{EMAIL_REQUEST_TYPE_LABEL[email.requestType]}</strong>
                    <span>• โดย {email.sentByRole === 'MYORDER_ADMIN' ? 'แอดมิน MyOrder' : `ร้านค้า (${email.senderName})`}</span>
                  </div>
                ))}
              </div>
            )}
            {sentBefore.some(e => e.requestType === requestType) && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <AlertTriangle size={14} /> เคสนี้เคยส่งคำร้องประเภท “{EMAIL_REQUEST_TYPE_LABEL[requestType]}” ไปแล้ว — ตรวจสอบก่อนส่งซ้ำ
              </div>
            )}

            {/* Request type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--thp-slate)' }}>ประเภทคำร้อง:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {TYPE_BUTTONS.map(btn => {
                  const active = requestType === btn.type;
                  return (
                    <button
                      key={btn.type}
                      type="button"
                      className="btn-secondary"
                      style={{
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        padding: '0.5rem',
                        background: active ? btn.bg : '#FFFFFF',
                        borderColor: active ? btn.border : 'var(--thp-border)',
                        color: active ? btn.color : 'inherit',
                        fontWeight: active ? 700 : 500
                      }}
                      onClick={() => handleTypeChange(btn.type)}
                    >
                      {btn.icon} {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>

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
                  placeholder="อีเมลร้านค้า (ถ้ามี)"
                  value={ccEmail}
                  onChange={e => setCcEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>หัวข้ออีเมล (Subject):</label>
              <input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>เนื้อหาอีเมล (Email Body):</label>
              <textarea className="form-control" rows={6} value={emailBody} onChange={e => setEmailBody(e.target.value)} required />
            </div>

            {/* Attachments */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Paperclip size={14} /> เอกสารแนบ (Attachments):
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>{attachments.length} ไฟล์</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                {attachments.map((file, idx) => (
                  <div
                    key={`${file}-${idx}`}
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
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 700 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', flex: 1, minWidth: 0 }}
                  placeholder="พิมพ์ชื่อไฟล์หรือเลือกหลักฐาน เช่น บัตรประชาชน.pdf"
                  value={newAttachmentName}
                  onChange={e => setNewAttachmentName(e.target.value)}
                />
                <button type="button" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={handleAddAttachment}>
                  + แนบไฟล์
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-myorder">
              <Send size={15} /> ส่งอีเมลทางการ & บันทึกเข้าระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
