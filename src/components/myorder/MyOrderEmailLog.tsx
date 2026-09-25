import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem, EmailRequestType, OfficialEmailRecord } from '../../types/case';
import { EMAIL_REQUEST_TYPE_LABEL } from '../../utils/emailTemplates';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { MerchantStatusBadge } from './CaseProgress';
import { MetricCard } from './MerchantOrders';
import { rowOpenProps } from '../../utils/rowOpen';
import { MailCheck, Mail, Store, UserCog, Paperclip, Eye, CalendarClock } from 'lucide-react';

interface EmailRow {
  email: OfficialEmailRecord;
  caseItem: CaseItem;
}

const TYPE_COLORS: Record<EmailRequestType, { bg: string; color: string }> = {
  RETURN_PARCEL: { bg: '#FEF3C7', color: '#92400E' },
  CHANGE_ADDRESS: { bg: '#DBEAFE', color: '#1E40AF' },
  SUBMIT_DOCS: { bg: '#EDE9FE', color: '#5B21B6' }
};

// MyOrder admin: every official request email sent to ThaiPost, by shops or by the admin on their behalf
export const MyOrderEmailLog: React.FC = () => {
  const { cases, searchQuery } = useCases();
  const { shops } = useMyOrder();
  const [typeFilter, setTypeFilter] = useState<'ALL' | EmailRequestType>('ALL');
  const [senderFilter, setSenderFilter] = useState<'ALL' | 'MERCHANT' | 'MYORDER_ADMIN'>('ALL');
  const [shopFilter, setShopFilter] = useState('ALL');
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);

  const allRows: EmailRow[] = cases
    .flatMap(caseItem => (caseItem.emails || []).map(email => ({ email, caseItem })))
    .sort((a, b) => b.email.sentAt.localeCompare(a.email.sentAt));

  const q = searchQuery.trim().toLowerCase();
  const rows = allRows.filter(({ email, caseItem }) => {
    if (typeFilter !== 'ALL' && email.requestType !== typeFilter) return false;
    if (senderFilter !== 'ALL' && (email.sentByRole || 'MERCHANT') !== senderFilter) return false;
    if (shopFilter !== 'ALL' && caseItem.myOrderRef.shopId !== shopFilter) return false;
    if (!q) return true;
    return (
      caseItem.trackingNumber.toLowerCase().includes(q) ||
      caseItem.id.toLowerCase().includes(q) ||
      caseItem.myOrderRef.orderId.toLowerCase().includes(q) ||
      email.subject.toLowerCase().includes(q)
    );
  });

  const todayKey = new Date().toDateString();
  const byAdminCount = allRows.filter(r => r.email.sentByRole === 'MYORDER_ADMIN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <MailCheck size={22} color="var(--myorder-teal)" />
              <span>อีเมลคำร้องที่ส่งแล้ว</span>
            </h1>
            <p>ขอตีกลับ / เปลี่ยนที่อยู่ / แนบหลักฐาน — ทุกฉบับที่ร้านค้าหรือแอดมิน MyOrder ส่งถึง ปณท</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <select className="form-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}>
              <option value="ALL">ทุกประเภทคำร้อง</option>
              {(Object.keys(EMAIL_REQUEST_TYPE_LABEL) as EmailRequestType[]).map(t => (
                <option key={t} value={t}>{EMAIL_REQUEST_TYPE_LABEL[t]}</option>
              ))}
            </select>
            <select className="form-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} value={senderFilter} onChange={e => setSenderFilter(e.target.value as typeof senderFilter)}>
              <option value="ALL">ผู้ส่งทั้งหมด</option>
              <option value="MERCHANT">ร้านค้าส่งเอง</option>
              <option value="MYORDER_ADMIN">แอดมิน MyOrder ส่งแทน</option>
            </select>
            <select className="form-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} value={shopFilter} onChange={e => setShopFilter(e.target.value)}>
              <option value="ALL">ทุกร้านค้า</option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="อีเมลทั้งหมด" value={allRows.length} icon={<Mail size={22} color="#0D9488" />} bg="#F0FDFA" />
        <MetricCard label="ร้านค้าส่งเอง" value={allRows.length - byAdminCount} icon={<Store size={22} color="#1D4ED8" />} bg="#EFF6FF" />
        <MetricCard label="แอดมินส่งแทน" value={byAdminCount} icon={<UserCog size={22} color="#6D28D9" />} bg="#F5F3FF" />
        <MetricCard
          label="ส่งวันนี้"
          value={allRows.filter(r => new Date(r.email.sentAt).toDateString() === todayKey).length}
          icon={<CalendarClock size={22} color="#B45309" />}
          bg="#FFFBEB"
        />
      </div>

      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>วันเวลาที่ส่ง</th>
                <th>ร้านค้า / เคส</th>
                <th>ประเภทคำร้อง & หัวข้อ</th>
                <th>ส่งโดย</th>
                <th>ไฟล์แนบ</th>
                <th>สถานะเคส</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ยังไม่มีอีเมลคำร้องตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                rows.map(({ email, caseItem }) => (
                  <tr key={email.id} {...rowOpenProps(() => setViewCase(caseItem))}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(email.sentAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{caseItem.companyName}</div>
                      <div className="tracking-pill">{caseItem.trackingNumber}</div>
                      <div className="case-id-sub">{caseItem.id} • {caseItem.myOrderRef.orderId}</div>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <span
                        className="order-status-chip"
                        style={{ background: TYPE_COLORS[email.requestType].bg, color: TYPE_COLORS[email.requestType].color }}
                      >
                        {EMAIL_REQUEST_TYPE_LABEL[email.requestType]}
                      </span>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{email.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--thp-muted)' }}>ถึง {email.to}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {email.sentByRole === 'MYORDER_ADMIN' ? (
                        <span className="source-chip">แอดมิน MyOrder</span>
                      ) : (
                        <>
                          <div>ร้านค้า</div>
                          <div style={{ color: 'var(--thp-muted)' }}>{email.senderName}</div>
                        </>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} title={email.attachments.join('\n')}>
                        <Paperclip size={12} /> {email.attachments.length}
                      </span>
                    </td>
                    <td>
                      <MerchantStatusBadge status={caseItem.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        onClick={() => setViewCase(caseItem)}
                      >
                        <Eye size={13} /> เปิดเคส
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}
    </div>
  );
};
