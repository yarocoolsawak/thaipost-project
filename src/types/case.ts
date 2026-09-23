export type CaseStatus =
  | 'NEW'
  | 'CENTRAL_REVIEWING'
  | 'SENT_TO_CEC'
  | 'WAITING_CEC_REPLY'
  | 'CEC_REPLIED'
  | 'WAITING_CENTRAL_REVIEW'
  | 'ANSWER_APPROVED'
  | 'ANSWER_SENT_TO_ADMIN'
  | 'SLA_EXCEEDED'
  | 'CENTRAL_CONTACT_BRANCH'
  | 'CLOSED';

export type UserRole = 'ADMIN' | 'CENTRAL' | 'CEC' | 'BRANCH';

export type IssueCategory =
  | 'DELAYED_DELIVERY'       // พัสดุล่าช้าเกินกำหนด
  | 'NOT_RECEIVED'           // ผู้รับยังไม่ได้รับของ (สถานะขึ้นนำจ่ายสำเร็จ)
  | 'WRONG_BRANCH'           // พัสดุส่งผิดสาขา / ตีกลับผิดพลาด
  | 'DAMAGED_PARCEL'         // พัสดุชำรุดเสียหาย
  | 'CANNOT_LOCATE'          // ค้นหาพัสดุไม่พบในระบบ
  | 'OTHER';                 // อื่นๆ

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  recipientOrSigner?: string;
}

export interface ParcelInfo {
  trackingNumber: string;
  originPostOffice: string;
  originZipCode: string;
  destPostOffice: string;
  destZipCode: string;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  currentPostalStatus: string;
  signerName?: string;
  weightKg: number;
  events: TrackingEvent[];
}

export interface ChatMessage {
  id: string;
  senderRole: 'CUSTOMER' | 'ADMIN' | 'CENTRAL' | 'CEC' | 'BRANCH' | 'AI_BOT';
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: string[];
  isInternalNote?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

export interface CecInfo {
  id: number;
  name: string;
  code: string;
  regionName: string;
  provinces: string[];
  memberCount: number;
  contactEmail: string;
  phone: string;
}

export interface BranchContactLog {
  timestamp: string;
  branchName: string;
  officerName: string;
  officerPhone: string;
  contactReason: string;
  outcome: string;
  recordedBy: string;
}

export interface CaseItem {
  id: string;                     // e.g. "TP-2026-0042"
  trackingNumber: string;         // e.g. "ED882194821TH"
  companyName: string;            // e.g. "Shopee Mall Official", "Lazada Co.", "TikTok Partner"
  contactPerson: string;
  contactChannel: 'LINE' | 'FACEBOOK' | 'EMAIL' | 'PORTAL';
  channelReference?: string;      // e.g. "LINE Group: Shopee VIP (Group #4)"
  
  category: IssueCategory;
  urgency: UrgencyLevel;
  customerInquiry: string;
  
  status: CaseStatus;
  
  assignedCecId?: number;         // 1 - 14
  assignedCecName?: string;
  assignedBranchName?: string;
  
  // SLA Fields (3 days from start)
  createdAt: string;              // ISO String
  dispatchedAt?: string;          // ISO String (when sent to CEC or Central review started)
  slaDeadline: string;            // ISO String (createdAt + 72 hours)
  isSlaExceeded: boolean;
  
  // Answers & Reviews
  cecReply?: {
    answer: string;
    repliedAt: string;
    repliedBy: string;
    branchNotes?: string;
  };
  
  centralReview?: {
    reviewedAt: string;
    reviewedBy: string;
    approvedAnswer: string;
    reviewNotes?: string;
    actionTaken: 'APPROVED' | 'EDITED' | 'REQUESTED_MORE_INFO';
  };
  
  branchContactLogs: BranchContactLog[];
  chatHistory: ChatMessage[];
  activityLogs: ActivityLog[];
  parcelInfo: ParcelInfo;
  emails?: OfficialEmailRecord[];
  
  // Duplicate detection link
  duplicateOfCaseId?: string;
  linkedDuplicateCaseIds?: string[];
}

export interface OfficialEmailRecord {
  id: string;
  sentAt: string;
  senderName: string;
  to: string;
  cc?: string;
  subject: string;
  requestType: 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS';
  body: string;
  attachments: string[];
}

export interface EmailPayload {
  to: string;
  cc?: string;
  subject: string;
  requestType: 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS';
  body: string;
  attachments: string[];
  senderName: string;
}

