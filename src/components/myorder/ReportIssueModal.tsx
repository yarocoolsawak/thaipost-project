import React, { useState } from 'react';
import type { CaseItem, EmailRequestType, IssueCategory, UrgencyLevel } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { DuplicateAlert } from '../common/DuplicateAlert';
import { notify } from '../../utils/dialog';
import type { MyOrder } from '../../data/myOrders';
import { KNOWN_PARCELS } from '../../services/trackTraceApi';
import { useMyOrder } from '../../context/MyOrderContext';
import type { ReportIssueResult } from '../../context/MyOrderContext';
import { buildEmailDraft, DEFAULT_REQUEST_EMAIL_TO, EMAIL_REQUEST_TYPE_LABEL, EMAIL_RULES } from '../../utils/emailTemplates';
import { RequestEmailEditor, type EmailDraft } from './RequestEmailEditor';
import { AlertTriangle, Paperclip, Send, X, Info, Mail } from 'lucide-react';

interface ReportIssueModalProps {
  order: MyOrder;
  onClose: () => void;
  onReported: (result: ReportIssueResult) => void;
  onFollowExisting: (existingCase: CaseItem) => void;
}

const CATEGORY_OPTIONS: { value: IssueCategory; label: string }[] = [
  { value: 'EXPEDITE_REQUEST', label: '⚡ ขอเร่งนำส่ง (ขอเร่งรัดนำจ่าย)' },
  { value: 'CLOSE_WORK_REQUEST', label: '✓ แจ้งปิดงาน (ปลายทางได้รับสินค้าแล้วแต่สถานะยังไม่สำเร็จ)' },
  { value: 'REDELIVERY_REQUEST', label: '🔄 เร่งนำจ่ายใหม่อีกครั้ง / นำจ่ายใหม่' },
  { value: 'RETURN_OR_REVERSE', label: '↩️ แจ้งตีกลับ (ขอส่งคืนต้นทาง) — ต้องส่งอีเมล' },
  { value: 'CHANGE_ADDRESS_REQUEST', label: '📍 ขอเปลี่ยนที่อยู่ / เบอร์โทรผู้รับ — ต้องส่งอีเมล' },
  { value: 'NOT_RECEIVED', label: 'สถานะส่งสำเร็จ แต่ลูกค้ายังไม่ได้รับของ' },
  { value: 'DELAYED_DELIVERY', label: 'พัสดุล่าช้า / สถานะไม่อัปเดต' },
  { value: 'DAMAGED_PARCEL', label: 'พัสดุชำรุด / สินค้าเสียหาย' },
  { value: 'WRONG_BRANCH', label: 'ส่งผิดที่อยู่ / ผิดสาขา' },
  { value: 'CANNOT_LOCATE', label: 'ค้นหาพัสดุไม่พบ' },
  { value: 'OTHER', label: 'อื่นๆ' }
];

