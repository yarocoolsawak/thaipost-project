import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem } from '../../types/case';
import { IssueDisplay } from '../common/IssueBadge';
import { SlaBadge } from '../common/SlaBadge';
import { DestinationCell, DuplicateChip, EmailCountChip, ReportedAtCell } from '../common/CecAssignment';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { rowOpenProps } from '../../utils/rowOpen';
import { MerchantStatusBadge } from './CaseProgress';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { EmailDispatchModal } from './EmailDispatchModal';
import { MetricCard } from './MerchantOrders';
import { exportCasesToExcel } from '../../utils/exportExcel';
import { MYORDER_CASE_FILTERS, matchesCaseFilter, type MyOrderCaseFilter } from './caseFilters';
import { MonitorCheck, Eye, HelpCircle, Send, CheckCircle2, AlertTriangle, FileSpreadsheet, Store, Layers, Mail } from 'lucide-react';

interface MyOrderAdminMonitorProps {
  onOpenBulkReport: () => void;
}

export const MyOrderAdminMonitor: React.FC<MyOrderAdminMonitorProps> = ({ onOpenBulkReport }) => {
  const { searchQuery } = useCases();
  const {
    shops,
    myOrderCases,
    caseFilter: filter,
    setCaseFilter: setFilter,
    adminShopFilter: shopFilter,
    setAdminShopFilter: setShopFilter
  } = useMyOrder();
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);
  const [emailCase, setEmailCase] = useState<CaseItem | null>(null);

  // MyOrder admin monitors every shop's cases (shop picker + status filter are shared with the sidebar)
  const q = searchQuery.trim().toLowerCase();
  const scoped = myOrderCases.filter(
    c =>
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.trackingNumber.toLowerCase().includes(q) ||
      c.myOrderRef.orderId.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q)
  );
  const visible = scoped.filter(c => matchesCaseFilter(c, filter));
  const count = (f: MyOrderCaseFilter) => scoped.filter(c => matchesCaseFilter(c, f)).length;

  const tabs = MYORDER_CASE_FILTERS.map(f => ({ key: f.key, label: f.key === 'ALL' ? 'ทั้งหมด' : f.label }));

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
            <DateRangeFilter idPrefix="myorder-admin-date" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
              <Store size={14} />
              <select
                className="form-control"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                value={shopFilter}
                onChange={e => setShopFilter(e.target.value)}
              >
                <option value="ALL">ทุกร้านค้า ({shops.length})</option>
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => exportCasesToExcel(visible, 'MyOrder_Cases')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileSpreadsheet size={15} color="#059669" /> Export Excel
            </button>
            <button type="button" className="btn-myorder" onClick={onOpenBulkReport}>
              <Layers size={15} /> แจ้งหลายเลขพัสดุ (เช่น เร่งนำส่ง)
            </button>
          </div>
        </div>

        <div className="status-tabs-row">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`status-tab-btn ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="tab-num">{count(tab.key)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="รอระบุ CEC" value={count('PENDING_CEC')} icon={<HelpCircle size={22} color="#C2410C" />} bg="#FFF7ED" />
        <MetricCard label="อยู่ระหว่าง CEC ตรวจสอบ" value={count('AT_CEC')} icon={<Send size={22} color="#B45309" />} bg="#FFFBEB" />
        <MetricCard label="ได้รับคำตอบแล้ว" value={count('ANSWERED')} icon={<CheckCircle2 size={22} color="#047857" />} bg="#ECFDF5" />
        <MetricCard label="เกิน SLA 3 วัน" value={count('SLA')} icon={<AlertTriangle size={22} color="#B91C1C" />} bg="#FEF2F2" />
      </div>

      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>ร้านค้า / คำสั่งซื้อ</th>
                <th>Case ID / เลขพัสดุ</th>
                <th>วันเวลาที่แจ้ง</th>
                <th>ปัญหา</th>
                <th>ปลายทาง & กลุ่ม CEC</th>
                <th>สถานะ</th>
                <th>SLA</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่มีเคสในหมวดนี้
                  </td>
                </tr>
              ) : (
                visible.map(c => (
                  <tr key={c.id} {...rowOpenProps(() => setViewCase(c))}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.myOrderRef.shopName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        {c.myOrderRef.orderId} • {c.contactPerson}
                      </div>
                    </td>
                    <td>
                      <div className="tracking-pill">{c.trackingNumber}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className="case-id-sub">{c.id}</span>
                        <EmailCountChip caseItem={c} />
                      </div>
                      <DuplicateChip caseItem={c} />
                    </td>
                    <td>
                      <ReportedAtCell iso={c.createdAt} />
                    </td>
                    <td>
                      <IssueDisplay category={c.category} urgency={c.urgency} inquiry={c.customerInquiry} compact />
                    </td>
                    <td>
                      <DestinationCell caseItem={c} showHint />
                    </td>
                    <td>
                      <MerchantStatusBadge status={c.status} />
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
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
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
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setViewCase(c)}
                        >
                          <Eye size={13} /> ติดตาม
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

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}
      {emailCase && <EmailDispatchModal caseItem={emailCase} onClose={() => setEmailCase(null)} />}
    </div>
  );
};
