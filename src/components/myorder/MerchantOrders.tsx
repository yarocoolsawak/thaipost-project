import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useMyOrder } from '../../context/MyOrderContext';
import type { CaseItem } from '../../types/case';
import type { MyOrder, MyOrderStatus } from '../../data/myOrders';
import { MYORDER_ORDER_STATUS_META, isShippedOrder, orderTotal } from '../../data/myOrders';
import { KNOWN_PARCELS } from '../../services/trackTraceApi';
import { ReportIssueModal } from './ReportIssueModal';
import { MerchantCaseDetailModal } from './MerchantCaseDetailModal';
import { MerchantStatusBadge } from './CaseProgress';
import { EmailDispatchModal } from './EmailDispatchModal';
import { EmailCountChip } from '../common/CecAssignment';
import { ShoppingBag, AlertTriangle, Link2, Package, Truck, CheckCircle2, Eye, Mail } from 'lucide-react';

type OrderFilter = 'ALL' | MyOrderStatus | 'HAS_CASE';

export const MerchantOrders: React.FC = () => {
  const { cases, searchQuery } = useCases();
  const { orders, currentShop } = useMyOrder();
  const [filter, setFilter] = useState<OrderFilter>('ALL');
  const [reportingOrder, setReportingOrder] = useState<MyOrder | null>(null);
  const [viewCase, setViewCase] = useState<CaseItem | null>(null);
  const [emailCase, setEmailCase] = useState<CaseItem | null>(null);
  const [toast, setToast] = useState('');

  // Switching shop clears the previous shop's notice
  const [toastShopId, setToastShopId] = useState(currentShop.id);
  if (toastShopId !== currentShop.id) {
    setToastShopId(currentShop.id);
    setToast('');
  }

  const shopOrders = orders.filter(o => o.shopId === currentShop.id);
  const caseOf = (o: MyOrder) => (o.caseId ? cases.find(c => c.id === o.caseId) : undefined);

  const q = searchQuery.trim().toLowerCase();
  const visibleOrders = shopOrders.filter(o => {
    if (filter === 'HAS_CASE' && !o.caseId) return false;
    if (filter !== 'ALL' && filter !== 'HAS_CASE' && o.orderStatus !== filter) return false;
    if (!q) return true;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.trackingNumber || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: shopOrders.length,
    shipped: shopOrders.filter(o => o.orderStatus === 'SHIPPED').length,
    delivered: shopOrders.filter(o => o.orderStatus === 'DELIVERED').length,
    withCase: shopOrders.filter(o => o.caseId && caseOf(o)?.status !== 'CLOSED').length
  };

  const filterTabs: { key: OrderFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'ทั้งหมด', count: shopOrders.length },
    { key: 'READY_TO_SHIP', label: 'รอจัดส่ง', count: shopOrders.filter(o => o.orderStatus === 'READY_TO_SHIP').length },
    { key: 'SHIPPED', label: 'จัดส่งแล้ว', count: stats.shipped },
    { key: 'DELIVERED', label: 'ส่งถึงแล้ว', count: stats.delivered },
    { key: 'HAS_CASE', label: 'มีการแจ้งปัญหา', count: shopOrders.filter(o => o.caseId).length }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <ShoppingBag size={22} color="var(--myorder-teal)" />
              <span>จัดการคำสั่งซื้อ (Order Management)</span>
            </h1>
            <p>{currentShop.name} • คำสั่งซื้อที่จัดส่งแล้วสามารถแจ้งปัญหาตรงถึงไปรษณีย์ไทยได้ทันที</p>
          </div>
        </div>

        <div className="myorder-banner">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link2 size={15} /> เชื่อมต่อ <strong>MyOrder</strong> ↔ <strong>ThaiPost Control Center</strong> (Mockup) •
            ซิงก์คำสั่งซื้อและเลขพัสดุอัตโนมัติ
          </span>
          <span style={{ fontSize: '0.75rem' }}>แจ้งปัญหา → ส่งตรง CEC • ปณ.ส่วนกลาง & แอดมิน MyOrder เห็นเคสพร้อมกัน</span>
        </div>

        {toast && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.84rem',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <span>{toast}</span>
            <button type="button" onClick={() => setToast('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#065F46' }}>
              ✕
            </button>
          </div>
        )}

        <div className="status-tabs-row">
          {filterTabs.map(tab => (
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

      <div className="metrics-grid">
        <MetricCard label="คำสั่งซื้อทั้งหมด" value={stats.total} icon={<Package size={22} color="#0D9488" />} bg="#F0FDFA" />
        <MetricCard label="อยู่ระหว่างจัดส่ง" value={stats.shipped} icon={<Truck size={22} color="#B45309" />} bg="#FFFBEB" />
        <MetricCard label="ส่งถึงแล้ว" value={stats.delivered} icon={<CheckCircle2 size={22} color="#047857" />} bg="#ECFDF5" />
        <MetricCard label="ปัญหาที่กำลังดำเนินการ" value={stats.withCase} icon={<AlertTriangle size={22} color="#C2410C" />} bg="#FFF7ED" />
      </div>

      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>เลขคำสั่งซื้อ</th>
                <th>ลูกค้า / ที่อยู่จัดส่ง</th>
                <th>สินค้า</th>
                <th>การจัดส่ง</th>
                <th>สถานะคำสั่งซื้อ</th>
                <th>การแจ้งปัญหา</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ไม่พบคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                visibleOrders.map(order => {
                  const linkedCase = caseOf(order);
                  const parcel = linkedCase?.parcelInfo || (order.trackingNumber ? KNOWN_PARCELS[order.trackingNumber] : undefined);
                  const statusMeta = MYORDER_ORDER_STATUS_META[order.orderStatus];
                  const canReport = isShippedOrder(order);
                  return (
                    <tr key={order.orderId}>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-en)', whiteSpace: 'nowrap' }}>{order.orderId}</div>
                        <div className="case-id-sub">{new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</div>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--thp-muted)', lineHeight: 1.35 }}>{order.shippingAddress}</div>
                      </td>
                      <td>
                        {order.items.map(item => (
                          <div key={item.name} style={{ fontSize: '0.78rem' }}>
                            {item.name} × {item.qty}
                          </div>
                        ))}
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '2px' }}>฿{orderTotal(order).toLocaleString()}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>{order.shippingService}</div>
                        {order.trackingNumber ? (
                          <>
                            <div className="tracking-pill">{order.trackingNumber}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--thp-slate)', marginTop: '2px', maxWidth: '190px' }}>
                              {parcel?.currentPostalStatus}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ยังไม่มีเลขพัสดุ</div>
                        )}
                      </td>
                      <td>
                        <span
                          className="order-status-chip"
                          style={{ background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>
                        {linkedCase ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MerchantStatusBadge status={linkedCase.status} />
                              <EmailCountChip caseItem={linkedCase} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => setViewCase(linkedCase)}
                              >
                                <Eye size={13} /> ติดตามเคส {linkedCase.id}
                              </button>
                              {linkedCase.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#BAE6FD', color: '#0369A1', background: '#F0F9FF' }}
                                  onClick={() => setEmailCase(linkedCase)}
                                  title="ส่งอีเมลแจ้ง ปณท (ขอตีกลับ / เปลี่ยนจ่าหน้า / แนบหลักฐาน)"
                                >
                                  <Mail size={13} /> ส่งเมลแจ้ง ปณ.
                                </button>
                              )}
                              {canReport && (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--myorder-teal-border)', color: 'var(--myorder-teal-dark)' }}
                                  onClick={() => setReportingOrder(order)}
                                >
                                  <AlertTriangle size={13} /> {linkedCase.status === 'CLOSED' ? 'แจ้งปัญหาใหม่' : 'แจ้งปัญหา'}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : canReport ? (
                          <button
                            type="button"
                            className="btn-myorder"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={() => setReportingOrder(order)}
                          >
                            <AlertTriangle size={13} /> แจ้งปัญหา
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>แจ้งได้หลังจัดส่ง</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reportingOrder && (
        <ReportIssueModal
          order={reportingOrder}
          onClose={() => setReportingOrder(null)}
          onFollowExisting={existing => {
            setReportingOrder(null);
            setViewCase(existing);
          }}
          onReported={({ caseItem, linkedToExisting, emailSent }) => {
            setReportingOrder(null);
            const dupNote = caseItem.duplicateOfCaseId ? ` (เคสใหม่ แยกจากเคสเดิม ${caseItem.duplicateOfCaseId})` : '';
            const base = linkedToExisting
              ? `พัสดุนี้มีเคส ${caseItem.id} อยู่แล้ว ระบบแนบข้อมูลของคุณเข้าเคสเดิมเรียบร้อย`
              : dupNote
              ? `ส่งเรื่องเข้าระบบ ปณ. แล้ว (${caseItem.id})${dupNote}`
              : caseItem.assignedCecId
              ? `ส่งเรื่องเข้าระบบ ปณ. แล้ว (${caseItem.id}) และส่งตรงถึง CEC ${caseItem.assignedCecId} เรียบร้อย`
              : `ส่งเรื่องเข้าระบบ ปณ. แล้ว (${caseItem.id}) — รอระบุ CEC เมื่อสถานะพัสดุอัปเดต`;
            setToast(emailSent ? `${base} • ส่งอีเมลคำร้องทางการแล้ว` : base);
          }}
        />
      )}

      {viewCase && <MerchantCaseDetailModal caseItem={viewCase} onClose={() => setViewCase(null)} />}

      {emailCase && (
        <EmailDispatchModal
          caseItem={emailCase}
          onClose={() => setEmailCase(null)}
          onSent={() => setToast(`ส่งอีเมลคำร้องทางการของเคส ${emailCase.id} ถึง ปณท เรียบร้อย`)}
        />
      )}
    </div>
  );
};

export const MetricCard: React.FC<{ label: string; value: number; icon: React.ReactNode; bg: string }> = ({ label, value, icon, bg }) => (
  <div className="metric-card">
    <div className="metric-info">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
    <div className="metric-icon-box" style={{ background: bg }}>
      {icon}
    </div>
  </div>
);
