import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { CaseItem, UserRole, IssueCategory, UrgencyLevel, BranchContactLog, ActivityLog, ChatMessage, EmailPayload, OfficialEmailRecord, MyOrderActorRole } from '../types/case';
import { EMAIL_REQUEST_TYPE_LABEL } from '../utils/emailTemplates';
import { INITIAL_CASES } from '../data/mockCases';
import { CEC_REGIONS, resolveCecFromParcel } from '../data/cecRegions';
import { fetchThaiPostTrackAndTrace, fetchTrackingUpdate } from '../services/trackTraceApi';

export type TrackingSyncResult = 'NO_CHANGE' | 'UPDATED' | 'CEC_ASSIGNED';

interface CreateCaseParams {
  trackingNumber: string;
  contactPerson: string;
  myOrderRef: CaseItem['myOrderRef'];
  attachments?: string[];
  category: IssueCategory;
  urgency: UrgencyLevel;
  customerInquiry: string;
  emailDispatch?: Omit<EmailPayload, 'senderName'>; // optional official request email sent together with the report
  reportedBy?: { role: MyOrderActorRole; name: string }; // defaults to the shop contact itself
  duplicateOfCaseId?: string; // reporter chose to open a new case although this open case exists for the parcel
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
  linkToExistingCase: (existingCaseId: string, newMessage: string, senderName: string, actorRole?: MyOrderActorRole) => void;
  dispatchToCec: (caseId: string, cecId: number) => void;
  syncParcelTracking: (caseId: string) => Promise<TrackingSyncResult>;
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
    pendingCec: number;
    waitingCec: number;
    waitingReview: number;
    slaExceeded: number;
    branchEscalated: number;
    closed: number;
  };
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

