import React, { useEffect, useState } from 'react';
import { subscribeDialogs, resolveDialog } from '../../utils/dialog';
import type { DialogRequest } from '../../utils/dialog';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// Renders notices / confirmations requested through utils/dialog (one at a time, on top of any modal)
export const AppDialogHost: React.FC = () => {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  useEffect(() => subscribeDialogs(setQueue), []);

  const current = queue[0];
  if (!current) return null;

  const icon =
    current.tone === 'danger' ? (
      <AlertTriangle size={20} color="var(--thp-danger)" />
    ) : current.tone === 'success' ? (
      <CheckCircle2 size={20} color="var(--thp-success)" />
    ) : (
      <Info size={20} color="var(--thp-blue)" />
    );

  return (
    <div
      className="modal-backdrop"
      style={{ zIndex: 300 }}
      onClick={() => resolveDialog(current.id, false)}
      role="presentation"
    >
      <div
        className="modal-card"
        style={{ maxWidth: '440px' }}
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`app-dialog-title-${current.id}`}
      >
        <div className="modal-header">
          <h2 id={`app-dialog-title-${current.id}`} style={{ fontSize: '1.05rem' }}>
            {icon}
            <span>{current.title}</span>
          </h2>
        </div>
        <div className="modal-body" style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>
          {current.message}
        </div>
        <div className="modal-footer">
          {current.kind === 'confirm' && (
            <button type="button" className="btn-secondary" onClick={() => resolveDialog(current.id, false)}>
              {current.cancelLabel}
            </button>
          )}
          <button
            type="button"
            autoFocus
            className={current.tone === 'danger' ? 'btn-danger' : current.tone === 'success' ? 'btn-success' : 'btn-primary'}
            onClick={() => resolveDialog(current.id, true)}
          >
            {current.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
