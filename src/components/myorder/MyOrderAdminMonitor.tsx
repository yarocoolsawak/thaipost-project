import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem } from '../../types/case';
import { IssueDisplay, UrgencyBadge } from '../common/IssueBadge';
import { SlaBadge } from '../common/SlaBadge';
import { DestinationCell, LatestStatusCell, ReportedAtCell, TrackingCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { SearchBox } from '../common/SearchBox';
import { matchesCaseSearch } from '../../utils/caseSearch';
import { rowOpenProps } from '../../utils/rowOpen';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { EmailDispatchModal } from './EmailDispatchModal';
import { exportCasesToExcel } from '../../utils/exportExcel';
import { MYORDER_CASE_FILTERS, matchesCaseFilter } from './caseFilters';
import { MonitorCheck, FileSpreadsheet, Mail } from 'lucide-react';
import { SortTh, useCaseSort } from '../common/CaseSort';

export const MyOrderAdminMonitor: React.FC = () => {
  const { searchQuery } = useCases();
  const {
    shops,
    myOrderCases,
    caseFilter: filter,
    adminShopFilter: shopFilter,
    setAdminShopFilter: setShopFilter
  } = useMyOrder();
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);
  const [detailTab, setDetailTab] = useState<'STATUS' | 'TRACKING'>('STATUS');
  const [emailCase, setEmailCase] = useState<CaseItem | null>(null);
  const { sort, sortCases, toggle } = useCaseSort();

  // MyOrder admin monitors every shop's cases (shop picker here, status filter in the sidebar)
  const visible = myOrderCases.filter(c => matchesCaseSearch(c, searchQuery) && matchesCaseFilter(c, filter));
  const filterLabel = MYORDER_CASE_FILTERS.find(f => f.key === filter)?.label;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <MonitorCheck size={22} color="var(--myorder-teal)" />
              <span>Monitoring เคสจากร้านค้า (MyOrder Admin)</span>
            </h1>
            <p>เคสที่ร้านค้าแจ้งผ่าน MyOrder ถูกส่งตรงเข้า ปณ./CEC — ติดตามความคืบหน้าทุกร้านได้ที่นี่</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => exportCasesToExcel(visible, 'MyOrder_Cases')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileSpreadsheet size={15} color="#059669" /> Export Excel
            </button>
          </div>
        </div>

        <div className="list-toolbar" style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
          <SearchBox placeholder="ค้นหาเลขพัสดุ / เลขคำสั่งซื้อ / ร้านค้า..." />
          <select
            className="form-control"
            style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={shopFilter}
            onChange={e => setShopFilter(e.target.value)}
            aria-label="ร้านค้า"
          >
            <option value="ALL">ทุกร้านค้า ({shops.length})</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <DateRangeFilter idPrefix="myorder-admin-date" />
          <span className="list-count">
            {filter !== 'ALL' && <strong>{filterLabel} • </strong>}
            {visible.length} เคส
          </span>
        </div>
      </div>

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
                <th>ปลายทาง & CEC</th>
                <th>ร้านค้า / คำสั่งซื้อ</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่พบเคสที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                sortCases(visible).map(c => (
                  <tr key={c.id} {...rowOpenProps(() => { setDetailTab('STATUS'); setViewCase(c); })}>
                    <td>
                      <TrackingCell caseItem={c} />
                    </td>
                    <td>
                      <IssueDisplay category={c.category} inquiry={c.customerInquiry} />
                    </td>
                    <td>
                      <UrgencyBadge urgency={c.urgency} />
                    </td>
                    <td>
                      <LatestStatusCell caseItem={c} onOpen={() => { setDetailTab('TRACKING'); setViewCase(c); }} />
                    </td>
                    <td>
                      <SlaBadge
                        deadlineIso={c.slaDeadline}
                        isExceeded={c.isSlaExceeded}
                        status={c.status}
                        bagOpenedAt={c.bagOpenedAt || c.parcelInfo?.bagOpenedAt}
                        targetDays={c.slaTargetDays}
                        routeType={c.slaRouteType}
                        retentionDeadline={c.retentionDeadline}
                      />
                    </td>
                    <td>
                      <ReportedAtCell iso={c.createdAt} />
                    </td>
                    <td>
                      <DestinationCell caseItem={c} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.myOrderRef.shopName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        {c.myOrderRef.orderId} • {c.contactPerson}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        {c.status !== 'CLOSED' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', borderColor: '#BAE6FD', color: '#0369A1', background: '#F0F9FF' }}
                            onClick={() => setEmailCase(c)}
                            title="ส่งอีเมลคำร้องแทนร้านค้า (ตีกลับ / เปลี่ยนที่อยู่ / แนบหลักฐาน)"
                          >
                            <Mail size={13} /> ส่งเมล
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

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} initialTab={detailTab} onClose={() => setViewCase(null)} />}
      {emailCase && <EmailDispatchModal caseItem={emailCase} onClose={() => setEmailCase(null)} />}
    </div>
  );
};
