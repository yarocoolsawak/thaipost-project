import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, X } from 'lucide-react';
import { POST_OFFICES, POST_OFFICE_GROUPS, POST_OFFICE_SOURCE, searchPostOffices } from '../../data/postOffices';

export function PostOfficeDirectoryModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [page, setPage] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const results = searchPostOffices(query, group);
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const visible = results.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        ref={dialogRef}
        role="dialog" aria-modal="true" aria-labelledby="post-office-directory-title"
        className="modal-card"
        style={{ maxWidth: 880, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={event => event.stopPropagation()}
        onKeyDown={event => {
          if (event.key === 'Escape') onClose();
          if (event.key !== 'Tab') return;
          const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select');
          if (!controls?.length) return;
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}
      >
        <div className="modal-header">
          <h2 id="post-office-directory-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}>
            <Building2 size={21} /> ที่ทำการไปรษณีย์และกลุ่ม CEC
          </h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="ปิดตารางที่ทำการ"><X size={20} /></button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--thp-muted)' }}>
            {POST_OFFICES.length.toLocaleString()} แห่ง · {POST_OFFICE_GROUPS.length} กลุ่ม · ข้อมูล ณ {POST_OFFICE_SOURCE.asOfLabel}
            <br />ที่มา: {POST_OFFICE_SOURCE.filename} · ไม่มีข้อมูลเบอร์โทรหรืออีเมลในไฟล์
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="form-control" style={{ flex: '1 1 240px' }} aria-label="ค้นหาที่ทำการ"
              placeholder="ค้นหารหัส ชื่อที่ทำการ หรือสังกัด" value={query}
              onChange={event => { setQuery(event.target.value); setPage(0); }} />
            <select className="form-control" style={{ width: 'auto' }} aria-label="กรองกลุ่ม CEC" value={group}
              onChange={event => { setGroup(event.target.value); setPage(0); }}>
              <option value="">ทุกกลุ่ม CEC</option>
              {POST_OFFICE_GROUPS.map(item => <option key={item.code} value={item.code}>{item.code} ({item.officeCount} แห่ง)</option>)}
            </select>
          </div>
          <div aria-live="polite" style={{ fontSize: '0.82rem' }}>พบ {results.length.toLocaleString()} แห่ง</div>
          <div className="table-responsive" style={{ overflow: 'auto', minHeight: 100 }}>
            <table className="case-table">
              <thead><tr><th>รหัสตามไฟล์</th><th>ที่ทำการไปรษณีย์</th><th>สังกัด</th><th>กลุ่ม CEC</th></tr></thead>
              <tbody>
                {visible.map(office => <tr key={office.code} title={`ชีต ${POST_OFFICE_SOURCE.sheet} แถว ${office.sourceRow}`}>
                  <td>{office.code}</td><td>{office.name}</td><td>{office.division}</td><td>{office.cecCode}</td>
                </tr>)}
                {!results.length && <tr><td colSpan={4}>ไม่พบรหัสหรือชื่อในตารางนี้ กรุณาตรวจสอบกับ ปณท ไม่เดาจากรหัสสองหลักแรก</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button type="button" className="btn-secondary" disabled={page === 0} onClick={() => setPage(value => value - 1)}>ก่อนหน้า</button>
            <span style={{ fontSize: '0.82rem' }}>หน้า {page + 1} / {pageCount}</span>
            <button type="button" className="btn-secondary" disabled={page + 1 >= pageCount} onClick={() => setPage(value => value + 1)}>ถัดไป</button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
}
