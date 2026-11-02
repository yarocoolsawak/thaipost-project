import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCases } from '../../context/CaseContext';
import { CLOSURE_CATEGORIES } from '../../utils/caseLifecycle';
import { getCategoryShortLabel } from './StatusBadge';

export function ClosureSettingsModal({ onClose }: { onClose: () => void }) {
  const { closureSettings, updateClosureSettings, role } = useCases();
  const [draft, setDraft] = useState(closureSettings);
  if (role !== 'CENTRAL') return null;
  return createPortal(<div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
    <form role="dialog" aria-modal="true" aria-labelledby="closure-settings-title" className="modal-card" onClick={event => event.stopPropagation()} onSubmit={event => { event.preventDefault(); updateClosureSettings(draft); onClose(); }}>
      <div className="modal-header"><h2 id="closure-settings-title">ตั้งเวลารอร้านค้ายืนยัน</h2><button type="button" className="close-btn" aria-label="ปิดการตั้งเวลา" onClick={onClose}>×</button></div>
      <div className="modal-body" style={{ overflow: 'auto', display: 'grid', gap: 12 }}>
        <p>ค่าเริ่มต้น 72 ชั่วโมง (3 วัน) · เตือนเมื่อเหลือ 24 ชั่วโมง · ใช้กับผลแก้ไขรอบใหม่ กำหนดเวลาเดิมคงอยู่</p>
        <p>เซ็นรับแล้วไม่ได้รับของ: ห้ามปิดอัตโนมัติทุกทาง ต้องร้านค้ายอมรับเท่านั้น</p>
        <table className="case-table"><thead><tr><th>ประเภท</th><th>ปิดเมื่อไม่ตอบ</th><th>ชั่วโมง</th></tr></thead><tbody>
          {CLOSURE_CATEGORIES.map(category => <tr key={category}>
            <td>{getCategoryShortLabel(category)}</td>
            <td><input aria-label={`เปิดปิดอัตโนมัติ ${getCategoryShortLabel(category)}`} type="checkbox" checked={draft[category].enabled} disabled={category === 'NOT_RECEIVED'} onChange={event => setDraft({ ...draft, [category]: { ...draft[category], enabled: event.target.checked } })} /></td>
            <td><input className="form-control" style={{ width: 100 }} aria-label={`ชั่วโมง ${getCategoryShortLabel(category)}`} type="number" min={1} max={720} step={1} required disabled={category === 'NOT_RECEIVED'} value={draft[category].hours} onChange={event => setDraft({ ...draft, [category]: { ...draft[category], hours: Number(event.target.value) } })} /></td>
          </tr>)}
        </tbody></table>
        <small>Prototype บันทึกข้อมูลบนเบราว์เซอร์เครื่องนี้ ตรวจเวลาขณะเปิดแอปและเมื่อกลับมาเปิดอีกครั้ง ยังไม่มี worker ฝั่ง server หรือการส่งแจ้งเตือนภายนอก</small>
      </div>
      <div className="modal-footer"><button type="button" className="btn-secondary" onClick={onClose}>ยกเลิก</button><button className="btn-primary" type="submit">บันทึกการตั้งเวลา</button></div>
    </form>
  </div>, document.body);
}
