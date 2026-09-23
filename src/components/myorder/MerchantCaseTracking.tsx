import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem } from '../../types/case';
import { IssueDisplay } from '../common/IssueBadge';
import { SlaBadge } from '../common/SlaBadge';
import { CaseProgressStepper, MerchantStatusBadge } from './CaseProgress';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { ClipboardList, Eye, CheckCircle2 } from 'lucide-react';

type CaseFilter = 'OPEN' | 'ANSWERED' | 'CLOSED' | 'ALL';

export const MerchantCaseTracking: React.FC = () => {
  const { cases, searchQuery } = useCases();
  const { orders, currentShop } = useMyOrder();
  const [filter, setFilter] = useState<CaseFilter>('OPEN');
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);

  // Cases linked to this shop's orders (covers cases merged into an existing tracking number too)
  const shopCaseIds = new Set(orders.filter(o => o.shopId === currentShop.id && o.caseId).map(o => o.caseId));
  const shopCases = cases
    .filter(c => shopCaseIds.has(c.id) || c.myOrderRef.shopId === currentShop.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isAnswered = (c: CaseItem) => !!c.centralReview && c.status !== 'CLOSED';
  const q = searchQuery.trim().toLowerCase();
  const visible = shopCases.filter(c => {
    if (filter === 'OPEN' && (c.status === 'CLOSED' || isAnswered(c))) return false;
    if (filter === 'ANSWERED' && !isAnswered(c)) return false;
    if (filter === 'CLOSED' && c.status !== 'CLOSED') return false;
    if (!q) return true;
    return (
      c.id.toLowerCase().includes(q) ||
      c.trackingNumber.toLowerCase().includes(q) ||
      c.myOrderRef.orderId.toLowerCase().includes(q)
    );
  });

  const tabs: { key: CaseFilter; label: string; count: number }[] = [
    { key: 'OPEN', label: 'กำลังดำเนินการ', count: shopCases.filter(c => c.status !== 'CLOSED' && !isAnswered(c)).length },
    { key: 'ANSWERED', label: 'ได้รับคำตอบแล้ว', count: shopCases.filter(isAnswered).length },
    { key: 'CLOSED', label: 'ปิดแล้ว', count: shopCases.filter(c => c.status === 'CLOSED').length },
    { key: 'ALL', label: 'ทั้งหมด', count: shopCases.length }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-title-box">
          <h1>
            <ClipboardList size={22} color="var(--myorder-teal)" />
            <span>ติดตามสถานะปัญหาที่แจ้ง</span>
          </h1>
          <p>{currentShop.name} • อัปเดตสถานะการดำเนินการจากไปรษณีย์ไทยแบบเรียลไทม์</p>
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
              <span className="tab-num">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="merchant-case-card" style={{ alignItems: 'center', color: 'var(--thp-muted)', padding: '2.5rem' }}>
          ไม่มีรายการในหมวดนี้
        </div>
      ) : (
        visible.map(c => (
          <div key={c.id} className="merchant-case-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800 }}>{c.myOrderRef.orderId}</span>
                  <span className="tracking-pill">{c.trackingNumber}</span>
                  <span className="case-id-sub">เคส {c.id}</span>
                </div>
                <IssueDisplay category={c.category} urgency={c.urgency} inquiry={c.customerInquiry} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <MerchantStatusBadge status={c.status} />
                <SlaBadge deadlineIso={c.slaDeadline} isExceeded={c.isSlaExceeded} status={c.status} />
              </div>
            </div>

            <CaseProgressStepper caseItem={c} />

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
                <span>{c.centralReview.approvedAnswer}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                อัปเดตล่าสุด: {c.activityLogs[0]?.action} • {new Date(c.activityLogs[0]?.timestamp || c.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <button type="button" className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => setViewCase(c)}>
                <Eye size={13} /> ดูรายละเอียด
              </button>
            </div>
          </div>
        ))
      )}

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}
    </div>
  );
};
