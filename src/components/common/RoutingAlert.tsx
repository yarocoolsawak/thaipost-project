import React, { useState } from 'react';
import type { CaseItem } from '../../types/case';
import { useCases } from '../../context/CaseContext';
import { CEC_REGIONS, getCecLabel } from '../../data/cecRegions';
import { findPostOffice, POST_OFFICES } from '../../data/postOffices';
import { ROUTING_ALERT_LABEL } from '../../utils/cecRouting';
import { MapPinX, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

// Small marker under the CEC in case lists
export const RoutingAlertChip: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => {
  const alert = caseItem.routingAlert;
  if (!alert || caseItem.status === 'CLOSED') return null;
  return (
    <span className="routing-alert-chip" title={alert.message}>
      <MapPinX size={11} /> {ROUTING_ALERT_LABEL[alert.kind]}
    </span>
  );
};

// Alert box at the top of the case: what QMS shows, and (for central) move the case or keep the CEC
export const RoutingAlertPanel: React.FC<{ caseItem: CaseItem }> = ({ caseItem }) => {
  const { role, reassignCec, dismissRoutingAlert } = useCases();
  const alert = caseItem.routingAlert;
  const [targetCec, setTargetCec] = useState<string>(alert?.suggestedCecId?.toString() || '');
  const [officeCode, setOfficeCode] = useState(alert?.officeZipCode || '');
  if (!alert || caseItem.status === 'CLOSED') return null;

  const canAct = role === 'CENTRAL';
  const target = CEC_REGIONS.find(c => c.id.toString() === targetCec);
  const office = findPostOffice(officeCode);
  const validOffice = office?.cecCode === target?.code ? office : undefined;

  return (
    <div
      role="alert"
      style={{
        background: '#FFF7ED',
        border: '1.5px solid #FB923C',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, color: '#C2410C', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPinX size={17} /> {ROUTING_ALERT_LABEL[alert.kind]}
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
          ตรวจพบ {new Date(alert.detectedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} น.
        </span>
      </div>

      <div style={{ fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.5 }}>{alert.message}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--thp-muted)' }}>CEC จากรหัสผู้รับ:</span>
        <span>
          {getCecLabel(caseItem.assignedCecId)} (รหัส {caseItem.parcelInfo.destZipCode})
        </span>
        {alert.officeName && (
          <>
            <span style={{ color: 'var(--thp-muted)' }}>พัสดุอยู่ที่จริง (QMS):</span>
            <span>
              {alert.officeName}
              {alert.officeZipCode ? ` (${alert.officeZipCode})` : ''}
              {alert.suggestedCecId ? ` → ${getCecLabel(alert.suggestedCecId)}` : ''}
            </span>
          </>
        )}
      </div>

      {canAct ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
            value={targetCec}
            onChange={e => { setTargetCec(e.target.value); setOfficeCode(''); }}
            aria-label="เลือก CEC ที่จะย้ายไป"
          >
            <option value="">เลือก CEC ที่จะย้ายไป</option>
            {CEC_REGIONS.map(c => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="form-control" style={{ width: 'auto', maxWidth: '100%' }}
            aria-label="เลือกที่ทำการปลายทาง" value={validOffice?.code || ''}
            onChange={event => setOfficeCode(event.target.value)} disabled={!target}>
            <option value="">เลือกที่ทำการปลายทาง</option>
            {POST_OFFICES.filter(item => item.cecCode === target?.code).map(item => (
              <option key={item.code} value={item.code}>{item.code} · {item.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            disabled={!target || !validOffice}
            onClick={() => target && validOffice && reassignCec(caseItem.id, target.id, undefined, validOffice.code)}
          >
            <ArrowRightLeft size={14} /> {target ? `ย้ายไป ${target.code}` : 'ย้าย CEC'}
          </button>
          {caseItem.assignedCecId !== undefined && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => dismissRoutingAlert(caseItem.id)}
              title="ตรวจแล้ว CEC เดิมถูกต้อง เช่น สาขาส่งต่อพัสดุไปที่ทำการที่ถูกต้องเอง"
            >
              <CheckCircle2 size={14} /> {getCecLabel(caseItem.assignedCecId)} ถูกต้องแล้ว
            </button>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '0.78rem', color: '#9A3412' }}>ปณ.ส่วนกลางได้รับแจ้งเตือนและกำลังตรวจ CEC ของเคสนี้</div>
      )}
    </div>
  );
};
