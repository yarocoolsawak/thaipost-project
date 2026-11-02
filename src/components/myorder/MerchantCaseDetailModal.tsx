import { CaseLifecyclePanel } from '../common/CaseLifecyclePanel';
import React, { useState } from 'react';
import type { CaseItem, UserRole } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { confirmDialog } from '../../utils/dialog';
import { CEC_REGIONS } from '../../data/cecRegions';
import { TrackingTimeline } from '../common/TrackingTimeline';
import { SlaBadge } from '../common/SlaBadge';
import { IssueDisplay, UrgencyBadge } from '../common/IssueBadge';
import { CaseProgressStepper, LatestUpdate, MerchantStatusBadge } from './CaseProgress';
import { EmailDispatchModal } from './EmailDispatchModal';
import { EMAIL_REQUEST_TYPE_LABEL } from '../../utils/emailTemplates';
import { X, RefreshCw, CheckCircle2, MessageSquare, Truck, History, MapPin, HelpCircle, Send, Mail, Paperclip } from 'lucide-react';

interface MerchantCaseDetailModalProps {
  caseItem: CaseItem;
  onClose: () => void;
  initialTab?: 'STATUS' | 'TRACKING';
}

const ACTOR_LABEL: Record<UserRole, string> = {
  CENTRAL: 'ไปรษณีย์ไทย',
  CEC: 'CEC ไปรษณีย์',
  BRANCH: 'ไปรษณีย์สาขา',
  MERCHANT: 'ร้านค้า',
  MYORDER_ADMIN: 'แอดมิน MyOrder'
};

