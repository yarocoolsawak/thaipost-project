import React, { useState } from 'react';
import type { CaseItem, PhoneCallAttempt, CallOutcome } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { notify } from '../../utils/dialog';
import { ISSUE_CATEGORY_META } from './IssueBadge';
import { formatThaiDate } from '../../utils/slaCalculator';
import {
  CheckCircle2,
  AlertTriangle,
  Phone,
  PhoneCall,
  Camera,
  X,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface CloseCaseModalProps {
  caseItem: CaseItem;
  onClose: () => void;
  onSuccess: () => void;
}

export const CloseCaseModal: React.FC<CloseCaseModalProps> = ({ caseItem, onClose, onSuccess }) => {
  const { role, closeCase, addChatMessage } = useCases();

  // 1. Central Postal Status Check (Official THP Code 501: Final delivery / นำจ่ายสำเร็จ)
  const postalStatus = caseItem.parcelInfo?.currentPostalStatus || '';
  const statusCode = caseItem.parcelInfo?.currentStatusCode || '';
  const isDeliveredInCentral =
    statusCode === '501' ||
    statusCode === '901' ||
    postalStatus.includes('501') ||
    postalStatus.includes('สำเร็จ') ||
    postalStatus.includes('รับพัสดุแล้ว') ||
    postalStatus.includes('ลงชื่อ') ||
    caseItem.parcelInfo?.events?.some(e => e.statusCode === '501' || e.statusCode === '901' || e.status.includes('นำจ่ายสำเร็จ') || e.status.includes('รับพัสดุ'));

  // 2. Photo Proof Evidence (POD)
  const hasProofEvidence = !!caseItem.deliveryProofPhotoUrl || !!caseItem.parcelInfo?.deliveryProofPhotoUrl;
  const proofUrl = caseItem.deliveryProofPhotoUrl || caseItem.parcelInfo?.deliveryProofPhotoUrl;

  // 3. Recipient Phone Confirmation State
  const initialRecipientConfirmed =
    caseItem.recipientConfirmedReceived ||
    caseItem.parcelInfo?.recipientConfirmedReceived ||
    false;
  const [recipientConfirmed, setRecipientConfirmed] = useState(initialRecipientConfirmed);
  const [confirmRecipientNote, setConfirmRecipientNote] = useState(
    initialRecipientConfirmed ? 'ผู้รับปลายทางยืนยันว่าได้รับสินค้าเรียบร้อยแล้ว' : ''
  );

  // 4. Call attempts (Officer 3 times + Admin 1 time)
  const [calls, setCalls] = useState<PhoneCallAttempt[]>(caseItem.callAttempts || []);
  const [isAddingAdminCall, setIsAddingAdminCall] = useState(false);
  const [adminCallOutcome, setAdminCallOutcome] = useState<CallOutcome>('CONFIRMED_RECEIVED');
  const [adminCallNote, setAdminCallNote] = useState('');

  // 5. Default auto-reply and resolution note based on case category
  const getDefaultResolution = () => {
    if (caseItem.category === 'CLOSE_WORK_REQUEST') {
      return {
        resolutionNotes: 'ตรวจสอบระบบกลางพบสถานะรับพัสดุเรียบร้อยแล้ว ดำเนินการปิดงานทันที',
        reply: `ทางเจ้าหน้าที่ไปรษณีย์ไทยได้ตรวจสอบข้อมูลในระบบกลาง (Track & Trace) พบว่ามีสถานะ "รับพัสดุแล้ว / นำจ่ายสำเร็จ" เรียบร้อยแล้ว จึงดำเนินการปิดงานและอัปเดตระบบให้เรียบร้อยแล้วครับ ขอบคุณครับ`
      };
    }
    if (caseItem.category === 'EXPEDITE_REQUEST') {
      if (hasProofEvidence) {
        return {
          resolutionNotes: 'ตรวจสอบพบนำจ่ายแล้ว และมีภาพหลักฐานการจัดส่ง (POD) ยืนยัน',
          reply: `ทางเจ้าหน้าที่ได้ตรวจสอบการจัดส่งเรียบร้อยแล้ว มีภาพถ่ายหลักฐานการนำส่ง (Proof of Delivery - POD) ยืนยันผู้รับได้รับสินค้าสมบูรณ์ จึงขอตอบกลับและดำเนินการปิดเคสเรียบร้อยครับ`
        };
      }
      return {
        resolutionNotes: 'โทรคอนเฟิร์มผู้รับปลายทางยืนยันได้รับสินค้าจริง และดำเนินการปิดเคส',
        reply: `ทางเจ้าหน้าที่ได้โทรประสานงานคอนเฟิร์มกับผู้รับปลายทางโดยตรง (${caseItem.parcelInfo?.receiverName || 'ผู้รับ'}) ยืนยันว่าได้รับพัสดุเรียบร้อยแล้ว จึงขอตอบกลับและดำเนินการปิดเคสเรียบร้อยครับ`
      };
    }
    if (caseItem.category === 'REDELIVERY_REQUEST') {
      return {
        resolutionNotes: 'เจ้าหน้าที่นำจ่ายรอบใหม่และติดต่อผู้รับสำเร็จ ดำเนินการปิดเคส',
        reply: `ทางเจ้าหน้าที่ได้ประสานงานนำจ่ายรอบใหม่ และติดต่อผู้รับปลายทางเพื่อจัดส่งสินค้าเรียบร้อยแล้ว จึงขอดำเนินการปิดเคสครับ`
      };
    }
    if (caseItem.category === 'RETURN_OR_REVERSE') {
      return {
        resolutionNotes: 'ตรวจสอบถอยสถานะตีกลับและส่งต่อนำส่งใหม่เรียบร้อย',
        reply: `ทางเจ้าหน้าที่ได้ตรวจสอบและดำเนินการประสานงานถอยสถานะตีกลับในระบบ พร้อมส่งต่อพัสดุเพื่อจัดส่งใหม่ให้แก่ผู้รับปลายทางเรียบร้อยแล้วครับ`
      };
    }
    return {
      resolutionNotes: 'เจ้าหน้าที่ตรวจสอบและดำเนินการแก้ปัญหาเรียบร้อย',
      reply: `เจ้าหน้าที่ได้ประสานงานตรวจสอบและดำเนินการแก้ไขปัญหาพัสดุเรียบร้อยแล้วครับ ขอบคุณที่ใช้บริการครับ`
    };
  };

  const defaults = getDefaultResolution();
  const [replyMessage, setReplyMessage] = useState(defaults.reply);
  const [resolutionNotes, setResolutionNotes] = useState(defaults.resolutionNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules before allowing close:
  let canClose = true;
  let validationMessage = '';

  if (caseItem.category === 'CLOSE_WORK_REQUEST') {
    // แจ้งปิดงาน: ถ้าเช็คที่กลางมีสถานะรับพัสดุแล้ว ปิดเคสได้เลย
    if (!isDeliveredInCentral) {
      canClose = false;
      validationMessage = 'สถานะระบบกลางยังไม่ขึ้น "รับพัสดุแล้ว" หรือ "นำจ่ายสำเร็จ" กรุณาประสานงานตรวจสอบก่อนปิดงาน';
    }
  } else if (caseItem.category === 'EXPEDITE_REQUEST') {
    // เร่งนำส่ง: ถ้าจัดส่งแล้วมีภาพหลักฐาน ปิดได้ทันที / ถ้าไม่มีภาพ ต้องโทรคอนเฟิร์มปลายทางว่าได้รับจริงหรือไม่
    if (!hasProofEvidence && !recipientConfirmed) {
      canClose = false;
      validationMessage = 'ยังไม่มีภาพถ่ายหลักฐานการนำส่ง (POD) ต้องโทรคอนเฟิร์มกับปลายทางว่าได้รับจริงก่อนปิดเคส';
    }
  }

  // Handle adding Admin Call attempt (Call #4)
  const handleSaveAdminCall = () => {
    const nextNum = Math.max(4, calls.length + 1);
    const newCall: PhoneCallAttempt = {
      id: `call-adm-${Date.now()}`,
      attemptNumber: nextNum,
      callerRole: 'ADMIN',
      callerName: role === 'MYORDER_ADMIN' ? 'แอดมิน MyOrder' : 'แอดมิน ปณ.ส่วนกลาง',
      calledAt: new Date().toISOString(),
      phoneNumber: caseItem.parcelInfo?.receiverPhone || '08X-XXX-XXXX',
      outcome: adminCallOutcome,
      outcomeLabel:
        adminCallOutcome === 'CONFIRMED_RECEIVED'
          ? 'ผู้รับยืนยันได้รับสินค้าแล้ว'
          : adminCallOutcome === 'NOT_RECEIVED'
          ? 'ผู้รับยืนยันยังไม่ได้รับ'
          : adminCallOutcome === 'POSTPONED'
          ? 'ผู้รับขอเลื่อนวันรับ'
          : 'ติดต่อไม่ได้ / ไม่รับสาย',
      note: adminCallNote.trim() || undefined
    };

    setCalls([...calls, newCall]);
    setIsAddingAdminCall(false);
    setAdminCallNote('');

    if (adminCallOutcome === 'CONFIRMED_RECEIVED') {
      setRecipientConfirmed(true);
      setConfirmRecipientNote('แอดมินโทรครั้งที่ 4: ผู้รับยืนยันได้รับสินค้าแล้ว');
    }

    notify(`บันทึกการโทรติดต่อของแอดมิน (ครั้งที่ ${nextNum}) เรียบร้อยแล้ว`, { title: 'บันทึกการโทรสำเร็จ', tone: 'success' });
  };

  const handleExecuteClose = async () => {
    if (!canClose) {
      notify(validationMessage, { title: 'ยังไม่ผ่านเงื่อนไขการปิดเคส', tone: 'danger' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Send the official reply message to the merchant/chat
      if (replyMessage.trim()) {
        const senderName =
          role === 'CENTRAL'
            ? 'ปณ.ส่วนกลาง (ปิดเคส)'
            : role === 'MYORDER_ADMIN'
            ? 'แอดมิน MyOrder'
            : 'เจ้าหน้าที่ ปณ.';
        addChatMessage(caseItem.id, replyMessage.trim(), role, senderName, false);
      }

      // Close the case with resolution notes
      const fullNotes = `${resolutionNotes.trim()} [ตรวจสอบ: หมวด ${caseItem.category} | ระบบกลาง: ${
        isDeliveredInCentral ? 'ยืนยันรับพัสดุ' : 'รอดำเนินการ'
      } | POD: ${hasProofEvidence ? 'มีภาพหลักฐาน' : 'ไม่มี'} | โทรคอนเฟิร์ม: ${
        recipientConfirmed ? 'ยืนยันได้รับจริง' : 'ไม่ได้คอนเฟิร์ม'
      }]`;

      closeCase(caseItem.id, fullNotes);
      notify(`ปิดเคส ${caseItem.id} และส่งคำตอบเรียบร้อยแล้ว`, { title: 'ปิดเคสสำเร็จ', tone: 'success' });
      onSuccess();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'ปิดเคสไม่สำเร็จ', { title: 'เกิดข้อผิดพลาด', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryMeta = ISSUE_CATEGORY_META[caseItem.category] || ISSUE_CATEGORY_META.OTHER;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={24} color="#059669" />
            <div>
              <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--thp-dark)' }}>
                ตรวจสอบเงื่อนไขก่อนปิดเคส
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
                เคส {caseItem.id} • เลขพัสดุ {caseItem.trackingNumber} • {caseItem.companyName}
              </span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} title="ปิด">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* 1. Case Category & Route Ribbon */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.6rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: categoryMeta.bg,
                  color: categoryMeta.color,
                  border: `1px solid ${categoryMeta.border}`
                }}
              >
                {categoryMeta.icon}
                <span>{categoryMeta.shortLabel}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
              <span>
                <strong>วันเปิดถุง:</strong> {formatThaiDate(caseItem.bagOpenedAt || caseItem.parcelInfo?.bagOpenedAt, 'short')}
              </span>
              <span>•</span>
              <span>
                <strong>เกณฑ์ SLA:</strong> {caseItem.slaTargetDays === 5 ? 'ข้ามจังหวัด (3-5 วัน)' : 'กทม./ภาคเดียวกัน (3 วัน)'}
              </span>
            </div>
          </div>

          {/* 2. SPECIFIC CHECKLIST BASED ON CASE TYPE */}
          <div
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '1rem',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.75rem', color: 'var(--thp-dark)' }}>
              เงื่อนไขการตรวจสอบตามประเภทเคส (SOP Verification)
            </div>

            {/* CASE TYPE 1: แจ้งปิดงาน */}
            {caseItem.category === 'CLOSE_WORK_REQUEST' && (
              <div
                style={{
                  background: isDeliveredInCentral ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${isDeliveredInCentral ? '#BBF7D0' : '#FECACA'}`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.9rem', color: isDeliveredInCentral ? '#166534' : '#991B1B' }}>
                    {isDeliveredInCentral ? <CheckCircle2 size={18} color="#16A34A" /> : <AlertTriangle size={18} color="#DC2626" />}
                    <span>ตรวจสอบสถานะระบบกลาง (Track & Trace / QMS)</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: isDeliveredInCentral ? '#DCFCE7' : '#FEE2E2',
                      color: isDeliveredInCentral ? '#15803D' : '#B91C1C'
                    }}
                  >
                    {postalStatus || 'ไม่ระบุสถานะ'}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: isDeliveredInCentral ? '#14532D' : '#7F1D1D', lineHeight: 1.5 }}>
                  {isDeliveredInCentral ? (
                    <>
                      ✓ ระบบกลางยืนยันมี <strong>สถานะรับพัสดุ / นำจ่ายสำเร็จ</strong> แล้ว
                      สามารถปิดเคสได้ทันทีและตอบกลับร้านค้าว่าเรียบร้อยแล้ว
                    </>
                  ) : (
                    <>
                      ⚠️ ระบบกลางยังไม่พบสถานะรับพัสดุสำเร็จ กรุณาประสานงานเจ้าหน้าที่นำจ่ายเพื่ออัปเดตสถานะก่อนปิดเคส
                    </>
                  )}
                </div>
              </div>
            )}

            {/* CASE TYPE 2: เร่งนำส่ง */}
            {caseItem.category === 'EXPEDITE_REQUEST' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Proof of delivery photo check */}
                <div
                  style={{
                    background: hasProofEvidence ? '#F0FDF4' : '#FFFBEB',
                    border: `1px solid ${hasProofEvidence ? '#BBF7D0' : '#FDE68A'}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.9rem', color: hasProofEvidence ? '#166534' : '#92400E' }}>
                      {hasProofEvidence ? <CheckCircle2 size={18} color="#16A34A" /> : <Camera size={18} color="#D97706" />}
                      <span>ภาพถ่ายหลักฐานการจัดส่ง (Proof of Delivery - POD)</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: hasProofEvidence ? '#DCFCE7' : '#FEF3C7',
                        color: hasProofEvidence ? '#15803D' : '#B45309'
                      }}
                    >
                      {hasProofEvidence ? 'มีภาพหลักฐานในระบบ' : 'ยังไม่มีภาพถ่ายหลักฐาน'}
                    </span>
                  </div>

                  {hasProofEvidence ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                      <img
                        src={proofUrl}
                        alt="หลักฐานการนำส่ง"
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #86EFAC'
                        }}
                      />
                      <div style={{ fontSize: '0.84rem', color: '#14532D' }}>
                        ✓ พบภาพถ่ายยืนยันการนำส่งพัสดุ (POD) ในระบบ <strong>สามารถตอบกลับและปิดเคสได้ทันที</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.84rem', color: '#78350F', lineHeight: 1.45 }}>
                      ⚠️ <strong>ยังไม่มีภาพหลักฐาน:</strong> กฎระบุว่า หากยังไม่มีภาพหลักฐาน{' '}
                      <u>จะต้องโทรคอนเฟิร์มกับปลายทางว่าได้รับจริงหรือไม่</u> ถ้าได้รับจริงจึงจะตอบกลับและปิดเคสได้
                    </div>
                  )}
                </div>

                {/* Recipient Phone Confirmation (Required if no POD) */}
                <div
                  style={{
                    background: recipientConfirmed ? '#F0FDF4' : '#F8FAFC',
                    border: `1px solid ${recipientConfirmed ? '#86EFAC' : '#E2E8F0'}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={recipientConfirmed}
                      onChange={e => {
                        setRecipientConfirmed(e.target.checked);
                        if (e.target.checked && !confirmRecipientNote) {
                          setConfirmRecipientNote('โทรคอนเฟิร์มผู้รับปลายทาง ยืนยันได้รับสินค้าจริง');
                        }
                      }}
                      style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#16A34A' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--thp-dark)' }}>
                        โทรคอนเฟิร์มกับปลายทางว่าได้รับพัสดุจริง (Phone Confirmation)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--thp-muted)', marginTop: '0.15rem' }}>
                        เบอร์ผู้รับ: {caseItem.parcelInfo?.receiverPhone || '08X-XXX-XXXX'} ({caseItem.parcelInfo?.receiverName})
                      </div>
                    </div>
                  </label>

                  {recipientConfirmed && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <input
                        type="text"
                        value={confirmRecipientNote}
                        onChange={e => setConfirmRecipientNote(e.target.value)}
                        placeholder="ระบุรายละเอียด เช่น โทรคุยกับคุณพัชราภรณ์ ยืนยันได้รับของเมื่อวานนี้แล้ว"
                        className="form-input"
                        style={{ fontSize: '0.84rem', background: '#FFFFFF' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASE TYPE 3 & 4: เร่งนำจ่ายใหม่ / แจ้งตีกลับ */}
            {(caseItem.category === 'REDELIVERY_REQUEST' || caseItem.category === 'RETURN_OR_REVERSE') && (
              <div
                style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.84rem',
                  color: '#0369A1',
                  lineHeight: 1.5
                }}
              >
                <strong>ตรวจสอบการนำจ่ายใหม่ & ถอยสถานะ:</strong> ประสานงานสายนำจ่ายตรวจสอบสถานะพัสดุ
                และตรวจสอบประวัติการติดต่อปลายทาง (3 ครั้งโดยเจ้าหน้าที่ + 1 ครั้งโดยแอดมิน)
              </div>
            )}
          </div>

          {/* 3. RECIPIENT CALL ATTEMPTS TRACKER (กฎ: จนท. โทร 3 ครั้ง + แอดมินโทร 1 ครั้ง) */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1rem',
              background: '#F8FAFC'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <PhoneCall size={16} color="var(--thp-red)" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--thp-dark)' }}>
                  การโทรติดต่อผู้รับปลายทาง (เจ้าหน้าที่ 3 ครั้ง + แอดมินโทรครั้งที่ 4)
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--thp-muted)' }}>
                บันทึกแล้ว {calls.length}/4 ครั้ง
              </span>
            </div>

            {/* Visual Call Progress Steps */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '0.85rem'
              }}
            >
              {[1, 2, 3, 4].map(num => {
                const call = calls.find(c => c.attemptNumber === num);
                const isCompleted = !!call;

                return (
                  <div
                    key={num}
                    style={{
                      background: isCompleted ? '#FFFFFF' : '#F1F5F9',
                      border: `1px solid ${isCompleted ? (num === 4 ? '#A7F3D0' : '#CBD5E1') : '#E2E8F0'}`,
                      borderRadius: '8px',
                      padding: '0.6rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      opacity: isCompleted ? 1 : 0.65
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: num === 4 ? '#059669' : '#334155'
                        }}
                      >
                        ครั้งที่ {num} {num === 4 ? '(แอดมิน)' : '(จนท.)'}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 size={13} color="#16A34A" />
                      ) : (
                        <Clock size={13} color="#94A3B8" />
                      )}
                    </div>
                    {isCompleted ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--thp-dark)', fontWeight: 600 }}>
                        {call.outcomeLabel}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ยังไม่โทร</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Admin 4th Call Button / Form */}
            {calls.length >= 3 && !calls.some(c => c.callerRole === 'ADMIN') && !isAddingAdminCall && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddingAdminCall(true)}
                style={{
                  width: '100%',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  borderColor: '#A7F3D0',
                  color: '#065F46',
                  background: '#ECFDF5'
                }}
              >
                <Phone size={14} /> โทรติดต่อปลายทางโดยแอดมิน (บันทึกการโทรครั้งที่ 4)
              </button>
            )}

            {isAddingAdminCall && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #86EFAC',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#047857' }}>
                  บันทึกผลการโทรของแอดมิน (ครั้งที่ 4)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <label className="form-group" style={{ margin: 0 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>ผลการติดต่อ:</span>
                    <select
                      className="form-input"
                      value={adminCallOutcome}
                      onChange={e => setAdminCallOutcome(e.target.value as CallOutcome)}
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="CONFIRMED_RECEIVED">ผู้รับยืนยันได้รับสินค้าแล้ว</option>
                      <option value="NOT_RECEIVED">ผู้รับยืนยันยังไม่ได้รับ</option>
                      <option value="NO_ANSWER">ไม่รับสาย / สายไม่ว่าง</option>
                      <option value="CANNOT_CONTACT">ปิดเครื่อง / ติดต่อไม่ได้</option>
                      <option value="POSTPONED">ผู้รับขอเลื่อนวันส่ง</option>
                    </select>
                  </label>
                  <label className="form-group" style={{ margin: 0 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>บันทึกเพิ่มเติม:</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="เช่น โทรติด สอบถามเรียบร้อย"
                      value={adminCallNote}
                      onChange={e => setAdminCallNote(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsAddingAdminCall(false)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveAdminCall}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', background: '#059669', borderColor: '#059669' }}
                  >
                    บันทึกการโทรครั้งที่ 4
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. AUTO-REPLY TO MERCHANT & RESOLUTION NOTES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--thp-dark)' }}>
                  ข้อความตอบกลับร้านค้าเมื่อปิดเคส (Auto Reply Message):
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                  ส่งผ่านแชท MyOrder อัตโนมัติ
                </span>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                style={{ fontSize: '0.85rem', lineHeight: 1.5 }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--thp-dark)' }}>
                บันทึกการทำงาน / หมายเหตุปิดเคส (Internal Audit Note):
              </label>
              <input
                type="text"
                className="form-input"
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {!canClose && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#B91C1C',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={18} />
              <span>{validationMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn-success"
            onClick={handleExecuteClose}
            disabled={!canClose || isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              background: canClose ? '#16A34A' : '#94A3B8',
              borderColor: canClose ? '#16A34A' : '#94A3B8',
              cursor: canClose ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? 'กำลังปิดเคส...' : 'ยืนยันปิดเคส & ตอบกลับเรียบร้อย'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
