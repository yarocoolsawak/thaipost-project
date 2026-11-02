import React from 'react';
import { useCases } from '../../context/CaseContext';
import { CEC_REGIONS } from '../../data/cecRegions';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Layers,
  ShieldAlert
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { cases, counts } = useCases();

  // Daily simulated scaling (based on 1,000 cases/day from Executive Summary)
  const totalCasesToday = 1048;
  const slaComplianceRate = 93.4; // 93.4% closed within 3 days

  // Workload distribution across 14 CECs
  const cecWorkloads = CEC_REGIONS.map(cec => {
    const liveCount = cases.filter(c => c.assignedCecId === cec.id).length;
    // Use the cases in this prototype; the office directory has no workload or member counts.
    return {
      cec,
      count: liveCount,
      liveCount
    };
  });

  const maxWorkload = Math.max(...cecWorkloads.map(w => w.count), 1);

  // Issues breakdown
  const categoryStats = [
    { label: 'ผู้รับยังไม่ได้รับของ (Not Received)', count: 385, color: '#EF4444' },
    { label: 'พัสดุล่าช้าเกินกำหนด (Delayed)', count: 312, color: '#F59E0B' },
    { label: 'พัสดุชำรุดเสียหาย (Damaged)', count: 142, color: '#DC2626' },
    { label: 'ส่งผิดสาขา/หลงทิศ (Wrong Branch)', count: 124, color: '#8B5CF6' },
    { label: 'ค้นหาพัสดุไม่พบ (Cannot Locate)', count: 85, color: '#64748B' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="content-header">
        <div className="content-title-box">
          <h1>
            <BarChart3 size={24} color="var(--thp-red)" />
            <span>ThaiPost Operations & SLA Analytics Dashboard</span>
          </h1>
          <p>
            ภาพรวมปริมาณงานประจำวัน (~1,000 เคส/วัน) อัตราความสำเร็จ SLA 3 วัน การกระจายงานกลุ่ม CEC 14 กลุ่ม และสถิติปัญหาพัสดุ
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">ปริมาณเคสวันนี้ (Daily Volume)</span>
            <span className="metric-value">{totalCasesToday.toLocaleString()}</span>
            <span className="metric-sub" style={{ color: '#059669' }}>
              ↑ +8.2% จากสัปดาห์ก่อน (ร้านค้า MyOrder)
            </span>
          </div>
          <div className="metric-icon-box" style={{ background: '#EFF6FF', color: '#0284C7' }}>
            <Layers size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">อัตราผ่านเกณฑ์ SLA 3 วัน</span>
            <span className="metric-value" style={{ color: '#059669' }}>
              {slaComplianceRate}%
            </span>
            <span className="metric-sub">เป้าหมายมาตรฐาน ปณท &gt; 92.0%</span>
          </div>
          <div className="metric-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">รอส่วนกลางรีวิวคำตอบ (Quality)</span>
            <span className="metric-value" style={{ color: '#4F46E5' }}>
              {counts.waitingReview}
            </span>
            <span className="metric-sub">CEC ตอบแล้ว รอตรวจสอบก่อนส่ง</span>
          </div>
          <div className="metric-icon-box" style={{ background: '#EEF2FF', color: '#6366F1' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">เกินกำหนด SLA 3 วัน (Alert)</span>
            <span className="metric-value" style={{ color: '#DC2626' }}>
              {counts.slaExceeded}
            </span>
            <span className="metric-sub" style={{ color: '#B91C1C' }}>
              ต้องยกระดับโทรสายตรงสาขาปลายทาง
            </span>
          </div>
          <div className="metric-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <ShieldAlert size={24} />
          </div>
        </div>
      </div>

      {/* Grid: CEC 1-14 Workload Breakdown & Issue Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
        {/* CEC 14 Workload Distribution */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--thp-border)',
            borderRadius: '14px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--thp-dark)' }}>
              เคสใน prototype แยกตามกลุ่ม CEC
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>
              ปน.1–4 / ปข.1–10 · ไม่ใช่ยอดงานจริง
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {cecWorkloads.map(item => {
              const pct = Math.round((item.count / maxWorkload) * 100);
              return (
                <div key={item.cec.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '90px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--thp-slate)' }}>
                    {item.cec.code}
                  </div>
                  <div style={{ flex: 1, height: '14px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #ED1C24, #F87171)',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <div style={{ width: '70px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--thp-dark)' }}>
                    {item.count} เคส
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issue Categories & SLA Rule Recap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Issue Categories */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--thp-border)',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--thp-dark)' }}>
              จำแนกประเภทปัญหาพัสดุ (Top Issues)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryStats.map((stat, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--thp-slate)' }}>{stat.label}</span>
                    <strong style={{ color: 'var(--thp-dark)' }}>{stat.count} เคส</strong>
                  </div>
                  <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round((stat.count / 400) * 100)}%`,
                        background: stat.color,
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Rule Summary Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FCA5A5' }}>
              ระเบียบควบคุม SLA 3 วัน (Page 8 Specification)
            </div>
            <ul style={{ fontSize: '0.8rem', color: '#CBD5E1', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li>นับ 72 ชม. จากวันที่เริ่มส่งเคส</li>
              <li>&lt; 3 วัน: ส่งหรือติดตามผ่านกลุ่ม CEC ตามพื้นที่</li>
              <li>CEC ตอบก่อน 3 วัน: เข้าคิว Waiting Central Review ให้ส่วนกลางตรวจคุณภาพ</li>
              <li>&gt;= 3 วัน: ย้ายเป็น SLA Exceeded และให้ส่วนกลางโทรสายตรงสาขาปลายทางทันที</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