export const MerchantCaseDetailModal: React.FC<MerchantCaseDetailModalProps> = ({ caseItem: initial, onClose, initialTab = 'STATUS' }) => {
  const { cases, role, addChatMessage, closeCase, syncParcelTracking } = useCases();
  const caseItem = cases.find(c => c.id === initial.id) || initial;
  const [tab, setTab] = useState<'STATUS' | 'TRACKING'>(initialTab);
  const [followUp, setFollowUp] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const emails = caseItem.emails || [];

  const cec = CEC_REGIONS.find(c => c.id === caseItem.assignedCecId);
  const isMerchant = role === 'MERCHANT';
  const hasAnswer = caseItem.status === 'ANSWER_SENT_TO_MERCHANT' && !!caseItem.confirmation;
  const resolutionMessage = [...caseItem.chatHistory].reverse().find(message => !message.isInternalNote && ['CENTRAL', 'CEC', 'BRANCH'].includes(message.senderRole) && message.timestamp === caseItem.confirmation?.sentAt);
  const resolutionText = resolutionMessage?.message || caseItem.centralReview?.approvedAnswer;
  const resolutionAt = caseItem.confirmation?.sentAt || caseItem.centralReview?.reviewedAt;

  // MyOrder admin sees every milestone (action + time, never internal details like officer phone numbers);
  // shops only ever see the latest update, not the internal case status
  const publicTimeline = caseItem.activityLogs;
  // Messages from the MyOrder side (shop = CUSTOMER, MyOrder admin = MYORDER_ADMIN); first one is the original report.
  // Email copies are shown in the email section instead.
  const merchantMessages = caseItem.chatHistory.filter(
    m =>
      (m.senderRole === 'CUSTOMER' || m.senderRole === 'MYORDER_ADMIN') &&
      !m.isInternalNote &&
      !m.message.startsWith('[ส่งอีเมลถึง')
  );

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncParcelTracking(caseItem.id);
    setSyncing(false);
    setSyncMessage(
      result === 'ROUTING_ALERT' && !isMerchant
        ? 'QMS อัปเดตสถานะพัสดุแล้ว พัสดุไปอยู่พื้นที่ของ CEC อื่น ระบบแจ้ง ปณ.ส่วนกลางให้ตรวจแล้ว'
        : result !== 'NO_CHANGE'
        ? 'QMS อัปเดตสถานะพัสดุแล้ว'
        : 'QMS ยังไม่มีสถานะพัสดุใหม่'
    );
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim()) return;
    addChatMessage(
      caseItem.id,
      `[ข้อมูลเพิ่มเติมจาก${isMerchant ? 'ร้านค้า' : 'แอดมิน MyOrder'}]: ${followUp.trim()}`,
      role,
      isMerchant ? `${caseItem.contactPerson} (${caseItem.companyName})` : 'แอดมิน MyOrder'
    );
    setFollowUp('');
  };

  const handleClose = async () => {
    const ok = await confirmDialog(`ยืนยันว่าได้รับคำตอบแล้ว และต้องการปิดเคส ${caseItem.id}?`, {
      title: 'ยอมรับผลแก้ไข',
      confirmLabel: 'ปิดเคส',
      tone: 'success'
    });
    if (ok) closeCase(caseItem.id, 'ร้านค้ายืนยันยอมรับผลแก้ไขผ่าน MyOrder');
  };

  return (
    <>
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{caseItem.id}</span>
            <span className="tracking-pill">{caseItem.trackingNumber}</span>
            {!isMerchant && <MerchantStatusBadge status={caseItem.status} />}
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            padding: '0.5rem 1.5rem 0',
            background: '#F8FAFC',
            borderBottom: '1px solid var(--thp-border)'
          }}
        >
          <button
            type="button"
            className={`status-tab-btn ${tab === 'STATUS' ? 'active' : ''}`}
            onClick={() => setTab('STATUS')}
          >
            <History size={14} /> {isMerchant ? 'รายละเอียดเรื่อง' : 'สถานะการดำเนินการ'}
          </button>
          <button
            type="button"
            className={`status-tab-btn ${tab === 'TRACKING' ? 'active' : ''}`}
            onClick={() => setTab('TRACKING')}
          >
            <Truck size={14} /> สถานะพัสดุ ({caseItem.parcelInfo.events.length})
          </button>
        </div>

        <div className="modal-body">
          <CaseLifecyclePanel caseItem={caseItem} />
          {tab === 'STATUS' ? (
            <>
              {isMerchant ? <LatestUpdate caseItem={caseItem} /> : <CaseProgressStepper caseItem={caseItem} />}

              {/* Order + responsible unit */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                <div style={{ border: '1px solid var(--thp-border)', borderRadius: '10px', padding: '0.85rem', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontWeight: 700 }}>ปัญหาที่แจ้ง</div>
                  <div style={{ color: 'var(--thp-muted)' }}>
                    คำสั่งซื้อ {caseItem.myOrderRef.orderId} • แจ้งเมื่อ {new Date(caseItem.createdAt).toLocaleString('th-TH')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <IssueDisplay category={caseItem.category} />
                    <UrgencyBadge urgency={caseItem.urgency} />
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{caseItem.customerInquiry}</div>
                </div>

                {!isMerchant && (
                <div style={{ border: '1px solid var(--thp-border)', borderRadius: '10px', padding: '0.85rem', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontWeight: 700 }}>หน่วยงานที่ดูแล</div>
                  {cec ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4338CA', fontWeight: 600 }}>
                        <MapPin size={14} /> {cec.name}
                      </div>
                      <div style={{ color: 'var(--thp-muted)' }}>ปลายทาง: {caseItem.assignedBranchName || caseItem.parcelInfo.destPostOffice}</div>
                    </>
                  ) : (
                    <>
                      <span className="cec-blank-chip" style={{ alignSelf: 'flex-start' }}>
                        <HelpCircle size={11} /> รอระบุ CEC
                      </span>
                      <div style={{ color: 'var(--thp-muted)' }}>
                        พัสดุยังไม่ถึงพื้นที่ปลายทาง ({caseItem.parcelInfo.currentPostalStatus}) ระบบจะระบุ CEC ให้อัตโนมัติเมื่อ QMS อัปเดตสถานะพัสดุ
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--thp-muted)' }}>กำหนดตอบกลับ:</span>
                    <SlaBadge
                      deadlineIso={caseItem.slaDeadline}
                      isExceeded={caseItem.isSlaExceeded}
                      status={caseItem.status}
                      bagOpenedAt={caseItem.bagOpenedAt || caseItem.parcelInfo?.bagOpenedAt}
                      targetDays={caseItem.slaTargetDays}
                      routeType={caseItem.slaRouteType}
                      retentionDeadline={caseItem.retentionDeadline}
                    />
                  </div>
                </div>
                )}
              </div>

              {/* Approved answer */}
              {resolutionText ? (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> คำตอบจากไปรษณีย์ไทย
                  </div>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: '#064E3B', whiteSpace: 'pre-wrap' }}>
                    {resolutionText}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '0.35rem' }}>
                    ตอบเมื่อ {resolutionAt ? new Date(resolutionAt).toLocaleString('th-TH') : '-'}
                  </div>
                </div>
              ) : (
                caseItem.status !== 'CLOSED' && (
                  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.84rem', color: 'var(--thp-muted)' }}>
                    ยังไม่มีคำตอบ — เจ้าหน้าที่กำลังดำเนินการ คุณจะเห็นคำตอบที่นี่ทันทีเมื่อ ปณ. ตอบกลับ
                  </div>
                )
              )}

              {/* Official request emails */}
              <div style={{ border: '1px solid var(--thp-border)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={15} /> อีเมลคำร้องทางการ ({emails.length})
                  </div>
                  {caseItem.status !== 'CLOSED' && (
                    <button type="button" className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => setShowEmailModal(true)}>
                      <Mail size={13} /> {isMerchant ? 'ส่งอีเมลคำร้อง' : 'ส่งอีเมลแทนร้านค้า'} (ตีกลับ / เปลี่ยนที่อยู่ / แนบหลักฐาน)
                    </button>
                  )}
                </div>
                {emails.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
                    ยังไม่มีการส่งอีเมลคำร้อง — ใช้เมื่อต้องการขอระงับการจ่ายและตีกลับ ขอแก้ไขที่อยู่ผู้รับ หรือส่งเอกสารหลักฐานเพิ่มเติม
                  </div>
                ) : (
                  emails.map(email => (
                    <div key={email.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong>{EMAIL_REQUEST_TYPE_LABEL[email.requestType]}</strong>
                        <span style={{ color: 'var(--thp-muted)' }}>{new Date(email.sentAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <div>{email.subject}</div>
                      <div style={{ color: 'var(--thp-muted)' }}>
                        ถึง {email.to}{email.cc ? ` • CC ${email.cc}` : ''} • ส่งโดย{' '}
                        {email.sentByRole === 'MYORDER_ADMIN' ? 'แอดมิน MyOrder (แทนร้านค้า)' : `ร้านค้า (${email.senderName})`}
                      </div>
                      {email.attachments.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', color: 'var(--thp-slate)' }}>
                          <Paperclip size={12} /> {email.attachments.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Full milestone timeline: MyOrder admin only */}
              {!isMerchant && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>ความคืบหน้า</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {publicTimeline.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--thp-muted)', minWidth: '118px', fontFamily: 'var(--font-en)', fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span>
                        <strong>{log.action}</strong>{' '}
                        <span style={{ color: 'var(--thp-muted)' }}>• {ACTOR_LABEL[log.actorRole]}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Follow-up messages */}
              {(
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MessageSquare size={15} /> ข้อความเพิ่มเติมจากฝั่ง MyOrder ({Math.max(merchantMessages.length - 1, 0)})
                  </div>
                  {merchantMessages.slice(1).map(m => (
                    <div key={m.id} className="chat-bubble customer" style={{ maxWidth: '100%' }}>
                      <div className="chat-author">
                        <span>{m.senderName}</span>
                        <span>{new Date(m.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <div>{m.message}</div>
                    </div>
                  ))}
                  <form onSubmit={handleSendFollowUp} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="form-control"
                      style={{ flex: 1, minWidth: 0 }}
                      placeholder="ส่งข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ เช่น เบอร์ติดต่อลูกค้าสำรอง..."
                      value={followUp}
                      onChange={e => setFollowUp(e.target.value)}
                    />
                    <button type="submit" className="btn-myorder" disabled={!followUp.trim()}>
                      <Send size={14} /> ส่ง
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="myorder-banner">
                <span>
                  สถานะล่าสุด: <strong>{caseItem.parcelInfo.currentPostalStatus}</strong>
                  {syncMessage && <span style={{ marginLeft: '0.5rem' }}>— {syncMessage}</span>}
                </span>
                <button type="button" className="btn-secondary" onClick={handleSync} disabled={syncing}>
                  <RefreshCw size={14} /> {syncing ? 'กำลังดึงข้อมูล...' : 'ดึงสถานะล่าสุดจาก QMS'}
                </button>
              </div>
              <TrackingTimeline events={caseItem.parcelInfo.events} currentStatus={caseItem.parcelInfo.currentPostalStatus} />
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            ปิดหน้าต่าง
          </button>
          {isMerchant && hasAnswer && caseItem.status !== 'CLOSED' && (
            <button type="button" className="btn-success" onClick={handleClose}>
              <CheckCircle2 size={15} /> ยอมรับผลแก้ไขและปิดเคส
            </button>
          )}
        </div>
      </div>
    </div>
    {showEmailModal && <EmailDispatchModal caseItem={caseItem} onClose={() => setShowEmailModal(false)} />}
    </>
  );
};
