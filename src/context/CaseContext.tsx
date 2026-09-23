import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CaseItem, UserRole, IssueCategory, UrgencyLevel, BranchContactLog, ActivityLog, ChatMessage, EmailPayload, OfficialEmailRecord } from '../types/case';
import { INITIAL_CASES } from '../data/mockCases';
import { getCecByZipCodeOrProvince } from '../data/cecRegions';
import { fetchThaiPostTrackAndTrace } from '../services/trackTraceApi';

interface CreateCaseParams {
  trackingNumber: string;
  companyName: string;
  contactPerson: string;
  contactChannel: 'LINE' | 'FACEBOOK' | 'EMAIL' | 'PORTAL';
  channelReference?: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  customerInquiry: string;
  emailDispatch?: {
    to: string;
    cc?: string;
    subject: string;
    requestType: 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS';
    body: string;
    attachments: string[];
  };
}

interface CaseContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedCecId: number;
  setSelectedCecId: (id: number) => void;
  selectedBranchName: string;
  setSelectedBranchName: (name: string) => void;
  
  cases: CaseItem[];
  filteredCases: CaseItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string; // 'ALL' or specific CaseStatus
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  
  selectedCase: CaseItem | null;
  setSelectedCase: (c: CaseItem | null) => void;
  
  // Actions
  createCase: (params: CreateCaseParams) => Promise<CaseItem>;
  checkDuplicate: (trackingNumber: string) => CaseItem | undefined;
  linkToExistingCase: (existingCaseId: string, newMessage: string, senderName: string) => void;
  dispatchToCec: (caseId: string, cecId: number) => void;
  cecSubmitReply: (caseId: string, answer: string, branchNotes?: string, replierName?: string) => void;
  centralReviewAnswer: (
    caseId: string,
    action: 'APPROVED' | 'EDITED' | 'REQUESTED_MORE_INFO',
    approvedAnswer: string,
    reviewNotes?: string
  ) => void;
  escalateToBranch: (caseId: string, branchContactLog: BranchContactLog) => void;
  closeCase: (caseId: string, resolutionNotes?: string) => void;
  addChatMessage: (caseId: string, message: string, senderRole?: UserRole, senderName?: string, isInternal?: boolean) => void;
  sendOfficialEmail: (caseId: string, payload: EmailPayload) => void;
  
  // Badge counts
  counts: {
    total: number;
    newCases: number;
    waitingCec: number;
    waitingReview: number;
    slaExceeded: number;
    branchEscalated: number;
    closed: number;
  };
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('CENTRAL');
  const [selectedCecId, setSelectedCecId] = useState<number>(1);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('ปณ.สันกำแพง (เชียงใหม่)');
  
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  // Check SLA violations every 30 seconds
  useEffect(() => {
    const checkSla = () => {
      const nowMs = Date.now();
      setCases(prev =>
        prev.map(c => {
          if (c.status === 'CLOSED') return c;
          const deadlineMs = new Date(c.slaDeadline).getTime();
          const isOverdue = deadlineMs < nowMs;
          if (isOverdue && c.status !== 'SLA_EXCEEDED' && c.status !== 'CENTRAL_CONTACT_BRANCH') {
            return {
              ...c,
              isSlaExceeded: true,
              status: 'SLA_EXCEEDED'
            };
          }
          return {
            ...c,
            isSlaExceeded: isOverdue
          };
        })
      );
    };

    checkSla();
    const interval = setInterval(checkSla, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update selectedCase reference if cases change
  useEffect(() => {
    if (selectedCase) {
      const updated = cases.find(c => c.id === selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
  }, [cases]);

  // Duplicate checker helper
  const checkDuplicate = (trackingNumber: string) => {
    const clean = trackingNumber.trim().toUpperCase();
    return cases.find(c => c.trackingNumber.toUpperCase() === clean && c.status !== 'CLOSED');
  };

  // Create Case
  const createCase = async (params: CreateCaseParams): Promise<CaseItem> => {
    const cleanTracking = params.trackingNumber.trim().toUpperCase();
    const parcelInfo = await fetchThaiPostTrackAndTrace(cleanTracking);
    const assignedCec = getCecByZipCodeOrProvince(parcelInfo.destZipCode, parcelInfo.destPostOffice);
    
    const now = new Date();
    const nowIso = now.toISOString();
    const slaDeadlineIso = new Date(now.getTime() + 72 * 3600 * 1000).toISOString(); // 3 days SLA

    const caseCount = cases.length + 1;
    const newId = `TP-2026-${caseCount.toString().padStart(4, '0')}`;

    const emails: OfficialEmailRecord[] = [];
    const chatHistory: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        senderRole: 'CUSTOMER',
        senderName: `${params.contactPerson} (${params.companyName})`,
        message: params.customerInquiry,
        timestamp: nowIso
      }
    ];
    const activityLogs: ActivityLog[] = [
      {
        id: `log-${Date.now()}`,
        timestamp: nowIso,
        actorName: `Admin (${params.companyName})`,
        actorRole: 'ADMIN',
        action: 'สร้างเคสในระบบ',
        details: `รับเรื่องติดตามพัสดุ ${cleanTracking} ผ่านช่องทาง ${params.contactChannel} ดึงข้อมูล Track & Trace ปณท สำเร็จ`
      }
    ];

    if (params.emailDispatch) {
      const emailRecord: OfficialEmailRecord = {
        id: `email-${Date.now()}`,
        sentAt: nowIso,
        senderName: params.contactPerson,
        to: params.emailDispatch.to,
        cc: params.emailDispatch.cc,
        subject: params.emailDispatch.subject,
        requestType: params.emailDispatch.requestType,
        body: params.emailDispatch.body,
        attachments: params.emailDispatch.attachments
      };
      emails.push(emailRecord);

      chatHistory.push({
        id: `msg-${Date.now() + 1}`,
        senderRole: 'ADMIN',
        senderName: `${params.contactPerson} (ส่งอีเมลทางการพร้อมสร้างเคส)`,
        message: `[ส่งอีเมลถึง ${emailRecord.to} | เรื่อง: ${emailRecord.subject}]\n\n${emailRecord.body}${
          emailRecord.attachments.length > 0 ? `\n\n📎 เอกสารแนบ (${emailRecord.attachments.length} ไฟล์):\n- ${emailRecord.attachments.join('\n- ')}` : ''
        }`,
        timestamp: nowIso,
        attachments: emailRecord.attachments
      });

      activityLogs.unshift({
        id: `log-${Date.now() + 2}`,
        timestamp: nowIso,
        actorName: `Admin (${params.companyName})`,
        actorRole: 'ADMIN',
        action: 'สร้างเคสพร้อมส่งอีเมลคำร้องทางการ',
        details: `ส่งอีเมลถึง: ${emailRecord.to} เรื่อง: ${emailRecord.subject} (แนบ ${emailRecord.attachments.length} ไฟล์)`
      });
    }

    const newCase: CaseItem = {
      id: newId,
      trackingNumber: cleanTracking,
      companyName: params.companyName,
      contactPerson: params.contactPerson,
      contactChannel: params.contactChannel,
      channelReference: params.channelReference,
      category: params.category,
      urgency: params.urgency,
      customerInquiry: params.customerInquiry,
      status: 'NEW',
      assignedCecId: assignedCec.id,
      assignedCecName: assignedCec.name,
      assignedBranchName: parcelInfo.destPostOffice,
      createdAt: nowIso,
      slaDeadline: slaDeadlineIso,
      isSlaExceeded: false,
      branchContactLogs: [],
      chatHistory,
      activityLogs,
      emails,
      parcelInfo
    };

    setCases(prev => [newCase, ...prev]);
    return newCase;
  };

  // Link to existing case (instead of creating duplicate)
  const linkToExistingCase = (existingCaseId: string, newMessage: string, senderName: string) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== existingCaseId) return c;
        const newChat: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderRole: 'CUSTOMER',
          senderName: senderName || 'ลูกค้า/แอดมิน (ถามซ้ำ)',
          message: `[สอบถามเพิ่มเติมเกี่ยวกับเลขพัสดุเดิม]: ${newMessage}`,
          timestamp: nowIso
        };
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          actorName: senderName || 'Admin',
          actorRole: 'ADMIN',
          action: 'แนบคำถามเข้าเคสเดิม (Duplicate Prevented)',
          details: `ตรวจพบการสอบถามซ้ำ ระบบผูกเข้า Timeline เดิมของ Case ID: ${existingCaseId}`
        };
        return {
          ...c,
          chatHistory: [...c.chatHistory, newChat],
          activityLogs: [newLog, ...c.activityLogs]
        };
      })
    );
  };

  // Central dispatches to CEC
  const dispatchToCec = (caseId: string, cecId: number) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'WAITING_CEC_REPLY',
          assignedCecId: cecId,
          dispatchedAt: c.dispatchedAt || nowIso,
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: 'เจ้าหน้าที่ ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: 'ส่งเคสไปยัง CEC',
              details: `ส่งเคสไปยัง CEC ${cecId} ประจำพื้นที่สาขาปลายทาง เพื่อตรวจสอบและประสานงาน`
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // CEC submits reply
  const cecSubmitReply = (caseId: string, answer: string, branchNotes?: string, replierName = 'เจ้าหน้าที่ CEC') => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'WAITING_CENTRAL_REVIEW', // moves to central review queue!
          cecReply: {
            answer,
            repliedAt: nowIso,
            repliedBy: replierName,
            branchNotes
          },
          chatHistory: [
            ...c.chatHistory,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'CEC',
              senderName: replierName,
              message: `[คำตอบจาก CEC]: ${answer}${branchNotes ? `\n(หมายเหตุสาขา: ${branchNotes})` : ''}`,
              timestamp: nowIso
            }
          ],
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: replierName,
              actorRole: 'CEC',
              action: 'CEC ส่งคำตอบ',
              details: 'CEC ส่งคำตอบกลับเข้า Central Review Queue เพื่อให้ ปณ.ส่วนกลาง ตรวจสอบ'
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // Central reviews answer (FR 07 Workflow)
  const centralReviewAnswer = (
    caseId: string,
    action: 'APPROVED' | 'EDITED' | 'REQUESTED_MORE_INFO',
    approvedAnswer: string,
    reviewNotes?: string
  ) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;

        if (action === 'REQUESTED_MORE_INFO') {
          return {
            ...c,
            status: 'WAITING_CEC_REPLY',
            activityLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: nowIso,
                actorName: 'ปณ.ส่วนกลาง (ผู้รีวิว)',
                actorRole: 'CENTRAL',
                action: 'ตีกลับคำตอบ / ขอข้อมูลเพิ่ม',
                details: `ส่งเรื่องกลับให้ CEC ตรวจสอบเพิ่มเติม: ${reviewNotes || 'ข้อมูลยังไม่ครบถ้วน'}`
              },
              ...c.activityLogs
            ],
            chatHistory: [
              ...c.chatHistory,
              {
                id: `msg-${Date.now()}`,
                senderRole: 'CENTRAL',
                senderName: 'ปณ.ส่วนกลาง',
                message: `[ขอข้อมูลเพิ่มเติมจาก CEC]: ${reviewNotes || 'รบกวนตรวจสอบรายละเอียดเพิ่มเติมครับ'}`,
                timestamp: nowIso,
                isInternalNote: true
              }
            ]
          };
        }

        // APPROVED or EDITED -> transitions to ANSWER_SENT_TO_ADMIN
        return {
          ...c,
          status: 'ANSWER_SENT_TO_ADMIN',
          centralReview: {
            reviewedAt: nowIso,
            reviewedBy: 'ปณ.ส่วนกลาง',
            approvedAnswer,
            reviewNotes,
            actionTaken: action
          },
          chatHistory: [
            ...c.chatHistory,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'CENTRAL',
              senderName: 'ปณ.ส่วนกลาง',
              message: approvedAnswer,
              timestamp: nowIso
            }
          ],
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: 'ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: action === 'APPROVED' ? 'อนุมัติคำตอบและส่งให้ Admin' : 'ปรับแก้คำตอบและส่งให้ Admin',
              details: `คำตอบผ่านการตรวจสอบคุณภาพและส่งมอบให้ Admin บริษัท ${c.companyName} แล้ว`
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // Escalate to destination branch directly (when SLA >= 3 days or urgent)
  const escalateToBranch = (caseId: string, branchContactLog: BranchContactLog) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'CENTRAL_CONTACT_BRANCH',
          branchContactLogs: [branchContactLog, ...c.branchContactLogs],
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: branchContactLog.recordedBy || 'ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: 'โทรสายตรงติดต่อสาขาปลายทาง (Branch Escalation)',
              details: `ติดต่อ ${branchContactLog.branchName} เจ้าหน้าที่: ${branchContactLog.officerName} (${branchContactLog.officerPhone}) - ผล: ${branchContactLog.outcome}`
            },
            ...c.activityLogs
          ],
          chatHistory: [
            ...c.chatHistory,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'CENTRAL',
              senderName: branchContactLog.recordedBy || 'ปณ.ส่วนกลาง',
              message: `[บันทึกการโทรติดต่อสาขาปลายทาง ${branchContactLog.branchName}]: ${branchContactLog.outcome}`,
              timestamp: nowIso
            }
          ]
        };
      })
    );
  };

  // Close Case
  const closeCase = (caseId: string, resolutionNotes = 'ดำเนินการเสร็จสิ้น') => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'CLOSED',
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: role === 'CENTRAL' ? 'ปณ.ส่วนกลาง' : 'Admin',
              actorRole: role,
              action: 'ปิดเคส (CLOSED)',
              details: `ปิดเคสสมบูรณ์: ${resolutionNotes}`
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // Add chat message
  const addChatMessage = (
    caseId: string,
    message: string,
    senderRole: UserRole = role,
    senderName = 'ผู้ใช้งาน',
    isInternal = false
  ) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderRole: senderRole === 'ADMIN' ? 'ADMIN' : senderRole === 'CENTRAL' ? 'CENTRAL' : senderRole === 'CEC' ? 'CEC' : 'BRANCH',
          senderName,
          message,
          timestamp: nowIso,
          isInternalNote: isInternal
        };
        return {
          ...c,
          chatHistory: [...c.chatHistory, newMsg]
        };
      })
    );
  };

  // Send Official Email (Admin requesting return / address change with attachments)
  const sendOfficialEmail = (caseId: string, payload: EmailPayload) => {
    const nowIso = new Date().toISOString();
    const typeLabel =
      payload.requestType === 'RETURN_PARCEL'
        ? 'ขอระงับการจ่ายและตีกลับต้นทาง'
        : payload.requestType === 'CHANGE_ADDRESS'
        ? 'ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่'
        : 'ส่งเอกสารหลักฐานประกอบคำร้อง';

    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;

        const emailMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderRole: 'ADMIN',
          senderName: `${payload.senderName} (ส่งอีเมลทางการ)`,
          message: `[ส่งอีเมลถึง ${payload.to} | เรื่อง: ${payload.subject}]\nประเภทคำร้อง: ${typeLabel}\n\nรายละเอียด:\n${payload.body}${
            payload.attachments.length > 0
              ? `\n\n📎 เอกสารแนบ (${payload.attachments.length} ไฟล์):\n- ${payload.attachments.join('\n- ')}`
              : ''
          }`,
          timestamp: nowIso,
          attachments: payload.attachments
        };

        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          actorName: payload.senderName || 'Admin',
          actorRole: 'ADMIN',
          action: 'ส่งอีเมลคำร้องทางการ (Email Sent)',
          details: `ส่งถึง: ${payload.to} | ${payload.subject} (แนบ ${payload.attachments.length} ไฟล์)`
        };

        const emailRecord: OfficialEmailRecord = {
          id: `email-${Date.now()}`,
          sentAt: nowIso,
          senderName: payload.senderName,
          to: payload.to,
          cc: payload.cc,
          subject: payload.subject,
          requestType: payload.requestType,
          body: payload.body,
          attachments: payload.attachments
        };

        return {
          ...c,
          category: payload.requestType === 'RETURN_PARCEL' ? 'WRONG_BRANCH' : c.category,
          emails: [emailRecord, ...(c.emails || [])],
          chatHistory: [...c.chatHistory, emailMsg],
          activityLogs: [newLog, ...c.activityLogs]
        };
      })
    );
  };

  // Filtered cases based on role and active search/status filters
  const filteredCases = cases.filter(c => {
    // Role based scoping
    if (role === 'CEC') {
      if (c.assignedCecId !== selectedCecId) return false;
    } else if (role === 'BRANCH') {
      if (selectedBranchName && !c.assignedBranchName?.includes(selectedBranchName.split(' ')[0])) {
        // Show if assigned branch matches or if escalated to branch
        const matchesEscalation = c.status === 'CENTRAL_CONTACT_BRANCH' || c.status === 'SLA_EXCEEDED';
        if (!matchesEscalation) return false;
      }
    }

    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTracking = c.trackingNumber.toLowerCase().includes(q);
      const matchCompany = c.companyName.toLowerCase().includes(q);
      const matchReceiver = c.parcelInfo.receiverName.toLowerCase().includes(q);
      const matchInquiry = c.customerInquiry.toLowerCase().includes(q);
      return matchId || matchTracking || matchCompany || matchReceiver || matchInquiry;
    }

    return true;
  });

  // Calculate live counts
  const counts = {
    total: cases.length,
    newCases: cases.filter(c => c.status === 'NEW').length,
    waitingCec: cases.filter(c => c.status === 'WAITING_CEC_REPLY' || c.status === 'SENT_TO_CEC').length,
    waitingReview: cases.filter(c => c.status === 'WAITING_CENTRAL_REVIEW').length,
    slaExceeded: cases.filter(c => c.status === 'SLA_EXCEEDED').length,
    branchEscalated: cases.filter(c => c.status === 'CENTRAL_CONTACT_BRANCH').length,
    closed: cases.filter(c => c.status === 'CLOSED').length
  };

  return (
    <CaseContext.Provider
      value={{
        role,
        setRole,
        selectedCecId,
        setSelectedCecId,
        selectedBranchName,
        setSelectedBranchName,
        cases,
        filteredCases,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,
        selectedCase,
        setSelectedCase,
        createCase,
        checkDuplicate,
        linkToExistingCase,
        dispatchToCec,
        cecSubmitReply,
        centralReviewAnswer,
        escalateToBranch,
        closeCase,
        addChatMessage,
        sendOfficialEmail,
        counts
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};
