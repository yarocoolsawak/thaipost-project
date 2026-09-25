import React, { useState } from 'react';
import type { CaseItem, EmailRequestType, IssueCategory, UrgencyLevel } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { DuplicateAlert } from '../common/DuplicateAlert';
import { notify } from '../../utils/dialog';
import type { MyOrder } from '../../data/myOrders';
import { KNOWN_PARCELS } from '../../services/trackTraceApi';
import { useMyOrder } from '../../context/MyOrderContext';
import type { ReportIssueResult } from '../../context/MyOrderContext';
import { buildEmailDraft, DEFAULT_REQUEST_EMAIL_TO, EMAIL_REQUEST_TYPE_LABEL } from '../../utils/emailTemplates';
import { AlertTriangle, Paperclip, Send, X, Info, Mail } from 'lucide-react';

interface ReportIssueModalProps {
  order: MyOrder;
  onClose: () => void;
  onReported: (result: ReportIssueResult) => void;
  onFollowExisting: (existingCase: CaseItem) => void;
}

const CATEGORY_OPTIONS: { value: IssueCategory; label: string }[] = [
  { value: 'NOT_RECEIVED', label: 'สถานะส่งสำเร็จ แต่ลูกค้ายังไม่ได้รับของ' },
  { value: 'DELAYED_DELIVERY', label: 'พัสดุล่าช้า / สถานะไม่อัปเดต' },
  { value: 'EXPEDITE_REQUEST', label: 'ขอเร่งนำส่ง' },
  { value: 'DAMAGED_PARCEL', label: 'พัสดุชำรุด / สินค้าเสียหาย' },
  { value: 'WRONG_BRANCH', label: 'ส่งผิดที่อยู่ / ผิดสาขา' },
  { value: 'CANNOT_LOCATE', label: 'ค้นหาพัสดุไม่พบ' },
  { value: 'OTHER', label: 'อื่นๆ (ขอตีกลับ / แก้ที่อยู่)' }
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ order, onClose, onReported, onFollowExisting }) => {
  const { currentShop, reportOrderIssue } = useMyOrder();
  const { checkDuplicate } = useCases();
  // Parcel already has a case that is not closed -> ask first: follow that case, or open a new one
  const existingCase = order.trackingNumber ? checkDuplicate(order.trackingNumber) : undefined;
  const [confirmNewCase, setConfirmNewCase] = useState(false);
  const blockedByDuplicate = !!existingCase && !confirmNewCase;
  const [category, setCategory] = useState<IssueCategory>(
    order.orderStatus === 'DELIVERED' ? 'NOT_RECEIVED' : 'DELAYED_DELIVERY'
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>('NORMAL');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(currentShop.ownerName);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parcel = order.trackingNumber ? KNOWN_PARCELS[order.trackingNumber] : undefined;

  // Optional official request email sent together with the report
  const draftFor = (type: EmailRequestType, contact: string) =>
    buildEmailDraft(type, {
      trackingNumber: order.trackingNumber || '',
      shopName: currentShop.name,
      contactPerson: contact || currentShop.ownerName,
      originPostOffice: parcel?.originPostOffice,
      destPostOffice: parcel?.destPostOffice,
      receiverName: order.customerName,
      receiverAddress: order.shippingAddress
    });
  const [includeEmail, setIncludeEmail] = useState(false);
  const [emailType, setEmailType] = useState<EmailRequestType>('RETURN_PARCEL');
  const [emailTo, setEmailTo] = useState(DEFAULT_REQUEST_EMAIL_TO);
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailAttachments, setEmailAttachments] = useState<string[]>([
    `หนังสือแจ้งคำร้อง_${order.trackingNumber}.pdf`,
    'สำเนาใบเสร็จรับฝาก_ปณท.jpg'
  ]);
  const [newEmailAttachment, setNewEmailAttachment] = useState('');

  const applyEmailDraft = (type: EmailRequestType) => {
    const draft = draftFor(type, reporterName.trim());
    setEmailType(type);
    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    try {
      setIsSubmitting(true);
      const result = await reportOrderIssue(order.orderId, {
        category,
        urgency,
        description: description.trim(),
        reporterName: reporterName.trim() || currentShop.ownerName,
        attachments,
        forceNewCase: !!existingCase,
        emailDispatch: includeEmail
          ? {
              to: emailTo || DEFAULT_REQUEST_EMAIL_TO,
              cc: emailCc || undefined,
              subject: emailSubject.trim(),
              requestType: emailType,
              body: emailBody.trim(),
              attachments: emailAttachments
            }
          : undefined
      });
      onReported(result);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'แจ้งปัญหาไม่สำเร็จ ลองใหม่อีกครั้ง', { title: 'แจ้งปัญหาไม่สำเร็จ', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <AlertTriangle size={20} color="var(--myorder-teal)" />
            <span>แจ้งปัญหาการจัดส่ง – {order.orderId}</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            {/* Order summary */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--thp-border)',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.35rem 1rem'
              }}
            >
              <div><strong>เลขพัสดุ:</strong> <span className="tracking-pill">{order.trackingNumber}</span></div>
              <div><strong>ลูกค้า:</strong> {order.customerName}</div>
              <div><strong>บริการ:</strong> {order.shippingService}</div>
              <div><strong>สถานะพัสดุล่าสุด:</strong> {parcel?.currentPostalStatus || '-'}</div>
            </div>

            {blockedByDuplicate && existingCase ? (
              <DuplicateAlert
                existingCase={existingCase}
                onFollowExisting={() => onFollowExisting(existingCase)}
                onCreateNew={() => setConfirmNewCase(true)}
              />
            ) : (
              <>
            {existingCase && (
              <div style={{ fontSize: '0.8rem', color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.5rem 0.8rem' }}>
                จะเปิดเป็นเคสใหม่แยกจากเคสเดิม <strong>{existingCase.id}</strong> (ระบบผูกให้ ปณ. เห็นว่าเป็นพัสดุเดียวกัน)
              </div>
            )}
            {/* What happens next (shops don't see internal routing / CEC) */}
            <div className="myorder-banner" style={{ justifyContent: 'flex-start', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                เรื่องจะถูกส่งถึง<strong>ไปรษณีย์ไทย</strong>ทันที ติดตามอัปเดตล่าสุดได้ที่เมนู “ติดตามปัญหาที่แจ้ง”
              </span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>ประเภทปัญหา:</label>
                <select className="form-control" value={category} onChange={e => setCategory(e.target.value as IssueCategory)}>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ความเร่งด่วน:</label>
                <select className="form-control" value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)}>
                  <option value="NORMAL">ปกติ</option>
                  <option value="HIGH">ด่วน (ลูกค้าร้องเรียน)</option>
                  <option value="CRITICAL">ด่วนที่สุด (สินค้ามูลค่าสูง)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>รายละเอียดปัญหา:</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="เช่น ลูกค้าแจ้งว่ายังไม่ได้รับของ แต่สถานะขึ้นว่านำจ่ายสำเร็จแล้ว..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>ชื่อผู้แจ้ง:</label>
                <input className="form-control" value={reporterName} onChange={e => setReporterName(e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Paperclip size={13} /> หลักฐานแนบ ({attachments.length} ไฟล์):
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    className="form-control"
                    placeholder="ชื่อไฟล์ เช่น รูปกล่องเสียหาย.jpg"
                    value={newAttachment}
                    onChange={e => setNewAttachment(e.target.value)}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (newAttachment.trim()) {
                        setAttachments([...attachments, newAttachment.trim()]);
                        setNewAttachment('');
                      }
                    }}
                  >
                    + แนบ
                  </button>
                </div>
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {attachments.map((file, i) => (
                      <span
                        key={`${file}-${i}`}
                        style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}
                      >
                        {file}
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                          style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', marginLeft: 4 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Official request email sent together with the report */}
            <div
              style={{
                background: includeEmail ? 'var(--myorder-teal-light)' : '#F8FAFC',
                border: `1px solid ${includeEmail ? 'var(--myorder-teal-border)' : 'var(--thp-border)'}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={includeEmail}
                  onChange={e => {
                    setIncludeEmail(e.target.checked);
                    if (e.target.checked) applyEmailDraft(emailType);
                  }}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--myorder-teal)' }}
                />
                <Mail size={16} color={includeEmail ? 'var(--myorder-teal)' : 'var(--thp-muted)'} />
                <span>ส่งอีเมลคำร้องทางการถึง ปณท พร้อมแจ้งปัญหา (ขอตีกลับ / เปลี่ยนที่อยู่ / แนบหลักฐาน)</span>
              </label>

              {includeEmail && (
                <>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(Object.keys(EMAIL_REQUEST_TYPE_LABEL) as EmailRequestType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        className="btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.65rem',
                          background: emailType === type ? '#FFFFFF' : 'transparent',
                          borderColor: emailType === type ? 'var(--myorder-teal)' : '#CBD5E1',
                          color: emailType === type ? 'var(--myorder-teal-dark)' : 'inherit',
                          fontWeight: emailType === type ? 700 : 500
                        }}
                        onClick={() => applyEmailDraft(type)}
                      >
                        {EMAIL_REQUEST_TYPE_LABEL[type]}
                      </button>
                    ))}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>ส่งถึง (To):</label>
                      <input type="email" className="form-control" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>สำเนา (CC):</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="อีเมลร้านค้า (ถ้ามี)"
                        value={emailCc}
                        onChange={e => setEmailCc(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>หัวข้ออีเมล (Subject):</label>
                    <input className="form-control" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>ข้อความคำร้องในอีเมล:</label>
                    <textarea className="form-control" rows={4} value={emailBody} onChange={e => setEmailBody(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Paperclip size={13} /> เอกสารแนบคำร้อง ({emailAttachments.length} ไฟล์):
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {emailAttachments.map((file, i) => (
                        <span key={`${file}-${i}`} style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                          {file}
                          <button
                            type="button"
                            onClick={() => setEmailAttachments(emailAttachments.filter((_, idx) => idx !== i))}
                            style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', marginLeft: 4 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        className="form-control"
                        style={{ flex: 1, minWidth: 0, fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                        placeholder="พิมพ์ชื่อไฟล์ เช่น สำเนาบัตรประชาชน_ผู้รับ.jpg"
                        value={newEmailAttachment}
                        onChange={e => setNewEmailAttachment(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}
                        onClick={() => {
                          if (newEmailAttachment.trim()) {
                            setEmailAttachments([...emailAttachments, newEmailAttachment.trim()]);
                            setNewEmailAttachment('');
                          }
                        }}
                      >
                        + แนบไฟล์
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-myorder" disabled={isSubmitting || blockedByDuplicate || !description.trim()}>
              <Send size={15} />
              {isSubmitting
                ? 'กำลังส่งเรื่องเข้าระบบ ปณ....'
                : existingCase
                ? includeEmail
                  ? 'สร้างเคสใหม่ + ส่งอีเมลคำร้อง'
                  : 'สร้างเคสใหม่'
                : includeEmail
                ? 'ส่งเรื่อง + อีเมลคำร้องถึงไปรษณีย์ไทย'
                : 'ส่งเรื่องถึงไปรษณีย์ไทย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
