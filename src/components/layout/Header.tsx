import React from 'react';
import { useCases } from '../../context/CaseContext';
import type { UserRole } from '../../types/case';
import { CEC_REGIONS } from '../../data/cecRegions';
import {
  Package,
  Building2,
  UserCheck,
  MapPin,
  Search,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    selectedCecId,
    setSelectedCecId,
    searchQuery,
    setSearchQuery,
    counts
  } = useCases();

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'CENTRAL', label: 'ปณ.ส่วนกลาง', icon: <Building2 size={15} /> },
    { role: 'ADMIN', label: 'Admin (คู่ค้า)', icon: <UserCheck size={15} /> },
    { role: 'CEC', label: 'CEC 14 กลุ่ม', icon: <MapPin size={15} /> },
    { role: 'BRANCH', label: 'สาขาปลายทาง', icon: <Package size={15} /> }
  ];

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Package size={22} />
          </div>
          <div className="brand-title">
            <div className="brand-main">
              ThaiPost Control Center
              <span className="brand-badge">SLA 3-Day</span>
            </div>
            <div className="brand-sub">ศูนย์ควบคุมและติดตามเคสพัสดุ</div>
          </div>
        </div>

        {/* Center: Role Switcher */}
        <div className="role-switcher-container">
          {roleOptions.map(opt => (
            <button
              key={opt.role}
              type="button"
              className={`role-pill ${role === opt.role ? 'active' : ''}`}
              onClick={() => setRole(opt.role)}
              title={`สลับบทบาทเป็น ${opt.label}`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Search & SLA alerts */}
        <div className="header-actions">
          {/* CEC Selector if role is CEC */}
          {role === 'CEC' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>ประจำกลุ่ม:</span>
              <select
                value={selectedCecId}
                onChange={e => setSelectedCecId(Number(e.target.value))}
                className="form-control"
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFF',
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              >
                {CEC_REGIONS.map(cec => (
                  <option key={cec.id} value={cec.id} style={{ color: '#000' }}>
                    {cec.code}: {cec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Search */}
          <div className="search-bar-header">
            <Search size={15} className="search-icon-pos" />
            <input
              type="text"
              placeholder="ค้นหาเลขพัสดุ / Case ID / บริษัท..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* SLA Warning Alert Button */}
          {counts.slaExceeded > 0 && (
            <div className="sla-quick-alert-pill" title="มีเคสที่เกิน SLA 3 วัน ต้องติดต่อสาขาปลายทาง">
              <AlertOctagon size={15} />
              <span>เกิน SLA 3 วัน: {counts.slaExceeded} เคส</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: '#94A3B8',
              background: 'rgba(255,255,255,0.06)',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px'
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>Audit Log Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
