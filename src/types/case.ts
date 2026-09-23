export type CaseStatus =
  | 'NEW'
  | 'PENDING_CEC_ASSIGNMENT'  // ส่งเข้า ปณ. แล้ว แต่ยังระบุ CEC ผู้รับผิดชอบไม่ได้ (รอสถานะพัสดุ)
  | 'CENTRAL_REVIEWING'
  | 'SENT_TO_CEC'
  | 'WAITING_CEC_REPLY'
  | 'CEC_REPLIED'
  | 'WAITING_CENTRAL_REVIEW'
  | 'ANSWER_APPROVED'
  | 'ANSWER_SENT_TO_MERCHANT'
  | 'SLA_EXCEEDED'
  | 'CENTRAL_CONTACT_BRANCH'
  | 'CLOSED';

export type UserRole = 'CENTRAL' | 'CEC' | 'BRANCH' | 'MERCHANT' | 'MYORDER_ADMIN';

export type IssueCategory =
  | 'DELAYED_DELIVERY'       // พัสดุล่าช้าเกินกำหนด
  | 'NOT_RECEIVED'           // ผู้รับยังไม่ได้รับของ (สถานะขึ้นนำจ่ายสำเร็จ)
  | 'WRONG_BRANCH'           // พัสดุส่งผิดสาขา / ตีกลับผิดพลาด
  | 'DAMAGED_PARCEL'         // พัสดุชำรุดเสียหาย
  | 'CANNOT_LOCATE'          // ค้นหาพัสดุไม่พบในระบบ
  | 'EXPEDITE_REQUEST'       // ขอเร่งนำส่ง
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
  senderRole: 'CUSTOMER' | 'MYORDER_ADMIN' | 'CENTRAL' | 'CEC' | 'BRANCH';
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
  companyName: string;            // MyOrder shop name, e.g. "Healthy Snack by Nok"
  contactPerson: string;          // shop owner / staff who reported the problem

  // Every case is raised by a shop from its MyOrder order
  myOrderRef: {
    orderId: string;
    shopId: string;
    shopName: string;
  };
  
  category: IssueCategory;
  urgency: UrgencyLevel;
  customerInquiry: string;
  
  status: CaseStatus;
  
  assignedCecId?: number;         // 1 - 14 (blank until destination CEC can be determined)
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
  emails?: OfficialEmailRecord[];     // official request emails the shop sent to ThaiPost
  
  // Duplicate detection link
  duplicateOfCaseId?: string;
  linkedDuplicateCaseIds?: string[];
}

export type EmailRequestType = 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'SUBMIT_DOCS';

// Who on the MyOrder side sent / reported something (the shop itself or MyOrder admin on its behalf)
export type MyOrderActorRole = 'MERCHANT' | 'MYORDER_ADMIN';

export interface OfficialEmailRecord {
  id: string;
  sentAt: string;
  senderName: string;
  to: string;
  cc?: string;
  subject: string;
  requestType: EmailRequestType;
  body: string;
  attachments: string[];
  sentByRole?: MyOrderActorRole;     // defaults to MERCHANT
}

export interface EmailPayload {
  to: string;
  cc?: string;
  subject: string;
  requestType: EmailRequestType;
  body: string;
  attachments: string[];
  senderName: string;
  sentByRole?: MyOrderActorRole;
}
