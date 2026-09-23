import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem } from '../../types/case';
import { SlaBadge } from '../common/SlaBadge';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { AnswerReviewModal } from './AnswerReviewModal';
import { BranchEscalationModal } from './BranchEscalationModal';
import { DispatchCecModal } from './DispatchCecModal';
import { CEC_REGIONS } from '../../data/cecRegions';
import { exportCasesToExcel } from '../../utils/exportExcel';
import { IssueDisplay } from '../common/IssueBadge';
import {
  Building2,
  Filter,
  CheckCircle2,
  PhoneForwarded,
  Send,
  Eye,
  AlertTriangle,
  FileSpreadsheet,
  Mail
} from 'lucide-react';

export const CentralQueue: React.FC = () => {
  const {
    filteredCases,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    counts
  } = useCases();

  // Modals state
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);
  const [reviewCase, setReviewCase] = useState<CaseItem | null>(null);
  const [escalateCase, setEscalateCase] = useState<CaseItem | null>(null);
  const [dispatchCase, setDispatchCase] = useState<CaseItem | null>(null);
  const [cecFilter, setCecFilter] = useState<string>('ALL');

  // Filter cases with CEC filter if selected
  const displayCases = filteredCases.filter(c => {
    if (cecFilter !== 'ALL' && c.assignedCecId?.toString() !== cecFilter) {
      return false;
    }
    return true;
  });

  const statusTabs = [
    { key: 'ALL', label: 'ทั้งหมด', count: counts.total },
    { key: 'NEW', label: 'เคสใหม่', count: counts.newCases },
    { key: 'WAITING_CEC_REPLY', label: 'รอ CEC ตอบ', count: counts.waitingCec },
    { key: 'WAITING_CENTRAL_REVIEW', label: 'รอตรวจคำตอบ', count: counts.waitingReview, highlight: true },
    { key: 'SLA_EXCEEDED', label: 'เกิน SLA 3 วัน', count: counts.slaExceeded, isDanger: true },
    { key: 'CENTRAL_CONTACT_BRANCH', label: 'โทรสาขาแล้ว', count: counts.branchEscalated },
    { key: 'CLOSED', label: 'ปิดแล้ว', count: counts.closed }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Content Header */}
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <Building2 size={22} color="var(--thp-red)" />
              <span>คิวงานควบคุมและรีวิวคำตอบ (ปณ.ส่วนกลาง)</span>
            </h1>
            <p>ติดตามงาน 14 กลุ่ม CEC • ควบคุม SLA 3 วัน</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Export Excel Button */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => exportCasesToExcel(displayCases, `ThaiPost_CentralQueue_${statusFilter}`)}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: '#A7F3D0', color: '#065F46', background: '#F0FDF4' }}
              title="ส่งออกรายการเคสเป็นไฟล์ Excel (.csv)"
            >
              <FileSpreadsheet size={16} color="#059669" />
              <span>Export Excel</span>
            </button>

            {counts.waitingReview > 0 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStatusFilter('WAITING_CENTRAL_REVIEW')}
                style={{ background: '#4F46E5', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              >
                <CheckCircle2 size={15} /> รอรีวิว {counts.waitingReview} เคส
              </button>
            )}

            {counts.slaExceeded > 0 && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => setStatusFilter('SLA_EXCEEDED')}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              >
                <AlertTriangle size={15} /> เกิน SLA {counts.slaExceeded} เคส
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.25rem', borderTop: '1px solid #F1F5F9' }}>
          {/* Status Tabs */}
          <div className="status-tabs-row">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`status-tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
                style={
                  tab.highlight && statusFilter !== tab.key
                    ? { borderColor: '#818CF8', background: '#EEF2FF', color: '#3730A3' }
                    : tab.isDanger && statusFilter !== tab.key
                    ? { borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }
                    : {}
                }
                onClick={() => setStatusFilter(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="tab-num">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
              <Filter size={14} />
              <span>CEC เขต:</span>
              <select
                className="form-control"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '130px' }}
                value={cecFilter}
                onChange={e => setCecFilter(e.target.value)}
              >
                <option value="ALL">ทุกเขต (1-14)</option>
                {CEC_REGIONS.map(cec => (
                  <option key={cec.id} value={cec.id.toString()}>
                    {cec.code}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
              <span>ปัญหา:</span>
              <select
                className="form-control"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '140px' }}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">ทุกประเภทปัญหา</option>
                <option value="DELAYED_DELIVERY">พัสดุล่าช้า</option>
                <option value="NOT_RECEIVED">ยังไม่ได้รับของ</option>
                <option value="WRONG_BRANCH">ส่งผิดสาขา/หลง</option>
                <option value="DAMAGED_PARCEL">ชำรุดเสียหาย</option>
                <option value="CANNOT_LOCATE">ค้นหาไม่พบ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Case Table Card */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>Case ID / เลขพัสดุ</th>
                <th>บริษัทคู่ค้า / ผู้แจ้ง</th>
                <th>ปลายทาง & กลุ่ม CEC</th>
                <th>ปัญหา & รายละเอียดคำร้อง</th>
                <th>สถานะเคส</th>
                <th>SLA Timer (3 วัน)</th>
                <th style={{ textAlign: 'right' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {displayCases.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่พบเคสที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง
                  </td>
                </tr>
              ) : (
                displayCases.map(item => (
                  <tr key={item.id}>
                    {/* Case & Tracking */}
                    <td>
                      <div className="tracking-pill">{item.trackingNumber}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className="case-id-sub">{item.id}</span>
                        {item.emails && item.emails.length > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.7rem',
                              color: '#1D4ED8',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              padding: '0.05rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                            title={`มีอีเมลคำร้องทางการ ${item.emails.length} ฉบับ`}
                          >
                            <Mail size={10} /> {item.emails.length}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Company */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--thp-dark)' }}>{item.companyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        {item.contactPerson} ({item.contactChannel})
                      </div>
                    </td>

                    {/* Destination & CEC */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>
                        {item.assignedBranchName || item.parcelInfo.destPostOffice}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4338CA', fontWeight: 500 }}>
                        {item.assignedCecName || 'CEC 1'}
                      </div>
                    </td>

                    {/* Category & Problem Details */}
                    <td>
                      <IssueDisplay
                        category={item.category}
                        urgency={item.urgency}
                        inquiry={item.customerInquiry}
                      />
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    </td>

                    {/* SLA Timer */}
                    <td>
                      <SlaBadge
                        deadlineIso={item.slaDeadline}
                        isExceeded={item.isSlaExceeded}
                        status={item.status}
                      />
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Action 1: If Waiting Central Review, show Review button */}
                        {item.status === 'WAITING_CENTRAL_REVIEW' && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', background: '#4F46E5' }}
                            onClick={() => setReviewCase(item)}
                          >
                            <CheckCircle2 size={13} /> ตรวจคำตอบ
                          </button>
                        )}

                        {/* Action 2: If SLA Exceeded, show Call Branch directly button */}
                        {(item.isSlaExceeded || item.status === 'SLA_EXCEEDED') && (
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => setEscalateCase(item)}
                          >
                            <PhoneForwarded size={13} /> โทรหา ปณ.
                          </button>
                        )}

                        {/* Action 3: If NEW, show Dispatch to CEC button */}
                        {(item.status === 'NEW' || item.status === 'CENTRAL_REVIEWING') && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => setDispatchCase(item)}
                          >
                            <Send size={13} /> ส่งเข้า CEC
                          </button>
                        )}

                        {/* View Full Detail */}
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setSelectedCaseForDetail(item)}
                          title="ดูรายละเอียด ไทม์ไลน์ และแชท"
                        >
                          <Eye size={13} /> รายละเอียด
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

      {/* Modals */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          caseItem={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
          onOpenReviewAnswer={c => {
            setSelectedCaseForDetail(null);
            setReviewCase(c);
          }}
          onOpenEscalateBranch={c => {
            setSelectedCaseForDetail(null);
            setEscalateCase(c);
          }}
          onOpenDispatchCec={c => {
            setSelectedCaseForDetail(null);
            setDispatchCase(c);
          }}
        />
      )}

      {reviewCase && (
        <AnswerReviewModal caseItem={reviewCase} onClose={() => setReviewCase(null)} />
      )}

      {escalateCase && (
        <BranchEscalationModal caseItem={escalateCase} onClose={() => setEscalateCase(null)} />
      )}

      {dispatchCase && (
        <DispatchCecModal caseItem={dispatchCase} onClose={() => setDispatchCase(null)} />
      )}
    </div>
  );
};
