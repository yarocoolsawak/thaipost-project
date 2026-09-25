import React from 'react';
import type { TrackingEvent } from '../../types/case';
import { CheckCircle2, Clock, Truck, MapPin, PackageCheck } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events, currentStatus }) => {
  if (!events || events.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--thp-muted)', fontSize: '0.85rem' }}>
        ไม่มีข้อมูลประวัติการขนส่งในระบบ
      </div>
    );
  }

  // Render events chronologically (most recent on top or bottom, we show most recent on top)
  const sortedEvents = [...events].reverse();

  const getEventIcon = (status: string) => {
    if (status.includes('สำเร็จ')) return <PackageCheck size={14} color="#10B981" />;
    if (status.includes('นำจ่าย')) return <Truck size={14} color="#0284C7" />;
    if (status.includes('ถึงที่ทำการ') || status.includes('ศป.')) return <MapPin size={14} color="#6366F1" />;
    if (status.includes('รับฝาก')) return <CheckCircle2 size={14} color="#10B981" />;
    return <Clock size={14} color="#64748B" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--thp-border)' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--thp-muted)', fontWeight: 500 }}>สถานะปัจจุบันตาม QMS:</span>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: currentStatus.includes('สำเร็จ') ? '#059669' : 'var(--thp-red)' }}>
          {currentStatus}
        </span>
      </div>

      <div className="tracking-timeline">
        {sortedEvents.map((evt, idx) => {
          const isLatest = idx === 0;
          return (
            <div key={idx} className={`timeline-step ${isLatest ? 'current' : 'completed'}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {getEventIcon(evt.status)}
                  <span className="timeline-status">{evt.status}</span>
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
    </div>
  );
};
