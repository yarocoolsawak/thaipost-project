import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem } from '../../types/case';
import { SlaBadge } from '../common/SlaBadge';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { AnswerReviewModal } from './AnswerReviewModal';
import { BranchEscalationModal } from './BranchEscalationModal';
import { CEC_REGIONS } from '../../data/cecRegions';
import { exportCasesToExcel } from '../../utils/exportExcel';
import { ISSUE_CATEGORY_META, IssueDisplay, UrgencyBadge } from '../common/IssueBadge';
import { CaseStatusBadge, getCaseStatusLabel } from '../common/StatusBadge';
import { DestinationCell, OrderRefChip, ReportedAtCell, TrackingCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { SearchBox } from '../common/SearchBox';
import { rowOpenProps } from '../../utils/rowOpen';
import type { IssueCategory } from '../../types/case';
import { Building2, CheckCircle2, PhoneForwarded, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const CentralQueue: React.FC = () => {
  const {
    filteredCases,
    statusFilter,
    categoryFilter,
    setCategoryFilter,
    syncParcelTracking
  } = useCases();

  // Modals state
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);
  const [reviewCase, setReviewCase] = useState<CaseItem | null>(null);
  const [escalateCase, setEscalateCase] = useState<CaseItem | null>(null);
  const [cecFilter, setCecFilter] = useState<string>('ALL');
  const [syncingIds, setSyncingIds] = useState<string[]>([]);
  const [syncNotice, setSyncNotice] = useState('');

  // Filter cases with CEC filter if selected
  const displayCases = filteredCases.filter(c => {
    if (cecFilter === 'NONE') {
      if (c.assignedCecId !== undefined) return false;
    } else if (cecFilter !== 'ALL' && c.assignedCecId?.toString() !== cecFilter) {
      return false;
    }
    return true;
  });

  const blankCecCases = filteredCases.filter(c => c.assignedCecId === undefined && c.status !== 'CLOSED');

  const runSync = async (ids: string[]) => {
    setSyncingIds(ids);
    const results = await Promise.all(ids.map(id => syncParcelTracking(id)));
    setSyncingIds([]);
    const assigned = results.filter(r => r === 'CEC_ASSIGNED').length;
    const updated = results.filter(r => r !== 'NO_CHANGE').length;
    setSyncNotice(
      updated === 0
        ? 'QMS ยังไม่มีสถานะพัสดุใหม่ — CEC ยังระบุไม่ได้'
        : `QMS อัปเดตสถานะพัสดุ ${updated} เคส${assigned ? ` • ระบุ CEC อัตโนมัติ ${assigned} เคส` : ''}`
    );
  };

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
            <p>เห็นและจัดการเคสทั้งหมดที่ร้านค้าแจ้งผ่าน MyOrder • เคสส่งตรงถึง CEC อัตโนมัติ • ควบคุม SLA 3 วัน</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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

            {blankCecCases.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => runSync(blankCecCases.map(c => c.id))}
                disabled={syncingIds.length > 0}
                style={{ fontWeight: 600, borderColor: '#FDBA74', color: '#C2410C', background: '#FFF7ED' }}
                title="ดึงสถานะพัสดุล่าสุดจาก QMS — CEC จะถูกระบุอัตโนมัติเมื่อ QMS ยืนยันพื้นที่ปลายทาง"
              >
                <RefreshCw size={15} /> {syncingIds.length > 0 ? 'กำลังดึงข้อมูล...' : `ดึงสถานะจาก QMS (${blankCecCases.length})`}
              </button>
            )}

          </div>
        </div>

        {syncNotice && (
          <div
            style={{
              fontSize: '0.82rem',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#075985',
              borderRadius: '8px',
              padding: '0.5rem 0.8rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>{syncNotice}</span>
            <button type="button" onClick={() => setSyncNotice('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}

        {/* Search + filters (case status is picked from the sidebar) */}
        <div className="list-toolbar" style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
          <SearchBox />
          <select
            className="form-control"
            style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={cecFilter}
            onChange={e => setCecFilter(e.target.value)}
            aria-label="กลุ่ม CEC"
          >
            <option value="ALL">ทุก CEC (1-14)</option>
            <option value="NONE">ยังไม่ระบุ CEC</option>
            {CEC_REGIONS.map(cec => (
              <option key={cec.id} value={cec.id.toString()}>
                {cec.code}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="ประเภทปัญหา"
          >
            <option value="ALL">ทุกปัญหา</option>
            {(Object.keys(ISSUE_CATEGORY_META) as IssueCategory[]).map(key => (
              <option key={key} value={key}>
                {ISSUE_CATEGORY_META[key].shortLabel}
              </option>
            ))}
          </select>
          <DateRangeFilter idPrefix="central-date" />
          <span className="list-count">
            {statusFilter !== 'ALL' && <strong>{getCaseStatusLabel(statusFilter)} • </strong>}
            {displayCases.length} เคส
          </span>
        </div>
      </div>

      {/* Case Table Card */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>เลขพัสดุ</th>
                <th>ปัญหา</th>
                <th>ความเร่งด่วน</th>
                <th>สถานะ</th>
                <th>SLA</th>
                <th>วันเวลาที่แจ้ง</th>
                <th>ร้านค้า / ผู้แจ้ง</th>
                <th>ปลายทาง & CEC</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {displayCases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่พบเคสที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง
                  </td>
                </tr>
              ) : (
                displayCases.map(item => (
                  <tr key={item.id} {...rowOpenProps(() => setSelectedCaseForDetail(item))}>
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
                      <CaseStatusBadge status={item.status} />
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
                      <div style={{ fontWeight: 600, color: 'var(--thp-dark)' }}>{item.companyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>{item.contactPerson}</div>
                      <OrderRefChip caseItem={item} />
                    </td>
                    <td>
                      <DestinationCell caseItem={item} showHint />
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

                        {/* CEC still blank: it can only be filled from QMS parcel status, never by hand */}
                        {item.assignedCecId === undefined && item.status !== 'CLOSED' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => runSync([item.id])}
                            disabled={syncingIds.includes(item.id)}
                            title="ดึงสถานะพัสดุล่าสุดจาก QMS (CEC ถูกระบุอัตโนมัติเมื่อ QMS ยืนยันพื้นที่ปลายทาง)"
                          >
                            <RefreshCw size={13} /> QMS
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
        />
      )}

      {reviewCase && (
        <AnswerReviewModal caseItem={reviewCase} onClose={() => setReviewCase(null)} />
      )}

      {escalateCase && (
        <BranchEscalationModal caseItem={escalateCase} onClose={() => setEscalateCase(null)} />
      )}
    </div>
  );
};