const QUICK_TEMPLATES: { label: string; category: IssueCategory; text: string }[] = [
  {
    label: 'ตัวอย่าง 1: แจ้งปิดงาน',
    category: 'CLOSE_WORK_REQUEST',
    text: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยนะครับ ร้านค้าสอบถามผู้รับปลายทางแจ้งได้รับพัสดุเรียบร้อยแล้ว สถานะยังไม่อัปเดตปิดงานตั้งแต่วันที่ 05/10/69 ครับ'
  },
  {
    label: 'ตัวอย่าง 2: นำส่งใหม่',
    category: 'REDELIVERY_REQUEST',
    text: 'รบกวนประสานงานเจ้าหน้าที่ติดต่อนำส่งใหม่ให้หน่อยนะครับ ร้านค้าสอบถามผู้รับแจ้งว่ายังไม่ได้รับการติดต่อจากเจ้าหน้าที่ครับ'
  },
  {
    label: 'ตัวอย่าง 3: ยกเลิกตีกลับ นำส่งใหม่',
    category: 'REDELIVERY_REQUEST',
    text: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบถอยสถานะตีกลับและแจ้งนำส่งใหม่ให้หน่อยนะครับ สถานะพัสดุไม่อัปเดตเคลื่อนไหว ค้างระหว่างส่งต่อตั้งแต่วันที่ 03/10/69 และสถานะอัปเดตอีกครั้งวันนี้ 07/10/69 ส่งคืนต้นทางโดยยังไม่มีการนำจ่ายครับ ไม่ทราบว่าพัสดุติดปัญหาส่วนใดครับ'
  },
  {
    label: 'ตัวอย่าง 4: เร่งนำส่ง (ปฏิเสธรับเท็จ)',
    category: 'EXPEDITE_REQUEST',
    text: 'รบกวนประสานงานเจ้าหน้าที่เร่งนำส่งให้หน่อยนะครับ เจ้าหน้าที่่ลงสถานะปฏิเสธรับ ผู้รับยืนยันไม่ได้ปฏิเสธรับและยังไม่มีเจ้าหน้าที่โทรติดต่อผู้รับปลายทางเลยครับ'
  }
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

  // Official request email sent together with the report: required for some problem types, optional for the rest
  const draftFor = (type: EmailRequestType, contact: string): EmailDraft => ({
    to: DEFAULT_REQUEST_EMAIL_TO,
    requestType: type,
    attachments: [`หนังสือแจ้งคำร้อง_${order.trackingNumber}.pdf`, 'สำเนาใบเสร็จรับฝาก_ปณท.jpg'],
    ...buildEmailDraft(type, {
      trackingNumber: order.trackingNumber || '',
      shopName: currentShop.name,
      contactPerson: contact || currentShop.ownerName,
      originPostOffice: parcel?.originPostOffice,
      destPostOffice: parcel?.destPostOffice,
      receiverName: order.customerName,
      receiverAddress: order.shippingAddress
    })
  });
  const rule = EMAIL_RULES[category];
  const [includeEmail, setIncludeEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>(() => draftFor(rule?.type || 'RETURN_PARCEL', reporterName));
  const emailOn = !!rule?.required || includeEmail;
  const emailIncomplete = emailOn && (!emailDraft.subject.trim() || !emailDraft.body.trim());

  const changeCategory = (next: IssueCategory) => {
    const nextRule = EMAIL_RULES[next];
    if (nextRule) {
      // Show the matching email straight away (it must be sent for required types)
      setEmailDraft(draftFor(nextRule.type, reporterName.trim()));
      setIncludeEmail(nextRule.required);
    } else if (rule?.required) {
      setIncludeEmail(false);
    }
    setCategory(next);
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
        emailDispatch: emailOn
          ? { ...emailDraft, to: emailDraft.to || DEFAULT_REQUEST_EMAIL_TO, subject: emailDraft.subject.trim(), body: emailDraft.body.trim() }
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
                <select className="form-control" value={category} onChange={e => changeCategory(e.target.value as IssueCategory)}>
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
                  <option value="CRITICAL">ด่วนมาก (สินค้ามูลค่าสูง)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ margin: 0 }}>รายละเอียดปัญหา:</label>
                <span style={{ fontSize: '0.74rem', color: 'var(--thp-muted)' }}>คลิกข้อความตัวอย่างเพื่อกรอกเร็ว:</span>
              </div>

              {/* Quick Template Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {QUICK_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      changeCategory(tpl.category);
                      setDescription(tpl.text);
                    }}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '5px',
                      background: category === tpl.category ? '#ECFDF5' : '#F1F5F9',
                      border: `1px solid ${category === tpl.category ? '#A7F3D0' : '#CBD5E1'}`,
                      color: category === tpl.category ? '#065F46' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

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
                background: emailOn ? 'var(--myorder-teal-light)' : '#F8FAFC',
                border: `1px solid ${emailOn ? 'var(--myorder-teal-border)' : 'var(--thp-border)'}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              {rule?.required ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Mail size={16} color="var(--myorder-teal)" />
                  <span>อีเมลคำร้องถึง ปณท: {EMAIL_REQUEST_TYPE_LABEL[rule.type]} (ต้องส่ง)</span>
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={includeEmail}
                    onChange={e => setIncludeEmail(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--myorder-teal)' }}
                  />
                  <Mail size={16} color={includeEmail ? 'var(--myorder-teal)' : 'var(--thp-muted)'} />
                  <span>
                    {rule
                      ? `ส่งอีเมลคำร้องถึง ปณท: ${EMAIL_REQUEST_TYPE_LABEL[rule.type]} (ไม่บังคับ)`
                      : 'ส่งอีเมลคำร้องทางการถึง ปณท พร้อมแจ้งปัญหา (ขอตีกลับ / เปลี่ยนที่อยู่ / แนบหลักฐาน)'}
                  </span>
                </label>
              )}
              {rule && (
                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', color: rule.required ? '#065F46' : '#92400E' }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{rule.note}</span>
                </div>
              )}

              {emailOn && (
                <>
                  {!rule && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {(Object.keys(EMAIL_REQUEST_TYPE_LABEL) as EmailRequestType[]).map(type => (
                        <button
                          key={type}
                          type="button"
                          className="btn-secondary"
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.65rem',
                            background: emailDraft.requestType === type ? '#FFFFFF' : 'transparent',
                            borderColor: emailDraft.requestType === type ? 'var(--myorder-teal)' : '#CBD5E1',
                            color: emailDraft.requestType === type ? 'var(--myorder-teal-dark)' : 'inherit',
                            fontWeight: emailDraft.requestType === type ? 700 : 500
                          }}
                          onClick={() => setEmailDraft({ ...emailDraft, ...draftFor(type, reporterName.trim()), to: emailDraft.to, cc: emailDraft.cc, attachments: emailDraft.attachments })}
                        >
                          {EMAIL_REQUEST_TYPE_LABEL[type]}
                        </button>
                      ))}
                    </div>
                  )}
                  <RequestEmailEditor draft={emailDraft} onChange={setEmailDraft} />
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
            <button type="submit" className="btn-myorder" disabled={isSubmitting || blockedByDuplicate || !description.trim() || emailIncomplete}>
              <Send size={15} />
              {isSubmitting
                ? 'กำลังส่งเรื่องเข้าระบบ ปณ....'
                : existingCase
                ? emailOn
                  ? 'สร้างเคสใหม่ + ส่งอีเมลคำร้อง'
                  : 'สร้างเคสใหม่'
                : emailOn
                ? 'ส่งเรื่อง + อีเมลคำร้องถึงไปรษณีย์ไทย'
                : 'ส่งเรื่องถึงไปรษณีย์ไทย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
