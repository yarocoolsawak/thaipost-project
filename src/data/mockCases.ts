import type { CaseItem } from '../types/case';
import { KNOWN_PARCELS } from '../services/trackTraceApi';

const now = new Date('2026-09-23T11:00:00+07:00');
const msPerHour = 3600 * 1000;

// Helper to create dates relative to simulated "now"
const hoursAgo = (h: number) => new Date(now.getTime() - h * msPerHour).toISOString();
const hoursAhead = (h: number) => new Date(now.getTime() + h * msPerHour).toISOString();

export const INITIAL_CASES: CaseItem[] = [
  // 1. NEW
  {
    id: 'TP-2026-0001',
    trackingNumber: 'ED882194821TH',
    companyName: 'Shopee Official Mall',
    contactPerson: 'คุณอารียา (LINE Shopee VIP)',
    contactChannel: 'LINE',
    channelReference: 'LINE Group: THP_Shopee_VIP1',
    category: 'NOT_RECEIVED',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าแจ้งว่าระบบขึ้นนำจ่ายสำเร็จตั้งแต่เมื่อวาน แต่ที่บ้านไม่มีใครได้รับของเลย รบกวนช่วยตรวจสอบหลักฐานผู้เซ็นรับให้ด่วนค่ะ',
    status: 'NEW',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    dispatchedAt: undefined,
    slaDeadline: hoursAhead(68),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-1',
        senderRole: 'CUSTOMER',
        senderName: 'Shopee CS (คุณอารียา)',
        message: 'รบกวนตรวจสอบเคส ED882194821TH ด้วยค่ะ ลูกค้ายังไม่ได้รับสินค้าเลย แต่สถานะขึ้นนำจ่ายสำเร็จแล้ว',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-1',
        timestamp: hoursAgo(4),
        actorName: 'แอดมิน บริษัท Shopee',
        actorRole: 'ADMIN',
        action: 'สร้างเคสใหม่',
        details: 'สร้างเคสจากหมายเลขพัสดุ ED882194821TH ผ่าน LINE Group'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED882194821TH']
  },

  // 2. WAITING_CENTRAL_REVIEW (CEC ตอบแล้ว รอ ปณ. ส่วนกลางตรวจคำตอบก่อนส่งกลับ Admin - Core Flow FR 07)
  {
    id: 'TP-2026-0002',
    trackingNumber: 'ED776512349TH',
    companyName: 'PowerBuy Tech Logistics',
    contactPerson: 'คุณกฤษณะ',
    contactChannel: 'LINE',
    channelReference: 'LINE_THP_Powerbuy_Support',
    category: 'DELAYED_DELIVERY',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุติดอยู่ที่หาดใหญ่มา 2 วันแล้ว ลูกค้าจำเป็นต้องใช้สินค้าคอมพิวเตอร์ด่วน',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 13,
    assignedCecName: 'CEC 13 (ภาคใต้ตอนล่าง 1)',
    assignedBranchName: 'ปณ.หาดใหญ่ (สงขลา)',
    createdAt: hoursAgo(30),
    dispatchedAt: hoursAgo(28),
    slaDeadline: hoursAhead(42),
    isSlaExceeded: false,
    cecReply: {
      answer: 'เจ้าหน้าที่ ปณ.หาดใหญ่ ชี้แจงว่าเมื่อวานเจ้าหน้าที่นำจ่ายไปแล้วแต่บ้านปิดและโทรไม่ติด วันนี้ได้จัดรอบนำจ่ายพิเศษช่วงบ่าย 14:00 น. โดยตรง เจ้าหน้าที่ผู้รับผิดชอบโทรประสานผู้รับเรียบร้อยแล้ว',
      repliedAt: hoursAgo(2),
      repliedBy: 'CEC 13 เจ้าหน้าที่ สมชาย ภ.',
      branchNotes: 'ประสานกับนายสุวัฒน์ หัวหน้าสายนำจ่าย ปณ.หาดใหญ่ พัสดุอยู่บนรถนำจ่ายรอบพิเศษแล้ว'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-2-1',
        senderRole: 'ADMIN',
        senderName: 'Admin PowerBuy',
        message: 'ขอเร่งพัสดุ ED776512349TH ครับ ลูกค้าร้องเรียนเข้ามา',
        timestamp: hoursAgo(30)
      },
      {
        id: 'msg-2-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง (เจ้าหน้าที่ วรรณา)',
        message: 'ส่งเรื่องเข้า CEC 13 ประสาน ปณ.หาดใหญ่ เร่งด่วนแล้วค่ะ',
        timestamp: hoursAgo(28)
      },
      {
        id: 'msg-2-3',
        senderRole: 'CEC',
        senderName: 'CEC 13 (สมชาย)',
        message: 'สาขาแจ้งว่าจัดรอบนำจ่ายพิเศษบ่าย 14.00 วันนี้เรียบร้อยครับ โทรนัดลูกค้าแล้ว',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-2-1',
        timestamp: hoursAgo(30),
        actorName: 'Admin PowerBuy',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'รับเรื่องพัสดุล่าช้า'
      },
      {
        id: 'log-2-2',
        timestamp: hoursAgo(28),
        actorName: 'วรรณา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสไปยัง CEC',
        details: 'Route เคสไป CEC 13 (สงขลา/หาดใหญ่)'
      },
      {
        id: 'log-2-3',
        timestamp: hoursAgo(2),
        actorName: 'สมชาย ภ. (CEC 13)',
        actorRole: 'CEC',
        action: 'ส่งคำตอบกลับส่วนกลาง',
        details: 'CEC ส่งคำตอบกลับเข้า Waiting Central Review'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED776512349TH']
  },

  // 3. SLA_EXCEEDED (เกิน 3 วัน - 72 ชม. ปณ. ส่วนกลางต้องยกระดับติดต่อสาขาปลายทางโดยตรง)
  {
    id: 'TP-2026-0003',
    trackingNumber: 'EF123984512TH',
    companyName: 'Konvy Beauty Store',
    contactPerson: 'คุณแพรว',
    contactChannel: 'LINE',
    channelReference: 'LINE_THP_Konvy_Care',
    category: 'DAMAGED_PARCEL',
    urgency: 'CRITICAL',
    customerInquiry: 'พัสดุเครื่องสำอางกล่องใหญ่มีรายงานว่ากล่องยับเยินที่ ศป.ภูเก็ต ส่งเรื่องไป 4 วันแล้วยังไม่ได้รับการติดต่อกลับเลย',
    status: 'SLA_EXCEEDED',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองภูเก็ต (ภูเก็ต)',
    createdAt: hoursAgo(84), // 84 hours ago (> 72 hours!)
    dispatchedAt: hoursAgo(80),
    slaDeadline: hoursAgo(12),
    isSlaExceeded: true,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-3-1',
        senderRole: 'ADMIN',
        senderName: 'Konvy Care',
        message: 'ตามเคสกล่องเสียหาย EF123984512TH ส่งเรื่องตั้งแต่วันที่ 19 ยังไม่มีความคืบหน้าเลยค่ะ',
        timestamp: hoursAgo(84)
      },
      {
        id: 'msg-3-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'ส่งเรื่องไป CEC 12 แล้ว รอการตรวจสอบบันทึกความเสียหายจากสาขา',
        timestamp: hoursAgo(80)
      }
    ],
    activityLogs: [
      {
        id: 'log-3-1',
        timestamp: hoursAgo(84),
        actorName: 'Konvy CS',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'พัสดุชำรุดเสียหาย'
      },
      {
        id: 'log-3-2',
        timestamp: hoursAgo(80),
        actorName: 'ปณ.ส่วนกลาง',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสไปยัง CEC 12',
        details: 'ส่งประสานงาน ศป.ภูเก็ต'
      },
      {
        id: 'log-3-3',
        timestamp: hoursAgo(12),
        actorName: 'ระบบอัตโนมัติ (SLA Timer)',
        actorRole: 'CENTRAL',
        action: 'SLA_EXCEEDED',
        details: 'เคสเกินกำหนด SLA 3 วัน (72 ชั่วโมง) ระบบยกระดับสถานะให้อัตโนมัติ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EF123984512TH']
  },

  // 4. CENTRAL_CONTACT_BRANCH (ส่วนกลางติดต่อสาขาปลายทางโดยตรงแล้ว มี Contact Log)
  {
    id: 'TP-2026-0004',
    trackingNumber: 'ED993812745TH',
    companyName: 'Banana IT (Com7 Logistics)',
    contactPerson: 'คุณอรรถพล',
    contactChannel: 'PORTAL',
    category: 'WRONG_BRANCH',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุมูลค่าสูงถูกส่งหลงไป ศป.อุดรธานี ทั้งที่ปลายทางคือ ม.ขอนแก่น ติดตามจนเกิน 3 วัน',
    status: 'CENTRAL_CONTACT_BRANCH',
    assignedCecId: 7,
    assignedCecName: 'CEC 7 (ภาคอีสานตอนบน 1)',
    assignedBranchName: 'ปณ.เมืองขอนแก่น (40000)',
    createdAt: hoursAgo(90),
    dispatchedAt: hoursAgo(88),
    slaDeadline: hoursAgo(16),
    isSlaExceeded: true,
    branchContactLogs: [
      {
        timestamp: hoursAgo(3),
        branchName: 'ปณ.เมืองขอนแก่น / ศป.ขอนแก่น',
        officerName: 'นายพงษ์ศักดิ์ บุญชู (หัวหน้าฝ่ายคัดแยก)',
        officerPhone: '043-221-445 ต่อ 102',
        contactReason: 'เคสเกิน SLA 3 วัน ส่วนกลางโทรสายตรงเพื่อประสานการส่งต่อสิ่งของหลงทิศ',
        outcome: 'พัสดุถูกส่งรถเที่ยวเช้าจากอุดรมาถึงขอนแก่นแล้ว กำลังลงคิวจ่ายพิเศษรอบเที่ยง เจ้าหน้าที่จะโทรแจ้งลูกค้าทันทีเมื่อจ่ายเสร็จ',
        recordedBy: 'คุณนิภา (ปณ.ส่วนกลาง ผู้ดูแลงานด่วน)'
      }
    ],
    emails: [
      {
        id: 'email-init-1',
        sentAt: hoursAgo(88),
        senderName: 'คุณอรรถพล (Com7 Logistics)',
        to: 'thp_returns@thailandpost.com',
        cc: 'logistics@com7.com',
        subject: '[คำร้องทางการ] ขอระงับและส่งต่อด่วน พัสดุหลงทิศ ED993812745TH (Banana IT)',
        requestType: 'CHANGE_ADDRESS',
        body: 'เรียน เจ้าหน้าที่ไปรษณีย์ไทย ทางบริษัทตรวจพบว่าพัสดุโน้ตบุ๊กมูลค่าสูงถูกคัดแยกผิดเส้นทางไป ศป.อุดรธานี จึงส่งหนังสือคำร้องเพื่อขอให้ส่งต่อสิ่งของกลับมายังที่ทำการปลายทาง ปณ.เมืองขอนแก่น (40000) ด่วนที่สุดครับ',
        attachments: ['หนังสือคำร้องCom7_ED993812745TH.pdf', 'สำเนาใบเสร็จรับฝาก_ปณท.jpg']
      }
    ],
    chatHistory: [
      {
        id: 'msg-4-1',
        senderRole: 'ADMIN',
        senderName: 'Admin Com7',
        message: 'พัสดุโน้ตบุ๊กหลงเส้นทาง ช่วยประสานขอนแก่นด่วนครับ',
        timestamp: hoursAgo(90)
      },
      {
        id: 'msg-4-2',
        senderRole: 'CENTRAL',
        senderName: 'นิภา (ปณ.ส่วนกลาง)',
        message: 'ส่วนกลางโทรประสาน หน.ฝ่ายคัดแยก ปณ.ขอนแก่น โดยตรงแล้ว ได้รับการยืนยันว่าของถึงขอนแก่นและจ่ายเที่ยงนี้ค่ะ',
        timestamp: hoursAgo(3)
      }
    ],
    activityLogs: [
      {
        id: 'log-4-1',
        timestamp: hoursAgo(90),
        actorName: 'Admin Com7',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'พัสดุหลงทิศ'
      },
      {
        id: 'log-4-2',
        timestamp: hoursAgo(3),
        actorName: 'นิภา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'โทรประสานสาขาปลายทางโดยตรง',
        details: 'บันทึก Branch Contact Log: โทรคุณพงษ์ศักดิ์ ยืนยันนำจ่ายรอบเที่ยง'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED993812745TH']
  },

  // 5. WAITING_CEC_REPLY (ส่งไป CEC แล้ว กำลังรอ CEC 4 ชลบุรี ตอบกลับ)
  {
    id: 'TP-2026-0005',
    trackingNumber: 'ED551029384TH',
    companyName: 'HomePro Express Fulfilment',
    contactPerson: 'คุณเอกสิทธิ์',
    contactChannel: 'LINE',
    channelReference: 'LINE_THP_Homepro_Team',
    category: 'NOT_RECEIVED',
    urgency: 'NORMAL',
    customerInquiry: 'ลูกค้าต้องการสำเนาใบรับหรือภาพถ่ายลายมือชื่อผู้เซ็นรับตัวจริงเพื่อปิดบิลตรวจรับสินค้า',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.เมืองชลบุรี (20000)',
    createdAt: hoursAgo(18),
    dispatchedAt: hoursAgo(16),
    slaDeadline: hoursAhead(54),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-5-1',
        senderRole: 'ADMIN',
        senderName: 'HomePro CS',
        message: 'ขอเอกสาร POD หรือรูปลายเซ็นยืนยันรับของพัสดุ ED551029384TH ครับ',
        timestamp: hoursAgo(18)
      },
      {
        id: 'msg-5-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง (เจ้าหน้าที่ อภิรดี)',
        message: 'ส่งเรื่องไป CEC 4 ชลบุรี ให้ประสานงานนำภาพถ่าย POD จากบุรุษไปรษณีย์แล้วค่ะ',
        timestamp: hoursAgo(16)
      }
    ],
    activityLogs: [
      {
        id: 'log-5-1',
        timestamp: hoursAgo(18),
        actorName: 'HomePro CS',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'ขอหลักฐานการนำจ่าย POD'
      },
      {
        id: 'log-5-2',
        timestamp: hoursAgo(16),
        actorName: 'อภิรดี (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสไป CEC 4',
        details: 'Route ให้ CEC 4 ตรวจสอบกับ ปณ.เมืองชลบุรี'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED551029384TH']
  },

  // 6. ANSWER_SENT_TO_ADMIN (ส่งคำตอบที่ผ่านการรีวิวกลับให้ Admin เรียบร้อย)
  {
    id: 'TP-2026-0006',
    trackingNumber: 'ED114477223TH',
    companyName: 'TikTok Shop Official TH',
    contactPerson: 'คุณมินตรา',
    contactChannel: 'LINE',
    channelReference: 'LINE_THP_TikTok_Ops',
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'พัสดุส่งไปร้อยเอ็ด ถึงวันไหนคะ ลูกค้าทวงถามรอบส่ง',
    status: 'ANSWER_SENT_TO_ADMIN',
    assignedCecId: 8,
    assignedCecName: 'CEC 8 (ภาคอีสานตอนบน 2)',
    assignedBranchName: 'ปณ.เมืองร้อยเอ็ด (45000)',
    createdAt: hoursAgo(24),
    dispatchedAt: hoursAgo(22),
    slaDeadline: hoursAhead(48),
    isSlaExceeded: false,
    cecReply: {
      answer: 'ของถึง ปณ.ร้อยเอ็ด แล้ว เตรียมนำจ่ายช่วง 10:00 น. วันนี้',
      repliedAt: hoursAgo(5),
      repliedBy: 'CEC 8 เจ้าหน้าที่ จิราภรณ์'
    },
    centralReview: {
      reviewedAt: hoursAgo(4),
      reviewedBy: 'ปณ.ส่วนกลาง (พชร)',
      approvedAnswer: 'เรียนแจ้งคุณมินตรา พัสดุหมายเลข ED114477223TH เดินทางถึง ปณ.เมืองร้อยเอ็ด เรียบร้อยแล้ว เจ้าหน้าที่นำจ่ายอยู่ในพื้นที่และเตรียมส่งมอบก่อนเวลา 12:00 น. วันนี้ครับ',
      reviewNotes: 'ขัดเกลาข้อความให้สุภาพและระบุเวลาชัดเจน',
      actionTaken: 'EDITED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-6-1',
        senderRole: 'ADMIN',
        senderName: 'Admin TikTok Shop',
        message: 'ตามรอบส่ง ปณ.ร้อยเอ็ด ให้ด้วยนะคะ',
        timestamp: hoursAgo(24)
      },
      {
        id: 'msg-6-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'เรียนแจ้งคุณมินตรา พัสดุหมายเลข ED114477223TH เดินทางถึง ปณ.เมืองร้อยเอ็ด เรียบร้อยแล้ว เจ้าหน้าที่นำจ่ายอยู่ในพื้นที่และเตรียมส่งมอบก่อนเวลา 12:00 น. วันนี้ครับ',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-6-1',
        timestamp: hoursAgo(24),
        actorName: 'Admin TikTok Shop',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'สอบถามรอบการนำจ่าย'
      },
      {
        id: 'log-6-2',
        timestamp: hoursAgo(4),
        actorName: 'พชร (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'อนุมัติและส่งคำตอบให้ Admin',
        details: 'ปรับปรุงข้อความและ Dispatch ให้ Admin ทางช่องทาง LINE'
      }
    ],
    parcelInfo: {
      trackingNumber: 'ED114477223TH',
      originPostOffice: 'ปณ.บางแค (10160)',
      originZipCode: '10160',
      destPostOffice: 'ปณ.เมืองร้อยเอ็ด (45000)',
      destZipCode: '45000',
      senderName: 'TikTok Shop Mega Hub',
      receiverName: 'คุณศุภชัย ทิพย์พนม',
      receiverPhone: '084-221-XXXX',
      receiverAddress: '44 ถ.เทวาภิบาล ต.ในเมือง อ.เมือง จ.ร้อยเอ็ด 45000',
      currentPostalStatus: 'เตรียมการนำจ่าย',
      signerName: undefined,
      weightKg: 0.9,
      events: [
        { timestamp: hoursAgo(24), status: 'รับฝาก', location: 'ปณ.บางแค', description: 'รับฝากเรียบร้อย' },
        { timestamp: hoursAgo(14), status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองร้อยเอ็ด', description: 'สิ่งของถึงที่ทำการ' }
      ]
    }
  },

  // 7. CLOSED (เคสจบสมบูรณ์)
  {
    id: 'TP-2026-0007',
    trackingNumber: 'ED332211998TH',
    companyName: 'Central Online Direct',
    contactPerson: 'คุณธัญญ่า',
    contactChannel: 'EMAIL',
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'สอบถามสถานะพัสดุติดตรวจสภาพ',
    status: 'CLOSED',
    assignedCecId: 1,
    assignedCecName: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    assignedBranchName: 'ปณ.จตุจักร (10900)',
    createdAt: hoursAgo(48),
    dispatchedAt: hoursAgo(46),
    slaDeadline: hoursAhead(24),
    isSlaExceeded: false,
    centralReview: {
      reviewedAt: hoursAgo(20),
      reviewedBy: 'ปณ.ส่วนกลาง (เจ้าหน้าที่ วรรณา)',
      approvedAnswer: 'พัสดุได้รับการตรวจปล่อยและนำจ่ายสำเร็จแล้ว ผู้รับลงชื่อรับด้วยตนเอง',
      actionTaken: 'APPROVED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-7-1',
        senderRole: 'ADMIN',
        senderName: 'Central CS',
        message: 'ตามพัสดุ ED332211998TH ค่ะ',
        timestamp: hoursAgo(48)
      },
      {
        id: 'msg-7-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'พัสดุได้รับการตรวจปล่อยและนำจ่ายสำเร็จแล้ว ผู้รับลงชื่อรับด้วยตนเองค่ะ',
        timestamp: hoursAgo(20)
      }
    ],
    activityLogs: [
      {
        id: 'log-7-1',
        timestamp: hoursAgo(48),
        actorName: 'Central CS',
        actorRole: 'ADMIN',
        action: 'สร้างเคส',
        details: 'สอบถามสถานะ'
      },
      {
        id: 'log-7-2',
        timestamp: hoursAgo(10),
        actorName: 'วรรณา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ปิดเคส (CLOSED)',
        details: 'ลูกค้ายืนยันได้รับสินค้าเรียบร้อย ปิดเคสในระบบ'
      }
    ],
    parcelInfo: {
      trackingNumber: 'ED332211998TH',
      originPostOffice: 'ปณ.ปทุมวัน (10330)',
      originZipCode: '10330',
      destPostOffice: 'ปณ.จตุจักร (10900)',
      destZipCode: '10900',
      senderName: 'Central Online Hub',
      receiverName: 'คุณภัทรดนัย',
      receiverPhone: '081-998-XXXX',
      receiverAddress: 'คอนโด LPN จตุจักร ถ.พหลโยธิน กรุงเทพฯ',
      currentPostalStatus: 'นำจ่ายสำเร็จ',
      signerName: 'ภัทรดนัย',
      weightKg: 1.1,
      events: [
        { timestamp: hoursAgo(48), status: 'รับฝาก', location: 'ปณ.ปทุมวัน', description: 'รับฝาก' },
        { timestamp: hoursAgo(22), status: 'นำจ่ายสำเร็จ', location: 'ปณ.จตุจักร', description: 'ผู้รับรับเองเรียบร้อย' }
      ]
    }
  }
];
