import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { CaseItem, UserRole, IssueCategory, UrgencyLevel, BranchContactLog, ActivityLog, ChatMessage, EmailPayload, OfficialEmailRecord, MyOrderActorRole, PhoneCallAttempt } from '../types/case';
import { EMAIL_REQUEST_TYPE_LABEL } from '../utils/emailTemplates';
import { DEFAULT_DATE_FILTER, matchesDateFilter, type CaseDateFilter } from '../utils/dateFilter';
import { INITIAL_CASES } from '../data/mockCases';
import { CEC_REGIONS, getCecLabel } from '../data/cecRegions';
import { findPostOffice, POST_OFFICE_SOURCE } from '../data/postOffices';
import { cecForRecipient, nextRoutingAlert, ROUTING_ALERT_LABEL } from '../utils/cecRouting';
import { fetchThaiPostTrackAndTrace, fetchTrackingUpdate } from '../services/trackTraceApi';
import {
  getSlaRouteType,
  getSlaTargetDays,
  findBagOpenDate,
  calculateSlaDeadline,
  calculateRetentionDeadline
} from '../utils/slaCalculator';
import { notify } from '../utils/dialog';
import { matchesCaseSearch } from '../utils/caseSearch';
import { acceptResolution, defaultClosureSettings, evaluateLifecycle, merchantFollowUp, normalizeClosureSettings, sendResolution, shipmentKey, type ClosureSettings } from '../utils/caseLifecycle';

export type TrackingSyncResult = 'NO_CHANGE' | 'UPDATED' | 'ROUTING_ALERT';

