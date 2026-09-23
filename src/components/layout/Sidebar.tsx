import React from 'react';
import { useCases } from '../../context/CaseContext';
import {
  Inbox,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  PhoneForwarded,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'CASES' | 'DASHBOARD';
  setCurrentTab: (tab: 'CASES' | 'DASHBOARD') => void;
  onOpenCreateCase?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateCase
}) => {
  const {
    role,
    statusFilter,
    setStatusFilter,
    counts
  } = useCases();

  return (
    <aside className="sidebar-panel">
      {/* Primary Action Button */}
      {role === 'ADMIN' && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
          onClick={onOpenCreateCase}
        >
          <Sparkles size={18} />
          <span>สร้างเคสใหม่ / AI วางแชท</span>
        </button>
      )}

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
                : role === 'ADMIN'
                ? 'กล่องข้อความเคส (Inbox)'
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
          className={`nav-item-btn ${statusFilter === 'NEW' ? 'active' : ''}`}
          onClick={() => setStatusFilter('NEW')}
        >
          <div className="nav-item-left">
            <Inbox size={16} />
            <span>เคสใหม่</span>
          </div>
          {counts.newCases > 0 && <span className="count-badge info">{counts.newCases}</span>}
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
