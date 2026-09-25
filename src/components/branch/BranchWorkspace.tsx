import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem } from '../../types/case';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { SlaBadge } from '../common/SlaBadge';
import { IssueDisplay } from '../common/IssueBadge';
import { ReportedAtCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { rowOpenProps } from '../../utils/rowOpen';
import { notify } from '../../utils/dialog';
import {
  Package,
  CheckCircle2,
  Eye
} from 'lucide-react';

export const BranchWorkspace: React.FC = () => {
  const {
    cases,
    dateScopedCases,
    selectedBranchName,
    setSelectedBranchName,
    addChatMessage
  } = useCases();

  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseItem | null>(null);
  const [updateActionCase, setUpdateActionCase] = useState<CaseItem | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Destination branches list extracted from cases
  const availableBranches = Array.from(
    new Set(cases.map(c => c.assignedBranchName || c.parcelInfo.destPostOffice))
  );

  const branchCases = dateScopedCases.filter(
    c =>
      (c.assignedBranchName && c.assignedBranchName.includes(selectedBranchName.split(' ')[0])) ||
      c.status === 'CENTRAL_CONTACT_BRANCH' ||
      c.status === 'SLA_EXCEEDED'
  );

  const handleUpdatePhysicalStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateActionCase || !actionNote.trim()) return;

    addChatMessage(
      updateActionCase.id,
      `[สาขาปลายทาง ${selectedBranchName} บันทึก]: ${actionNote.trim()}`,
      'BRANCH',
      `เจ้าหน้าที่ ${selectedBranchName}`
    );

    notify('บันทึกผลการดำเนินการของสาขาปลายทางเรียบร้อยแล้ว', { title: 'บันทึกแล้ว', tone: 'success' });
    setUpdateActionCase(null);
    setActionNote('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Branch Header */}
      <div className="content-header">
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <Package size={24} color="var(--thp-red)" />
              <span>คิวงานที่ทำการไปรษณีย์ปลายทาง (Destination Branch)</span>
            </h1>
            <p>
              ตรวจสอบสิ่งของในพื้นที่จริง รับเรื่องประสานงานโดยตรงจาก ปณ.ส่วนกลาง สำหรับเคสที่เกิน SLA 3 วัน หรือเคสเร่งด่วนพิเศษ
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <DateRangeFilter idPrefix="branch-date" />
            <span style={{ fontSize: '0.82rem', color: 'var(--thp-muted)' }}>เลือกสาขาปลายทาง:</span>
            <select
              className="form-control"
              value={selectedBranchName}
              onChange={e => setSelectedBranchName(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {availableBranches.map((b, i) => (
                <option key={i} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branch Escalated Case List */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>Case ID / เลขพัสดุ</th>
                <th>วันเวลาที่แจ้ง</th>
                <th>ร้านค้า (MyOrder)</th>
                <th>ผู้รับปลายทาง</th>
                <th>ปัญหา & คำร้อง</th>
                <th>สถานะการประสานงาน</th>
                <th>บันทึกสายตรงจากส่วนกลาง</th>
                <th>SLA Timer</th>
                <th style={{ textAlign: 'right' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {branchCases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่มีเคสที่ถูกยกระดับหรือติดต่อมายังสาขานี้
                  </td>
                </tr>
              ) : (
                branchCases.map(item => {
                  const latestBranchLog = item.branchContactLogs[0];
                  return (
                    <tr key={item.id} {...rowOpenProps(() => setSelectedCaseDetail(item))}>
                      <td>
                        <div className="tracking-pill">{item.trackingNumber}</div>
                        <div className="case-id-sub">{item.id}</div>
                      </td>
                      <td>
                        <ReportedAtCell iso={item.createdAt} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                          {item.parcelInfo.destPostOffice}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.parcelInfo.receiverName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                          {item.parcelInfo.receiverPhone}
                        </div>
                      </td>
                      <td>
                        <IssueDisplay
                          category={item.category}
                          urgency={item.urgency}
                          inquiry={item.customerInquiry}
                          compact={true}
                        />
                      </td>
                      <td>
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                      </td>
                      <td>
                        {latestBranchLog ? (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#9F1239',
                              background: '#FFF1F2',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #FECDD3',
                              maxWidth: '260px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={latestBranchLog.outcome}
                          >
                            📞 {latestBranchLog.outcome}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>
                            รอส่วนกลางติดต่อสายตรง
                          </span>
                        )}
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
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => {
                              setUpdateActionCase(item);
                              setActionNote('นำจ่ายซ้ำเรียบร้อย ผู้รับลงชื่อรับจริง...');
                            }}
                          >
                            บันทึกผลนำจ่าย
                          </button>

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Branch Action */}
      {updateActionCase && (
        <div className="modal-backdrop" onClick={() => setUpdateActionCase(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <CheckCircle2 size={20} color="var(--thp-red)" />
                <span>บันทึกผลการตรวจสอบ/นำจ่ายพัสดุในพื้นที่</span>
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setUpdateActionCase(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePhysicalStatus} className="modal-body">
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--thp-border)',
                  fontSize: '0.85rem'
                }}
              >
                <div><strong>เลขพัสดุ:</strong> {updateActionCase.trackingNumber}</div>
                <div><strong>ผู้รับ:</strong> {updateActionCase.parcelInfo.receiverName} ({updateActionCase.parcelInfo.receiverAddress})</div>
              </div>

              <div className="form-group">
                <label>บันทึกการดำเนินการของสาขา (จะแสดงใน Timeline และ Chat Log):</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="เช่น บุรุษไปรษณีย์ได้นำพัสดุไปส่งมอบใหม่ถึงมือผู้รับเรียบร้อยแล้ว โดยผู้รับลงชื่อรับจริง..."
                  required
                />
              </div>

              <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setUpdateActionCase(null)}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-success">
                  <CheckCircle2 size={16} /> บันทึกและส่งข้อความ
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
