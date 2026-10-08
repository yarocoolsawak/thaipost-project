import React, { useState } from 'react';
import type { EmailPayload } from '../../types/case';
import { Paperclip } from 'lucide-react';

export type EmailDraft = Omit<EmailPayload, 'senderName'>;

// Editable official request email (to / cc / subject / body / attachments) sent together with a report
export const RequestEmailEditor: React.FC<{ draft: EmailDraft; onChange: (draft: EmailDraft) => void }> = ({ draft, onChange }) => {
  const [newFile, setNewFile] = useState('');
  const set = (patch: Partial<EmailDraft>) => onChange({ ...draft, ...patch });

  return (
    <>
      <div className="form-grid-2">
        <div className="form-group">
          <label>ส่งถึง (To):</label>
          <input type="email" className="form-control" value={draft.to} onChange={e => set({ to: e.target.value })} />
        </div>
        <div className="form-group">
          <label>สำเนา (CC):</label>
          <input
            type="email"
            className="form-control"
            placeholder="อีเมลร้านค้า (ถ้ามี)"
            value={draft.cc || ''}
            onChange={e => set({ cc: e.target.value || undefined })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>หัวข้ออีเมล (Subject):</label>
        <input className="form-control" value={draft.subject} onChange={e => set({ subject: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>ข้อความในอีเมล (แก้ไขได้):</label>
        <textarea className="form-control" rows={7} value={draft.body} onChange={e => set({ body: e.target.value })} required />
      </div>
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Paperclip size={13} /> เอกสารแนบคำร้อง ({draft.attachments.length} ไฟล์):
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {draft.attachments.map((file, i) => (
            <span key={`${file}-${i}`} style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
              {file}
              <button
                type="button"
                onClick={() => set({ attachments: draft.attachments.filter((_, idx) => idx !== i) })}
                style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', marginLeft: 4 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <input
            className="form-control"
            style={{ flex: 1, minWidth: 0, fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            placeholder="พิมพ์ชื่อไฟล์ เช่น สำเนาบัตรประชาชน_ผู้รับ.jpg"
            value={newFile}
            onChange={e => setNewFile(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}
            onClick={() => {
              if (newFile.trim()) {
                set({ attachments: [...draft.attachments, newFile.trim()] });
                setNewFile('');
              }
            }}
          >
            + แนบไฟล์
          </button>
        </div>
      </div>
    </>
  );
};