// Chat + audit entries recorded whenever a shop sends an official request email
const buildEmailEntries = (payload: EmailPayload, nowIso: string, idSeed: number) => {
  const record: OfficialEmailRecord = {
    id: `email-${idSeed}`,
    sentAt: nowIso,
    senderName: payload.senderName,
    to: payload.to,
    cc: payload.cc,
    subject: payload.subject,
    requestType: payload.requestType,
    body: payload.body,
    attachments: payload.attachments,
    sentByRole: payload.sentByRole || 'MERCHANT'
  };
  const byAdmin = payload.sentByRole === 'MYORDER_ADMIN';
  const chat: ChatMessage = {
    id: `msg-${idSeed}`,
    senderRole: byAdmin ? 'MYORDER_ADMIN' : 'CUSTOMER',
    senderName: `${payload.senderName} (ส่งอีเมลทางการ)`,
    message: `[ส่งอีเมลถึง ${payload.to} | เรื่อง: ${payload.subject}]\nประเภทคำร้อง: ${EMAIL_REQUEST_TYPE_LABEL[payload.requestType]}\n\nรายละเอียด:\n${payload.body}${
      payload.attachments.length > 0
        ? `\n\n📎 เอกสารแนบ (${payload.attachments.length} ไฟล์):\n- ${payload.attachments.join('\n- ')}`
        : ''
    }`,
    timestamp: nowIso,
    attachments: payload.attachments
  };
  const log: ActivityLog = {
    id: `log-${idSeed}`,
    timestamp: nowIso,
    actorName: byAdmin ? payload.senderName : `${payload.senderName} (MyOrder)`,
    actorRole: byAdmin ? 'MYORDER_ADMIN' : 'MERCHANT',
    action: byAdmin ? 'แอดมิน MyOrder ส่งอีเมลคำร้องแทนร้านค้า' : 'ส่งอีเมลคำร้องทางการ (Email Sent)',
    details: `${EMAIL_REQUEST_TYPE_LABEL[payload.requestType]} • ส่งถึง: ${payload.to} | ${payload.subject} (แนบ ${payload.attachments.length} ไฟล์)`
  };
  return { record, chat, log };
};

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('CENTRAL');
  const [selectedCecId, setSelectedCecId] = useState<number>(1);
  const [selectedBranchName, setSelectedBranchName] = useState<string>('ปณ.สันกำแพง (เชียงใหม่)');
  
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  // Running case number so several cases created at once (bulk report) never share an ID
  const caseSeq = useRef(INITIAL_CASES.length);

  // Switching role starts from clean filters (each role has its own queue/tabs)
  const setRole = (next: UserRole) => {
    setRoleState(next);
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

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

  // Create Case (a shop reports a problem on a shipped MyOrder order)
  const createCase = async (params: CreateCaseParams): Promise<CaseItem> => {
    const cleanTracking = params.trackingNumber.trim().toUpperCase();
    const parcelInfo = await fetchThaiPostTrackAndTrace(cleanTracking);
    // Route straight to CEC when the destination is confirmed; otherwise leave CEC blank for now
    const assignedCec = resolveCecFromParcel(parcelInfo);
    const shopName = params.myOrderRef.shopName;

    const now = new Date();
    const nowIso = now.toISOString();
    const slaDeadlineIso = new Date(now.getTime() + 72 * 3600 * 1000).toISOString(); // 3 days SLA

    caseSeq.current += 1;
    const newId = `TP-2026-${caseSeq.current.toString().padStart(4, '0')}`;
    const reporter = params.reportedBy || { role: 'MERCHANT' as const, name: params.contactPerson };
    const byAdmin = reporter.role === 'MYORDER_ADMIN';

    const chatHistory: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        senderRole: byAdmin ? 'MYORDER_ADMIN' : 'CUSTOMER',
        senderName: byAdmin ? `${reporter.name} (แจ้งแทน ${shopName})` : `${params.contactPerson} (${shopName})`,
        message: params.customerInquiry,
        timestamp: nowIso,
        attachments: params.attachments?.length ? params.attachments : undefined
      }
    ];
    const activityLogs: ActivityLog[] = [
      assignedCec
        ? {
            id: `log-${Date.now() + 3}`,
            timestamp: nowIso,
            actorName: 'ระบบ (Auto-Routing)',
            actorRole: 'CENTRAL',
            action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
            details: `ระบุ ${assignedCec.code} จากรหัสไปรษณีย์ปลายทาง ${parcelInfo.destZipCode} และส่งเข้าคิว CEC ทันที`
          }
        : {
            id: `log-${Date.now() + 3}`,
            timestamp: nowIso,
            actorName: 'ระบบ (Auto-Routing)',
            actorRole: 'CENTRAL',
            action: 'รอระบุ CEC ผู้รับผิดชอบ',
            details: `สถานะพัสดุล่าสุด "${parcelInfo.currentPostalStatus}" ยังยืนยันพื้นที่ปลายทางไม่ได้ ระบบจะระบุ CEC อัตโนมัติเมื่อสถานะพัสดุอัปเดต`
          },
      {
        id: `log-${Date.now()}`,
        timestamp: nowIso,
        actorName: byAdmin ? reporter.name : `${params.contactPerson} (MyOrder)`,
        actorRole: reporter.role,
        action: byAdmin ? 'แอดมิน MyOrder แจ้งปัญหาแทนร้านค้า' : 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: `แจ้งปัญหาจากคำสั่งซื้อ ${params.myOrderRef.orderId} (${cleanTracking}) ของร้าน ${shopName} ส่งตรงเข้าระบบ ปณ.`
      }
    ];

    if (params.duplicateOfCaseId) {
      activityLogs.splice(1, 0, {
        id: `log-${Date.now() + 4}`,
        timestamp: nowIso,
        actorName: byAdmin ? reporter.name : `${params.contactPerson} (MyOrder)`,
        actorRole: reporter.role,
        action: 'เปิดเคสใหม่ทั้งที่มีเคสเดิมยังไม่ปิด',
        details: `ผู้แจ้งยืนยันสร้างเคสใหม่ แม้เลขพัสดุนี้มีเคส ${params.duplicateOfCaseId} ที่ยังเปิดอยู่`
      });
    }

    const emails: OfficialEmailRecord[] = [];
    if (params.emailDispatch) {
      const { record, chat, log } = buildEmailEntries(
        { ...params.emailDispatch, senderName: byAdmin ? reporter.name : params.contactPerson, sentByRole: reporter.role },
        nowIso,
        Date.now() + 5
      );
      emails.push(record);
      chatHistory.push(chat);
      activityLogs.splice(1, 0, log); // after the routing entry, before the report entry
    }

    const newCase: CaseItem = {
      id: newId,
      trackingNumber: cleanTracking,
      companyName: shopName,
      contactPerson: params.contactPerson,
      myOrderRef: params.myOrderRef,
      category: params.category,
      urgency: params.urgency,
      customerInquiry: params.customerInquiry,
      status: assignedCec ? 'WAITING_CEC_REPLY' : 'PENDING_CEC_ASSIGNMENT',
      assignedCecId: assignedCec?.id,
      assignedCecName: assignedCec?.name,
      assignedBranchName: parcelInfo.destPostOffice,
      createdAt: nowIso,
      dispatchedAt: assignedCec ? nowIso : undefined,
      slaDeadline: slaDeadlineIso,
      isSlaExceeded: false,
      branchContactLogs: [],
      chatHistory,
      activityLogs,
      emails,
      parcelInfo,
      duplicateOfCaseId: params.duplicateOfCaseId
    };

    setCases(prev => [
      newCase,
      ...prev.map(c =>
        c.id !== params.duplicateOfCaseId
          ? c
          : {
              ...c,
              linkedDuplicateCaseIds: [...(c.linkedDuplicateCaseIds || []), newId],
              activityLogs: [
                {
                  id: `log-${Date.now() + 6}`,
                  timestamp: nowIso,
                  actorName: 'ระบบ (Duplicate Check)',
                  actorRole: 'CENTRAL' as const,
                  action: 'มีการเปิดเคสใหม่ของพัสดุเดียวกัน',
                  details: `เปิดเคส ${newId} สำหรับเลขพัสดุ ${cleanTracking} ขณะที่เคสนี้ยังไม่ปิด`
                },
                ...c.activityLogs
              ]
            }
      )
    ]);
    return newCase;
  };

  // Link to existing case (instead of creating duplicate)
  const linkToExistingCase = (
    existingCaseId: string,
    newMessage: string,
    senderName: string,
    actorRole: MyOrderActorRole = 'MERCHANT'
  ) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== existingCaseId) return c;
        const newChat: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderRole: actorRole === 'MYORDER_ADMIN' ? 'MYORDER_ADMIN' : 'CUSTOMER',
          senderName: senderName || 'ร้านค้า (ถามซ้ำ)',
          message: `[สอบถามเพิ่มเติมเกี่ยวกับเลขพัสดุเดิม]: ${newMessage}`,
          timestamp: nowIso
        };
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          actorName: senderName || 'ร้านค้า',
          actorRole,
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

  // Central assigns / reassigns a CEC (also used to fill in a blank CEC manually)
  const dispatchToCec = (caseId: string, cecId: number) => {
    const nowIso = new Date().toISOString();
    const cec = CEC_REGIONS.find(r => r.id === cecId);
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const isReassign = c.assignedCecId !== undefined && c.assignedCecId !== cecId;
        // Keep later-stage statuses (e.g. SLA exceeded / waiting review) when only swapping the CEC
        const keepStatus = isReassign && !['NEW', 'CENTRAL_REVIEWING', 'PENDING_CEC_ASSIGNMENT'].includes(c.status);
        return {
          ...c,
          status: keepStatus ? c.status : 'WAITING_CEC_REPLY',
          assignedCecId: cecId,
          assignedCecName: cec?.name,
          dispatchedAt: c.dispatchedAt || nowIso,
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: 'เจ้าหน้าที่ ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: isReassign ? 'เปลี่ยน CEC ผู้รับผิดชอบ' : 'ระบุ CEC และส่งเคส',
              details: isReassign
                ? `ย้ายเคสจาก CEC ${c.assignedCecId} ไปยัง ${cec?.code || `CEC ${cecId}`}`
                : `ส่งเคสไปยัง ${cec?.code || `CEC ${cecId}`} ประจำพื้นที่สาขาปลายทาง เพื่อตรวจสอบและประสานงาน`
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // Pull the latest Track & Trace status; fill in the CEC once the destination becomes known
  const syncParcelTracking = async (caseId: string): Promise<TrackingSyncResult> => {
    const target = cases.find(c => c.id === caseId);
    if (!target) return 'NO_CHANGE';

    const updatedParcel = await fetchTrackingUpdate(target.parcelInfo);
    if (updatedParcel === target.parcelInfo) return 'NO_CHANGE';

    const cec = target.assignedCecId === undefined ? resolveCecFromParcel(updatedParcel) : undefined;
    const nowIso = new Date().toISOString();
    const latestEvent = updatedParcel.events[updatedParcel.events.length - 1];

    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const logs: ActivityLog[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: nowIso,
            actorName: 'ระบบ (Track & Trace API)',
            actorRole: 'CENTRAL',
            action: 'อัปเดตสถานะพัสดุ',
            details: `${latestEvent.status} @ ${latestEvent.location}: ${latestEvent.description}`
          }
        ];
        if (cec) {
          logs.unshift({
            id: `log-${Date.now() + 1}`,
            timestamp: nowIso,
            actorName: 'ระบบ (Auto-Routing)',
            actorRole: 'CENTRAL',
            action: 'ระบุ CEC อัตโนมัติและส่งเคส',
            details: `ยืนยันพื้นที่ปลายทางแล้ว ระบุ ${cec.code} จากรหัสไปรษณีย์ ${updatedParcel.destZipCode} และส่งเข้าคิว CEC`
          });
        }
        return {
          ...c,
          parcelInfo: updatedParcel,
          ...(cec
            ? {
                assignedCecId: cec.id,
                assignedCecName: cec.name,
                dispatchedAt: c.dispatchedAt || nowIso,
                status: c.status === 'PENDING_CEC_ASSIGNMENT' ? 'WAITING_CEC_REPLY' : c.status
              }
            : {}),
          activityLogs: [...logs, ...c.activityLogs]
        };
      })
    );
    return cec ? 'CEC_ASSIGNED' : 'UPDATED';
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

        // APPROVED or EDITED -> transitions to ANSWER_SENT_TO_MERCHANT
        return {
          ...c,
          status: 'ANSWER_SENT_TO_MERCHANT',
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
              action: action === 'APPROVED' ? 'อนุมัติคำตอบและส่งให้ร้านค้า' : 'ปรับแก้คำตอบและส่งให้ร้านค้า',
              details: `คำตอบผ่านการตรวจสอบคุณภาพและส่งกลับร้าน ${c.companyName} ผ่าน MyOrder แล้ว`
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
              actorName:
                role === 'MERCHANT'
                  ? `ร้านค้า (${c.companyName})`
                  : role === 'MYORDER_ADMIN'
                  ? 'แอดมิน MyOrder'
                  : 'ปณ.ส่วนกลาง',
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
          senderRole:
            senderRole === 'MERCHANT'
              ? 'CUSTOMER'
              : senderRole === 'MYORDER_ADMIN'
              ? 'MYORDER_ADMIN'
              : senderRole === 'CENTRAL'
              ? 'CENTRAL'
              : senderRole === 'CEC'
              ? 'CEC'
              : 'BRANCH',
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

  // Shop sends an official request email (return parcel / change address / submit evidence)
  const sendOfficialEmail = (caseId: string, payload: EmailPayload) => {
    const nowIso = new Date().toISOString();
    const { record, chat, log } = buildEmailEntries(payload, nowIso, Date.now());
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          category: payload.requestType === 'RETURN_PARCEL' ? 'WRONG_BRANCH' : c.category,
          emails: [record, ...(c.emails || [])],
          chatHistory: [...c.chatHistory, chat],
          activityLogs: [log, ...c.activityLogs]
        };
      })
    );
  };

  // Filtered cases based on role and active search/status filters
  const filteredCases = cases.filter(c => {
    // Role based scoping
    // (MERCHANT is scoped per shop inside its own views; MYORDER_ADMIN and CENTRAL see every case)
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
    pendingCec: cases.filter(c => c.status === 'PENDING_CEC_ASSIGNMENT').length,
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
        syncParcelTracking,
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
