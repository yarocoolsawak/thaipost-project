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
  | 'EXPEDITE_REQUEST'       // เร่งนำส่ง (ขอเร่งรัดนำจ่าย)
  | 'CLOSE_WORK_REQUEST'     // แจ้งปิดงาน (ปลายทางได้รับสินค้าแล้วแต่สถานะยังไม่สำเร็จ)
  | 'REDELIVERY_REQUEST'     // เร่งนำจ่ายใหม่อีกครั้ง / นำจ่ายใหม่
  | 'RETURN_OR_REVERSE'      // แจ้งตีกลับ (ขอส่งคืนต้นทาง)
  | 'CHANGE_ADDRESS_REQUEST' // ขอเปลี่ยนที่อยู่ / เบอร์โทรผู้รับปลายทาง
  | 'DELAYED_DELIVERY'       // พัสดุล่าช้าเกินกำหนด
  | 'NOT_RECEIVED'           // ผู้รับยังไม่ได้รับของ (สถานะขึ้นนำจ่ายสำเร็จ)
  | 'WRONG_BRANCH'           // พัสดุส่งผิดสาขา / ตีกลับผิดพลาด
  | 'DAMAGED_PARCEL'         // พัสดุชำรุดเสียหาย
  | 'CANNOT_LOCATE'          // ค้นหาพัสดุไม่พบในระบบ
  | 'OTHER';                 // อื่นๆ

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type SlaRouteType = 'SAME_REGION_OR_BKK' | 'CROSS_PROVINCE'; // กทม./ภาคเดียวกัน (3 วัน) vs ข้ามจังหวัด (3-5 วัน)

export type CallOutcome =
  | 'NO_ANSWER'            // ไม่รับสาย
  | 'CANNOT_CONTACT'       // ปิดเครื่อง / ติดต่อไม่ได้
  | 'ANSWERED'             // รับสายแล้ว
  | 'POSTPONED'            // ผู้รับขอเลื่อนวันส่ง
  | 'CONFIRMED_RECEIVED'   // โทรคอนเฟิร์มแล้ว: ยืนยันได้รับพัสดุจริง
  | 'NOT_RECEIVED'         // ผู้รับยืนยันยังไม่ได้รับ
  | 'REJECTED'             // ผู้รับปฏิเสธรับ
  | 'OTHER';

export interface PhoneCallAttempt {
  id: string;
  attemptNumber: number; // 1, 2, 3 (เจ้าหน้าที่นำจ่าย/สาขา) หรือ 4 (แอดมินโทรตาม)
  callerRole: 'OFFICER' | 'ADMIN';
  callerName: string;
  calledAt: string;
  phoneNumber: string;
  outcome: CallOutcome;
  outcomeLabel: string;
  note?: string;
}

export interface CloseVerificationRecord {
  verifiedAt: string;
  verifiedBy: string;
  verifiedRole: UserRole;
  category: IssueCategory;
  centralStatusChecked: boolean;
  centralStatusText: string;
  hasProofEvidence: boolean;
  proofPhotoUrl?: string;
  recipientPhoneConfirmed: boolean;
  resolutionNotes: string;
  replySentToMerchant: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  statusCode?: string; // รหัสสถานะตาม THP Developer Guide เช่น '103', '201', '220', '301', '303', '304', '401', '501'
  location: string;
  description: string;
  recipientOrSigner?: string;
  isBagOpenEvent?: boolean; // ระบุว่าเป็นเหตุการณ์เปิดถุง (รหัส 220)
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
  currentStatusCode?: string;       // รหัสสถานะล่าสุดตาม THP Developer Guide (เช่น '501', '401', '301')
  signerName?: string;
  deliveryStaffName?: string;       // พนักงานนำจ่าย — QMS ส่งมาเมื่อพัสดุออกนำจ่ายแล้ว
  deliveryStaffPhone?: string;
  signatureImageUrl?: string;       // ภาพลายเซ็นผู้รับ (e-Signature) — QMS ส่งมาเมื่อเซ็นรับแล้ว
  weightKg: number;
  events: TrackingEvent[];
  bagOpenedAt?: string;             // วันเวลาที่เปิดถุง (ใช้นับเริ่ม SLA)
  deliveryProofPhotoUrl?: string;   // ภาพหลักฐานการจัดส่ง (POD)
  deliveryProofPhotoNote?: string;
  recipientConfirmedReceived?: boolean; // ปลายทางคอนเฟิร์มว่าได้รับจริง
  recipientConfirmedAt?: string;
  recipientConfirmedBy?: string;
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
  
  // SLA Fields (นับจากวันเปิดถุง: กทม./ภาคเดียวกัน 3 วัน, ข้ามจังหวัด 3-5 วัน, เก็บพัสดุ 7 วัน)
  createdAt: string;              // ISO String
  dispatchedAt?: string;          // ISO String (when sent to CEC or Central review started)
  bagOpenedAt?: string;           // วันที่เปิดถุง (จุดเริ่มต้นนับ SLA)
  slaRouteType?: SlaRouteType;    // กทม./ภาคเดียวกัน (3 วัน) หรือ ข้ามจังหวัด (3-5 วัน)
  slaTargetDays?: number;         // 3 หรือ 5 วัน
  slaDeadline: string;            // ISO String (bagOpenedAt + 3 or 5 days)
  retentionDeadline?: string;     // ISO String (bagOpenedAt + 7 days เก็บรักษาพัสดุ)
  isSlaExceeded: boolean;
  
  // Call Attempts (เจ้าหน้าที่โทร 3 ครั้ง + แอดมินโทรครั้งที่ 4)
  callAttempts?: PhoneCallAttempt[];

  // Delivery Evidence & Confirmation
  deliveryProofPhotoUrl?: string;       // ภาพถ่ายหลักฐานการนำส่ง (POD)
  recipientConfirmedReceived?: boolean; // ปลายทางคอนเฟิร์มว่าได้รับจริง

  // Verification record when closing case
  closeVerification?: CloseVerificationRecord;

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

export type EmailRequestType = 'RETURN_PARCEL' | 'CHANGE_ADDRESS' | 'REDELIVER' | 'SUBMIT_DOCS';

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
