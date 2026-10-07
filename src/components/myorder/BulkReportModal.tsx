import React, { useState } from 'react';
import type { CaseItem, IssueCategory, UrgencyLevel } from '../../types/case';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { useMyOrder } from '../../context/MyOrderContext';
import type { BulkLinePreview, BulkLineResult } from '../../context/MyOrderContext';
import { parseTrackingList } from '../../utils/trackingParser';
import { KNOWN_PARCELS } from '../../services/trackTraceApi';
import { resolveCecFromParcel } from '../../data/cecRegions';
import { ISSUE_CATEGORY_META } from '../common/IssueBadge';
import { Layers, X, Send, ClipboardPaste, CheckCircle2, Link2, AlertCircle, AlertTriangle, Eye } from 'lucide-react';

interface BulkReportModalProps {
  onClose: () => void;
}

const DEFAULT_MESSAGES: Partial<Record<IssueCategory, string>> = {
  EXPEDITE_REQUEST: 'รบกวนประสานงานเจ้าหน้าที่เร่งนำส่งให้หน่อยนะครับ ลูกค้ามีความจำเป็นต้องใช้งานด่วน',
  CLOSE_WORK_REQUEST: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยนะครับ ร้านค้าสอบถามผู้รับปลายทางแจ้งได้รับพัสดุเรียบร้อยแล้ว สถานะยังไม่อัปเดตปิดงานครับ',
  REDELIVERY_REQUEST: 'รบกวนประสานงานเจ้าหน้าที่ติดต่อนำส่งใหม่ให้หน่อยนะครับ ร้านค้าสอบถามผู้รับแจ้งว่ายังไม่ได้รับการติดต่อจากเจ้าหน้าที่ครับ',
  RETURN_OR_REVERSE: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบถอยสถานะตีกลับและแจ้งนำส่งใหม่ให้หน่อยนะครับ พัสดุถูกส่งคืนต้นทางโดยยังไม่มีการนำจ่ายครับ',
  DELAYED_DELIVERY: 'พัสดุล่าช้ากว่ากำหนด สถานะไม่อัปเดต รบกวนตรวจสอบตำแหน่งพัสดุ',
  NOT_RECEIVED: 'สถานะขึ้นนำจ่ายสำเร็จ แต่ผู้รับแจ้งว่ายังไม่ได้รับของ รบกวนตรวจสอบหลักฐานการนำจ่าย'
};

// Demo paste: 8 parcels that can open new cases, 1 with an open case already, 1 not in MyOrder
const SAMPLE_PASTE = [
  'EN100200301TH',
  'EN100200305TH',
  'EN100200308TH',
  'EN100200310TH',
  'EN100200311TH',
  'EN100200312TH',
  'EN100200313TH',
  'EN100200314TH',
  'ED776512349TH',
  'EF999888777TH'
].join('\n');

const STATUS_META: Record<BulkLinePreview['status'], { label: string; color: string; bg: string }> = {
  NEW_CASE: { label: 'เปิดเคสใหม่', color: '#047857', bg: '#ECFDF5' },
  EXISTING_CASE: { label: 'เคยสร้างเคสแล้ว (ยังไม่ปิด)', color: '#92400E', bg: '#FEF3C7' },
  NOT_FOUND: { label: 'ไม่พบใน MyOrder (ข้าม)', color: '#B91C1C', bg: '#FEF2F2' },
  NOT_SHIPPED: { label: 'ยังไม่จัดส่ง (ข้าม)', color: '#92400E', bg: '#FFFBEB' }
};

