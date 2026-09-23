import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { SlaBadge } from './SlaBadge';
import { TrackingTimeline } from './TrackingTimeline';
import { DuplicateChip, OrderRefChip } from './CecAssignment';
import {
  X,
  Building2,
  Calendar,
  MessageSquare,
  History,
  PhoneForwarded,
  Truck,
  CheckCircle2,
  Send,
  Lock,
  CornerDownRight,
  Mail,
  Paperclip,
  FileText
} from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: CaseItem;
  onClose: () => void;
  onOpenReviewAnswer?: (caseItem: CaseItem) => void;
  onOpenEscalateBranch?: (caseItem: CaseItem) => void;
  onOpenDispatchCec?: (caseItem: CaseItem) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem: initialCaseItem,
  onClose,
  onOpenReviewAnswer,
  onOpenEscalateBranch,
  onOpenDispatchCec
}) => {
  const { role, addChatMessage, closeCase, cases } = useCases();
  const caseItem = cases.find(c => c.id === initialCaseItem.id) || initialCaseItem;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRACKING' | 'CHAT' | 'EMAILS' | 'BRANCH' | 'AUDIT'>('OVERVIEW');
  const [newChatText, setNewChatText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const senderName =
      role === 'CENTRAL'
        ? 'ปณ.ส่วนกลาง'
        : role === 'CEC'
        ? `CEC ${caseItem.assignedCecId}`
        : role === 'MERCHANT'
        ? `${caseItem.contactPerson} (${caseItem.companyName})`
        : role === 'MYORDER_ADMIN'
        ? 'แอดมิน MyOrder'
        : 'สาขาปลายทาง';

    addChatMessage(caseItem.id, newChatText.trim(), role, senderName, isInternalNote);
    setNewChatText('');
  };

  const handleCloseCaseAction = () => {
    if (window.confirm(`ต้องการปิดเคส ${caseItem.id} ใช่หรือไม่?`)) {
      closeCase(caseItem.id, 'เจ้าหน้าที่ตรวจสอบและดำเนินการปิดเคสเรียบร้อย');
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card large" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--thp-dark)' }}>
              {caseItem.id}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-en)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--thp-red)',
                background: '#FEE2E2',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}
            >
              {caseItem.trackingNumber}
            </span>
            <span className={`status-badge ${caseItem.status}`}>{caseItem.status}</span>
            <OrderRefChip caseItem={caseItem} />
            <DuplicateChip caseItem={caseItem} />
            <SlaBadge
              deadlineIso={caseItem.slaDeadline}
              isExceeded={caseItem.isSlaExceeded}
              status={caseItem.status}
            />
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem 1.5rem 0',
            background: '#F8FAFC',
            borderBottom: '1px solid var(--thp-border)'
          }}
        >
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <Building2 size={15} /> สรุปเคส & ข้อมูลพัสดุ
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'TRACKING' ? 'active' : ''}`}
            onClick={() => setActiveTab('TRACKING')}
          >
            <Truck size={15} /> Track & Trace API ({caseItem.parcelInfo.events?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'CHAT' ? 'active' : ''}`}
            onClick={() => setActiveTab('CHAT')}
          >
            <MessageSquare size={15} /> ประวัติแชท ({caseItem.chatHistory?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'EMAILS' ? 'active' : ''}`}
            onClick={() => setActiveTab('EMAILS')}
            style={
              caseItem.emails && caseItem.emails.length > 0
                ? {
                    background: activeTab === 'EMAILS' ? '#0F172A' : '#EFF6FF',
                    borderColor: '#93C5FD',
                    color: activeTab === 'EMAILS' ? '#FFFFFF' : '#1D4ED8',
                    fontWeight: 600
                  }
                : {}
            }
          >
            <Mail size={15} /> อีเมลคำร้อง & เอกสาร ({caseItem.emails?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'BRANCH' ? 'active' : ''}`}
            onClick={() => setActiveTab('BRANCH')}
          >
            <PhoneForwarded size={15} /> บันทึกติดต่อสาขา ({caseItem.branchContactLogs?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
            onClick={() => setActiveTab('AUDIT')}
          >
            <History size={15} /> Audit & Dispatch Log ({caseItem.activityLogs?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Banner: CEC Answer Waiting Review if applicable */}
              {caseItem.status === 'WAITING_CENTRAL_REVIEW' && caseItem.cecReply && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '2px solid #3B82F6',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.95rem' }}>
                      ⚡ คำตอบจาก CEC รอ ปณ.ส่วนกลาง ตรวจสอบก่อนส่งกลับร้านค้า (FR 07)
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      ตอบเมื่อ: {new Date(caseItem.cecReply.repliedAt).toLocaleTimeString('th-TH')} โดย {caseItem.cecReply.repliedBy}
                    </span>
                  </div>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #BFDBFE',
                      fontSize: '0.9rem',
                      lineHeight: 1.5
                    }}
                  >
                    "{caseItem.cecReply.answer}"
                  </div>
                  {caseItem.cecReply.branchNotes && (
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>
                      <strong>หมายเหตุประสานงานสาขา:</strong> {caseItem.cecReply.branchNotes}
                    </div>
                  )}
                  {role === 'CENTRAL' && onOpenReviewAnswer && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => onOpenReviewAnswer(caseItem)}
                      >
                        <CheckCircle2 size={16} /> ตรวจสอบคำตอบ & ส่งให้ร้านค้า
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Grid 2 Cols: Customer Request vs Postal Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
                {/* Inquiry Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--thp-border)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--thp-dark)' }}>
                    รายละเอียดการรับเรื่อง (Customer Inquiry)
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: '0.4rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--thp-muted)' }}>ร้านค้า (MyOrder):</span>
                    <strong>{caseItem.companyName}</strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้แจ้ง:</span>
                    <span>{caseItem.contactPerson}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>คำสั่งซื้อ:</span>
                    <span style={{ color: '#0F766E', fontWeight: 600 }}>{caseItem.myOrderRef.orderId}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>หมวดปัญหา:</span>
                    <span className="category-chip" style={{ width: 'fit-content' }}>
                      {caseItem.category}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>ระดับความเร่งด่วน:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          caseItem.urgency === 'CRITICAL'
                            ? '#DC2626'
                            : caseItem.urgency === 'HIGH'
                            ? '#EA580C'
                            : '#16A34A'
                      }}
                    >
                      {caseItem.urgency}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>สร้างเมื่อ:</span>
                    <span>
                      <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(caseItem.createdAt).toLocaleString('th-TH')}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--thp-muted)' }}>
                      ข้อความที่ร้านค้าแจ้ง:
                    </div>
                    <div
                      style={{
                        marginTop: '0.25rem',
                        padding: '0.75rem',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.88rem',
                        lineHeight: 1.5
                      }}
                    >
                      {caseItem.customerInquiry}
                    </div>
                  </div>
                </div>

                {/* Postal Info Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--thp-border)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--thp-dark)' }}>
                    ข้อมูลพัสดุ ปณท (API Integration)
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: '0.4rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--thp-muted)' }}>ต้นทาง:</span>
                    <span>{caseItem.parcelInfo.originPostOffice}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>ปลายทาง:</span>
                    <strong style={{ color: '#B91C1C' }}>{caseItem.parcelInfo.destPostOffice}</strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้รับปลายทาง:</span>
                    <span>{caseItem.parcelInfo.receiverName}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>เบอร์โทรผู้รับ:</span>
                    <span>{caseItem.parcelInfo.receiverPhone}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>กลุ่ม CEC ที่ดูแล:</span>
                    <span style={{ color: '#4338CA', fontWeight: 600 }}>
                      {caseItem.assignedCecName || 'รอระบุ CEC (สถานะพัสดุยังไม่ยืนยันปลายทาง)'}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้เซ็นรับ (POD):</span>
                    <span style={{ fontWeight: 600, color: caseItem.parcelInfo.signerName ? '#059669' : '#94A3B8' }}>
                      {caseItem.parcelInfo.signerName || 'ยังไม่มีผู้เซ็นรับ'}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>ที่อยู่จัดส่ง:</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--thp-slate)', marginTop: '2px' }}>
                      {caseItem.parcelInfo.receiverAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Review Completed Banner once the answer is sent back to the shop */}
              {caseItem.centralReview && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065F46', fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>คำตอบผ่านการตรวจสอบโดย ปณ.ส่วนกลาง และส่งกลับร้านค้าผ่าน MyOrder แล้ว</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#047857', background: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #D1FAE5' }}>
                    {caseItem.centralReview.approvedAnswer}
                  </div>
                </div>
              )}

              {/* Official Email Notification Banner if any emails sent */}
              {caseItem.emails && caseItem.emails.length > 0 && (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#DCFCE7',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.88rem' }}>
                        มีจดหมายทางการแจ้ง ปณท. แล้ว {caseItem.emails.length} ฉบับ
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#15803D' }}>
                        หัวข้อล่าสุด: "{caseItem.emails[caseItem.emails.length - 1].subject}"
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveTab('EMAILS')}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    ดูรายละเอียดอีเมล & ไฟล์แนบ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRACK & TRACE */}
          {activeTab === 'TRACKING' && (
            <TrackingTimeline
              events={caseItem.parcelInfo.events}
              currentStatus={caseItem.parcelInfo.currentPostalStatus}
            />
          )}

          {/* TAB 3: CHAT HISTORY */}
          {activeTab === 'CHAT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="chat-log-container">
                {caseItem.chatHistory.map(chat => (
                  <div
                    key={chat.id}
                    className={`chat-bubble ${
                      chat.isInternalNote
                        ? 'internal'
                        : chat.senderRole === 'CENTRAL'
                        ? 'central'
                        : chat.senderRole === 'CEC'
                        ? 'cec'
                        : 'customer'
                    }`}
                  >
                    <div className="chat-author">
                      <span>{chat.senderName}</span>
                      <span>{new Date(chat.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{chat.message}</div>
                  </div>
                ))}
              </div>

              {/* Send Chat Form */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`พิมพ์ข้อความในนาม ${role}...`}
                    value={newChatText}
                    onChange={e => setNewChatText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    <Send size={15} /> ส่ง
                  </button>
                </div>
                {role === 'CENTRAL' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--thp-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={e => setIsInternalNote(e.target.checked)}
                    />
                    <Lock size={12} /> โน้ตภายใน (Internal Note เฉพาะ ปณ.ส่วนกลาง & CEC)
                  </label>
                )}
              </form>
            </div>
          )}

          {/* TAB 4: EMAILS & OFFICIAL DISPATCH */}
          {activeTab === 'EMAILS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--thp-border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--thp-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={18} color="#2563EB" />
                    <span>อีเมลคำร้องทางการ & หลักฐานแนบ</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '12px', fontWeight: 600 }}>
                      {caseItem.emails?.length || 0} ฉบับ
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--thp-muted)', marginTop: '2px' }}>
                    อีเมลคำร้องที่ร้านค้าส่งถึงไปรษณีย์ไทยผ่าน MyOrder (เช่น แจ้งตีกลับ หรือขอเปลี่ยนแปลงข้อมูลผู้รับ)
                  </div>
                </div>

              </div>

              {/* Email List or Empty State */}
              {!caseItem.emails || caseItem.emails.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px dashed #CBD5E1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--thp-muted)'
                    }}
                  >
                    <Mail size={24} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--thp-dark)', fontSize: '0.92rem' }}>
                    ยังไม่มีประวัติการส่งอีเมลคำร้องสำหรับเคสนี้
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--thp-muted)', maxWidth: '420px', lineHeight: 1.4 }}>
                    ร้านค้าสามารถส่งหนังสือขอตีกลับพัสดุ ขอแก้ไขที่อยู่จัดส่ง หรือแนบหลักฐานเพิ่มเติม ได้จากหน้าเคสใน MyOrder
                  </div>
                </div>
              ) : (
                caseItem.emails.map((email, idx) => (
                  <div
                    key={email.id || idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Top Row: Type Badge + Subject + Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            background:
                              email.requestType === 'RETURN_PARCEL'
                                ? '#FEF3C7'
                                : email.requestType === 'CHANGE_ADDRESS'
                                ? '#DBEAFE'
                                : '#EDE9FE',
                            color:
                              email.requestType === 'RETURN_PARCEL'
                                ? '#92400E'
                                : email.requestType === 'CHANGE_ADDRESS'
                                ? '#1E40AF'
                                : '#5B21B6'
                          }}
                        >
                          {email.requestType === 'RETURN_PARCEL'
                            ? '📦 แจ้งขอตีกลับต้นทาง'
                            : email.requestType === 'CHANGE_ADDRESS'
                            ? '📝 แจ้งเปลี่ยนข้อมูลจ่าหน้า'
                            : '📎 แนบเอกสาร/หลักฐาน'}
                        </span>
                        <strong style={{ fontSize: '0.96rem', color: 'var(--thp-dark)' }}>
                          {email.subject}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--thp-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> ส่งออกสำเร็จ
                        </span>
                        <span>•</span>
                        <span>{new Date(email.sentAt).toLocaleString('th-TH')}</span>
                      </div>
                    </div>

                    {/* Email Headers: To, CC, Sender */}
                    <div
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.8rem',
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr',
                        rowGap: '0.3rem',
                        columnGap: '0.5rem',
                        border: '1px solid #F1F5F9'
                      }}
                    >
                      <span style={{ color: 'var(--thp-muted)' }}>ส่งถึง (To):</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--thp-dark)' }}>{email.to}</span>

                      {email.cc && (
                        <>
                          <span style={{ color: 'var(--thp-muted)' }}>สำเนา (CC):</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--thp-slate)' }}>{email.cc}</span>
                        </>
                      )}

                      <span style={{ color: 'var(--thp-muted)' }}>ผู้ส่ง:</span>
                      <span style={{ color: 'var(--thp-slate)' }}>{email.senderName}</span>
                    </div>

                    {/* Email Message Content */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '0.9rem',
                        fontSize: '0.86rem',
                        lineHeight: 1.6,
                        color: 'var(--thp-dark)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit'
                      }}
                    >
                      {email.body}
                    </div>

                    {/* Attachments Section */}
                    {email.attachments && email.attachments.length > 0 && (
                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.6rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--thp-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Paperclip size={13} />
                          <span>เอกสารแนบ ({email.attachments.length} ไฟล์):</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {email.attachments.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.8rem',
                                color: 'var(--thp-dark)'
                              }}
                            >
                              <FileText size={14} color="#2563EB" />
                              <span style={{ fontWeight: 500 }}>{file}</span>
                              <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>[แนบในระบบแล้ว]</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: BRANCH CONTACT LOGS */}
          {activeTab === 'BRANCH' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {caseItem.branchContactLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--thp-muted)', fontSize: '0.88rem' }}>
                  ยังไม่มีการโทรสายตรงติดต่อสาขาปลายทาง
                  {caseItem.isSlaExceeded && role === 'CENTRAL' && onOpenEscalateBranch && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => onOpenEscalateBranch(caseItem)}
                      >
                        <PhoneForwarded size={16} /> โทรประสานสาขาปลายทางโดยตรง (Escalate)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                caseItem.branchContactLogs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, color: '#BE123C', fontSize: '0.9rem' }}>
                        {log.branchName} • เจ้าหน้าที่ {log.officerName} ({log.officerPhone})
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        บันทึกเมื่อ: {new Date(log.timestamp).toLocaleString('th-TH')} โดย {log.recordedBy}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#9F1239' }}>
                      <strong>เหตุผลที่ติดต่อ:</strong> {log.contactReason}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#881337', background: '#FFFFFF', padding: '0.6rem', borderRadius: '6px', border: '1px solid #FEE2E2' }}>
                      <strong>ผลการประสานงาน:</strong> {log.outcome}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: AUDIT & DISPATCH LOG */}
          {activeTab === 'AUDIT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--thp-muted)' }}>
                บันทึกการทำงานของระบบและเจ้าหน้าที่ทุกระดับ (FR 10: Dispatch & Activity Log):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {caseItem.activityLogs.map(act => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <CornerDownRight size={15} style={{ color: '#0284C7', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: 'var(--thp-dark)' }}>
                          {act.action} ({act.actorName})
                        </span>
                        <span style={{ color: 'var(--thp-muted)', fontSize: '0.75rem' }}>
                          {new Date(act.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div style={{ color: 'var(--thp-slate)', marginTop: '2px' }}>{act.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Role Context Actions */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            ปิดหน้าต่าง
          </button>

          {/* Central Role Actions */}
          {role === 'CENTRAL' && (
            <>
              {(caseItem.status === 'NEW' ||
                caseItem.status === 'CENTRAL_REVIEWING' ||
                (caseItem.assignedCecId === undefined && caseItem.status !== 'CLOSED')) &&
                onOpenDispatchCec && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onOpenDispatchCec(caseItem)}
                >
                  <Send size={15} /> {caseItem.assignedCecId === undefined ? 'ระบุ CEC ผู้รับผิดชอบ' : 'ส่งงานเข้า CEC 14 กลุ่ม'}
                </button>
              )}

              {caseItem.status === 'WAITING_CENTRAL_REVIEW' && onOpenReviewAnswer && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onOpenReviewAnswer(caseItem)}
                >
                  <CheckCircle2 size={15} /> ตรวจสอบคำตอบ (Review Answer)
                </button>
              )}

              {(caseItem.isSlaExceeded || caseItem.status === 'SLA_EXCEEDED') && onOpenEscalateBranch && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onOpenEscalateBranch(caseItem)}
                >
                  <PhoneForwarded size={15} /> โทรสายตรงสาขาปลายทาง
                </button>
              )}

              {caseItem.status !== 'CLOSED' && (
                <button type="button" className="btn-success" onClick={handleCloseCaseAction}>
                  <CheckCircle2 size={15} /> ปิดเคส (Close Case)
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
