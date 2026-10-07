import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { SlaBadge } from './SlaBadge';
import { TrackingTimeline } from './TrackingTimeline';
import { DuplicateChip, OrderRefChip } from './CecAssignment';
import { CloseCaseModal } from './CloseCaseModal';
import { evaluateCaseSla, formatThaiDate } from '../../utils/slaCalculator';
import { CaseStatusBadge, getCategoryShortLabel, formatPostalStatus } from './StatusBadge';
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
  FileText,
  Camera,
  PhoneCall,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: CaseItem;
  onClose: () => void;
  onOpenReviewAnswer?: (caseItem: CaseItem) => void;
  onOpenEscalateBranch?: (caseItem: CaseItem) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem: initialCaseItem,
  onClose,
  onOpenReviewAnswer,
  onOpenEscalateBranch
}) => {
  const { role, addChatMessage, cases } = useCases();
  const caseItem = cases.find(c => c.id === initialCaseItem.id) || initialCaseItem;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRACKING' | 'CHAT' | 'EMAILS' | 'BRANCH' | 'AUDIT'>('OVERVIEW');
  const [newChatText, setNewChatText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const slaInfo = evaluateCaseSla(caseItem);

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
    setIsCloseModalOpen(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card large" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--thp-dark)' }}>
              {caseItem.id}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-en)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--thp-red)',
                background: '#FEE2E2',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px'
              }}
            >
              {caseItem.trackingNumber}
            </span>
            <CaseStatusBadge status={caseItem.status} />
            <OrderRefChip caseItem={caseItem} />
            <DuplicateChip caseItem={caseItem} />
            <SlaBadge
              deadlineIso={caseItem.slaDeadline}
              isExceeded={caseItem.isSlaExceeded}
              status={caseItem.status}
            />
          </div>
          <button type="button" className="close-btn" onClick={onClose} title="ปิด">
            <X size={20} />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.4rem 1.25rem 0',
            background: '#F8FAFC',
            borderBottom: '1px solid var(--thp-border)',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <Building2 size={14} /> สรุปเคส
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'TRACKING' ? 'active' : ''}`}
            onClick={() => setActiveTab('TRACKING')}
          >
            <Truck size={14} /> สถานะพัสดุ ({caseItem.parcelInfo.events?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'CHAT' ? 'active' : ''}`}
            onClick={() => setActiveTab('CHAT')}
          >
            <MessageSquare size={14} /> แชท ({caseItem.chatHistory?.length || 0})
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
            <Mail size={14} /> อีเมล ({caseItem.emails?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'BRANCH' ? 'active' : ''}`}
            onClick={() => setActiveTab('BRANCH')}
          >
            <PhoneForwarded size={14} /> ติดต่อสาขา ({caseItem.branchContactLogs?.length || 0})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
            onClick={() => setActiveTab('AUDIT')}
          >
            <History size={14} /> ประวัติ ({caseItem.activityLogs?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Top Banner: CEC Answer Waiting Review if applicable */}
              {caseItem.status === 'WAITING_CENTRAL_REVIEW' && caseItem.cecReply && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1.5px solid #3B82F6',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.92rem' }}>
                      ⚡ คำตอบจาก CEC (รอตรวจสอบก่อนตอบร้านค้า)
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      ตอบเมื่อ: {new Date(caseItem.cecReply.repliedAt).toLocaleTimeString('th-TH')} โดย {caseItem.cecReply.repliedBy}
                    </span>
                  </div>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #BFDBFE',
                      fontSize: '0.88rem',
                      lineHeight: 1.45,
                      color: '#1E293B'
                    }}
                  >
                    "{caseItem.cecReply.answer}"
                  </div>
                  {caseItem.cecReply.branchNotes && (
                    <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <strong>หมายเหตุประสานงานสาขา:</strong> {caseItem.cecReply.branchNotes}
                    </div>
                  )}
                  {role === 'CENTRAL' && onOpenReviewAnswer && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.15rem' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                        onClick={() => onOpenReviewAnswer(caseItem)}
                      >
                        <CheckCircle2 size={15} /> ตรวจคำตอบ & ส่งร้านค้า
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Grid 2 Cols: Customer Request vs Postal Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                {/* Inquiry Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--thp-border)',
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--thp-dark)' }}>
                    ข้อมูลคำร้องจากร้านค้า
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr',
                      gap: '0.35rem',
                      fontSize: '0.84rem'
                    }}
                  >
                    <span style={{ color: 'var(--thp-muted)' }}>ร้านค้า:</span>
                    <strong>{caseItem.companyName}</strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้แจ้ง:</span>
                    <span>{caseItem.contactPerson}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>คำสั่งซื้อ:</span>
                    <span style={{ color: '#0F766E', fontWeight: 600 }}>{caseItem.myOrderRef.orderId}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>หมวดปัญหา:</span>
                    <span
                      style={{
                        width: 'fit-content',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.5rem',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      {getCategoryShortLabel(caseItem.category)}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>ความเร่งด่วน:</span>
                    <span>
                      {caseItem.urgency === 'CRITICAL' ? (
                        <span style={{ color: '#DC2626', fontWeight: 700 }}>⚡ ด่วนที่สุด</span>
                      ) : caseItem.urgency === 'HIGH' ? (
                        <span style={{ color: '#EA580C', fontWeight: 700 }}>ด่วน</span>
                      ) : (
                        <span style={{ color: '#16A34A', fontWeight: 600 }}>ปกติ</span>
                      )}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>เวลาแจ้ง:</span>
                    <span style={{ fontSize: '0.8rem' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {new Date(caseItem.createdAt).toLocaleString('th-TH')}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--thp-muted)', marginBottom: '0.25rem' }}>
                      ข้อความที่ร้านค้าแจ้ง:
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.8rem',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.85rem',
                        lineHeight: 1.45,
                        color: 'var(--thp-dark)',
                        maxHeight: '120px',
                        overflowY: 'auto'
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
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--thp-dark)' }}>
                    ข้อมูลพัสดุ ปณท
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '95px 1fr',
                      gap: '0.35rem',
                      fontSize: '0.84rem'
                    }}
                  >
                    <span style={{ color: 'var(--thp-muted)' }}>สถานะพัสดุ:</span>
                    <strong style={{ color: caseItem.parcelInfo.currentPostalStatus?.includes('สำเร็จ') ? '#059669' : 'var(--thp-dark)' }}>
                      {formatPostalStatus(caseItem.parcelInfo.currentPostalStatus)}
                    </strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ต้นทาง:</span>
                    <span>{caseItem.parcelInfo.originPostOffice}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>ปลายทาง:</span>
                    <strong style={{ color: '#B91C1C' }}>{caseItem.parcelInfo.destPostOffice}</strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้รับ:</span>
                    <span>{caseItem.parcelInfo.receiverName} ({caseItem.parcelInfo.receiverPhone})</span>

                    <span style={{ color: 'var(--thp-muted)' }}>กลุ่ม CEC:</span>
                    <span style={{ color: '#4338CA', fontWeight: 600 }}>
                      {caseItem.assignedCecName || 'รอระบุ CEC'}
                    </span>

                    <span style={{ color: 'var(--thp-muted)' }}>ผู้เซ็นรับ:</span>
                    <span style={{ fontWeight: 600, color: caseItem.parcelInfo.signerName ? '#059669' : '#94A3B8' }}>
                      {caseItem.parcelInfo.signerName || 'ยังไม่มีผู้เซ็นรับ'}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>ที่อยู่จัดส่ง:</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--thp-slate)', marginTop: '2px', lineHeight: 1.35 }}>
                      {caseItem.parcelInfo.receiverAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row: SLA Breakdown Card & Proof Evidence Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                {/* 1. SLA Breakdown Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--thp-dark)' }}>
                      <Clock size={15} color="var(--thp-red)" />
                      <span>กำหนดเวลา SLA</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '4px',
                        background: slaInfo.targetDays === 3 ? '#EFF6FF' : '#FDF4FF',
                        color: slaInfo.targetDays === 3 ? '#1D4ED8' : '#86198F',
                        border: `1px solid ${slaInfo.targetDays === 3 ? '#BFDBFE' : '#F0ABFC'}`
                      }}
                    >
                      {slaInfo.targetDays === 3 ? 'กทม./ภาคเดียวกัน (3 วัน)' : 'ข้ามจังหวัด (3-5 วัน)'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.3rem', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--thp-muted)' }}>เปิดถุง:</span>
                    <strong style={{ color: '#0F172A' }}>{formatThaiDate(slaInfo.bagOpenedAt, 'long')}</strong>

                    <span style={{ color: 'var(--thp-muted)' }}>ครบกำหนด:</span>
                    <span>{formatThaiDate(slaInfo.slaDeadline, 'long')}</span>

                    <span style={{ color: 'var(--thp-muted)' }}>เก็บรักษา:</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>
                      ถึง {formatThaiDate(slaInfo.retentionDeadline, 'short')}
                      <span style={{ fontSize: '0.74rem', color: '#64748B', marginLeft: '4px' }}>
                        (เหลือ {slaInfo.retentionDaysLeft} วัน)
                      </span>
                    </span>
                  </div>
                </div>

                {/* 2. Proof Evidence (POD) Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--thp-dark)' }}>
                      <Camera size={15} color="#0284C7" />
                      <span>หลักฐานนำจ่าย (POD)</span>
                    </div>
                    {caseItem.deliveryProofPhotoUrl || caseItem.parcelInfo?.deliveryProofPhotoUrl ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        มีภาพหลักฐาน
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        ยังไม่มีภาพถ่าย
                      </span>
                    )}
                  </div>

                  {caseItem.deliveryProofPhotoUrl || caseItem.parcelInfo?.deliveryProofPhotoUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={caseItem.deliveryProofPhotoUrl || caseItem.parcelInfo?.deliveryProofPhotoUrl}
                        alt="POD"
                        onClick={() => setPreviewPhotoUrl(caseItem.deliveryProofPhotoUrl || caseItem.parcelInfo?.deliveryProofPhotoUrl || null)}
                        style={{
                          width: '64px',
                          height: '46px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          cursor: 'pointer'
                        }}
                        title="คลิกเพื่อดูภาพขยาย"
                      />
                      <div style={{ fontSize: '0.8rem', color: 'var(--thp-slate)' }}>
                        <div style={{ fontWeight: 600, color: '#15803D' }}>มีภาพถ่ายยืนยันนำจ่าย</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--thp-muted)' }}>คลิกดูภาพขยาย</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--thp-muted)', lineHeight: 1.4 }}>
                      ยังไม่มีภาพถ่ายในระบบ (โทรยืนยันกับผู้รับก่อนปิดเคส)
                    </div>
                  )}

                  {caseItem.recipientConfirmedReceived && (
                    <div style={{ fontSize: '0.74rem', color: '#166534', background: '#F0FDF4', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #BBF7D0', fontWeight: 600 }}>
                      ✓ ผู้รับยืนยันได้รับสินค้าแล้ว
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Recipient Calls Log Card */}
              {caseItem.callAttempts && caseItem.callAttempts.length > 0 && (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--thp-dark)' }}>
                      <PhoneCall size={14} color="var(--thp-red)" />
                      <span>ประวัติโทรติดต่อผู้รับ</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--thp-muted)' }}>
                      {caseItem.callAttempts.length} ครั้ง
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.45rem' }}>
                    {caseItem.callAttempts.map((call, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '0.45rem 0.6rem',
                          fontSize: '0.76rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
                          <span style={{ color: call.callerRole === 'ADMIN' ? '#059669' : '#1E40AF' }}>
                            ครั้งที่ {call.attemptNumber} ({call.callerName})
                          </span>
                          <span style={{ color: 'var(--thp-muted)', fontSize: '0.68rem' }}>
                            {new Date(call.calledAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </span>
                        </div>
                        <div style={{ color: 'var(--thp-dark)', fontWeight: 600, marginTop: '2px' }}>
                          {call.outcomeLabel}
                        </div>
                        {call.note && (
                          <div style={{ color: 'var(--thp-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                            {call.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                บันทึกกิจกรรมและการปฏิบัติงาน:
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
            ปิด
          </button>

          {/* Central Role Actions */}
          {role === 'CENTRAL' && (
            <>
              {caseItem.status === 'WAITING_CENTRAL_REVIEW' && onOpenReviewAnswer && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onOpenReviewAnswer(caseItem)}
                >
                  <CheckCircle2 size={15} /> ตรวจคำตอบ
                </button>
              )}

              {(caseItem.isSlaExceeded || caseItem.status === 'SLA_EXCEEDED') && onOpenEscalateBranch && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onOpenEscalateBranch(caseItem)}
                >
                  <PhoneForwarded size={15} /> โทรตามสาขา
                </button>
              )}

              {caseItem.status !== 'CLOSED' && (
                <button
                  type="button"
                  className="btn-success"
                  onClick={handleCloseCaseAction}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <ShieldCheck size={16} /> ตรวจเงื่อนไข & ปิดเคส
                </button>
              )}
            </>
          )}

          {/* Admin role can also initiate close case verification */}
          {role === 'MYORDER_ADMIN' && caseItem.status !== 'CLOSED' && (
            <button
              type="button"
              className="btn-success"
              onClick={handleCloseCaseAction}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <ShieldCheck size={16} /> ตรวจเงื่อนไข & ปิดเคส
            </button>
          )}

        </div>
      </div>

      {/* Smart Pre-Close Verification Modal */}
      {isCloseModalOpen && (
        <CloseCaseModal
          caseItem={caseItem}
          onClose={() => setIsCloseModalOpen(false)}
          onSuccess={() => {
            setIsCloseModalOpen(false);
            onClose();
          }}
        />
      )}

      {/* Image Zoom Modal */}
      {previewPhotoUrl && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewPhotoUrl(null)}
          style={{ zIndex: 1300, background: 'rgba(0,0,0,0.75)' }}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px', background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--thp-dark)' }}>
                หลักฐานภาพถ่ายการนำส่งพัสดุ (POD)
              </div>
              <button type="button" className="close-btn" onClick={() => setPreviewPhotoUrl(null)}>
                <X size={20} />
              </button>
            </div>
            <img
              src={previewPhotoUrl}
              alt="POD Zoom"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--thp-muted)', textAlign: 'center' }}>
              เลขพัสดุ: {caseItem.trackingNumber} • บันทึกเข้าระบบไปรษณีย์ไทย
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
