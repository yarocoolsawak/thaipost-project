import { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { requiresMerchantAcceptance } from '../../utils/caseLifecycle';

export function CaseLifecyclePanel({ caseItem }: { caseItem: CaseItem }) {
  const { role, submitResolution, disputeDelivery, addChatMessage } = useCases();
  const [answer, setAnswer] = useState('');
  const protectedCase = requiresMerchantAcceptance(caseItem);
  const confirmation = caseItem.confirmation;
  const staff = ['CENTRAL', 'CEC', 'BRANCH'].includes(role);
  return (
    <section aria-label="การยืนยันและปิดเคส" style={{ background: protectedCase ? '#FFF7ED' : '#EFF6FF', color: '#1E293B', border: '1px solid #CBD5E1', borderRadius: 10, padding: '0.85rem', display: 'grid', gap: 8, fontSize: '0.83rem' }}>
      <strong>{caseItem.status === 'CLOSED' ? 'Archived · ปิดเคสแล้ว' : confirmation ? 'รอร้านค้ายืนยันผลแก้ไข' : 'อยู่ระหว่างดำเนินการ'}</strong>
      <span>ที่มา: {caseItem.creationSource === 'AUTO_SLA' ? 'ระบบเปิดติดตาม SLA อัตโนมัติ' : 'ร้านค้าแจ้งปัญหา'}</span>
      {protectedCase && <strong>เซ็นรับแล้วไม่ได้รับของ — ยกเว้นการปิดอัตโนมัติ ต้องร้านค้ากดยอมรับเท่านั้น</strong>}
      {caseItem.status === 'CLOSED' ? (
        <span>{caseItem.closeReason === 'NO_RESPONSE_TIMEOUT' ? 'ปิดอัตโนมัติเนื่องจากร้านค้าไม่ตอบภายในเวลาที่กำหนด (ไม่ใช่การยอมรับ)' : caseItem.closeReason === 'DELIVERED_AUTO' ? 'ปิดอัตโนมัติเนื่องจากสถานะพัสดุนำจ่ายสำเร็จแล้ว' : caseItem.closeReason === 'MERCHANT_ACCEPTED' ? 'ปิดโดยร้านค้ายอมรับผลแก้ไข' : 'ปิดเคสจากประวัติเดิม'}{caseItem.closedAt ? ` · ${new Date(caseItem.closedAt).toLocaleString('th-TH')}` : ''}</span>
      ) : confirmation && (
        <span>{confirmation.dueAt ? `ปิดอัตโนมัติเมื่อไม่ตอบ: ${new Date(confirmation.dueAt).toLocaleString('th-TH')} (${confirmation.timeoutHours} ชั่วโมง)` : 'ไม่มีเวลาปิดอัตโนมัติ'} · ผลแก้ไขรุ่น {confirmation.version}
          {confirmation.remindedAt && ' · แจ้งเตือนร้านค้าแล้ว'}{confirmation.escalatedAt && ' · ครบ 3 วัน แจ้ง CS และสาขาติดตามแล้ว'}</span>
      )}
      {role === 'MERCHANT' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="btn-secondary" onClick={() => disputeDelivery(caseItem.id)}>เซ็นรับแล้วแต่ยังไม่ได้รับของ</button>
        {caseItem.status === 'ANSWER_SENT_TO_MERCHANT' && <button type="button" className="btn-secondary" onClick={() => addChatMessage(caseItem.id, 'ยังไม่จบ กรุณาดำเนินการตรวจสอบต่อ', 'MERCHANT', caseItem.companyName)}>ยังไม่จบ / ให้ดำเนินการต่อ</button>}
      </div>}
      {staff && caseItem.status !== 'CLOSED' && <form onSubmit={event => {
        event.preventDefault(); if (!answer.trim()) return;
        submitResolution(caseItem.id, answer); setAnswer('');
      }} style={{ display: 'grid', gap: 6 }}>
        <label htmlFor={`resolution-${caseItem.id}`}>ผลแก้ไขที่จะส่งให้ร้านค้ายืนยัน (ส่งรอบใหม่จึงเริ่มนับเวลาใหม่)</label>
        <textarea id={`resolution-${caseItem.id}`} className="form-control" value={answer} onChange={event => setAnswer(event.target.value)} rows={2} maxLength={2000} required />
        <button type="submit" className="btn-primary" disabled={!answer.trim()}>ส่งผลแก้ไขให้ร้านค้ายืนยัน</button>
      </form>}
    </section>
  );
}
