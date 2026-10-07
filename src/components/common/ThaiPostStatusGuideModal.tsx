import React, { useState, useMemo } from 'react';
import { 
  THAILAND_POST_STATUSES, 
  type ThaiPostStatusDefinition 
} from '../../constants/thailandPostStatuses';
import { X, Search, ExternalLink, HelpCircle, CheckCircle, AlertTriangle, Truck, Clock, RefreshCw } from 'lucide-react';

interface ThaiPostStatusGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThaiPostStatusGuideModal: React.FC<ThaiPostStatusGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredStatuses = useMemo(() => {
    return THAILAND_POST_STATUSES.filter(st => {
      // Category filter
      if (selectedCategory !== 'ALL' && st.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        st.code.includes(term) ||
        st.descTh.toLowerCase().includes(term) ||
        st.descEn.toLowerCase().includes(term) ||
        st.categoryTh.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'ทั้งหมด (30 รหัส)' },
    { key: 'POSTING', label: 'รับฝาก (100)' },
    { key: 'TRANSIT', label: 'ส่งต่อ / คัดแยก (200)' },
    { key: 'DELIVERY', label: 'นำจ่าย / ติดต่อผู้รับ (300)' },
    { key: 'EXCEPTION', label: 'ไม่สำเร็จ / ส่งคืน (400 / 203)' },
    { key: 'COMPLETED', label: 'สำเร็จ / โอนเงิน (500 / 900)' }
  ];

  const getStatusIcon = (st: ThaiPostStatusDefinition) => {
    if (st.isSuccess) return <CheckCircle size={15} color="#059669" />;
    if (st.isException) return <AlertTriangle size={15} color="#DC2626" />;
    if (st.isBagOpenIndicator) return <Clock size={15} color="#4338CA" />;
    if (st.category === 'DELIVERY') return <Truck size={15} color="#0284C7" />;
    return <RefreshCw size={14} color="#64748B" />;
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--thp-border)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: '#FEE2E2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--thp-red)' 
            }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                คู่มือรหัสสถานะพัสดุไปรษณีย์ไทย (THP Track & Trace API)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--thp-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                อ้างอิงมาตรฐานทางการ: 
                <a 
                  href="https://track.thailandpost.com/developerGuide" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: 'var(--thp-red)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}
                >
                  track.thailandpost.com/developerGuide <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid var(--thp-border)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัส (เช่น 501, 401, 220, 303) หรือชื่อสถานะภาษาไทย / อังกฤษ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                borderRadius: '6px',
                border: '1px solid var(--thp-border)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: selectedCategory === cat.key ? 600 : 500,
                  border: selectedCategory === cat.key ? '1px solid var(--thp-red)' : '1px solid #CBD5E1',
                  background: selectedCategory === cat.key ? '#FEF2F2' : '#FFFFFF',
                  color: selectedCategory === cat.key ? 'var(--thp-red)' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.75rem', width: '90px' }}>รหัส (Code)</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>สถานะภาษาไทย</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>English Description</th>
                <th style={{ padding: '0.6rem 0.75rem', width: '120px' }}>กลุ่มขั้นตอน</th>
                <th style={{ padding: '0.6rem 0.75rem', width: '170px' }}>หมายเหตุในระบบ SOP</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                    ไม่พบรหัสสถานะที่ตรงกับเงื่อนไขการค้นหา "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStatuses.map(st => (
                  <tr 
                    key={st.code} 
                    style={{ 
                      borderBottom: '1px solid #E2E8F0',
                      background: st.code === '501' ? '#F0FDF4' : st.code === '220' ? '#EEF2FF' : undefined
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'top' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: '0.88rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: st.badgeBg,
                        color: st.badgeColor,
                        border: `1px solid ${st.badgeBorder}`
                      }}>
                        {getStatusIcon(st)}
                        {st.code}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#1E293B', verticalAlign: 'top' }}>
                      {st.descTh}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#64748B', fontSize: '0.8rem', verticalAlign: 'top' }}>
                      {st.descEn}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'top' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1'
                      }}>
                        {st.categoryTh}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.78rem', color: '#334155', verticalAlign: 'top' }}>
                      {st.code === '220' && (
                        <span style={{ color: '#4338CA', fontWeight: 600 }}>
                          ⏱️ จุดเปิดถุง ใช้นับเริ่ม SLA 3 วัน / 3-5 วัน
                        </span>
                      )}
                      {st.code === '501' && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          ✓ นำจ่ายสำเร็จ ปิดเคสแจ้งปิดงานได้ทันที
                        </span>
                      )}
                      {st.code === '303' && (
                        <span style={{ color: '#B45309', fontWeight: 600 }}>
                          📞 จนท.โทรติดต่อผู้รับ (นับรอบ 1-3 ครั้ง)
                        </span>
                      )}
                      {st.code === '304' && (
                        <span style={{ color: '#B91C1C', fontWeight: 600 }}>
                          ⚠️ โทรไม่รับสาย (ครบ 3 ครั้งส่งต่อแอดมินโทร)
                        </span>
                      )}
                      {st.code === '401' && (
                        <span style={{ color: '#DC2626', fontWeight: 600 }}>
                          ❌ นำจ่ายไม่สำเร็จ (เก็บรักษา 7 วันก่อนตีกลับ)
                        </span>
                      )}
                      {st.code === '203' && (
                        <span style={{ color: '#DC2626', fontWeight: 600 }}>
                          ↩️ ตีกลับต้นทาง (เช็คเคสถอยสถานะ)
                        </span>
                      )}
                      {st.code === '901' && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          💰 โอนเงิน COD เสร็จสิ้น
                        </span>
                      )}
                      {!['220', '501', '303', '304', '401', '203', '901'].includes(st.code) && (
                        <span style={{ color: '#94A3B8' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#F8FAFC', borderTop: '1px solid var(--thp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--thp-muted)' }}>
            รวมรหัสสถานะทั้งหมด 30 รายการตาม Developer Guide ไปรษณีย์ไทย
          </span>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