// Sidebar filter for cases whose CEC may not match where the parcel really is (not a case status)
export const ROUTING_ALERT_FILTER = 'ROUTING_ALERT';

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
  creationSource?: 'MERCHANT' | 'AUTO_SLA';
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
  dateFilter: CaseDateFilter; // by the date the case was reported
  setDateFilter: (f: CaseDateFilter) => void;
  dateScopedCases: CaseItem[]; // every case within the date filter (before role/status/search filters)
  
  selectedCase: CaseItem | null;
  setSelectedCase: (c: CaseItem | null) => void;
  
  // Actions
  createCase: (params: CreateCaseParams) => Promise<CaseItem>;
  closureSettings: ClosureSettings;
  updateClosureSettings: (settings: ClosureSettings) => void;
  submitResolution: (caseId: string, message: string) => void;
  disputeDelivery: (caseId: string) => void;
  checkDuplicate: (trackingNumber: string, orderRef?: CaseItem['myOrderRef']) => CaseItem | undefined;
  linkToExistingCase: (existingCaseId: string, newMessage: string, senderName: string, actorRole?: MyOrderActorRole) => void;
  syncParcelTracking: (caseId: string) => Promise<TrackingSyncResult>;
  reassignCec: (caseId: string, cecId: number, note?: string, officeCode?: string) => void;
  dismissRoutingAlert: (caseId: string, note?: string) => void;
  cecSubmitReply: (caseId: string, answer: string, branchNotes?: string, replierName?: string) => void;
  centralReviewAnswer: (
    caseId: string,
    action: 'APPROVED' | 'EDITED' | 'REQUESTED_MORE_INFO',
    approvedAnswer: string,
    reviewNotes?: string
  ) => void;
  escalateToBranch: (caseId: string, branchContactLog: BranchContactLog) => void;
  closeCase: (caseId: string, resolutionNotes?: string, expectedVersion?: number) => void;
  addChatMessage: (caseId: string, message: string, senderRole?: UserRole, senderName?: string, isInternal?: boolean) => void;
  sendOfficialEmail: (caseId: string, payload: EmailPayload) => void;
  logPhoneCallAttempt: (caseId: string, attempt: Omit<PhoneCallAttempt, 'id' | 'calledAt'>) => void;
  confirmRecipientReceived: (caseId: string, confirmed: boolean, note?: string) => void;
  
  // Refresh & Reset
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  resetToMockData: () => void;

  // Badge counts
  counts: {
    open: number; // every case not closed yet
    newCases: number;
    routingAlerts: number; // CEC may not match the parcel's real destination
    waitingCec: number;
    waitingReview: number;
    slaExceeded: number;
    branchEscalated: number;
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
  const [selectedBranchName, setSelectedBranchName] = useState<string>('ปณ.สันกำแพง');
  
  const [closureSettings, setClosureSettings] = useState<ClosureSettings>(() => {
    try { return normalizeClosureSettings(JSON.parse(localStorage.getItem('thaipost-closure-settings-v1') || 'null')); }
    catch { return defaultClosureSettings(); }
  });
  const [cases, setCases] = useState<CaseItem[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('thaipost-cases-lifecycle-v1') || 'null');
      if (Array.isArray(saved) && saved.length && saved.every(c => typeof c.id === 'string' && c.myOrderRef && c.parcelInfo && Array.isArray(c.activityLogs) && Array.isArray(c.chatHistory))) return saved;
    } catch { /* start the demo when storage is unavailable */ }
    return INITIAL_CASES;
  });
  const casesRef = useRef(cases);
  useEffect(() => { casesRef.current = cases; }, [cases]);
  const settingsRef = useRef(closureSettings);
  useEffect(() => { settingsRef.current = closureSettings; }, [closureSettings]);
  useEffect(() => { try { localStorage.setItem('thaipost-cases-lifecycle-v1', JSON.stringify(cases)); } catch { /* quota/private mode */ } }, [cases]);
  const updateClosureSettings = (settings: ClosureSettings) => {
    if (role !== 'CENTRAL') return;
    const normalized = normalizeClosureSettings(settings);
    setClosureSettings(normalized);
    try { localStorage.setItem('thaipost-closure-settings-v1', JSON.stringify(normalized)); } catch { /* private mode */ }
    const now = new Date().toISOString();
    setCases(prev => prev.map(c => ({ ...c, activityLogs: [{ id: `settings-${c.id}-${now}`, timestamp: now, actorName: 'CS ส่วนกลาง', actorRole: 'CENTRAL', action: 'ตั้งค่ารอร้านค้ายืนยัน', details: `ใช้กับผลแก้ไขรอบใหม่เท่านั้น; ${JSON.stringify(normalized)}` }, ...c.activityLogs] })));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<CaseDateFilter>(DEFAULT_DATE_FILTER);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  // Running case number so several cases created at once (bulk report) never share an ID
  const caseSeq = useRef(Math.max(INITIAL_CASES.length, ...cases.map(c => Number(c.id.split('-').at(-1)) || 0)));

  // Switching role starts from clean filters (each role has its own queue/tabs)
  const setRole = (next: UserRole) => {
    setRoleState(next);
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setDateFilter(DEFAULT_DATE_FILTER);
  };

  // Check SLA violations every 30 seconds
  useEffect(() => {
    const checkSla = () => {
      const nowMs = Date.now();
      setCases(prev =>
        prev.map(c => {
          const evaluated = evaluateLifecycle(c, new Date(nowMs).toISOString());
          if (evaluated !== c || c.status === 'CLOSED' || c.confirmation) return evaluated;
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
    const interval = setInterval(checkSla, 15000);
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
  const checkDuplicate = (trackingNumber: string, orderRef?: CaseItem['myOrderRef']) => {
    const clean = trackingNumber.trim().toUpperCase();
    return casesRef.current.find(c => c.trackingNumber.toUpperCase() === clean && (!orderRef || (c.myOrderRef.orderId === orderRef.orderId && c.myOrderRef.shopId === orderRef.shopId)));
  };

  // Create Case (a shop reports a problem on a shipped MyOrder order)
  const createCase = async (params: CreateCaseParams): Promise<CaseItem> => {
    const cleanTracking = params.trackingNumber.trim().toUpperCase();
    const existing = checkDuplicate(cleanTracking, params.myOrderRef);
    if (existing) return existing;
    const parcelInfo = await fetchThaiPostTrackAndTrace(cleanTracking);
    const raced = checkDuplicate(cleanTracking, params.myOrderRef);
    if (raced) return raced;
    // CEC comes from the recipient's postal code; QMS statuses later confirm or flag it
    const assignedCec = cecForRecipient(parcelInfo);
    const destinationOffice = findPostOffice(parcelInfo.destZipCode);
    const shopName = params.myOrderRef.shopName;

    const now = new Date();
    const nowIso = now.toISOString();
    const routing = nextRoutingAlert({ assignedCecId: assignedCec?.id }, parcelInfo, nowIso);
    const routeType = getSlaRouteType(parcelInfo.originZipCode, parcelInfo.destZipCode);
    const targetDays = getSlaTargetDays(parcelInfo.originZipCode, parcelInfo.destZipCode);
    const bagOpenedAt = findBagOpenDate(parcelInfo.events, nowIso);
    const slaDeadlineIso = calculateSlaDeadline(bagOpenedAt, targetDays);
    const retentionDeadlineIso = calculateRetentionDeadline(bagOpenedAt, 7);

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
            details: `ระบุ ${assignedCec.code} จากรหัสไปรษณีย์ผู้รับ ${parcelInfo.destZipCode} จาก ${POST_OFFICE_SOURCE.filename} (ข้อมูล ณ ${POST_OFFICE_SOURCE.asOfLabel}) และส่งเข้าคิว CEC ทันที`
          }
        : {
            id: `log-${Date.now() + 3}`,
            timestamp: nowIso,
            actorName: 'ระบบ (Auto-Routing)',
            actorRole: 'CENTRAL',
            action: 'ไม่พบ CEC ของรหัสไปรษณีย์ผู้รับ',
            details: `รหัสไปรษณีย์ ${parcelInfo.destZipCode} ไม่มีในตารางรหัสไปรษณีย์ → CEC ส่งให้ส่วนกลางเลือก CEC`
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

    if (routing.alert && routing.alert.kind !== 'UNKNOWN_ZIP') {
      activityLogs.unshift({
        id: `log-${Date.now() + 7}`,
        timestamp: nowIso,
        actorName: 'ระบบ (ตรวจปลายทางจาก QMS)',
        actorRole: 'CENTRAL',
        action: `แจ้งเตือน: ${ROUTING_ALERT_LABEL[routing.alert.kind]}`,
        details: routing.alert.message
      });
    }

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
      shipmentId: shipmentKey(params.myOrderRef, cleanTracking),
      creationSource: params.creationSource || 'MERCHANT',
      parcelCycleVerified: true, // mock API returns the order's bound fixture; production must verify provider cycle
      deliveryDisputed: params.category === 'NOT_RECEIVED',
      merchantEngaged: params.creationSource !== 'AUTO_SLA',
      trackingNumber: cleanTracking,
      companyName: shopName,
      contactPerson: params.contactPerson,
      myOrderRef: params.myOrderRef,
      category: params.category,
      urgency: params.urgency,
      customerInquiry: params.customerInquiry,
      status: assignedCec ? 'WAITING_CEC_REPLY' : 'NEW',
      assignedCecId: assignedCec?.id,
      assignedCecName: assignedCec?.name,
      assignedBranchName: destinationOffice ? `ปณ.${destinationOffice.name}` : undefined,
      assignedBranchCode: destinationOffice?.code,
      createdAt: nowIso,
      dispatchedAt: assignedCec ? nowIso : undefined,
      bagOpenedAt,
      slaRouteType: routeType,
      slaTargetDays: targetDays,
      slaDeadline: slaDeadlineIso,
      retentionDeadline: retentionDeadlineIso,
      isSlaExceeded: false,
      callAttempts: [],
      deliveryProofPhotoUrl: parcelInfo.deliveryProofPhotoUrl,
      recipientConfirmedReceived: parcelInfo.recipientConfirmedReceived,
      branchContactLogs: [],
      chatHistory,
      activityLogs,
      emails,
      parcelInfo,
      routingAlert: routing.alert,
      duplicateOfCaseId: params.duplicateOfCaseId
    };

    if (params.creationSource === 'AUTO_SLA') {
      newCase.chatHistory = [];
      newCase.activityLogs = [{ id: `auto-sla-${newId}`, timestamp: nowIso, actorName: 'ระบบอัตโนมัติ', actorRole: 'CENTRAL', action: 'ระบบเปิดเคสติดตาม SLA อัตโนมัติ', details: `เกิน 3 วัน แจ้งร้านค้า / สาขา / CEC; shipment=${newCase.shipmentId}` }, ...activityLogs.filter(log => log.action !== 'ร้านค้าแจ้งปัญหา')];
    }
    casesRef.current = [newCase, ...casesRef.current];
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
          ...merchantFollowUp(c, nowIso),
          chatHistory: [...c.chatHistory, newChat],
          activityLogs: [newLog, ...merchantFollowUp(c, nowIso).activityLogs]
        };
      })
    );
  };

  // Pull the latest parcel status from QMS and check it still matches the case's CEC
  const syncParcelTracking = async (caseId: string): Promise<TrackingSyncResult> => {
    const target = cases.find(c => c.id === caseId);
    if (!target) return 'NO_CHANGE';

    const updatedParcel = await fetchTrackingUpdate(target.parcelInfo);
    if (updatedParcel === target.parcelInfo) return 'NO_CHANGE';

    const nowIso = new Date().toISOString();
    const routing = nextRoutingAlert(target, updatedParcel, nowIso);
    const latestEvent = updatedParcel.events[updatedParcel.events.length - 1];

    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const logs: ActivityLog[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: nowIso,
            actorName: 'ระบบ QMS',
            actorRole: 'CENTRAL',
            action: 'QMS อัปเดตสถานะพัสดุ',
            details: `${latestEvent.status} @ ${latestEvent.location}: ${latestEvent.description}`
          }
        ];
        if (routing.isNew && routing.alert) {
          logs.unshift({
            id: `log-${Date.now() + 1}`,
            timestamp: nowIso,
            actorName: 'ระบบ (ตรวจปลายทางจาก QMS)',
            actorRole: 'CENTRAL',
            action: `แจ้งเตือนส่วนกลาง: ${ROUTING_ALERT_LABEL[routing.alert.kind]}`,
            details: routing.alert.message
          });
        }
        return evaluateLifecycle({ ...c, parcelInfo: updatedParcel, routingAlert: routing.alert, activityLogs: [...logs, ...c.activityLogs] }, nowIso);
      })
    );
    return routing.isNew ? 'ROUTING_ALERT' : 'UPDATED';
  };

  // Central moves a case to another CEC after QMS showed the parcel is somewhere else
  const reassignCec = (caseId: string, cecId: number, note?: string, officeCode?: string) => {
    const cec = CEC_REGIONS.find(r => r.id === cecId);
    const office = findPostOffice(officeCode);
    if (!cec || !office || office.cecCode !== cec.code) return;
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const from = c.assignedCecId !== undefined ? getCecLabel(c.assignedCecId) : 'ยังไม่ระบุ CEC';
        const stillWithCec = ['NEW', 'SENT_TO_CEC', 'WAITING_CEC_REPLY'].includes(c.status);
        return {
          ...c,
          assignedCecId: cec.id,
          assignedCecName: cec.name,
          assignedBranchCode: office.code,
          assignedBranchName: `ปณ.${office.name}`,
          dispatchedAt: nowIso,
          status: stillWithCec ? 'WAITING_CEC_REPLY' : c.status,
          routingAlert: undefined,
          routingAlertDismissedKey: c.routingAlert?.key,
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: 'ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: `ย้ายเคสจาก ${from} ไป ${cec.code}`,
              details: `${note || c.routingAlert?.message || `ส่วนกลางเลือก ${cec.code}`} → ${office.code} ${office.name} (${cec.code}) จาก ${POST_OFFICE_SOURCE.filename}`
            },
            ...c.activityLogs
          ]
        };
      })
    );
  };

  // Central checked the alert and the current CEC is right (e.g. the office forwards the parcel itself)
  const dismissRoutingAlert = (caseId: string, note?: string) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId || !c.routingAlert) return c;
        return {
          ...c,
          routingAlert: undefined,
          routingAlertDismissedKey: c.routingAlert.key,
          activityLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowIso,
              actorName: 'ปณ.ส่วนกลาง',
              actorRole: 'CENTRAL',
              action: `ยืนยัน ${getCecLabel(c.assignedCecId)} ถูกต้อง`,
              details: note || `ตรวจแล้ว: ${c.routingAlert.message}`
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
        if (c.id !== caseId || c.status === 'CLOSED') return c;
        if (c.status === 'ANSWER_SENT_TO_MERCHANT' && c.centralReview?.approvedAnswer === approvedAnswer && action !== 'REQUESTED_MORE_INFO') return c;

        if (action === 'REQUESTED_MORE_INFO') {
          return {
            ...c,
            status: 'WAITING_CEC_REPLY',
            confirmation: undefined,
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
        return sendResolution({
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
        }, settingsRef.current, nowIso);
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

  // Only a merchant can accept a delivered resolution. Staff send a result and start confirmation.
  const closeCase = (caseId: string, _resolutionNotes = '', expectedVersion?: number) => {
    if (role !== 'MERCHANT') {
      notify('เจ้าหน้าที่ส่งผลแก้ไขให้ร้านค้ายืนยัน ไม่สามารถปิดแทนร้านค้าได้', { title: 'รอร้านค้ายืนยัน', tone: 'default' });
      return;
    }
    const nowIso = new Date().toISOString();
    setCases(prev => prev.map(c => c.id === caseId ? acceptResolution(c, role, `ร้านค้า (${c.companyName})`, nowIso, expectedVersion) : c));
  };

  const submitResolution = (caseId: string, message: string) => {
    if (!['CENTRAL', 'CEC', 'BRANCH'].includes(role) || !message.trim()) return;
    const nowIso = new Date().toISOString();
    setCases(prev => prev.map(c => c.id !== caseId || c.status === 'CLOSED' || (c.confirmation && c.chatHistory.at(-1)?.message === message.trim()) ? c : sendResolution({
      ...c,
      chatHistory: [...c.chatHistory, { id: `resolution-${c.id}-${nowIso}`, senderRole: role as 'CENTRAL' | 'CEC' | 'BRANCH', senderName: 'เจ้าหน้าที่ ปณท', message: message.trim(), timestamp: nowIso }]
    }, settingsRef.current, nowIso)));
  };

  const disputeDelivery = (caseId: string) => {
    if (role !== 'MERCHANT') return;
    const nowIso = new Date().toISOString();
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...merchantFollowUp(c, nowIso, true), category: 'NOT_RECEIVED',
      chatHistory: [...c.chatHistory, { id: `dispute-${c.id}-${nowIso}`, senderRole: 'CUSTOMER', senderName: c.companyName, message: 'เซ็นรับแล้วแต่ยังไม่ได้รับของ กรุณาตรวจสอบ ต้องการให้ดำเนินการต่อ', timestamp: nowIso }]
    }));
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
          ...(!isInternal && (senderRole === 'MERCHANT' || senderRole === 'MYORDER_ADMIN') ? merchantFollowUp(c, nowIso) : c),
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
          ...merchantFollowUp(c, nowIso),
          category: payload.requestType === 'RETURN_PARCEL' ? 'WRONG_BRANCH' : c.category,
          emails: [record, ...(c.emails || [])],
          chatHistory: [...c.chatHistory, chat],
          activityLogs: [log, ...merchantFollowUp(c, nowIso).activityLogs]
        };
      })
    );
  };

  // Log Phone Call Attempt (จนท. 3 ครั้ง + แอดมินครั้งที่ 4)
  const logPhoneCallAttempt = (caseId: string, attempt: Omit<PhoneCallAttempt, 'id' | 'calledAt'>) => {
    const nowIso = new Date().toISOString();
    const newAttempt: PhoneCallAttempt = {
      ...attempt,
      id: `call-${Date.now()}`,
      calledAt: nowIso
    };
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const attempts = [...(c.callAttempts || []), newAttempt];
        const log: ActivityLog = {
          id: `log-call-${Date.now()}`,
          timestamp: nowIso,
          actorName: attempt.callerName,
          actorRole: attempt.callerRole === 'ADMIN' ? 'MYORDER_ADMIN' : 'BRANCH',
          action: `บันทึกการโทรติดต่อผู้รับ (ครั้งที่ ${attempt.attemptNumber})`,
          details: `ผลการโทร: ${attempt.outcomeLabel} (${attempt.phoneNumber})${attempt.note ? ` - ${attempt.note}` : ''}`
        };
        return {
          ...c,
          callAttempts: attempts,
          recipientConfirmedReceived: attempt.outcome === 'CONFIRMED_RECEIVED' ? true : c.recipientConfirmedReceived,
          activityLogs: [log, ...c.activityLogs]
        };
      })
    );
  };

  // Confirm recipient received goods (โทรคอนเฟิร์มปลายทาง)
  const confirmRecipientReceived = (caseId: string, confirmed: boolean, note?: string) => {
    const nowIso = new Date().toISOString();
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const log: ActivityLog = {
          id: `log-confirm-${Date.now()}`,
          timestamp: nowIso,
          actorName: role === 'MYORDER_ADMIN' ? 'แอดมิน MyOrder' : 'เจ้าหน้าที่ ปณ.',
          actorRole: role,
          action: 'โทรคอนเฟิร์มปลายทางยืนยันรับพัสดุ',
          details: note || (confirmed ? 'ปลายทางยืนยันได้รับสินค้าแล้ว' : 'ปลายทางยืนยันยังไม่ได้รับ')
        };
        return {
          ...c,
          recipientConfirmedReceived: confirmed,
          activityLogs: [log, ...c.activityLogs]
        };
      })
    );
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh all cases: fetch latest parcel info & re-check SLAs
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const nowMs = Date.now();
      let newAlerts = 0;
      const updatedCases = await Promise.all(
        cases.map(async c => {
          if (c.status === 'CLOSED') return c;
          let parcel = c.parcelInfo;
          try {
            parcel = await fetchTrackingUpdate(c.parcelInfo);
          } catch {
            // keep existing parcel
          }
          const routing = nextRoutingAlert(c, parcel, new Date(nowMs).toISOString());
          if (routing.isNew) newAlerts += 1;
          const deadlineMs = new Date(c.slaDeadline).getTime();
          const isOverdue = deadlineMs < nowMs;
          const nextStatus =
            isOverdue && c.status !== 'SLA_EXCEEDED' && c.status !== 'CENTRAL_CONTACT_BRANCH'
              ? 'SLA_EXCEEDED'
              : c.status;
          return {
            ...c,
            parcelInfo: parcel,
            routingAlert: routing.alert,
            isSlaExceeded: isOverdue,
            status: nextStatus
          };
        })
      );
      const updates = new Map(updatedCases.map(c => [c.id, c.parcelInfo]));
      setCases(prev => prev.map(c => {
        const parcelInfo = updates.get(c.id) || c.parcelInfo;
        const next = { ...c, parcelInfo, routingAlert: nextRoutingAlert(c, parcelInfo, new Date(nowMs).toISOString()).alert };
        return evaluateLifecycle(next, new Date(nowMs).toISOString());
      }));
      notify(
        newAlerts > 0
          ? `รีเฟรชข้อมูลแล้ว พบ ${newAlerts} เคสที่ CEC อาจไม่ตรงกับปลายทางจริงจาก QMS ดูได้ที่ "ปลายทางไม่ตรง CEC"`
          : 'รีเฟรชข้อมูลสถานะพัสดุและคำนวณ SLA ล่าสุดเรียบร้อยแล้ว',
        { title: newAlerts > 0 ? 'มีเคสต้องตรวจ CEC' : 'รีเฟรชข้อมูลสำเร็จ', tone: newAlerts > 0 ? 'danger' : 'success' }
      );
    } catch {
      notify('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล', { title: 'แจ้งเตือน', tone: 'danger' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset to initial mock cases
  const resetToMockData = () => {
    const fresh: CaseItem[] = JSON.parse(JSON.stringify(INITIAL_CASES));
    setCases(fresh);
    caseSeq.current = INITIAL_CASES.length;
    if (selectedCase) {
      const match = fresh.find(c => c.id === selectedCase.id);
      setSelectedCase(match || null);
    }
    notify('รีเซ็ตข้อมูลเคสและสถานะทั้งหมดกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว', {
      title: 'รีเซ็ตข้อมูลเริ่มต้น',
      tone: 'default'
    });
  };

  // Filtered cases based on role and active search/status filters
  const dateScopedCases = cases.filter(c => matchesDateFilter(c.createdAt, dateFilter));

  const filteredCases = dateScopedCases.filter(c => {
    // Role based scoping
    // (MERCHANT is scoped per shop inside its own views; MYORDER_ADMIN and CENTRAL see every case)
    if (role === 'CEC') {
      if (c.assignedCecId !== selectedCecId) return false;
    } else if (role === 'BRANCH') {
      if (selectedBranchName && c.assignedBranchName !== selectedBranchName) return false;
    }

    // Status filter: 'ALL' means every case still in progress; closed cases only show when picked
    // (or when searching, so a closed case can still be found by its tracking number)
    if (statusFilter === 'ALL') {
      if (c.status === 'CLOSED' && !searchQuery.trim()) return false;
    } else if (statusFilter === ROUTING_ALERT_FILTER) {
      if (!c.routingAlert || c.status === 'CLOSED') return false;
    } else if (c.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (!matchesCaseSearch(c, searchQuery)) return false;

    return true;
  });

  // Calculate live counts
  // Counts follow the date filter so tab numbers match the list below them
  const counted = dateScopedCases;
  const counts = {
    open: counted.filter(c => c.status !== 'CLOSED').length,
    newCases: counted.filter(c => c.status === 'NEW').length,
    routingAlerts: counted.filter(c => c.routingAlert && c.status !== 'CLOSED').length,
    waitingCec: counted.filter(c => c.status === 'WAITING_CEC_REPLY' || c.status === 'SENT_TO_CEC').length,
    waitingReview: counted.filter(c => c.status === 'WAITING_CENTRAL_REVIEW').length,
    slaExceeded: counted.filter(c => c.status === 'SLA_EXCEEDED').length,
    branchEscalated: counted.filter(c => c.status === 'CENTRAL_CONTACT_BRANCH').length
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
        dateFilter,
        setDateFilter,
        dateScopedCases,
        selectedCase,
        setSelectedCase,
        createCase,
        closureSettings, updateClosureSettings, submitResolution, disputeDelivery,
        checkDuplicate,
        linkToExistingCase,
        syncParcelTracking,
        reassignCec,
        dismissRoutingAlert,
        cecSubmitReply,
        centralReviewAnswer,
        escalateToBranch,
        closeCase,
        addChatMessage,
        sendOfficialEmail,
        logPhoneCallAttempt,
        confirmRecipientReceived,
        isRefreshing,
        refreshData,
        resetToMockData,
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
