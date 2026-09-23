import type { CaseItem } from '../types/case';
import { KNOWN_PARCELS } from '../services/trackTraceApi';

const now = new Date('2026-09-23T11:00:00+07:00');
const msPerHour = 3600 * 1000;

// Helper to create dates relative to simulated "now"
const hoursAgo = (h: number) => new Date(now.getTime() - h * msPerHour).toISOString();
const hoursAhead = (h: number) => new Date(now.getTime() + h * msPerHour).toISOString();

// Every case is raised by a MyOrder shop from a shipped order (see src/data/myOrders.ts)
export const INITIAL_CASES: CaseItem[] = [
  // 1. Routed straight to CEC 5 when reported (parcel already at destination)
  {
    id: 'TP-2026-0001',
    trackingNumber: 'ED882194821TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240890', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'NOT_RECEIVED',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าแจ้งว่าระบบขึ้นนำจ่ายสำเร็จตั้งแต่เมื่อวาน แต่ที่บ้านไม่มีใครได้รับของเลย รบกวนช่วยตรวจสอบหลักฐานผู้เซ็นรับให้ด่วนค่ะ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    dispatchedAt: hoursAgo(4),
    slaDeadline: hoursAhead(68),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'ลูกค้าแจ้งว่าระบบขึ้นนำจ่ายสำเร็จตั้งแต่เมื่อวาน แต่ที่บ้านไม่มีใครได้รับของเลย รบกวนช่วยตรวจสอบหลักฐานผู้เซ็นรับให้ด่วนค่ะ',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-1-2',
        timestamp: hoursAgo(4),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'พัสดุถึงพื้นที่ปลายทางแล้ว ระบบระบุ CEC 5 จากรหัสไปรษณีย์ 50130 และส่งเคสเข้าคิว CEC ทันที'
      },
      {
        id: 'log-1',
        timestamp: hoursAgo(4),
        actorName: 'คุณฟ้า อารียา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240890 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED882194821TH']
  },

  // 2. WAITING_CENTRAL_REVIEW (CEC ตอบแล้ว รอ ปณ.ส่วนกลางตรวจคำตอบก่อนส่งกลับร้านค้า - Core Flow FR 07)
  {
    id: 'TP-2026-0002',
    trackingNumber: 'ED776512349TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240891', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'DELAYED_DELIVERY',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุติดอยู่ที่หาดใหญ่มา 2 วันแล้ว ลูกค้าจำเป็นต้องใช้สินค้าคอมพิวเตอร์ด่วน',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 13,
    assignedCecName: 'CEC 13 (ภาคใต้ตอนล่าง 1)',
    assignedBranchName: 'ปณ.หาดใหญ่ (สงขลา)',
    createdAt: hoursAgo(30),
    dispatchedAt: hoursAgo(30),
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
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'พัสดุติดอยู่ที่หาดใหญ่มา 2 วันแล้ว ลูกค้าจำเป็นต้องใช้สินค้าคอมพิวเตอร์ด่วน',
        timestamp: hoursAgo(30)
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
        id: 'log-2-3',
        timestamp: hoursAgo(2),
        actorName: 'สมชาย ภ. (CEC 13)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'CEC ส่งคำตอบกลับเข้า Waiting Central Review'
      },
      {
        id: 'log-2-2',
        timestamp: hoursAgo(30),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC 13 จากรหัสไปรษณีย์ปลายทาง 90110 และส่งเข้าคิว CEC ทันที'
      },
      {
        id: 'log-2-1',
        timestamp: hoursAgo(30),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240891 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED776512349TH']
  },

  // 3. SLA_EXCEEDED (เกิน 3 วัน - 72 ชม. ปณ.ส่วนกลางต้องยกระดับติดต่อสาขาปลายทางโดยตรง)
  {
    id: 'TP-2026-0003',
    trackingNumber: 'EF123984512TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240892', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'DAMAGED_PARCEL',
    urgency: 'CRITICAL',
    customerInquiry: 'พัสดุเครื่องสำอางกล่องใหญ่มีรายงานว่ากล่องยับเยินที่ ศป.ภูเก็ต แจ้งไป 3 วันแล้วยังไม่ได้รับการติดต่อกลับเลย',
    status: 'SLA_EXCEEDED',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองภูเก็ต (ภูเก็ต)',
    createdAt: hoursAgo(84), // 84 hours ago (> 72 hours!)
    dispatchedAt: hoursAgo(84),
    slaDeadline: hoursAgo(12),
    isSlaExceeded: true,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-3-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'กล่องเครื่องสำอาง EF123984512TH เสียหายที่ ศป.ภูเก็ต ของเหลวซึมออกมา ขอให้ตรวจสอบและทำบันทึกความเสียหายค่ะ',
        timestamp: hoursAgo(84)
      },
      {
        id: 'msg-3-2',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: '[ข้อมูลเพิ่มเติมจากร้านค้า]: ยังไม่มีความคืบหน้าเลยค่ะ ลูกค้าขอคืนเงินแล้ว',
        timestamp: hoursAgo(20)
      }
    ],
    activityLogs: [
      {
        id: 'log-3-3',
        timestamp: hoursAgo(12),
        actorName: 'ระบบอัตโนมัติ (SLA Timer)',
        actorRole: 'CENTRAL',
        action: 'SLA_EXCEEDED',
        details: 'เคสเกินกำหนด SLA 3 วัน (72 ชั่วโมง) ระบบยกระดับสถานะให้อัตโนมัติ'
      },
      {
        id: 'log-3-2',
        timestamp: hoursAgo(84),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC 12 จากรหัสไปรษณีย์ปลายทาง 83000 และส่งประสานงาน ศป.ภูเก็ต'
      },
      {
        id: 'log-3-1',
        timestamp: hoursAgo(84),
        actorName: 'คุณฟ้า อารียา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240892 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EF123984512TH']
  },

  // 4. CENTRAL_CONTACT_BRANCH (พัสดุหลงทิศ: ตอนแจ้งยังระบุ CEC ไม่ได้ ส่วนกลางระบุภายหลัง แล้วโทรสาขาโดยตรง)
  {
    id: 'TP-2026-0004',
    trackingNumber: 'ED993812745TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240893', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'WRONG_BRANCH',
    urgency: 'HIGH',
    customerInquiry: 'โน้ตบุ๊กมูลค่าสูงถูกส่งหลงไป ศป.อุดรธานี ทั้งที่ปลายทางคือ ม.ขอนแก่น ติดตามจนเกิน 3 วัน',
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
        senderName: 'คุณต้น ภาณุ',
        to: 'thp_returns@thailandpost.com',
        cc: 'shop@gadgetcornerbkk.com',
        subject: '[คำร้องทางการ] ขอระงับและส่งต่อด่วน พัสดุหลงทิศ ED993812745TH (Gadget Corner BKK)',
        requestType: 'CHANGE_ADDRESS',
        body: 'เรียน เจ้าหน้าที่ไปรษณีย์ไทย ทางร้านตรวจพบว่าพัสดุโน้ตบุ๊กมูลค่าสูงถูกคัดแยกผิดเส้นทางไป ศป.อุดรธานี จึงส่งหนังสือคำร้องเพื่อขอให้ส่งต่อสิ่งของกลับมายังที่ทำการปลายทาง ปณ.เมืองขอนแก่น (40000) ด่วนที่สุดครับ',
        attachments: ['หนังสือคำร้อง_ED993812745TH.pdf', 'สำเนาใบเสร็จรับฝาก_ปณท.jpg']
      }
    ],
    chatHistory: [
      {
        id: 'msg-4-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'โน้ตบุ๊กหลงเส้นทางไปอุดรฯ ช่วยประสานขอนแก่นด่วนครับ',
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
        id: 'log-4-4',
        timestamp: hoursAgo(3),
        actorName: 'นิภา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'โทรประสานสาขาปลายทางโดยตรง',
        details: 'บันทึก Branch Contact Log: โทรคุณพงษ์ศักดิ์ ยืนยันนำจ่ายรอบเที่ยง'
      },
      {
        id: 'log-4-3',
        timestamp: hoursAgo(88),
        actorName: 'เจ้าหน้าที่ ปณ.ส่วนกลาง',
        actorRole: 'CENTRAL',
        action: 'ระบุ CEC และส่งเคส',
        details: 'ส่งเคสไปยัง CEC-07 ประจำพื้นที่สาขาปลายทาง เพื่อตรวจสอบและประสานงาน'
      },
      {
        id: 'log-4-1b',
        timestamp: hoursAgo(88),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ส่งอีเมลคำร้องทางการ (Email Sent)',
        details: 'ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่ • ส่งถึง: thp_returns@thailandpost.com (แนบ 2 ไฟล์)'
      },
      {
        id: 'log-4-2',
        timestamp: hoursAgo(90),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'รอระบุ CEC ผู้รับผิดชอบ',
        details: 'สถานะพัสดุล่าสุด "ส่งต่อผิดศูนย์คัดแยก" ยังยืนยันพื้นที่ปลายทางไม่ได้'
      },
      {
        id: 'log-4-1',
        timestamp: hoursAgo(90),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240893 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED993812745TH']
  },

  // 5. WAITING_CEC_REPLY (อยู่ที่ CEC 4 ชลบุรี กำลังรอตอบกลับ)
  {
    id: 'TP-2026-0005',
    trackingNumber: 'ED551029384TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240894', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'NOT_RECEIVED',
    urgency: 'NORMAL',
    customerInquiry: 'ลูกค้าต้องการสำเนาใบรับหรือภาพถ่ายลายมือชื่อผู้เซ็นรับตัวจริงเพื่อปิดบิลตรวจรับสินค้า',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.เมืองชลบุรี (20000)',
    createdAt: hoursAgo(18),
    dispatchedAt: hoursAgo(18),
    slaDeadline: hoursAhead(54),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-5-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'ขอเอกสาร POD หรือรูปลายเซ็นยืนยันรับของพัสดุ ED551029384TH ครับ',
        timestamp: hoursAgo(18)
      }
    ],
    activityLogs: [
      {
        id: 'log-5-2',
        timestamp: hoursAgo(18),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC 4 จากรหัสไปรษณีย์ปลายทาง 20000 ให้ตรวจสอบกับ ปณ.เมืองชลบุรี'
      },
      {
        id: 'log-5-1',
        timestamp: hoursAgo(18),
        actorName: 'คุณเอกสิทธิ์ ใจงาม (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240894 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED551029384TH']
  },

  // 6. ANSWER_SENT_TO_MERCHANT (คำตอบผ่านการรีวิวแล้ว ส่งกลับร้านค้าผ่าน MyOrder)
  {
    id: 'TP-2026-0006',
    trackingNumber: 'ED114477223TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240895', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'พัสดุส่งไปร้อยเอ็ด ถึงวันไหนคะ ลูกค้าทวงถามรอบส่ง',
    status: 'ANSWER_SENT_TO_MERCHANT',
    assignedCecId: 8,
    assignedCecName: 'CEC 8 (ภาคอีสานตอนบน 2)',
    assignedBranchName: 'ปณ.เมืองร้อยเอ็ด (45000)',
    createdAt: hoursAgo(24),
    dispatchedAt: hoursAgo(14),
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
      approvedAnswer: 'เรียนแจ้งคุณนก พัสดุหมายเลข ED114477223TH เดินทางถึง ปณ.เมืองร้อยเอ็ด เรียบร้อยแล้ว เจ้าหน้าที่นำจ่ายอยู่ในพื้นที่และเตรียมส่งมอบก่อนเวลา 12:00 น. วันนี้ครับ',
      reviewNotes: 'ขัดเกลาข้อความให้สุภาพและระบุเวลาชัดเจน',
      actionTaken: 'EDITED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-6-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'พัสดุส่งไปร้อยเอ็ด ถึงวันไหนคะ ลูกค้าทวงถามรอบส่ง',
        timestamp: hoursAgo(24)
      },
      {
        id: 'msg-6-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'เรียนแจ้งคุณนก พัสดุหมายเลข ED114477223TH เดินทางถึง ปณ.เมืองร้อยเอ็ด เรียบร้อยแล้ว เจ้าหน้าที่นำจ่ายอยู่ในพื้นที่และเตรียมส่งมอบก่อนเวลา 12:00 น. วันนี้ครับ',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-6-4',
        timestamp: hoursAgo(4),
        actorName: 'พชร (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ปรับแก้คำตอบและส่งให้ร้านค้า',
        details: 'ปรับปรุงข้อความและส่งกลับร้านค้าผ่าน MyOrder'
      },
      {
        id: 'log-6-3',
        timestamp: hoursAgo(14),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ระบุ CEC อัตโนมัติและส่งเคส',
        details: 'ยืนยันพื้นที่ปลายทางแล้ว ระบุ CEC-08 จากรหัสไปรษณีย์ 45000 และส่งเข้าคิว CEC'
      },
      {
        id: 'log-6-2',
        timestamp: hoursAgo(24),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'รอระบุ CEC ผู้รับผิดชอบ',
        details: 'พัสดุยังอยู่ระหว่างขนส่ง ระบบจะระบุ CEC อัตโนมัติเมื่อสถานะพัสดุอัปเดต'
      },
      {
        id: 'log-6-1',
        timestamp: hoursAgo(24),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240895 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: {
      trackingNumber: 'ED114477223TH',
      originPostOffice: 'ปณ.คลองหลวง (12120)',
      originZipCode: '12120',
      destPostOffice: 'ปณ.เมืองร้อยเอ็ด (45000)',
      destZipCode: '45000',
      senderName: 'Healthy Snack by Nok (MyOrder)',
      receiverName: 'คุณศุภชัย ทิพย์พนม',
      receiverPhone: '084-221-XXXX',
      receiverAddress: '44 ถ.เทวาภิบาล ต.ในเมือง อ.เมือง จ.ร้อยเอ็ด 45000',
      currentPostalStatus: 'เตรียมการนำจ่าย',
      signerName: undefined,
      weightKg: 0.9,
      events: [
        { timestamp: hoursAgo(24), status: 'รับฝาก', location: 'ปณ.คลองหลวง', description: 'รับฝากเรียบร้อย' },
        { timestamp: hoursAgo(14), status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองร้อยเอ็ด', description: 'สิ่งของถึงที่ทำการ' }
      ]
    }
  },

  // 7. CLOSED (ร้านค้ารับทราบคำตอบและปิดเคส)
  {
    id: 'TP-2026-0007',
    trackingNumber: 'ED332211998TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240896', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'สอบถามสถานะพัสดุ ขึ้นว่าติดตรวจสภาพ',
    status: 'CLOSED',
    assignedCecId: 1,
    assignedCecName: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    assignedBranchName: 'ปณ.จตุจักร (10900)',
    createdAt: hoursAgo(48),
    dispatchedAt: hoursAgo(48),
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
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'สอบถามสถานะพัสดุ ขึ้นว่าติดตรวจสภาพ',
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
        id: 'log-7-3',
        timestamp: hoursAgo(10),
        actorName: 'ร้านค้า (HomeLiving Deco)',
        actorRole: 'MERCHANT',
        action: 'ปิดเคส (CLOSED)',
        details: 'ปิดเคสสมบูรณ์: ร้านค้ายืนยันรับทราบคำตอบผ่าน MyOrder'
      },
      {
        id: 'log-7-2',
        timestamp: hoursAgo(20),
        actorName: 'วรรณา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'อนุมัติคำตอบและส่งให้ร้านค้า',
        details: 'คำตอบผ่านการตรวจสอบคุณภาพและส่งกลับร้านค้าผ่าน MyOrder แล้ว'
      },
      {
        id: 'log-7-1',
        timestamp: hoursAgo(48),
        actorName: 'คุณเอกสิทธิ์ ใจงาม (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240896 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: {
      trackingNumber: 'ED332211998TH',
      originPostOffice: 'ปณ.บางพลี (10540)',
      originZipCode: '10540',
      destPostOffice: 'ปณ.จตุจักร (10900)',
      destZipCode: '10900',
      senderName: 'HomeLiving Deco (MyOrder)',
      receiverName: 'คุณภัทรดนัย',
      receiverPhone: '081-998-XXXX',
      receiverAddress: 'คอนโด LPN จตุจักร ถ.พหลโยธิน กรุงเทพฯ 10900',
      currentPostalStatus: 'นำจ่ายสำเร็จ',
      signerName: 'ภัทรดนัย',
      weightKg: 1.1,
      events: [
        { timestamp: hoursAgo(48), status: 'รับฝาก', location: 'ปณ.บางพลี', description: 'รับฝาก' },
        { timestamp: hoursAgo(22), status: 'นำจ่ายสำเร็จ', location: 'ปณ.จตุจักร', description: 'ผู้รับรับเองเรียบร้อย' }
      ]
    }
  },

  // ---------- More recent reports ----------

  // 8. MyOrder: parcel still in transit -> CEC cannot be determined yet (blank)
  {
    id: 'TP-2026-0008',
    trackingNumber: 'EN100200302TH',
    companyName: 'ร้านผ้าไหมบ้านครูสมศรี',
    contactPerson: 'ครูสมศรี ทองสุข',
    myOrderRef: { orderId: 'MO-240902', shopId: 'SHOP-01', shopName: 'ร้านผ้าไหมบ้านครูสมศรี' },
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'ส่ง EMS ไปอุบลฯ ตั้งแต่ 5 วันก่อน สถานะค้างอยู่ที่ศูนย์คัดแยกนครราชสีมา ลูกค้าถามทุกวันค่ะ',
    status: 'PENDING_CEC_ASSIGNMENT',
    assignedCecId: undefined,
    assignedCecName: undefined,
    assignedBranchName: 'ปณ.เมืองอุบลราชธานี (34000)',
    createdAt: hoursAgo(6),
    slaDeadline: hoursAhead(66),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-8-1',
        senderRole: 'CUSTOMER',
        senderName: 'ครูสมศรี ทองสุข (ร้านผ้าไหมบ้านครูสมศรี)',
        message: 'ส่ง EMS ไปอุบลฯ ตั้งแต่ 5 วันก่อน สถานะค้างอยู่ที่ศูนย์คัดแยกนครราชสีมา ลูกค้าถามทุกวันค่ะ',
        timestamp: hoursAgo(6)
      }
    ],
    activityLogs: [
      {
        id: 'log-8-2',
        timestamp: hoursAgo(6),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'รอระบุ CEC ผู้รับผิดชอบ',
        details: 'พัสดุยังอยู่ระหว่างขนส่ง ยังไม่ยืนยันพื้นที่ปลายทาง ระบบจะระบุ CEC อัตโนมัติเมื่อสถานะพัสดุอัปเดต'
      },
      {
        id: 'log-8-1',
        timestamp: hoursAgo(6),
        actorName: 'ครูสมศรี ทองสุข (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240902 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200302TH']
  },

  // 9. MyOrder: damaged parcel -> routed straight to CEC 12
  {
    id: 'TP-2026-0009',
    trackingNumber: 'EN100200304TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240904', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'DAMAGED_PARCEL',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าได้รับของแล้วแต่ขวดน้ำผึ้งแตก กล่องบุบ มีรูปถ่ายจากลูกค้า ขอเคลมค่าเสียหายค่ะ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองสุราษฎร์ธานี (84000)',
    createdAt: hoursAgo(20),
    dispatchedAt: hoursAgo(20),
    slaDeadline: hoursAhead(52),
    isSlaExceeded: false,
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-9-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'ลูกค้าได้รับของแล้วแต่ขวดน้ำผึ้งแตก กล่องบุบ มีรูปถ่ายจากลูกค้า ขอเคลมค่าเสียหายค่ะ',
        timestamp: hoursAgo(20),
        attachments: ['รูปกล่องบุบ_1.jpg', 'รูปขวดแตก_2.jpg']
      }
    ],
    activityLogs: [
      {
        id: 'log-9-2',
        timestamp: hoursAgo(20),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC 12 จากรหัสไปรษณีย์ปลายทาง 84000 และส่งเข้าคิว CEC ทันที'
      },
      {
        id: 'log-9-1',
        timestamp: hoursAgo(20),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240904 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200304TH']
  },

  // 10. MyOrder: answered -> merchant can read the approved answer
  {
    id: 'TP-2026-0010',
    trackingNumber: 'EN100200307TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240907', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'NOT_RECEIVED',
    urgency: 'HIGH',
    customerInquiry: 'สถานะขึ้นส่งสำเร็จ แต่ลูกค้าบอกว่ายังไม่ได้รับหูฟัง ช่วยตรวจสอบว่าฝากไว้กับใครครับ',
    status: 'ANSWER_SENT_TO_MERCHANT',
    assignedCecId: 1,
    assignedCecName: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    assignedBranchName: 'ปณ.บางรัก (10500)',
    createdAt: hoursAgo(40),
    dispatchedAt: hoursAgo(40),
    slaDeadline: hoursAhead(32),
    isSlaExceeded: false,
    cecReply: {
      answer: 'ปณ.บางรัก ตรวจสอบแล้ว พัสดุฝากไว้ที่เคาน์เตอร์นิติบุคคลอาคารชั้น G ตามที่ผู้รับเคยแจ้งไว้ มีลายเซ็นเจ้าหน้าที่นิติรับไว้ วันที่ 21 ก.ย. 11:10 น.',
      repliedAt: hoursAgo(20),
      repliedBy: 'CEC 1 เจ้าหน้าที่ กมลชนก ส.',
      branchNotes: 'ประสานบุรุษไปรษณีย์สายสีลม 3 ยืนยันแล้ว'
    },
    centralReview: {
      reviewedAt: hoursAgo(18),
      reviewedBy: 'ปณ.ส่วนกลาง',
      approvedAnswer: 'ไปรษณีย์ปลายทางยืนยันว่าพัสดุนำจ่ายโดยฝากไว้ที่เคาน์เตอร์นิติบุคคลของอาคาร (ชั้น G) เมื่อ 21 ก.ย. เวลา 11:10 น. รบกวนแจ้งผู้รับติดต่อรับพัสดุที่นิติบุคคลอาคารได้เลยครับ',
      actionTaken: 'APPROVED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-10-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'สถานะขึ้นส่งสำเร็จ แต่ลูกค้าบอกว่ายังไม่ได้รับหูฟัง ช่วยตรวจสอบว่าฝากไว้กับใครครับ',
        timestamp: hoursAgo(40)
      },
      {
        id: 'msg-10-2',
        senderRole: 'CEC',
        senderName: 'CEC 1 (กมลชนก)',
        message: '[คำตอบจาก CEC]: ปณ.บางรัก ตรวจสอบแล้ว พัสดุฝากไว้ที่เคาน์เตอร์นิติบุคคลอาคารชั้น G',
        timestamp: hoursAgo(20)
      },
      {
        id: 'msg-10-3',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'ไปรษณีย์ปลายทางยืนยันว่าพัสดุนำจ่ายโดยฝากไว้ที่เคาน์เตอร์นิติบุคคลของอาคาร (ชั้น G) เมื่อ 21 ก.ย. เวลา 11:10 น. รบกวนแจ้งผู้รับติดต่อรับพัสดุที่นิติบุคคลอาคารได้เลยครับ',
        timestamp: hoursAgo(18)
      }
    ],
    activityLogs: [
      {
        id: 'log-10-4',
        timestamp: hoursAgo(18),
        actorName: 'ปณ.ส่วนกลาง',
        actorRole: 'CENTRAL',
        action: 'อนุมัติคำตอบและส่งให้ร้านค้า',
        details: 'คำตอบผ่านการตรวจสอบคุณภาพและส่งกลับร้านค้าผ่าน MyOrder แล้ว'
      },
      {
        id: 'log-10-3',
        timestamp: hoursAgo(20),
        actorName: 'กมลชนก ส. (CEC 1)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'CEC ส่งคำตอบกลับเข้า Central Review Queue'
      },
      {
        id: 'log-10-2',
        timestamp: hoursAgo(40),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC 1 จากรหัสไปรษณีย์ปลายทาง 10500 และส่งเข้าคิว CEC ทันที'
      },
      {
        id: 'log-10-1',
        timestamp: hoursAgo(40),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240907 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200307TH']
  }
];
