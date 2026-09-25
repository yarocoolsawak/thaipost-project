import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem } from '../../types/case';
import { CEC_REGIONS } from '../../data/cecRegions';
import { SlaBadge } from '../common/SlaBadge';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { IssueDisplay } from '../common/IssueBadge';
import { DuplicateChip, EmailCountChip, OrderRefChip, ReportedAtCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { rowOpenProps } from '../../utils/rowOpen';
import {
  MapPin,
  Send,
  Eye,
  CheckCircle
} from 'lucide-react';

export const CecWorkspace: React.FC = () => {
  const {
    dateScopedCases,
    selectedCecId,
    setSelectedCecId,
    cecSubmitReply
  } = useCases();

  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseItem | null>(null);
  const [replyingCase, setReplyingCase] = useState<CaseItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [branchNotes, setBranchNotes] = useState('');
  const [replierName, setReplierName] = useState('');

  const currentCec = CEC_REGIONS.find(c => c.id === selectedCecId) || CEC_REGIONS[0];

  // Cases for this specific CEC
  const cecCases = dateScopedCases.filter(c => c.assignedCecId === selectedCecId);

  const handleOpenReplyModal = (c: CaseItem) => {
    setReplyingCase(c);
    setReplyText(
      `เจ้าหน้าที่ ปณ.ปลายทาง ตรวจสอบแล้ว พบว่าพัสดุ ${c.trackingNumber} ...`
    );
    setBranchNotes('ประสานกับหัวหน้าเวรนำจ่ายเรียบร้อย');
    setReplierName(`เจ้าหน้าที่ ${currentCec.code}`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingCase || !replyText.trim()) return;

    cecSubmitReply(replyingCase.id, replyText.trim(), branchNotes.trim(), replierName.trim());
    setReplyingCase(null);
    setReplyText('');
    setBranchNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* CEC Region Banner */}
      <div className="content-header">
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <MapPin size={24} color="var(--thp-red)" />
              <span>{currentCec.name} (คิวงานศูนย์ประสานงานลูกค้า)</span>
            </h1>
            <p>
              รับเคสที่ร้านค้าแจ้งผ่าน MyOrder (ส่งตรงถึง CEC หรือ ปณ.ส่วนกลางระบุให้) ตรวจสอบกับที่ทำการไปรษณีย์ปลายทาง และส่งคำตอบกลับเข้า Central Review Queue
            </p>
          </div>

          {/* Switch CEC group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <DateRangeFilter idPrefix="cec-date" />
            <span style={{ fontSize: '0.82rem', color: 'var(--thp-muted)' }}>สลับกลุ่ม CEC:</span>
            <select
              className="form-control"
              value={selectedCecId}
              onChange={e => setSelectedCecId(Number(e.target.value))}
              style={{ fontWeight: 600 }}
            >
              {CEC_REGIONS.map(cec => (
                <option key={cec.id} value={cec.id}>
                  {cec.code}: {cec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CEC Stats bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            background: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--thp-border)',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--thp-muted)' }}>พื้นที่รับผิดชอบ:</span>{' '}
            <strong>{currentCec.regionName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--thp-muted)' }}>สมาชิกกลุ่ม LINE:</span>{' '}
            <strong>{currentCec.memberCount} คน</strong>
          </div>
          <div>
            <span style={{ color: 'var(--thp-muted)' }}>เคสในความดูแล:</span>{' '}
            <strong style={{ color: '#0284C7' }}>{cecCases.length} เคส</strong>
          </div>
        </div>
      </div>

      {/* Case Table */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>Case ID / เลขพัสดุ</th>
                <th>วันเวลาที่แจ้ง</th>
                <th>ร้านค้า</th>
                <th>สาขาปลายทาง & ผู้รับ</th>
                <th>ปัญหา & รายละเอียดคำร้อง</th>
                <th>สถานะเคส</th>
                <th>SLA Timer (3 วัน)</th>
                <th style={{ textAlign: 'right' }}>การตอบกลับ</th>
              </tr>
            </thead>
            <tbody>
              {cecCases.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่มีเคสคงค้างในกลุ่ม {currentCec.code} ในขณะนี้
                  </td>
                </tr>
              ) : (
                cecCases.map(item => (
                  <tr key={item.id} {...rowOpenProps(() => setSelectedCaseDetail(item))}>
                    <td>
                      <div className="tracking-pill">{item.trackingNumber}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className="case-id-sub">{item.id}</span>
                        <EmailCountChip caseItem={item} />
                      </div>
                      <DuplicateChip caseItem={item} />
                    </td>
                    <td>
                      <ReportedAtCell iso={item.createdAt} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.companyName}</div>
                      <OrderRefChip caseItem={item} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.parcelInfo.destPostOffice}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        ผู้รับ: {item.parcelInfo.receiverName} ({item.parcelInfo.receiverPhone})
                      </div>
                    </td>
                    <td>
                      <IssueDisplay
                        category={item.category}
                        urgency={item.urgency}
                        inquiry={item.customerInquiry}
                      />
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    </td>
                    <td>
                      <SlaBadge
                        deadlineIso={item.slaDeadline}
                        isExceeded={item.isSlaExceeded}
                        status={item.status}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Reply Action */}
                        {item.status === 'WAITING_CEC_REPLY' || item.status === 'SENT_TO_CEC' ? (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleOpenReplyModal(item)}
                          >
                            <Send size={13} /> ประสานสาขา & ตอบ
                          </button>
                        ) : item.status === 'WAITING_CENTRAL_REVIEW' ? (
                          <span style={{ fontSize: '0.75rem', color: '#4338CA', fontWeight: 600 }}>
                            รอส่วนกลางรีวิว
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleOpenReplyModal(item)}
                          >
                            อัปเดตข้อมูล
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setSelectedCaseDetail(item)}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: CEC Submit Reply */}
      {replyingCase && (
        <div className="modal-backdrop" onClick={() => setReplyingCase(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Send size={20} color="var(--thp-red)" />
                <span>ส่งคำตอบและผลการตรวจสอบจากสาขา ({currentCec.code})</span>
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setReplyingCase(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReply} className="modal-body">
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--thp-border)',
                  fontSize: '0.85rem'
                }}
              >
                <div><strong>Case:</strong> {replyingCase.id} ({replyingCase.trackingNumber})</div>
                <div><strong>ปลายทาง:</strong> {replyingCase.parcelInfo.destPostOffice}</div>
                <div style={{ color: 'var(--thp-muted)', marginTop: '4px' }}>
                  <strong>คำถามลูกค้า:</strong> "{replyingCase.customerInquiry}"
                </div>
              </div>

              <div className="form-group">
                <label>ชื่อผู้ประสานงาน / เจ้าหน้าที่ CEC ผู้ตอบ:</label>
                <input
                  type="text"
                  className="form-control"
                  value={replierName}
                  onChange={e => setReplierName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>ข้อความคำตอบที่ส่งกลับไปยัง ปณ.ส่วนกลาง (จะผ่านการ Review ก่อนส่งกลับร้านค้า):</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="ระบุข้อเท็จจริง เช่น สาขาแจ้งว่านำจ่ายไว้ที่นิติบุคคลคอนโด เนื่องจากผู้รับไม่อยู่ห้อง โดยมีคุณสมศรี รปภ. เซ็นรับ..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>บันทึกการประสานงานภายในกับสาขา (Internal Branch Notes):</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น ประสานกับนายสมชาย หน.สายนำจ่าย ปณ.ปลายทาง เวลา 11:30 น."
                  value={branchNotes}
                  onChange={e => setBranchNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReplyingCase(null)}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle size={16} /> ส่งคำตอบเข้า Central Review Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCaseDetail && (
        <CaseDetailModal
          caseItem={selectedCaseDetail}
          onClose={() => setSelectedCaseDetail(null)}
        />
      )}
    </div>
  );
};
