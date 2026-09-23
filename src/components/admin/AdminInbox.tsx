import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import type { CaseItem, IssueCategory, UrgencyLevel } from '../../types/case';
import { PARTNER_COMPANIES } from '../../data/partnerCompanies';
import { parseCustomerChatMessage } from '../../services/aiParser';
import { DuplicateAlert } from '../common/DuplicateAlert';
import { SlaBadge } from '../common/SlaBadge';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { EmailDispatchModal } from './EmailDispatchModal';
import { IssueDisplay } from '../common/IssueBadge';
import {
  Sparkles,
  PlusCircle,
  MessageSquare,
  Eye,
  Bot,
  Mail,
  Paperclip
} from 'lucide-react';

interface AdminInboxProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const AdminInbox: React.FC<AdminInboxProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  const {
    filteredCases,
    createCase,
    checkDuplicate,
    linkToExistingCase
  } = useCases();

  // Create Case Form State
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(PARTNER_COMPANIES[0].name);
  const [contactPerson, setContactPerson] = useState('เจ้าหน้าที่ฝ่ายบริการลูกค้า');
  const [contactChannel, setContactChannel] = useState<'LINE' | 'FACEBOOK' | 'EMAIL' | 'PORTAL'>('LINE');
  const [channelRef, setChannelRef] = useState('LINE Group: THP_Shopee_VIP1');
  const [category, setCategory] = useState<IssueCategory>('NOT_RECEIVED');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [inquiryText, setInquiryText] = useState('');

  // AI Paste State
  const [aiRawInput, setAiRawInput] = useState('');
  const [showAiPasteBox, setShowAiPasteBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate match
  const [duplicateMatch, setDuplicateMatch] = useState<CaseItem | undefined>(undefined);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseItem | null>(null);
  const [emailModalCase, setEmailModalCase] = useState<CaseItem | null>(null);

  // Email dispatch inside create form
  const [includeEmailDispatch, setIncludeEmailDispatch] = useState(false);
  const [emailRequestType, setEmailRequestType] = useState<'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS'>('RETURN_PARCEL');
  const [emailTo, setEmailTo] = useState('thp_returns@thailandpost.com');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailAttachments, setEmailAttachments] = useState<string[]>([
    'หนังสือแจ้งคำร้อง_ปณท.pdf',
    'สำเนาใบเสร็จรับฝาก.jpg'
  ]);
  const [newAttachmentInput, setNewAttachmentInput] = useState('');

  // Auto-generate template when email dispatch is enabled or params change
  useEffect(() => {
    const tr = trackingInput.trim() || '[เลขพัสดุ]';
    if (emailRequestType === 'RETURN_PARCEL') {
      setEmailSubject(`[คำร้องทางการ] ขอระงับการจ่ายและส่งคืนต้นทาง พัสดุ ${tr} (${selectedCompany})`);
      setEmailBody(`เรียน ไปรษณีย์ไทย\n\nทางบริษัท ${selectedCompany} มีความประสงค์ขอระงับการนำจ่ายพัสดุ ${tr} และขอให้ดำเนินการตีกลับส่งคืนผู้ส่งต้นทาง\n\nได้แนบเอกสารคำร้องมาพร้อมนี้ ขอความกรุณาดำเนินการระงับการจ่ายโดยด่วนครับ\n\nขอแสดงความนับถือ,\n${contactPerson}`);
    } else if (emailRequestType === 'CHANGE_ADDRESS') {
      setEmailSubject(`[คำร้องทางการ] ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่ พัสดุ ${tr} (${selectedCompany})`);
      setEmailBody(`เรียน ไปรษณีย์ไทย\n\nเนื่องด้วยพัสดุ ${tr} มีความประสงค์ขอเปลี่ยนที่อยู่จัดส่งใหม่ ดังนี้:\n\nชื่อผู้รับใหม่: [ระบุชื่อผู้รับ]\nเบอร์โทรศัพท์: [ระบุเบอร์โทร]\nที่อยู่จัดส่งใหม่: [ระบุที่อยู่ใหม่]\n\nได้แนบหนังสือยืนยันจากผู้ส่งมาพร้อมนี้ครับ\n\nขอแสดงความนับถือ,\n${contactPerson}`);
    } else {
      setEmailSubject(`[เอกสารเพิ่มเติม] แนบหลักฐานประกอบการติดตาม พัสดุ ${tr} (${selectedCompany})`);
      setEmailBody(`เรียน ไปรษณีย์ไทย\n\nทางบริษัทได้แนบเอกสารหลักฐานเพิ่มเติม สำหรับพัสดุ ${tr} มาเพื่อประกอบการตรวจสอบของส่วนกลางครับ\n\nขอแสดงความนับถือ,\n${contactPerson}`);
    }
  }, [includeEmailDispatch, emailRequestType, trackingInput, selectedCompany, contactPerson]);

  // Check duplicate whenever tracking input changes
  const handleTrackingChange = (value: string) => {
    setTrackingInput(value);
    if (value.trim().length >= 8) {
      const existing = checkDuplicate(value);
      setDuplicateMatch(existing);
    } else {
      setDuplicateMatch(undefined);
    }
  };

  // Run AI extraction on pasted text
  const handleApplyAiParse = () => {
    if (!aiRawInput.trim()) return;
    const result = parseCustomerChatMessage(aiRawInput);

    if (result.detectedTrackingNumber) {
      handleTrackingChange(result.detectedTrackingNumber);
    }
    if (result.detectedCompany) {
      setSelectedCompany(result.detectedCompany);
    }
    setCategory(result.suggestedCategory);
    setUrgency(result.suggestedUrgency);
    setInquiryText(result.inquirySummary);
    setShowAiPasteBox(false);
  };

  // Submit new case
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) {
      alert('กรุณากรอกเลขพัสดุ');
      return;
    }

    // If duplicate exists and user didn't link
    if (duplicateMatch) {
      const confirmContinue = window.confirm(
        `เลขพัสดุนี้มีเคสเดิม ${duplicateMatch.id} อยู่แล้ว ต้องการแนบข้อความเป็น Timeline เดิมแทนการสร้างเคสใหม่หรือไม่?`
      );
      if (confirmContinue) {
        linkToExistingCase(duplicateMatch.id, inquiryText, contactPerson);
        setIsCreateModalOpen(false);
        resetForm();
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await createCase({
        trackingNumber: trackingInput.trim().toUpperCase(),
        companyName: selectedCompany,
        contactPerson: contactPerson.trim(),
        contactChannel,
        channelReference: channelRef.trim(),
        category,
        urgency,
        customerInquiry: inquiryText.trim() || 'ขอติดตามสถานะพัสดุเร่งด่วน',
        emailDispatch: includeEmailDispatch
          ? {
              to: emailTo || 'thp_returns@thailandpost.com',
              cc: emailCc || undefined,
              subject: emailSubject || `[คำร้องทางการ] พัสดุ ${trackingInput}`,
              requestType: emailRequestType,
              body: emailBody || inquiryText,
              attachments: emailAttachments
            }
          : undefined
      });
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้างเคส');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkToExisting = () => {
    if (!duplicateMatch) return;
    linkToExistingCase(
      duplicateMatch.id,
      inquiryText || 'ลูกค้าสอบถามความคืบหน้าเพิ่มเติมผ่าน LINE',
      contactPerson
    );
    alert(`ระบบได้ผูกข้อความเข้ากับ Case ${duplicateMatch.id} เรียบร้อยแล้ว`);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTrackingInput('');
    setInquiryText('');
    setAiRawInput('');
    setDuplicateMatch(undefined);
    setIncludeEmailDispatch(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div className="content-header" style={{ padding: '1rem 1.25rem' }}>
        <div className="content-header-top">
          <div className="content-title-box">
            <h1>
              <MessageSquare size={22} color="var(--thp-red)" />
              <span>กล่องรับเรื่องและสร้างเคส (Admin Intake)</span>
            </h1>
            <p>สร้างเคสจากเลขพัสดุ • ตรวจเคสซ้ำ • AI สกัดแชท • ส่งอีเมลคำร้องทางการ</p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircle size={17} />
            <span>สร้างเคสใหม่ / AI วางแชท</span>
          </button>
        </div>
      </div>

      {/* Case List for Admin */}
      <div className="case-table-card">
        <div className="table-responsive">
          <table className="case-table">
            <thead>
              <tr>
                <th>Case ID / เลขพัสดุ</th>
                <th>บริษัทคู่ค้า</th>
                <th>ปลายทาง & ผู้รับ</th>
                <th>ปัญหา & รายละเอียดคำร้อง</th>
                <th>สถานะเคส</th>
                <th>คำตอบจากส่วนกลาง</th>
                <th>SLA Timer</th>
                <th style={{ textAlign: 'right' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--thp-muted)' }}>
                    ยังไม่มีรายการเคสในระบบ
                  </td>
                </tr>
              ) : (
                filteredCases.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="tracking-pill">{item.trackingNumber}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className="case-id-sub">{item.id}</span>
                        {item.emails && item.emails.length > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.7rem',
                              color: '#1D4ED8',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              padding: '0.05rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                            title={`ส่งอีเมลแจ้ง ปณท. แล้ว ${item.emails.length} ฉบับ`}
                          >
                            <Mail size={10} /> {item.emails.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.companyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        {item.contactChannel} • {item.contactPerson}
                      </div>
                    </td>
                    <td>
                      <div>{item.parcelInfo.destPostOffice}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--thp-muted)' }}>
                        ผู้รับ: {item.parcelInfo.receiverName}
                      </div>
                    </td>
                    <td>
                      <IssueDisplay
                        category={item.category}
                        urgency={item.urgency}
                        inquiry={item.customerInquiry}
                      />
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    </td>
                    {/* Latest answer if replied */}
                    <td>
                      {item.centralReview ? (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#065F46',
                            background: '#ECFDF5',
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #A7F3D0',
                            maxWidth: '240px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={item.centralReview.approvedAnswer}
                        >
                          ✓ {item.centralReview.approvedAnswer}
                        </div>
                      ) : item.status === 'WAITING_CENTRAL_REVIEW' ? (
                        <span style={{ fontSize: '0.78rem', color: '#4338CA' }}>
                          ⚡ CEC ตอบแล้ว รอรีวิว
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--thp-muted)' }}>
                          รอผลตรวจสอบ
                        </span>
                      )}
                    </td>
                    <td>
                      <SlaBadge
                        deadlineIso={item.slaDeadline}
                        isExceeded={item.isSlaExceeded}
                        status={item.status}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderColor: '#BAE6FD', color: '#0369A1', background: '#F0F9FF' }}
                          onClick={() => setEmailModalCase(item)}
                          title="ส่งอีเมลแจ้ง ปณท (ขอตีกลับ / เปลี่ยนจ่าหน้า / แนบหลักฐาน)"
                        >
                          <Mail size={13} /> ส่งเมลแจ้ง ปณ.
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setSelectedCaseDetail(item)}
                          title="ดูรายละเอียดและไทม์ไลน์"
                        >
                          <Eye size={13} /> ไทม์ไลน์
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Case */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <PlusCircle size={20} color="var(--thp-red)" />
                <span>สร้างเคสติดตามพัสดุ (New Case Intake)</span>
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-body">
              {/* AI Smart Paste Toggle Banner */}
              <div className="ai-smart-box">
                <div className="ai-header">
                  <div className="ai-title">
                    <Sparkles size={18} />
                    <span>AI Smart Assist (FR 12: ดึงเลขพัสดุ & สรุปแชทจาก LINE)</span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => setShowAiPasteBox(!showAiPasteBox)}
                  >
                    {showAiPasteBox ? 'ซ่อนกล่องวางแชท' : 'วางข้อความแชทเพื่อสกัดข้อมูล'}
                  </button>
                </div>

                {showAiPasteBox ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="วางข้อความจาก LINE/แชท เช่น 'ตามพัสดุ ED882194821TH ให้หน่อยค่ะ ลูกค้าบ่นว่ายังไม่ได้รับของ จาก Shopee'..."
                      value={aiRawInput}
                      onChange={e => setAiRawInput(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                        onClick={handleApplyAiParse}
                      >
                        <Bot size={15} /> สกัดข้อมูลเข้าฟอร์มอัตโนมัติ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: '#1E3A8A' }}>
                    กดปุ่มเพื่อวางข้อความแชทดิบ ระบบจะสกัดเลขพัสดุ 13 หลัก, ตรวจจับชื่อบริษัท, จำแนกประเภทปัญหา และร่างข้อมูลให้อัตโนมัติ
                  </p>
                )}
              </div>

              {/* Duplicate Detection Alert if detected */}
              {duplicateMatch && (
                <DuplicateAlert
                  existingCase={duplicateMatch}
                  onLinkToExisting={handleLinkToExisting}
                  onViewExisting={() => {
                    setSelectedCaseDetail(duplicateMatch);
                  }}
                />
              )}

              {/* Form Grid */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>หมายเลขพัสดุ (Tracking Number 13 หลัก):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น ED882194821TH หรือ EF123984512TH"
                    value={trackingInput}
                    onChange={e => handleTrackingChange(e.target.value)}
                    required
                  />
                  {/* Quick sample numbers */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--thp-muted)' }}>ตัวอย่าง:</span>
                    {['ED882194821TH', 'ED776512349TH', 'ED993812745TH', 'EF123984512TH'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleTrackingChange(num)}
                        style={{
                          fontSize: '0.7rem',
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: '1px 5px'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>บริษัทคู่ค้า (50 บริษัท):</label>
                  <select
                    className="form-control"
                    value={selectedCompany}
                    onChange={e => setSelectedCompany(e.target.value)}
                  >
                    {PARTNER_COMPANIES.map(comp => (
                      <option key={comp.id} value={comp.name}>
                        {comp.name} ({comp.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>ชื่อผู้แจ้งเรื่อง / Admin:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ช่องทางการรับเรื่อง & กลุ่ม LINE:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      className="form-control"
                      value={contactChannel}
                      onChange={e => setContactChannel(e.target.value as any)}
                      style={{ width: '130px' }}
                    >
                      <option value="LINE">LINE Group</option>
                      <option value="PORTAL">B2B Portal</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="EMAIL">Email</option>
                    </select>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ชื่อกลุ่ม เช่น LINE_Shopee_VIP1"
                      value={channelRef}
                      onChange={e => setChannelRef(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>หมวดปัญหา (Category):</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    <option value="NOT_RECEIVED">ผู้รับยังไม่ได้รับของ (สถานะส่งสำเร็จแล้ว)</option>
                    <option value="DELAYED_DELIVERY">พัสดุล่าช้าเกินกำหนดปกติ</option>
                    <option value="WRONG_BRANCH">พัสดุส่งผิดสาขา / หลงทาง</option>
                    <option value="DAMAGED_PARCEL">พัสดุชำรุดเสียหาย</option>
                    <option value="CANNOT_LOCATE">ค้นหาพัสดุไม่พบในระบบ</option>
                    <option value="OTHER">อื่นๆ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>ระดับความเร่งด่วน:</label>
                  <select
                    className="form-control"
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                  >
                    <option value="NORMAL">ปกติ (ตามรอบ SLA 3 วัน)</option>
                    <option value="HIGH">เร่งด่วน (ลูกค้าร้องเรียน)</option>
                    <option value="CRITICAL">ด่วนที่สุด (มูลค่าสูง / เสียหาย)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>ข้อความสอบถาม / รายละเอียดจากลูกค้า:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="ระบุข้อความที่ลูกค้าหรือคู่ค้าแจ้งเข้ามา..."
                  value={inquiryText}
                  onChange={e => setInquiryText(e.target.value)}
                  required
                />
              </div>

              {/* Integrated Email Dispatch inside Create Case Form */}
              <div
                style={{
                  background: includeEmailDispatch ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${includeEmailDispatch ? '#86EFAC' : '#E2E8F0'}`,
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: includeEmailDispatch ? '#166534' : 'var(--thp-dark)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeEmailDispatch}
                    onChange={e => setIncludeEmailDispatch(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--thp-red)' }}
                  />
                  <Mail size={16} color={includeEmailDispatch ? '#16A34A' : 'var(--thp-muted)'} />
                  <span>ส่งอีเมลคำร้องทางการถึง ปณท พร้อมสร้างเคส (แจ้งตีกลับ / เปลี่ยนจ่าหน้า / แนบหลักฐาน)</span>
                </label>

                {includeEmailDispatch && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.25rem' }}>
                    {/* Preset Buttons */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.65rem',
                          background: emailRequestType === 'RETURN_PARCEL' ? '#FEF2F2' : '#FFF',
                          borderColor: emailRequestType === 'RETURN_PARCEL' ? 'var(--thp-red)' : '#CBD5E1',
                          color: emailRequestType === 'RETURN_PARCEL' ? 'var(--thp-red)' : 'inherit',
                          fontWeight: emailRequestType === 'RETURN_PARCEL' ? 700 : 500
                        }}
                        onClick={() => setEmailRequestType('RETURN_PARCEL')}
                      >
                        ขอตีกลับต้นทาง
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.65rem',
                          background: emailRequestType === 'CHANGE_ADDRESS' ? '#EFF6FF' : '#FFF',
                          borderColor: emailRequestType === 'CHANGE_ADDRESS' ? '#3B82F6' : '#CBD5E1',
                          color: emailRequestType === 'CHANGE_ADDRESS' ? '#1D4ED8' : 'inherit',
                          fontWeight: emailRequestType === 'CHANGE_ADDRESS' ? 700 : 500
                        }}
                        onClick={() => setEmailRequestType('CHANGE_ADDRESS')}
                      >
                        ขอเปลี่ยนจ่าหน้า/ที่อยู่
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.65rem',
                          background: emailRequestType === 'SUBMIT_DOCS' ? '#ECFDF5' : '#FFF',
                          borderColor: emailRequestType === 'SUBMIT_DOCS' ? '#10B981' : '#CBD5E1',
                          color: emailRequestType === 'SUBMIT_DOCS' ? '#047857' : 'inherit',
                          fontWeight: emailRequestType === 'SUBMIT_DOCS' ? 700 : 500
                        }}
                        onClick={() => setEmailRequestType('SUBMIT_DOCS')}
                      >
                        แนบหลักฐานเพิ่มเติม
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.78rem' }}>ส่งถึง (To):</label>
                        <input
                          type="email"
                          className="form-control"
                          style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                          value={emailTo}
                          onChange={e => setEmailTo(e.target.value)}
                          placeholder="thp_returns@thailandpost.com"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.78rem' }}>สำเนา (CC):</label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                          value={emailCc}
                          onChange={e => setEmailCc(e.target.value)}
                          placeholder="cc@company.com (ถ้ามี)"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem' }}>หัวข้ออีเมล (Subject):</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem' }}>ข้อความคำร้องในอีเมล:</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        style={{ fontSize: '0.82rem' }}
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                      />
                    </div>

                    {/* Attachments Section */}
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Paperclip size={13} /> เอกสารแนบคำร้อง ({emailAttachments.length} ไฟล์):
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '4px' }}>
                        {emailAttachments.map((file, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: '#E2E8F0',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--thp-dark)'
                            }}
                          >
                            {file}
                            <button
                              type="button"
                              onClick={() => setEmailAttachments(emailAttachments.filter((_, idx) => idx !== i))}
                              style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                          placeholder="พิมพ์ชื่อไฟล์ เช่น สำเนาบัตรประชาชน_ผู้รับ.jpg"
                          value={newAttachmentInput}
                          onChange={e => setNewAttachmentInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                          onClick={() => {
                            if (newAttachmentInput.trim()) {
                              setEmailAttachments([...emailAttachments, newAttachmentInput.trim()]);
                              setNewAttachmentInput('');
                            }
                          }}
                        >
                          + แนบไฟล์
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังดึงข้อมูล Track & Trace...' : 'สร้างเคสและส่งเข้า ปณ.ส่วนกลาง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCaseDetail && (
        <CaseDetailModal
          caseItem={selectedCaseDetail}
          onClose={() => setSelectedCaseDetail(null)}
          onOpenSendEmail={c => setEmailModalCase(c)}
        />
      )}

      {/* Email Dispatch Modal */}
      {emailModalCase && (
        <EmailDispatchModal
          caseItem={emailModalCase}
          onClose={() => setEmailModalCase(null)}
        />
      )}
    </div>
  );
};
