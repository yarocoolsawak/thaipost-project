import React from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import { MYORDER_CASE_FILTERS, matchesCaseFilter } from '../myorder/caseFilters';
import {
  Inbox,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  PhoneForwarded,
  Layers,
  ShoppingBag,
  ClipboardList,
  MonitorCheck,
  HelpCircle,
  MailCheck
} from 'lucide-react';

export type AppTab = 'CASES' | 'DASHBOARD' | 'ORDERS' | 'EMAILS';

interface SidebarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onOpenBulkReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenBulkReport
}) => {
  const {
    role,
    cases,
    statusFilter,
    setStatusFilter,
    counts
  } = useCases();
  const { myOrderCases, caseFilter, setCaseFilter } = useMyOrder();
  const sentEmailCount = cases.reduce((sum, c) => sum + (c.emails?.length || 0), 0);

  // MyOrder side has its own, simpler navigation
  if (role === 'MERCHANT' || role === 'MYORDER_ADMIN') {
    return (
      <aside className="sidebar-panel">
        {role === 'MYORDER_ADMIN' && onOpenBulkReport && (
          <button
            type="button"
            className="btn-myorder"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
            onClick={onOpenBulkReport}
          >
            <Layers size={18} />
            <span>แจ้งหลายเลขพัสดุพร้อมกัน</span>
          </button>
        )}
        <div className="sidebar-card">
          <div className="sidebar-title">MyOrder {role === 'MERCHANT' ? '(ร้านค้า)' : '(แอดมิน)'}</div>
          {role === 'MERCHANT' ? (
            <>
              <button
                type="button"
                className={`nav-item-btn ${currentTab === 'ORDERS' ? 'active' : ''}`}
                onClick={() => setCurrentTab('ORDERS')}
              >
                <div className="nav-item-left">
                  <ShoppingBag size={18} />
                  <span>จัดการคำสั่งซื้อ</span>
                </div>
              </button>
              <button
                type="button"
                className={`nav-item-btn ${currentTab === 'CASES' ? 'active' : ''}`}
                onClick={() => setCurrentTab('CASES')}
              >
                <div className="nav-item-left">
                  <ClipboardList size={18} />
                  <span>ติดตามปัญหาที่แจ้ง</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`nav-item-btn ${currentTab === 'CASES' ? 'active' : ''}`}
                onClick={() => setCurrentTab('CASES')}
              >
                <div className="nav-item-left">
                  <MonitorCheck size={18} />
                  <span>Monitoring เคสร้านค้า</span>
                </div>
              </button>
              <button
                type="button"
                className={`nav-item-btn ${currentTab === 'EMAILS' ? 'active' : ''}`}
                onClick={() => setCurrentTab('EMAILS')}
              >
                <div className="nav-item-left">
                  <MailCheck size={18} />
                  <span>อีเมลคำร้องที่ส่งแล้ว</span>
                </div>
                <span className="count-badge">{sentEmailCount}</span>
              </button>
            </>
          )}
        </div>

        {/* Status Filters: MyOrder admin only — shops never see internal case statuses */}
        {role === 'MYORDER_ADMIN' && (
        <div className="sidebar-card">
          <div className="sidebar-title">สถานะเคส (Filter by Status)</div>
          {MYORDER_CASE_FILTERS.map(f => {
            const count = myOrderCases.filter(c => matchesCaseFilter(c, f.key)).length;
            const showBadge = !f.badge || count > 0;
            return (
              <button
                key={f.key}
                type="button"
                className={`nav-item-btn ${currentTab === 'CASES' && caseFilter === f.key ? 'active' : ''}`}
                onClick={() => {
                  setCaseFilter(f.key);
                  setCurrentTab('CASES');
                }}
              >
                <div className="nav-item-left">
                  {f.icon}
                  <span style={f.key === 'SLA' ? { color: 'var(--thp-danger)', fontWeight: 600 } : undefined}>{f.label}</span>
                </div>
                {showBadge && <span className={`count-badge ${f.badge || ''}`}>{count}</span>}
              </button>
            );
          })}
        </div>
        )}

        <div className="sidebar-card" style={{ fontSize: '0.78rem', color: 'var(--thp-slate)', lineHeight: 1.55 }}>
          <div className="sidebar-title">ขั้นตอนการแจ้งปัญหา</div>
          <div>1. ร้านค้ากด “แจ้งปัญหา” ที่คำสั่งซื้อที่จัดส่งแล้ว</div>
          <div>2. เรื่องเข้าระบบ ปณ. และส่งตรงถึง CEC ปลายทาง</div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <HelpCircle size={13} style={{ flexShrink: 0, marginTop: 3, color: '#C2410C' }} />
            <span>CEC ระบุจากสถานะพัสดุในระบบ QMS เท่านั้น ถ้าพัสดุยังไม่ถึงปลายทาง CEC จะว่างไว้ก่อน</span>
          </div>
          <div>3. ร้านค้า แอดมิน MyOrder และ ปณ.ส่วนกลาง เห็นสถานะเดียวกัน</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar-panel">
      {/* Main Navigation Views */}
      <div className="sidebar-card">
        <div className="sidebar-title">มุมมองหลัก (Main View)</div>
        <button
          type="button"
          className={`nav-item-btn ${currentTab === 'CASES' ? 'active' : ''}`}
          onClick={() => setCurrentTab('CASES')}
        >
          <div className="nav-item-left">
            <Inbox size={18} />
            <span>
              {role === 'CENTRAL'
                ? 'Central Control Queue'
                : role === 'CEC'
                ? 'คิวงานกลุ่ม CEC'
                : 'คิวงานสาขาปลายทาง'}
            </span>
          </div>
          <span className="count-badge">{counts.total}</span>
        </button>

        <button
          type="button"
          className={`nav-item-btn ${currentTab === 'DASHBOARD' ? 'active' : ''}`}
          onClick={() => setCurrentTab('DASHBOARD')}
        >
          <div className="nav-item-left">
            <BarChart3 size={18} />
            <span>แดชบอร์ดสถิติ & SLA</span>
          </div>
        </button>
      </div>

      {/* Status Filters */}
      <div className="sidebar-card">
        <div className="sidebar-title">สถานะเคส (Filter by Status)</div>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className="nav-item-left">
            <Layers size={16} />
            <span>ทั้งหมด (All)</span>
          </div>
          <span className="count-badge">{counts.total}</span>
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'PENDING_CEC_ASSIGNMENT' ? 'active' : ''}`}
          onClick={() => setStatusFilter('PENDING_CEC_ASSIGNMENT')}
        >
          <div className="nav-item-left">
            <HelpCircle size={16} />
            <span>รอระบุ CEC</span>
          </div>
          {counts.pendingCec > 0 && <span className="count-badge warning">{counts.pendingCec}</span>}
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'WAITING_CEC_REPLY' ? 'active' : ''}`}
          onClick={() => setStatusFilter('WAITING_CEC_REPLY')}
        >
          <div className="nav-item-left">
            <Send size={16} />
            <span>รอ CEC ตอบ</span>
          </div>
          {counts.waitingCec > 0 && <span className="count-badge warning">{counts.waitingCec}</span>}
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'WAITING_CENTRAL_REVIEW' ? 'active' : ''}`}
          onClick={() => setStatusFilter('WAITING_CENTRAL_REVIEW')}
        >
          <div className="nav-item-left">
            <Clock size={16} />
            <span>รอตรวจคำตอบ</span>
          </div>
          {counts.waitingReview > 0 && (
            <span className="count-badge" style={{ background: '#6366F1', color: '#FFF' }}>
              {counts.waitingReview}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'SLA_EXCEEDED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('SLA_EXCEEDED')}
        >
          <div className="nav-item-left">
            <AlertTriangle size={16} color="var(--thp-danger)" />
            <span style={{ color: 'var(--thp-danger)', fontWeight: 600 }}>เกิน SLA 3 วัน</span>
          </div>
          {counts.slaExceeded > 0 && <span className="count-badge danger">{counts.slaExceeded}</span>}
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'CENTRAL_CONTACT_BRANCH' ? 'active' : ''}`}
          onClick={() => setStatusFilter('CENTRAL_CONTACT_BRANCH')}
        >
          <div className="nav-item-left">
            <PhoneForwarded size={16} />
            <span>โทรสาขาแล้ว</span>
          </div>
          {counts.branchEscalated > 0 && (
            <span className="count-badge" style={{ background: '#BE123C', color: '#FFF' }}>
              {counts.branchEscalated}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`nav-item-btn ${statusFilter === 'CLOSED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('CLOSED')}
        >
          <div className="nav-item-left">
            <CheckCircle size={16} />
            <span>ปิดเคสแล้ว</span>
          </div>
          <span className="count-badge">{counts.closed}</span>
        </button>
      </div>
    </aside>
  );
};
