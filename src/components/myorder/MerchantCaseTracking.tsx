import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem } from '../../types/case';
import { IssueDisplay, UrgencyBadge } from '../common/IssueBadge';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { SearchBox } from '../common/SearchBox';
import { matchesCaseSearch } from '../../utils/caseSearch';
import { LatestUpdate, latestActivity } from './CaseProgress';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { rowOpenProps } from '../../utils/rowOpen';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

// Shops see what was last done on each report — never the internal case status
export const MerchantCaseTracking: React.FC = () => {
  const { searchQuery } = useCases();
  const { currentShop, myOrderCases: shopCases } = useMyOrder();
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);

  const visible = shopCases
    .filter(c => matchesCaseSearch(c, searchQuery))
    // Most recently updated first
    .sort((a, b) => (latestActivity(b)?.timestamp || b.createdAt).localeCompare(latestActivity(a)?.timestamp || a.createdAt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <ClipboardList size={22} color="var(--myorder-teal)" />
              <span>ติดตามปัญหาที่แจ้ง</span>
            </h1>
            <p>{currentShop.name} • ดูอัปเดตล่าสุดจากไปรษณีย์ไทยของแต่ละเรื่อง ({visible.length} เรื่อง)</p>
          </div>
        </div>
        <div className="list-toolbar" style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
          <SearchBox placeholder="ค้นหาเลขพัสดุ / เลขคำสั่งซื้อ..." />
          <DateRangeFilter idPrefix="merchant-date" />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="merchant-case-card" style={{ alignItems: 'center', color: 'var(--thp-muted)', padding: '2.5rem' }}>
          ไม่พบเรื่องที่แจ้งตามเงื่อนไขนี้
        </div>
      ) : (
        visible.map(c => {
          const open = rowOpenProps(() => setViewCase(c));
          return (
            <div key={c.id} {...open} className={`merchant-case-card ${open.className}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="tracking-pill">{c.trackingNumber}</span>
                  <IssueDisplay category={c.category} inquiry={c.customerInquiry} />
                  <UrgencyBadge urgency={c.urgency} />
                </div>
                <span className="case-id-sub">
                  คำสั่งซื้อ {c.myOrderRef.orderId} • เคส {c.id} • แจ้งเมื่อ{' '}
                  {new Date(c.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              <LatestUpdate caseItem={c} />

              {c.centralReview && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.82rem',
                    color: '#065F46',
                    display: 'flex',
                    gap: '0.4rem'
                  }}
                >
                  <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    <strong>คำตอบจากไปรษณีย์ไทย:</strong> {c.centralReview.approvedAnswer}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}
    </div>
  );
};
