import React, { useState } from 'react';
import type { TrackingEvent } from '../../types/case';
import { CheckCircle2, Clock, Truck, MapPin, PackageCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { getThaiPostStatus } from '../../constants/thailandPostStatuses';
import { ThaiPostStatusGuideModal } from './ThaiPostStatusGuideModal';

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events, currentStatus }) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!events || events.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--thp-muted)', fontSize: '0.85rem' }}>
        ไม่มีข้อมูลประวัติการขนส่งในระบบ
      </div>
    );
  }

  // Render events chronologically (most recent on top)
  const sortedEvents = [...events].reverse();

  const getEventIcon = (status: string, code?: string) => {
    if (code === '501' || status.includes('สำเร็จ')) return <PackageCheck size={14} color="#10B981" />;
    if (code === '401' || code === '203' || status.includes('ไม่สำเร็จ') || status.includes('ตีกลับ')) {
      return <AlertTriangle size={14} color="#EF4444" />;
    }
    if (code === '301' || status.includes('นำจ่าย')) return <Truck size={14} color="#0284C7" />;
    if (code === '220' || code === '206' || status.includes('ถึงที่ทำการ') || status.includes('ศป.')) {
      return <MapPin size={14} color="#6366F1" />;
    }
    if (code === '103' || status.includes('รับฝาก')) return <CheckCircle2 size={14} color="#10B981" />;
    return <Clock size={14} color="#64748B" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Status Header with Developer Guide Trigger */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0.6rem 0.85rem', 
        background: '#F8FAFC', 
        borderRadius: '8px', 
        border: '1px solid var(--thp-border)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--thp-muted)', fontWeight: 500 }}>สถานะล่าสุด:</span>
          <span style={{ 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            color: currentStatus.includes('สำเร็จ') ? '#059669' : currentStatus.includes('ไม่สำเร็จ') || currentStatus.includes('ส่งคืน') ? '#DC2626' : 'var(--thp-red)' 
          }}>
            {currentStatus}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '0.25rem 0.55rem',
            fontSize: '0.75rem',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="เปิดดูคู่มือรหัสสถานะพัสดุทางการ 30 รหัส (THP Developer Guide)"
        >
          <BookOpen size={12} color="var(--thp-red)" />
          <span>คู่มือรหัสสถานะ (30 รหัส)</span>
        </button>
      </div>

      <div className="tracking-timeline">
        {sortedEvents.map((evt, idx) => {
          const isLatest = idx === 0;
          const statusDef = getThaiPostStatus(evt.statusCode);
          return (
            <div key={idx} className={`timeline-step ${isLatest ? 'current' : 'completed'}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {getEventIcon(evt.status, evt.statusCode)}
                  
                  {/* Status Code badge if available */}
                  {evt.statusCode && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: statusDef?.badgeBg || '#F1F5F9',
                      color: statusDef?.badgeColor || '#475569',
                      border: `1px solid ${statusDef?.badgeBorder || '#CBD5E1'}`
                    }}>
                      [{evt.statusCode}]
                    </span>
                  )}

                  <span className="timeline-status">{evt.status}</span>

                  {/* Special indicator for Bag Open Event (SLA origin) */}
                  {(evt.isBagOpenEvent || evt.statusCode === '220') && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: '#EEF2FF',
                      color: '#4338CA',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      border: '1px solid #C7D2FE'
                    }}>
                      🏷️ วันเปิดถุง (เริ่มนับ SLA)
                    </span>
                  )}

                  <span style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>• {evt.location}</span>
                </div>
                <div className="timeline-desc">{evt.description}</div>
                {evt.recipientOrSigner && (
                  <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                    ผู้ลงชื่อรับ: {evt.recipientOrSigner}
                  </div>
                )}
                <div className="timeline-time">{evt.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* THP Developer Guide Modal */}
      <ThaiPostStatusGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};