export const BulkReportModal: React.FC<BulkReportModalProps> = ({ onClose }) => {
  const { previewBulkReport, submitBulkReport } = useMyOrder();
  const [rawInput, setRawInput] = useState('');
  const [category, setCategory] = useState<IssueCategory>('EXPEDITE_REQUEST');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [description, setDescription] = useState(DEFAULT_MESSAGES.EXPEDITE_REQUEST!);
  const [adminName, setAdminName] = useState('แอดมิน MyOrder');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<BulkLineResult[] | null>(null);
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);
  // Parcels with an open case: default is to follow the existing case; admin can switch each one to "create new"
  const [newCaseFor, setNewCaseFor] = useState<string[]>([]);

  const parsed = parseTrackingList(rawInput);
  const lines = previewBulkReport(parsed.valid);
  const actionable = lines.filter(l => l.status === 'NEW_CASE' || l.status === 'EXISTING_CASE');
  const duplicateLines = lines.filter(l => l.status === 'EXISTING_CASE');
  const wantsNew = (l: BulkLinePreview) => newCaseFor.includes(l.trackingNumber);
  const newCount = lines.filter(l => l.status === 'NEW_CASE').length + duplicateLines.filter(wantsNew).length;
  const followCount = duplicateLines.length - duplicateLines.filter(wantsNew).length;
  const setDecision = (trackingNumber: string, createNew: boolean) =>
    setNewCaseFor(prev => (createNew ? [...new Set([...prev, trackingNumber])] : prev.filter(t => t !== trackingNumber)));

  const handleCategoryChange = (next: IssueCategory) => {
    // Swap the default message only if the admin has not typed their own
    if (Object.values(DEFAULT_MESSAGES).includes(description) || !description.trim()) {
      setDescription(DEFAULT_MESSAGES[next] || '');
    }
    setCategory(next);
  };

  const handleSubmit = async () => {
    if (actionable.length === 0 || !description.trim()) return;
    setIsSubmitting(true);
    const res = await submitBulkReport(lines, {
      category,
      urgency,
      description: description.trim(),
      adminName: adminName.trim() || 'แอดมิน MyOrder'
    }, new Set(newCaseFor));
    setIsSubmitting(false);
    setResults(res);
  };

  const cecPreview = (line: BulkLinePreview) => {
    if (line.status === 'EXISTING_CASE' && !wantsNew(line)) {
      return line.existingCase?.assignedCecId ? `CEC ${line.existingCase.assignedCecId}` : 'รอระบุ CEC';
    }
    if (line.status !== 'NEW_CASE' && line.status !== 'EXISTING_CASE') return '-';
    const parcel = KNOWN_PARCELS[line.trackingNumber];
    const cec = parcel ? resolveCecFromParcel(parcel) : undefined;
    return cec ? cec.code : 'รอระบุ CEC';
  };

  return (
    <>
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Layers size={20} color="var(--myorder-teal)" />
            <span>แจ้งหลายเลขพัสดุพร้อมกัน (Bulk Report)</span>
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {results ? (
          <>
            <div className="modal-body">
              <div className="metrics-grid">
                <SummaryTile label="เปิดเคสใหม่" value={results.filter(r => r.outcome === 'CREATED').length} color="#047857" />
                <SummaryTile label="ติดตามเคสเดิม" value={results.filter(r => r.outcome === 'LINKED').length} color="#1D4ED8" />
                <SummaryTile label="ข้าม" value={results.filter(r => r.outcome === 'SKIPPED').length} color="#B91C1C" />
              </div>
              <div className="case-table-card">
                <div className="table-responsive">
                  <table className="case-table">
                    <thead>
                      <tr>
                        <th>เลขพัสดุ</th>
                        <th>ร้านค้า</th>
                        <th>ผลลัพธ์</th>
                        <th>เคส / CEC</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.trackingNumber}>
                          <td><span className="tracking-pill">{r.trackingNumber}</span></td>
                          <td>{r.shop?.name || '-'}</td>
                          <td>
                            {r.outcome === 'CREATED' ? (
                              <span style={{ color: '#047857', fontWeight: 600, display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                                <CheckCircle2 size={14} /> เปิดเคสใหม่
                              </span>
                            ) : r.outcome === 'LINKED' ? (
                              <span style={{ color: '#1D4ED8', fontWeight: 600, display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                                <Link2 size={14} /> ติดตามเคสเดิม (แนบข้อความแล้ว)
                              </span>
                            ) : (
                              <span style={{ color: '#B91C1C', display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                                <AlertCircle size={14} /> ข้าม: {r.reason}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {r.caseItem ? (
                              <>
                                <strong>{r.caseItem.id}</strong> •{' '}
                                {r.caseItem.assignedCecId ? `CEC ${r.caseItem.assignedCecId}` : <span className="cec-blank-chip">รอระบุ CEC</span>}
                                {r.caseItem.duplicateOfCaseId && (
                                  <div style={{ fontSize: '0.7rem', color: '#92400E' }}>เคสใหม่ แยกจาก {r.caseItem.duplicateOfCaseId}</div>
                                )}
                              </>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {r.caseItem && (
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => setViewCase(r.caseItem!)}
                              >
                                <Eye size={13} /> ติดตาม
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => { setResults(null); setRawInput(''); setNewCaseFor([]); }}>
                แจ้งชุดใหม่
              </button>
              <button type="button" className="btn-myorder" onClick={onClose}>
                เสร็จสิ้น
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              <div className="myorder-banner" style={{ justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                <ClipboardPaste size={16} style={{ flexShrink: 0 }} />
                <span>
                  วางเลขพัสดุได้หลายเลข (คั่นด้วยขึ้นบรรทัดใหม่ เว้นวรรค หรือจุลภาค) ระบบจะจับคู่กับคำสั่งซื้อ MyOrder
                  แล้วเปิดเคส<strong>แยกเลขละ 1 เคส</strong> ส่งตรงถึง CEC ของแต่ละปลายทาง — เลขที่มีเคสเปิดอยู่แล้วจะถูกแนบเข้าเคสเดิม
                </span>
              </div>

              <div className="bulk-grid">
                {/* Left: inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>เลขพัสดุ ({parsed.valid.length} เลข):</span>
                      <button
                        type="button"
                        onClick={() => setRawInput(SAMPLE_PASTE)}
                        style={{ fontSize: '0.72rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', padding: '1px 6px' }}
                      >
                        ใส่ตัวอย่าง 10 เลข
                      </button>
                    </label>
                    <textarea
                      className="form-control"
                      rows={9}
                      style={{ fontFamily: 'var(--font-en)', fontSize: '0.85rem' }}
                      placeholder={'EN100200310TH\nEN100200311TH\nEN100200312TH\n...'}
                      value={rawInput}
                      onChange={e => setRawInput(e.target.value)}
                    />
                    {(parsed.invalid.length > 0 || parsed.duplicateCount > 0) && (
                      <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                        {parsed.invalid.length > 0 && <>รูปแบบไม่ถูกต้อง (ข้าม): {parsed.invalid.join(', ')}. </>}
                        {parsed.duplicateCount > 0 && <>ตัดเลขซ้ำออก {parsed.duplicateCount} รายการ</>}
                      </div>
                    )}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>ประเภทคำร้อง:</label>
                      <select className="form-control" value={category} onChange={e => handleCategoryChange(e.target.value as IssueCategory)}>
                        {(['EXPEDITE_REQUEST', 'CLOSE_WORK_REQUEST', 'REDELIVERY_REQUEST', 'RETURN_OR_REVERSE', 'DELAYED_DELIVERY', 'NOT_RECEIVED', 'OTHER'] as IssueCategory[]).map(c => (
                          <option key={c} value={c}>{ISSUE_CATEGORY_META[c]?.label || c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>ความเร่งด่วน:</label>
                      <select className="form-control" value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)}>
                        <option value="NORMAL">ปกติ</option>
                        <option value="HIGH">ด่วน</option>
                        <option value="CRITICAL">ด่วนที่สุด</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>ข้อความถึง ปณ. (ใช้กับทุกเลข):</label>
                    <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>ชื่อผู้แจ้ง:</label>
                    <input className="form-control" value={adminName} onChange={e => setAdminName(e.target.value)} />
                  </div>
                </div>

                {/* Right: live preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: 0 }}>
                {duplicateLines.length > 0 && (
                  <div className="duplicate-alert-banner" style={{ padding: '0.65rem 0.85rem' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#D97706' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <strong>พบ {duplicateLines.length} เลขพัสดุที่เคยสร้างเคสแล้วและเคสยังไม่ปิด</strong>
                      <span>เลือกในแต่ละแถวว่าจะติดตามเคสเดิม (แนบข้อความเข้าเคสเดิม) หรือสร้างเคสใหม่</span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setNewCaseFor([])}>
                          ติดตามเคสเดิมทั้งหมด
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => setNewCaseFor(duplicateLines.map(l => l.trackingNumber))}
                        >
                          สร้างเคสใหม่ทั้งหมด
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="case-table-card" style={{ alignSelf: 'stretch' }}>
                  <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table className="case-table">
                      <thead>
                        <tr>
                          <th>เลขพัสดุ / ร้านค้า</th>
                          <th>ผลตรวจ</th>
                          <th>CEC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--thp-muted)' }}>
                              วางเลขพัสดุด้านซ้ายเพื่อตรวจสอบรายการ
                            </td>
                          </tr>
                        ) : (
                          lines.map(line => {
                            const meta = STATUS_META[line.status];
                            return (
                              <tr key={line.trackingNumber}>
                                <td>
                                  <span className="tracking-pill">{line.trackingNumber}</span>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--thp-muted)', marginTop: 2 }}>
                                    {line.shop ? `${line.shop.name} • ${line.order?.orderId}` : '-'}
                                  </div>
                                </td>
                                <td>
                                  <span className="order-status-chip" style={{ background: meta.bg, color: meta.color }}>
                                    {meta.label}
                                  </span>
                                  {line.existingCase && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: 4 }}>
                                      <button
                                        type="button"
                                        onClick={() => setViewCase(line.existingCase!)}
                                        style={{ fontSize: '0.7rem', color: '#1D4ED8', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                                      >
                                        ดูเคส {line.existingCase.id}
                                      </button>
                                      <div className="dup-toggle">
                                        <button
                                          type="button"
                                          className={!wantsNew(line) ? 'active' : ''}
                                          onClick={() => setDecision(line.trackingNumber, false)}
                                        >
                                          ติดตามเคสเดิม
                                        </button>
                                        <button
                                          type="button"
                                          className={wantsNew(line) ? 'active' : ''}
                                          onClick={() => setDecision(line.trackingNumber, true)}
                                        >
                                          สร้างใหม่
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{cecPreview(line)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ marginRight: 'auto', fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
                เปิดเคสใหม่ {newCount} • ติดตามเคสเดิม {followCount} • ข้าม{' '}
                {lines.length - actionable.length + parsed.invalid.length}
              </span>
              <button type="button" className="btn-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-myorder"
                disabled={isSubmitting || actionable.length === 0 || !description.trim()}
                onClick={handleSubmit}
              >
                <Send size={15} /> {isSubmitting ? 'กำลังส่งเรื่องเข้าระบบ ปณ....' : `แจ้ง ${actionable.length} เลขพัสดุ`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}
    </>
  );
};

const SummaryTile: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="metric-card">
    <div className="metric-info">
      <span className="metric-label">{label}</span>
      <span className="metric-value" style={{ color }}>{value}</span>
    </div>
  </div>
);
