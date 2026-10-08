import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem } from '../../types/case';
import { CEC_REGIONS } from '../../data/cecRegions';
import { SlaBadge } from '../common/SlaBadge';
import { CaseDetailModal, type DetailTab } from '../common/CaseDetailModal';
import { IssueDisplay, UrgencyBadge } from '../common/IssueBadge';
import { getCaseStatusLabel } from '../common/StatusBadge';
import { LatestStatusCell, OrderRefChip, ReportedAtCell, TrackingCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { SearchBox } from '../common/SearchBox';
import { rowOpenProps } from '../../utils/rowOpen';
import { MapPin, Send, CheckCircle } from 'lucide-react';
import { SortTh, useCaseSort } from '../common/CaseSort';

export const CecWorkspace: React.FC = () => {
  const {
    filteredCases,
    statusFilter,
    selectedCecId,
    cecSubmitReply
  } = useCases();

  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseItem | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('OVERVIEW');
  const { sort, sortCases, toggle } = useCaseSort();
  const [replyingCase, setReplyingCase] = useState<CaseItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [branchNotes, setBranchNotes] = useState('');
  const [replierName, setReplierName] = useState('');

  const currentCec = CEC_REGIONS.find(c => c.id === selectedCecId) || CEC_REGIONS[0];

  // Cases for this CEC group (already scoped by role, sidebar status, search and date)
  const cecCases = filteredCases;

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
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--thp-muted)' }}>
          พื้นที่รับผิดชอบ: <strong style={{ color: 'var(--thp-slate)' }}>{currentCec.regionName}</strong> • สมาชิกกลุ่ม LINE{' '}
          <strong style={{ color: 'var(--thp-slate)' }}>{currentCec.memberCount} คน</strong> • เปลี่ยนกลุ่ม CEC ได้ที่แถบด้านบน
        </div>

        <div className="list-toolbar" style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
          <SearchBox />
          <DateRangeFilter idPrefix="cec-date" />
          <span className="list-count">
            {statusFilter !== 'ALL' && <strong>{getCaseStatusLabel(statusFilter)} • </strong>}
            {cecCases.length} เคส
          </span>
        </div>
      </div>

      {/* Case Table */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>เลขพัสดุ</th>
                <th>ปัญหา</th>
                <SortTh label="เร่งด่วน" sortKey="urgency" sort={sort} onSort={toggle} />
                <th>สถานะล่าสุด</th>
                <SortTh label="SLA" sortKey="sla" sort={sort} onSort={toggle} />
                <SortTh label="วันเวลาที่แจ้ง" sortKey="reportedAt" sort={sort} onSort={toggle} />
                <th>ปลายทาง & ผู้รับ</th>
                <th>ร้านค้า</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {cecCases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่มีเคสในกลุ่ม {currentCec.code} ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                sortCases(cecCases).map(item => (
                  <tr key={item.id} {...rowOpenProps(() => { setDetailTab('OVERVIEW'); setSelectedCaseDetail(item); })}>
                    <td>
                      <TrackingCell caseItem={item} />
                    </td>
                    <td>
                      <IssueDisplay category={item.category} inquiry={item.customerInquiry} />
                    </td>
                    <td>
                      <UrgencyBadge urgency={item.urgency} />
                    </td>
                    <td>
                      <LatestStatusCell caseItem={item} onOpen={() => { setDetailTab('TRACKING'); setSelectedCaseDetail(item); }} />
                    </td>
                    <td>
                      <SlaBadge
                        deadlineIso={item.slaDeadline}
                        isExceeded={item.isSlaExceeded}
                        status={item.status}
                        bagOpenedAt={item.bagOpenedAt || item.parcelInfo?.bagOpenedAt}
                        targetDays={item.slaTargetDays}
                        routeType={item.slaRouteType}
                        retentionDeadline={item.retentionDeadline}
                      />
                    </td>
                    <td>
                      <ReportedAtCell iso={item.createdAt} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.parcelInfo.destPostOffice}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        ผู้รับ: {item.parcelInfo.receiverName} ({item.parcelInfo.receiverPhone})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.companyName}</div>
                      <OrderRefChip caseItem={item} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
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
          initialTab={detailTab}
          onClose={() => setSelectedCaseDetail(null)}
        />
      )}
    </div>
  );
};
