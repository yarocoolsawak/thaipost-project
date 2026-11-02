import type { CaseItem } from '../types/case';
import { KNOWN_PARCELS, POD_SAMPLE_IMAGE, withDeliveryStaff } from '../services/trackTraceApi';

import { hoursAgo, hoursAhead } from './demoClock';
import { cecForRecipient, detectRoutingAlert } from '../utils/cecRouting';
import { findPostOffice } from './postOffices';
import { defaultClosureSettings, sendResolution, shipmentKey } from '../utils/caseLifecycle';

// Every case is raised by a MyOrder shop from a shipped order (see src/data/myOrders.ts)
const SEED_CASES: CaseItem[] = [
  // ==========================================
  // เคสตัวอย่างที่ 1: แจ้งปิดงาน (ผู้รับได้ของแล้วแต่สถานะยังไม่สำเร็จ)
  // ==========================================
  {
    id: 'TP-2026-0101',
    trackingNumber: 'ED901234561TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240901', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'CLOSE_WORK_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยนะครับ ร้านค้าสอบถามผู้รับปลายทางแจ้งได้รับพัสดุเรียบร้อยแล้ว สถานะยังไม่อัปเดตปิดงานตั้งแต่วันที่ 05/10/69 ครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'เจ้าหน้าที่ ปณ.สันกำแพง ตรวจสอบและประสานบุรุษไปรษณีย์แล้ว ยืนยันนำจ่ายพัสดุให้คุณกิตติศักดิ์เรียบร้อยแล้ว มีภาพถ่ายหลักฐานและลายเซ็นสมบูรณ์ในระบบ QMS ขออนุญาตปิดงาน',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 5 เจ้าหน้าที่ สมพร น.',
      branchNotes: 'ส่งมอบที่บ้านผู้รับแล้ว ลายเซ็นตรงกับชื่อผู้รับจ่าหน้า'
    },
    dispatchedAt: hoursAgo(6),
    bagOpenedAt: '2026-10-03T10:30:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(42),
    retentionDeadline: hoursAhead(90),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['ED901234561TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-ex-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยนะครับ ร้านค้าสอบถามผู้รับปลายทางแจ้งได้รับพัสดุเรียบร้อยแล้ว สถานะยังไม่อัปเดตปิดงานตั้งแต่วันที่ 05/10/69 ครับ',
        timestamp: hoursAgo(6)
      }
    ],
    activityLogs: [
      {
        id: 'log-ex-1-1',
        timestamp: hoursAgo(6),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 5',
        details: 'ระบุ CEC 5 จากรหัสไปรษณีย์ปลายทาง 50130'
      },
      {
        id: 'log-ex-1-2',
        timestamp: hoursAgo(6),
        actorName: 'คุณฟ้า อารียา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปิดงาน',
        details: 'ร้านค้าแจ้งปิดงาน: ผู้รับปลายทางได้รับของแล้ว แต่ระบบยังไม่อัปเดต'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234561TH']!
  },

  // ==========================================
  // เคสตัวอย่างที่ 2: เร่งนำจ่ายใหม่อีกครั้ง / นำจ่ายใหม่ (จนท.โทร 3 ครั้ง รอแอดมินโทรครั้งที่ 4)
  // ==========================================
  {
    id: 'TP-2026-0102',
    trackingNumber: 'ED901234562TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240902', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'REDELIVERY_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'รบกวนประสานงานเจ้าหน้าที่ติดต่อนำส่งใหม่ให้หน่อยนะครับ ร้านค้าสอบถามผู้รับแจ้งว่ายังไม่ได้รับการติดต่อจากเจ้าหน้าที่ครับ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 7,
    assignedCecName: 'CEC 7 (ภาคตะวันออกเฉียงเหนือตอนบน)',
    assignedBranchName: 'ปณ.เมืองขอนแก่น (ขอนแก่น)',
    createdAt: hoursAgo(10),
    dispatchedAt: hoursAgo(10),
    bagOpenedAt: '2026-10-04T09:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(38),
    retentionDeadline: hoursAhead(86),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายสมบัติ (จนท.นำจ่าย)',
        calledAt: '2026-10-05T10:15:00.000Z',
        phoneNumber: '089-881-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรออก 3 ครั้ง ไม่มีผู้รับสาย'
      },
      {
        id: 'call-2',
        attemptNumber: 2,
        callerRole: 'OFFICER',
        callerName: 'นายสมบัติ (จนท.นำจ่าย)',
        calledAt: '2026-10-05T13:40:00.000Z',
        phoneNumber: '089-881-XXXX',
        outcome: 'CANNOT_CONTACT',
        outcomeLabel: 'ติดต่อไม่ได้ / สายไม่ว่าง',
        note: 'สัญญาณติดแต่ตัดสาย'
      },
      {
        id: 'call-3',
        attemptNumber: 3,
        callerRole: 'OFFICER',
        callerName: 'นายสมบัติ (จนท.นำจ่าย)',
        calledAt: '2026-10-05T16:30:00.000Z',
        phoneNumber: '089-881-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย (ครบ 3 ครั้ง)',
        note: 'ครบเกณฑ์ 3 ครั้ง ส่งเรื่องต่อแอดมินโทรติดตาม'
      }
    ],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-ex-2',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'รบกวนประสานงานเจ้าหน้าที่ติดต่อนำส่งใหม่ให้หน่อยนะครับ ร้านค้าสอบถามผู้รับแจ้งว่ายังไม่ได้รับการติดต่อจากเจ้าหน้าที่ครับ',
        timestamp: hoursAgo(10)
      }
    ],
    activityLogs: [
      {
        id: 'log-ex-2-1',
        timestamp: hoursAgo(10),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 7',
        details: 'ระบุ CEC 7 จากรหัสไปรษณีย์ 40000'
      },
      {
        id: 'log-ex-2-2',
        timestamp: hoursAgo(10),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ขอให้นำส่งใหม่',
        details: 'ร้านค้าแจ้งผู้รับยังไม่ได้รับการติดต่อจาก จนท.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234562TH']!
  },

  // ==========================================
  // เคสตัวอย่างที่ 3: แจ้งตีกลับ / ตรวจสอบถอยสถานะตีกลับและแจ้งนำส่งใหม่
  // ==========================================
  {
    id: 'TP-2026-0103',
    trackingNumber: 'ED901234563TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณวิชัย รัตน์โกมล',
    myOrderRef: { orderId: 'MO-240903', shopId: 'SHOP-02', shopName: 'HomeLiving Deco' },
    category: 'RETURN_OR_REVERSE',
    urgency: 'HIGH',
    customerInquiry: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบถอยสถานะตีกลับและแจ้งนำส่งใหม่ให้หน่อยนะครับ สถานะพัสดุไม่อัปเดตเคลื่อนไหว ค้างระหว่างส่งต่อตั้งแต่วันที่ 03/10/69 และสถานะอัปเดตอีกครั้งวันนี้ 07/10/69 ส่งคืนต้นทางโดยยังไม่มีการนำจ่ายครับ ไม่ทราบว่าพัสดุติดปัญหาส่วนใดครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 13,
    assignedCecName: 'CEC 13 (ภาคใต้ตอนล่าง 1)',
    assignedBranchName: 'ปณ.หาดใหญ่ (สงขลา)',
    createdAt: hoursAgo(2),
    dispatchedAt: hoursAgo(2),
    bagOpenedAt: '2026-10-03T11:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(14),
    retentionDeadline: hoursAhead(62),
    isSlaExceeded: false,
    cecReply: {
      answer: 'ตรวจสอบพบว่าพัสดุมีการติดบาร์โค้ดส่งต่อคลาดเคลื่อน ทำให้ระบบคัดแยกส่งคืนต้นทาง ได้สั่งการระงับการส่งคืนต้นทางและทำการถอยสถานะในระบบแล้ว กำลังส่งมอบให้ ปณ.หาดใหญ่ จัดรอบนำจ่ายใหม่ในรอบบ่ายวันนี้',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 13 เจ้าหน้าที่ สมชาย ภ.',
      branchNotes: 'ประสานหัวหน้าศูนย์คัดแยกหาดใหญ่ ถอยสถานะสำเร็จ สิ่งของอยู่ที่โต๊ะนำจ่ายหาดใหญ่แล้ว'
    },
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-ex-3',
        senderRole: 'CUSTOMER',
        senderName: 'คุณวิชัย รัตน์โกมล (HomeLiving Deco)',
        message: 'รบกวนประสานงานเจ้าหน้าที่ตรวจสอบถอยสถานะตีกลับและแจ้งนำส่งใหม่ให้หน่อยนะครับ สถานะพัสดุไม่อัปเดตเคลื่อนไหว ค้างระหว่างส่งต่อตั้งแต่วันที่ 03/10/69 และสถานะอัปเดตอีกครั้งวันนี้ 07/10/69 ส่งคืนต้นทางโดยยังไม่มีการนำจ่ายครับ ไม่ทราบว่าพัสดุติดปัญหาส่วนใดครับ',
        timestamp: hoursAgo(2)
      },
      {
        id: 'msg-ex-3-2',
        senderRole: 'CEC',
        senderName: 'CEC 13 สมชาย',
        message: 'สาขาแจ้งถอยสถานะส่งคืนต้นทางเรียบร้อยครับ กำลังนำส่งมอบปลายทางหาดใหญ่รอบบ่ายครับ',
        timestamp: hoursAgo(1)
      }
    ],
    activityLogs: [
      {
        id: 'log-ex-3-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 13',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'ถอยสถานะตีกลับเรียบร้อย รอ ปณ.ส่วนกลาง ตรวจสอบ'
      },
      {
        id: 'log-ex-3-2',
        timestamp: hoursAgo(2),
        actorName: 'คุณวิชัย (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอถอยสถานะตีกลับ',
        details: 'ค้างระหว่างส่งต่อ 03/10/69 และอัปเดต 07/10/69 ส่งคืนต้นทางโดยยังไม่นำจ่าย'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234563TH']!
  },

  // ==========================================
  // เคสตัวอย่างที่ 4: ขอเร่งนำส่ง (จนท.ลงสถานะปฏิเสธรับเท็จ ผู้รับยืนยันไม่ได้ปฏิเสธ)
  // ==========================================
  {
    id: 'TP-2026-0104',
    trackingNumber: 'ED901234564TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก พัชรี',
    myOrderRef: { orderId: 'MO-240904', shopId: 'SHOP-01', shopName: 'Healthy Snack by Nok' },
    category: 'EXPEDITE_REQUEST',
    urgency: 'CRITICAL',
    customerInquiry: 'รบกวนประสานงานเจ้าหน้าที่เร่งนำส่งให้หน่อยนะครับ เจ้าหน้าที่่ลงสถานะปฏิเสธรับ ผู้รับยืนยันไม่ได้ปฏิเสธรับและยังไม่มีเจ้าหน้าที่โทรติดต่อผู้รับปลายทางเลยครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 9,
    assignedCecName: 'CEC 9 (ภาคตะวันออกเฉียงเหนือตอนล่าง 1)',
    assignedBranchName: 'ปณ.เมืองนครราชสีมา (นครราชสีมา)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'CEC 9 ตรวจสอบแล้ว พบว่า จนท.นำจ่ายกดรหัสผิดพลาด ได้ประสาน ปณ.เมืองนครราชสีมา ระงับการส่งคืนและถอยสถานะแล้ว พร้อมจัดรถนำจ่ายพิเศษรอบบ่ายวันนี้ ติดต่อผู้รับได้เรียบร้อย',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 9 เจ้าหน้าที่ ชาญชัย ว.',
      branchNotes: 'บุรุษไปรษณีย์โทรขอโทษผู้รับแล้ว นัดหมายส่งมอบ 14:00 น.'
    },
    dispatchedAt: hoursAgo(5),
    bagOpenedAt: '2026-10-04T12:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(43),
    retentionDeadline: hoursAhead(91),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-ex-4',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก พัชรี (Healthy Snack by Nok)',
        message: 'รบกวนประสานงานเจ้าหน้าที่เร่งนำส่งให้หน่อยนะครับ เจ้าหน้าที่่ลงสถานะปฏิเสธรับ ผู้รับยืนยันไม่ได้ปฏิเสธรับและยังไม่มีเจ้าหน้าที่โทรติดต่อผู้รับปลายทางเลยครับ',
        timestamp: hoursAgo(5)
      }
    ],
    activityLogs: [
      {
        id: 'log-ex-4-1',
        timestamp: hoursAgo(5),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 9',
        details: 'ระบุ CEC 9 จากรหัสไปรษณีย์ 30000'
      },
      {
        id: 'log-ex-4-2',
        timestamp: hoursAgo(5),
        actorName: 'คุณนก พัชรี (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'แจ้งเร่งนำส่งด่วนที่สุด',
        details: 'จนท.ลงสถานะปฏิเสธรับเท็จ ผู้รับยืนยันไม่ได้ปฏิเสธรับและไม่มีใครโทรติดต่อ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234564TH']!
  },

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
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 5 ตรวจสอบกับ ปณ.สันกำแพง แล้ว บุรุษไปรษณีย์ฝากพัสดุไว้ที่ป้อม รปภ. หมู่บ้านศุภาลัย มีลายเซ็น รปภ.สุรชัย และภาพถ่ายวางที่โต๊ะพัสดุ ได้โทรแจ้งผู้รับรับทราบแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 5 เจ้าหน้าที่ ธนพล ส.',
      branchNotes: 'โทรติดต่อผู้รับแล้ว ผู้รับแจ้งว่าเห็นกล่องที่ป้อม รปภ. เรียบร้อยแล้ว'
    },
    dispatchedAt: hoursAgo(4),
    bagOpenedAt: '2026-10-04T08:30:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(68),
    retentionDeadline: hoursAhead(116),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['ED882194821TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: false,
    callAttempts: [
      {
        id: 'call-001-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายสมพงษ์ (จนท.นำจ่าย)',
        calledAt: '2026-10-05T09:30:00.000Z',
        phoneNumber: '081-445-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรแจ้งนำจ่าย ฝากนิติ/รปภ.แทน'
      }
    ],
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
    createdAt: hoursAgo(3),
    dispatchedAt: hoursAgo(30),
    bagOpenedAt: '2026-10-03T14:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(42),
    retentionDeadline: hoursAhead(90),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-002-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายสุวัฒน์ (จนท.นำจ่าย)',
        calledAt: '2026-10-04T10:00:00.000Z',
        phoneNumber: '089-771-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 1 บ้านปิด'
      },
      {
        id: 'call-002-2',
        attemptNumber: 2,
        callerRole: 'OFFICER',
        callerName: 'นายสุวัฒน์ (จนท.นำจ่าย)',
        calledAt: '2026-10-04T14:30:00.000Z',
        phoneNumber: '089-771-XXXX',
        outcome: 'CANNOT_CONTACT',
        outcomeLabel: 'ติดต่อไม่ได้ / สายไม่ว่าง',
        note: 'โทรครั้งที่ 2'
      },
      {
        id: 'call-002-3',
        attemptNumber: 3,
        callerRole: 'OFFICER',
        callerName: 'นายสุวัฒน์ (จนท.นำจ่าย)',
        calledAt: '2026-10-05T09:15:00.000Z',
        phoneNumber: '089-771-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'โทรครั้งที่ 3 นัดจ่ายรอบพิเศษบ่ายนี้'
      }
    ],
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
    bagOpenedAt: '2026-10-03T11:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAgo(12),
    retentionDeadline: hoursAhead(36),
    isSlaExceeded: true,
    callAttempts: [],
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

  // 4. CENTRAL_CONTACT_BRANCH (พัสดุหลงทิศ: ตอนแจ้งยังระบุ CEC ไม่ได้ จน QMS ยืนยันปลายทาง แล้วส่วนกลางโทรสาขาโดยตรง)
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
    dispatchedAt: hoursAgo(6),
    bagOpenedAt: '2026-10-06T08:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAgo(16),
    retentionDeadline: hoursAhead(104),
    isSlaExceeded: true,
    callAttempts: [
      {
        id: 'call-004-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายพงษ์ศักดิ์ (ศป.ขอนแก่น)',
        calledAt: '2026-10-06T09:30:00.000Z',
        phoneNumber: '086-123-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'แจ้งลูกค้านำจ่ายรอบเที่ยงเรียบร้อย'
      }
    ],
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
        timestamp: hoursAgo(6),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ระบุ CEC อัตโนมัติและส่งเคส',
        details: 'QMS ยืนยันพื้นที่ปลายทางแล้ว (ถึง ศป.ขอนแก่น) ระบุ CEC-07 จากรหัสไปรษณีย์ 40000 และส่งเข้าคิว CEC'
      },
      {
        id: 'log-4-3a',
        timestamp: hoursAgo(6),
        actorName: 'ระบบ QMS',
        actorRole: 'CENTRAL',
        action: 'QMS อัปเดตสถานะพัสดุ',
        details: 'ถึงศูนย์คัดแยกปลายทาง @ ศป.ขอนแก่น: แก้ไขเส้นทางเรียบร้อย สิ่งของถึงศูนย์คัดแยกปลายทาง'
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
        details: 'สถานะพัสดุใน QMS "ส่งต่อผิดศูนย์คัดแยก" ยังยืนยันพื้นที่ปลายทางไม่ได้'
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
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.เมืองชลบุรี (20000)',
    createdAt: hoursAgo(5),
    cecReply: {
      answer: 'CEC 4 ดึงภาพถ่ายใบรับและลายมือชื่อจากระบบ QMS สาขาเมืองชลบุรี เรียบร้อยแล้ว ผู้รับคุณเอกสิทธิ์ เซ็นรับด้วยตนเองเมื่อ 06/10 เวลา 11:20 น. แนบภาพถ่ายให้ร้านค้าแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 4 เจ้าหน้าที่ วิมลมาศ',
      branchNotes: 'เอกสาร POD อัปโหลดเข้าสู่ระบบสมบูรณ์'
    },
    dispatchedAt: hoursAgo(18),
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(54),
    retentionDeadline: hoursAhead(102),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['ED551029384TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [],
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
    bagOpenedAt: '2026-10-06T07:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(48),
    retentionDeadline: hoursAhead(96),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-006-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'จนท.นำจ่าย ปณ.เมืองร้อยเอ็ด',
        calledAt: '2026-10-06T08:30:00.000Z',
        phoneNumber: '084-221-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'โทรแจ้งนำจ่ายก่อนเที่ยง'
      }
    ],
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
        details: 'QMS ยืนยันพื้นที่ปลายทางแล้ว ระบุ CEC-08 จากรหัสไปรษณีย์ 45000 และส่งเข้าคิว CEC'
      },
      {
        id: 'log-6-2',
        timestamp: hoursAgo(24),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'รอระบุ CEC ผู้รับผิดชอบ',
        details: 'พัสดุยังอยู่ระหว่างขนส่ง ระบบจะระบุ CEC อัตโนมัติเมื่อ QMS อัปเดตสถานะพัสดุ'
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
      currentPostalStatus: '301 - อยู่ระหว่างการนำจ่าย',
      currentStatusCode: '301',
      bagOpenedAt: '2026-10-06T07:00:00.000Z',
      weightKg: 0.9,
      events: [
        { timestamp: hoursAgo(24), statusCode: '103', status: 'รับฝาก', location: 'ปณ.คลองหลวง', description: 'รับฝากเรียบร้อย' },
        { timestamp: hoursAgo(14), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองร้อยเอ็ด', description: 'สิ่งของถึงที่ทำการ เปิดถุงเตรียมนำจ่าย', isBagOpenEvent: true }
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
    createdAt: hoursAgo(5),
    dispatchedAt: hoursAgo(48),
    bagOpenedAt: '2026-10-05T08:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(24),
    retentionDeadline: hoursAhead(72),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    callAttempts: [],
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
      currentPostalStatus: '501 - นำจ่ายสำเร็จ',
      currentStatusCode: '501',
      bagOpenedAt: '2026-10-05T08:00:00.000Z',
      deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
      recipientConfirmedReceived: true,
      signerName: 'ภัทรดนัย',
      weightKg: 1.1,
      events: [
        { timestamp: hoursAgo(48), statusCode: '103', status: 'รับฝาก', location: 'ปณ.บางพลี', description: 'รับฝาก' },
        { timestamp: hoursAgo(26), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.จตุจักร', description: 'เปิดถุงรอนำจ่าย', isBagOpenEvent: true },
        { timestamp: hoursAgo(22), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.จตุจักร', description: 'ผู้รับรับเองเรียบร้อย', recipientOrSigner: 'ภัทรดนัย' }
      ]
    }
  },

  // ---------- More recent reports ----------

  // 8. MyOrder: parcel still in transit -> CEC 10 from the recipient's postal code (34000)
  {
    id: 'TP-2026-0008',
    trackingNumber: 'EN100200302TH',
    companyName: 'ร้านผ้าไหมบ้านครูสมศรี',
    contactPerson: 'ครูสมศรี ทองสุข',
    myOrderRef: { orderId: 'MO-240902', shopId: 'SHOP-01', shopName: 'ร้านผ้าไหมบ้านครูสมศรี' },
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'ส่ง EMS ไปอุบลฯ ตั้งแต่ 5 วันก่อน สถานะค้างอยู่ที่ศูนย์คัดแยกนครราชสีมา ลูกค้าถามทุกวันค่ะ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 10,
    assignedCecName: 'CEC 10 (ภาคอีสานตอนล่าง 2)',
    assignedBranchName: 'ปณ.เมืองอุบลราชธานี (34000)',
    createdAt: hoursAgo(6),
    dispatchedAt: hoursAgo(6),
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(66),
    isSlaExceeded: false,
    callAttempts: [],
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
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC-10 จากรหัสไปรษณีย์ผู้รับ 34000 และส่งเข้าคิว CEC ทันที'
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
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองสุราษฎร์ธานี (84000)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 12 ตรวจสอบกับ ปณ.สุราษฎร์ธานี พบว่าพัสดุตกกระแทกระหว่างคัดแยกที่ศูนย์ทุ่งสง สาขาได้ออกเอกสารบันทึก ปณ.14 รับรองความเสียหายแล้ว ขอส่งให้ส่วนกลางอนุมัติจ่ายเงินชดใช้ตามสิทธิ์ EMS (2,000 บาท)',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 12 เจ้าหน้าที่ ไพโรจน์',
      branchNotes: 'มีใบ ปณ.14 แนบในระบบ และภาพถ่ายขวดแตกครบถ้วน'
    },
    dispatchedAt: hoursAgo(20),
    bagOpenedAt: '2026-10-04T10:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(52),
    retentionDeadline: hoursAhead(100),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['EN100200304TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [
      {
        id: 'call-009-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายประสิทธิ์ (จนท.นำจ่าย ปณ.สุราษฎร์ธานี)',
        calledAt: '2026-10-05T09:40:00.000Z',
        phoneNumber: '081-907-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'โทรแจ้งนำจ่ายและแจ้งผู้รับว่ากล่องภายนอกมีรอยบุบ ผู้รับยินยอมเปิดตรวจรับสินค้า'
      }
    ],
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
    bagOpenedAt: '2026-10-05T08:30:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(32),
    retentionDeadline: hoursAhead(80),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['EN100200307TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [
      {
        id: 'call-010-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายศักดิ์ดา (จนท.นำจ่าย สายสีลม 3)',
        calledAt: '2026-10-05T10:50:00.000Z',
        phoneNumber: '092-448-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'โทรแจ้งผู้รับว่าจะฝากไว้ที่เคาน์เตอร์นิติบุคคลอาคารสีลมคอมเพล็กซ์ตามที่ระบุ'
      }
    ],
    cecReply: {
      answer: 'ปณ.บางรัก ตรวจสอบแล้ว พัสดุฝากไว้ที่เคาน์เตอร์นิติบุคคลอาคารชั้น G ตามที่ผู้รับเคยแจ้งไว้ มีลายเซ็นเจ้าหน้าที่นิติรับไว้ เมื่อวาน เวลา 11:10 น.',
      repliedAt: hoursAgo(20),
      repliedBy: 'CEC 1 เจ้าหน้าที่ กมลชนก ส.',
      branchNotes: 'ประสานบุรุษไปรษณีย์สายสีลม 3 ยืนยันแล้ว'
    },
    centralReview: {
      reviewedAt: hoursAgo(18),
      reviewedBy: 'ปณ.ส่วนกลาง',
      approvedAnswer: 'ไปรษณีย์ปลายทางยืนยันว่าพัสดุนำจ่ายโดยฝากไว้ที่เคาน์เตอร์นิติบุคคลของอาคาร (ชั้น G) เมื่อวาน เวลา 11:10 น. รบกวนแจ้งผู้รับติดต่อรับพัสดุที่นิติบุคคลอาคารได้เลยครับ',
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
        message: 'ไปรษณีย์ปลายทางยืนยันว่าพัสดุนำจ่ายโดยฝากไว้ที่เคาน์เตอร์นิติบุคคลของอาคาร (ชั้น G) เมื่อวาน เวลา 11:10 น. รบกวนแจ้งผู้รับติดต่อรับพัสดุที่นิติบุคคลอาคารได้เลยครับ',
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
  },

  // ==========================================
  // เคสเพิ่มเติม (TP-2026-0011 ถึง TP-2026-0024)
  // ครอบคลุมทุกสถานะ ทุกประเภทปัญหา และ CEC ทุกเขตทั่วประเทศ
  // ==========================================

  // 11. RETURN_OR_REVERSE + SLA_EXCEEDED (เกิน 7 วันในการเก็บพัสดุหลังเปิดถุง)
  {
    id: 'TP-2026-0011',
    trackingNumber: 'EN100200311TH',
    companyName: 'ร้านผ้าไหมบ้านครูสมศรี',
    contactPerson: 'ครูสมศรี ทองสุข',
    myOrderRef: { orderId: 'MO-240911', shopId: 'SHOP-01', shopName: 'ร้านผ้าไหมบ้านครูสมศรี' },
    category: 'RETURN_OR_REVERSE',
    urgency: 'HIGH',
    customerInquiry: 'ผู้รับแจ้งไม่พร้อมรับพัสดุและขอปฏิเสธรับสินค้า ของเก็บไว้ที่ ปณ.หางดง เกิน 7 วันแล้ว ขอให้ทำเรื่องตีกลับต้นทางด่วนค่ะ',
    status: 'SLA_EXCEEDED',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.หางดง (50230)',
    createdAt: hoursAgo(170),
    dispatchedAt: hoursAgo(170),
    bagOpenedAt: '2026-09-30T09:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAgo(50),
    retentionDeadline: hoursAgo(2), // เกิน 7 วันหลังเปิดถุง
    isSlaExceeded: true,
    callAttempts: [
      {
        id: 'call-011-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายสุเทพ (จนท.นำจ่าย ปณ.หางดง)',
        calledAt: '2026-10-01T10:00:00.000Z',
        phoneNumber: '089-118-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 1 ติดต่อไม่ได้'
      },
      {
        id: 'call-011-2',
        attemptNumber: 2,
        callerRole: 'OFFICER',
        callerName: 'นายสุเทพ (จนท.นำจ่าย ปณ.หางดง)',
        calledAt: '2026-10-02T14:30:00.000Z',
        phoneNumber: '089-118-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 2 ตัดสาย'
      },
      {
        id: 'call-011-3',
        attemptNumber: 3,
        callerRole: 'OFFICER',
        callerName: 'นายสุเทพ (จนท.นำจ่าย ปณ.หางดง)',
        calledAt: '2026-10-03T11:00:00.000Z',
        phoneNumber: '089-118-XXXX',
        outcome: 'REJECTED',
        outcomeLabel: 'ผู้รับปฏิเสธรับ',
        note: 'ผู้รับแจ้งไม่อยู่พื้นที่และไม่ต้องการรับพัสดุ'
      },
      {
        id: 'call-011-4',
        attemptNumber: 4,
        callerRole: 'ADMIN',
        callerName: 'นภาภรณ์ (แอดมิน MyOrder)',
        calledAt: '2026-10-05T09:30:00.000Z',
        phoneNumber: '089-118-XXXX',
        outcome: 'REJECTED',
        outcomeLabel: 'ยืนยันปฏิเสธรับ (แอดมินโทรตาม)',
        note: 'แอดมินโทรยืนยัน ผู้รับยืนยันขอยกเลิกคำสั่งซื้อ ให้ส่งคืนต้นทาง'
      }
    ],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-11-1',
        senderRole: 'CUSTOMER',
        senderName: 'ครูสมศรี ทองสุข (ร้านผ้าไหมบ้านครูสมศรี)',
        message: 'ผู้รับแจ้งไม่พร้อมรับพัสดุและขอปฏิเสธรับสินค้า ของเก็บไว้ที่ ปณ.หางดง เกิน 7 วันแล้ว ขอให้ทำเรื่องตีกลับต้นทางด่วนค่ะ',
        timestamp: hoursAgo(170)
      }
    ],
    activityLogs: [
      {
        id: 'log-11-2',
        timestamp: hoursAgo(2),
        actorName: 'ระบบอัตโนมัติ (SLA Timer)',
        actorRole: 'CENTRAL',
        action: 'SLA_EXCEEDED (Retention Exceeded)',
        details: 'พัสดุถูกเก็บรักษาเกินเกณฑ์ 7 วันหลังวันเปิดถุง ระบบแจ้งเตือนให้ดำเนินการตีกลับสิ่งของ'
      },
      {
        id: 'log-11-1',
        timestamp: hoursAgo(170),
        actorName: 'ครูสมศรี ทองสุข (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240911 ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200311TH']
  },

  // 12. EXPEDITE_REQUEST + NEW (เคสเปิดใหม่ เข้าสู่ระบบ รอตรวจสอบ)
  {
    id: 'TP-2026-0012',
    trackingNumber: 'EN100200312TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240912', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'EXPEDITE_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'สินค้าอาหารควบคุมโภชนาการสำหรับผู้ป่วย รบกวนเร่งนำส่งให้ รพ.นครปฐม ภายในช่วงเช้าวันนี้ด้วยนะคะ ลูกค้าต้องใช้ด่วน',
    status: 'NEW',
    assignedCecId: 11,
    assignedCecName: 'CEC 11 (ภาคตะวันตก)',
    assignedBranchName: 'ปณ.เมืองนครปฐม (73000)',
    createdAt: hoursAgo(2),
    dispatchedAt: hoursAgo(2),
    bagOpenedAt: '2026-10-07T02:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(70),
    retentionDeadline: hoursAhead(166),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-12-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'สินค้าอาหารควบคุมโภชนาการสำหรับผู้ป่วย รบกวนเร่งนำส่งให้ รพ.นครปฐม ภายในช่วงเช้าวันนี้ด้วยนะคะ ลูกค้าต้องใช้ด่วน',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-12-1',
        timestamp: hoursAgo(2),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอเร่งนำส่ง (EXPEDITE)',
        details: 'แจ้งเคสเร่งด่วนจากคำสั่งซื้อ MO-240912 ส่งเข้าระบบ ปณ.ส่วนกลาง'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200312TH']
  },

  // 13. CLOSE_WORK_REQUEST + WAITING_CENTRAL_REVIEW (CEC ตอบแล้ว มี POD รอยืนยันปิดงาน)
  {
    id: 'TP-2026-0013',
    trackingNumber: 'EN100200313TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240913', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'CLOSE_WORK_REQUEST',
    urgency: 'NORMAL',
    customerInquiry: 'ลูกค้าแจ้งได้รับขนมสุขภาพเรียบร้อยเมื่อวาน แต่สถานะในระบบยังค้างนำจ่าย รบกวนเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยค่ะ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 3,
    assignedCecName: 'CEC 3 (ภาคกลาง & ตะวันตก)',
    assignedBranchName: 'ปณ.บางบัวทอง (11110)',
    createdAt: hoursAgo(12),
    dispatchedAt: hoursAgo(12),
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(36),
    retentionDeadline: hoursAhead(84),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    callAttempts: [
      {
        id: 'call-013-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายพงษ์เทพ (จนท.นำจ่าย ปณ.บางบัวทอง)',
        calledAt: '2026-10-06T15:30:00.000Z',
        phoneNumber: '082-771-XXXX',
        outcome: 'CONFIRMED_RECEIVED',
        outcomeLabel: 'ส่งมอบเรียบร้อย',
        note: 'ผู้รับลงชื่อรับด้วยตนเอง'
      }
    ],
    cecReply: {
      answer: 'ปณ.บางบัวทอง ตรวจสอบแล้ว นำส่งให้ผู้รับคุณสุรเชษฐ์ เรียบร้อยแล้วเมื่อวาน 16:20 น. มีภาพถ่ายหน้าบ้านพร้อมลายเซ็นแนบเรียบร้อย ขออนุมัติปิดงานในระบบ',
      repliedAt: hoursAgo(2),
      repliedBy: 'CEC 3 เจ้าหน้าที่ อรรถพล',
      branchNotes: 'ส่งมอบเรียบร้อย ตรวจสอบความถูกต้องสมบูรณ์'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-13-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'ลูกค้าแจ้งได้รับขนมสุขภาพเรียบร้อยเมื่อวาน แต่สถานะในระบบยังค้างนำจ่าย รบกวนเจ้าหน้าที่ตรวจสอบปิดงานให้หน่อยค่ะ',
        timestamp: hoursAgo(12)
      },
      {
        id: 'msg-13-2',
        senderRole: 'CEC',
        senderName: 'CEC 3 (อรรถพล)',
        message: 'ตรวจสอบกับ ปณ.บางบัวทอง แล้ว ยืนยันนำจ่ายสำเร็จ มีภาพหลักฐาน POD แนบเรียบร้อยครับ ส่งเรื่องให้ส่วนกลางรีวิวปิดงาน',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-13-2',
        timestamp: hoursAgo(2),
        actorName: 'อรรถพล (CEC 3)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบพร้อมหลักฐานปิดงาน',
        details: 'ส่งคำตอบกลับเข้า Waiting Central Review พร้อมภาพถ่าย POD'
      },
      {
        id: 'log-13-1',
        timestamp: hoursAgo(12),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอปิดงาน (CLOSE_WORK)',
        details: 'ลูกค้าได้รับสินค้าแล้ว แจ้งตรวจสอบปิดงานคำสั่งซื้อ MO-240913'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200313TH']
  },

  // 14. EXPEDITE_REQUEST in transit -> CEC 7 from the recipient's postal code (41000)
  {
    id: 'TP-2026-0014',
    trackingNumber: 'EN100200314TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240914', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'EXPEDITE_REQUEST',
    urgency: 'NORMAL',
    customerInquiry: 'เครื่องสำอางชุดแต่งหน้าเจ้าสาว ลูกค้าต้องใช้วันพรุ่งนี้เช้าที่อุดรธานี รบกวนเร่งตรวจสอบเส้นทางส่งต่อให้ด้วยค่ะ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 7,
    assignedCecName: 'CEC 7 (ภาคอีสานตอนบน 1)',
    assignedBranchName: 'ปณ.เมืองอุดรธานี (41000)',
    createdAt: hoursAgo(8),
    dispatchedAt: hoursAgo(8),
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(112),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-14-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'เครื่องสำอางชุดแต่งหน้าเจ้าสาว ลูกค้าต้องใช้วันพรุ่งนี้เช้าที่อุดรธานี รบกวนเร่งตรวจสอบเส้นทางส่งต่อให้ด้วยค่ะ',
        timestamp: hoursAgo(8)
      }
    ],
    activityLogs: [
      {
        id: 'log-14-2',
        timestamp: hoursAgo(8),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC-07 จากรหัสไปรษณีย์ผู้รับ 41000 และส่งเข้าคิว CEC ทันที'
      },
      {
        id: 'log-14-1',
        timestamp: hoursAgo(8),
        actorName: 'คุณฟ้า อารียา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งขอเร่งนำส่งคำสั่งซื้อ MO-240914'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200314TH']
  },

  // 25. Postal code typo: the shop typed 38000 (Bueng Kan) for an address in Nakhon Ratchasima (30000).
  //     The case went to CEC 7 by the postal code; QMS then shows ผิดเขต (code 40) and later the Korat office.
  {
    id: 'TP-2026-0025',
    trackingNumber: 'EN100200321TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240921', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'DELAYED_DELIVERY',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าที่โคราชแจ้งว่ายังไม่ได้รับของ สถานะขึ้นผิดเขตที่ ปณ.บึงกาฬ รบกวนตรวจสอบและส่งต่อให้ด้วยครับ',
    status: 'WAITING_CEC_REPLY',
    assignedCecId: 7,
    assignedCecName: 'CEC 7 (ภาคอีสานตอนบน 1)',
    assignedBranchName: 'ปณ.บึงกาฬ (38000)',
    createdAt: hoursAgo(3),
    dispatchedAt: hoursAgo(3),
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(94),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-25-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'ลูกค้าที่โคราชแจ้งว่ายังไม่ได้รับของ สถานะขึ้นผิดเขตที่ ปณ.บึงกาฬ รบกวนตรวจสอบและส่งต่อให้ด้วยครับ',
        timestamp: hoursAgo(3)
      }
    ],
    activityLogs: [
      {
        id: 'log-25-3',
        timestamp: hoursAgo(3),
        actorName: 'ระบบ (ตรวจปลายทางจาก QMS)',
        actorRole: 'CENTRAL',
        action: 'แจ้งเตือน: สาขาแจ้งผิดเขต / ที่อยู่ผิด',
        details: 'ปณ.บึงกาฬ แจ้งสถานะ "ผิดเขต" (รหัส 40) ที่อยู่หรือรหัสไปรษณีย์ผู้รับ 38000 อาจพิมพ์ผิด'
      },
      {
        id: 'log-25-2',
        timestamp: hoursAgo(3),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC อัตโนมัติ',
        details: 'ระบุ CEC-07 จากรหัสไปรษณีย์ผู้รับ 38000 และส่งเข้าคิว CEC ทันที'
      },
      {
        id: 'log-25-1',
        timestamp: hoursAgo(3),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาจากคำสั่งซื้อ MO-240921 (EN100200321TH) ส่งตรงเข้าระบบ ปณ.'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200321TH']
  },

  // 15. REDELIVERY_REQUEST + WAITING_CEC_REPLY (นัดหมายนำจ่ายใหม่รอบบ่าย)
  {
    id: 'TP-2026-0015',
    trackingNumber: 'EN100200315TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240915', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'REDELIVERY_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุของตกแต่งบ้านลูกค้าแจ้งว่าเมื่อวานไม่อยู่บ้าน วันนี้พร้อมรับของแล้ว รบกวนเจ้าหน้าที่นำจ่ายใหม่อีกครั้งช่วงบ่ายครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.ศรีราชา (20110)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'ปณ.ศรีราชา ติดต่อผู้รับรอบเช้าเรียบร้อยแล้ว ผู้รับยืนยันอยู่บ้านช่วงบ่ายวันนี้ ได้จัดลงสายนำจ่ายรอบ 13:30-15:00 น. เรียบร้อยแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 4 เจ้าหน้าที่ อมรรัตน์',
      branchNotes: 'ประสานบุรุษไปรษณีย์สายอัสสัมชัญ นำจ่ายรอบบ่าย'
    },
    dispatchedAt: hoursAgo(16),
    bagOpenedAt: '2026-10-05T08:30:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(20),
    retentionDeadline: hoursAhead(68),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-015-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายณรงค์ (จนท.นำจ่าย ปณ.ศรีราชา)',
        calledAt: '2026-10-06T11:00:00.000Z',
        phoneNumber: '085-640-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 1 บ้านปิด'
      },
      {
        id: 'call-015-2',
        attemptNumber: 2,
        callerRole: 'OFFICER',
        callerName: 'นายณรงค์ (จนท.นำจ่าย ปณ.ศรีราชา)',
        calledAt: '2026-10-06T15:30:00.000Z',
        phoneNumber: '085-640-XXXX',
        outcome: 'POSTPONED',
        outcomeLabel: 'ผู้รับขอเลื่อนวันส่ง',
        note: 'ผู้รับแจ้งติดธุระต่างอำเภอ ขอเลื่อนรับวันนี้ช่วงบ่าย'
      }
    ],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-15-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'พัสดุของตกแต่งบ้านลูกค้าแจ้งว่าเมื่อวานไม่อยู่บ้าน วันนี้พร้อมรับของแล้ว รบกวนเจ้าหน้าที่นำจ่ายใหม่อีกครั้งช่วงบ่ายครับ',
        timestamp: hoursAgo(16)
      }
    ],
    activityLogs: [
      {
        id: 'log-15-2',
        timestamp: hoursAgo(16),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 4',
        details: 'ระบุ CEC 4 จากรหัสไปรษณีย์ 20110 ส่งให้ ปณ.ศรีราชา ดำเนินการนำจ่ายใหม่'
      },
      {
        id: 'log-15-1',
        timestamp: hoursAgo(16),
        actorName: 'คุณเอกสิทธิ์ ใจงาม (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอนำจ่ายใหม่',
        details: 'แจ้งขอนำจ่ายรอบใหม่คำสั่งซื้อ MO-240915'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200315TH']
  },

  // 16. WRONG_BRANCH + CENTRAL_CONTACT_BRANCH (ส่งผิดศูนย์คัดแยก ส่วนกลางประสานตรง)
  {
    id: 'TP-2026-0016',
    trackingNumber: 'EN100200316TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240916', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'WRONG_BRANCH',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุถูกส่งไปผิดศูนย์ที่ ศป.พิษณุโลก ทั้งที่ผู้รับอยู่ อ.วังทอง เกิน SLA แล้ว ขอให้ส่วนกลางช่วยประสานงานสาขาปลายทางโดยตรงครับ',
    status: 'CENTRAL_CONTACT_BRANCH',
    assignedCecId: 6,
    assignedCecName: 'CEC 6 (ภาคเหนือตอนล่าง)',
    assignedBranchName: 'ปณ.เมืองพิษณุโลก (65000)',
    createdAt: hoursAgo(85),
    dispatchedAt: hoursAgo(10),
    bagOpenedAt: '2026-10-03T09:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAgo(15),
    retentionDeadline: hoursAhead(33),
    isSlaExceeded: true,
    branchContactLogs: [
      {
        timestamp: hoursAgo(4),
        branchName: 'ปณ.เมืองพิษณุโลก / ศป.พิษณุโลก',
        officerName: 'นายสุรชัย วงศ์สว่าง (หน.ฝ่ายคัดแยก)',
        officerPhone: '055-258-006 ต่อ 104',
        contactReason: 'เคสเกิน SLA 5 วัน สิ่งของคัดแยกผิดสาย ส่วนกลางโทรเร่งรัดการส่งต่อ',
        outcome: 'พัสดุได้รับการคัดแยกส่งต่อไปยัง ปณ.วังทอง เรียบร้อยแล้ว รถเที่ยวบ่ายจะนำจ่ายทันที',
        recordedBy: 'คุณวราภรณ์ (ปณ.ส่วนกลาง)'
      }
    ],
    chatHistory: [
      {
        id: 'msg-16-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'พัสดุถูกส่งไปผิดศูนย์ที่ ศป.พิษณุโลก ทั้งที่ผู้รับอยู่ อ.วังทอง เกิน SLA แล้ว ขอให้ส่วนกลางช่วยประสานงานสาขาปลายทางโดยตรงครับ',
        timestamp: hoursAgo(85)
      },
      {
        id: 'msg-16-2',
        senderRole: 'CENTRAL',
        senderName: 'วราภรณ์ (ปณ.ส่วนกลาง)',
        message: 'ส่วนกลางโทรประสาน หน.ฝ่ายคัดแยก ศป.พิษณุโลก โดยตรงแล้ว สิ่งของส่งต่อไป ปณ.วังทอง เตรียมนำจ่ายบ่ายนี้ค่ะ',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-16-3',
        timestamp: hoursAgo(4),
        actorName: 'วราภรณ์ (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'โทรประสานสาขาปลายทางโดยตรง',
        details: 'บันทึก Branch Contact Log: โทร หน.ฝ่ายคัดแยก ยืนยันส่งต่อ ปณ.วังทอง'
      },
      {
        id: 'log-16-2',
        timestamp: hoursAgo(15),
        actorName: 'ระบบอัตโนมัติ (SLA Timer)',
        actorRole: 'CENTRAL',
        action: 'SLA_EXCEEDED',
        details: 'เคสเกินกำหนด SLA 5 วัน (ข้ามจังหวัด) ระบบยกระดับสถานะให้อัตโนมัติ'
      },
      {
        id: 'log-16-1',
        timestamp: hoursAgo(85),
        actorName: 'คุณเอกสิทธิ์ ใจงาม (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งปัญหาพัสดุส่งผิดศูนย์คำสั่งซื้อ MO-240916'
      }
    ],
    parcelInfo: KNOWN_PARCELS['EN100200316TH']
  },

  // 17. CANNOT_LOCATE + SLA_EXCEEDED (ของค้างสแกนเกิน SLA 3 วันในพื้นที่)
  {
    id: 'TP-2026-0017',
    trackingNumber: 'ED662244118TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240917', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'CANNOT_LOCATE',
    urgency: 'CRITICAL',
    customerInquiry: 'จอภาพคอมพิวเตอร์ส่งไปนิคมมาบตาพุด ระยอง สถานะค้างที่เปิดถุง 4 วันแล้ว ไม่มีความคืบหน้า ลูกค้าโรงงานทวงถามด่วนมากครับ',
    status: 'SLA_EXCEEDED',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.มาบตาพุด (21150)',
    createdAt: hoursAgo(88),
    dispatchedAt: hoursAgo(88),
    bagOpenedAt: '2026-10-03T08:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAgo(16),
    retentionDeadline: hoursAhead(32),
    isSlaExceeded: true,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-17-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'จอภาพคอมพิวเตอร์ส่งไปนิคมมาบตาพุด ระยอง สถานะค้างที่เปิดถุง 4 วันแล้ว ไม่มีความคืบหน้า ลูกค้าโรงงานทวงถามด่วนมากครับ',
        timestamp: hoursAgo(88)
      }
    ],
    activityLogs: [
      {
        id: 'log-17-2',
        timestamp: hoursAgo(16),
        actorName: 'ระบบอัตโนมัติ (SLA Timer)',
        actorRole: 'CENTRAL',
        action: 'SLA_EXCEEDED',
        details: 'เคสเปิดถุงเกินกำหนด SLA 3 วัน (72 ชม.) ในภาคเดียวกัน ระบบยกระดับสถานะเตือนส่วนกลาง'
      },
      {
        id: 'log-17-1',
        timestamp: hoursAgo(88),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาค้นหาพัสดุไม่พบ',
        details: 'แจ้งปัญหาพัสดุค้างสแกนจากคำสั่งซื้อ MO-240917'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED662244118TH']
  },

  // 18. CLOSE_WORK_REQUEST + CLOSED (ปิดเคสสำเร็จสมบูรณ์)
  {
    id: 'TP-2026-0018',
    trackingNumber: 'ED881122334TH',
    companyName: 'ร้านผ้าไหมบ้านครูสมศรี',
    contactPerson: 'ครูสมศรี ทองสุข',
    myOrderRef: { orderId: 'MO-240918', shopId: 'SHOP-01', shopName: 'ร้านผ้าไหมบ้านครูสมศรี' },
    category: 'CLOSE_WORK_REQUEST',
    urgency: 'NORMAL',
    customerInquiry: 'ผ้าไหมส่งถึง ปณ.นครราชสีมา ลูกค้าแจ้งว่ารับของเรียบร้อยแล้วเมื่อวาน ขอช่วยตรวจปิดงานในระบบให้ด้วยนะคะ',
    status: 'CLOSED',
    assignedCecId: 9,
    assignedCecName: 'CEC 9 (ภาคอีสานตอนล่าง 1)',
    assignedBranchName: 'ปณ.เมืองนครราชสีมา (30000)',
    createdAt: hoursAgo(5),
    dispatchedAt: hoursAgo(48),
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(24),
    retentionDeadline: hoursAhead(72),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    closeVerification: {
      verifiedAt: hoursAgo(12),
      verifiedBy: 'วรรณา (ปณ.ส่วนกลาง)',
      verifiedRole: 'CENTRAL',
      category: 'CLOSE_WORK_REQUEST',
      centralStatusChecked: true,
      centralStatusText: '501 - นำจ่ายสำเร็จ',
      hasProofEvidence: true,
      proofPhotoUrl: POD_SAMPLE_IMAGE,
      recipientPhoneConfirmed: true,
      resolutionNotes: 'ตรวจสอบหลักฐาน POD และสถานะ 501 นำจ่ายสำเร็จเรียบร้อย',
      replySentToMerchant: 'ตรวจสอบพัสดุ ED881122334TH นำจ่ายสำเร็จเรียบร้อย มีภาพลายเซ็นผู้รับครบถ้วน ปิดงานสมบูรณ์ครับ'
    },
    centralReview: {
      reviewedAt: hoursAgo(12),
      reviewedBy: 'วรรณา (ปณ.ส่วนกลาง)',
      approvedAnswer: 'ตรวจสอบพัสดุ ED881122334TH นำจ่ายสำเร็จเรียบร้อย มีภาพลายเซ็นผู้รับครบถ้วน ปิดงานสมบูรณ์ครับ',
      actionTaken: 'APPROVED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-18-1',
        senderRole: 'CUSTOMER',
        senderName: 'ครูสมศรี ทองสุข (ร้านผ้าไหมบ้านครูสมศรี)',
        message: 'ผ้าไหมส่งถึง ปณ.นครราชสีมา ลูกค้าแจ้งว่ารับของเรียบร้อยแล้วเมื่อวาน ขอช่วยตรวจปิดงานในระบบให้ด้วยนะคะ',
        timestamp: hoursAgo(48)
      },
      {
        id: 'msg-18-2',
        senderRole: 'CENTRAL',
        senderName: 'วรรณา (ปณ.ส่วนกลาง)',
        message: 'ตรวจสอบหลักฐาน POD แล้ว นำจ่ายสำเร็จเรียบร้อย ปิดเคสในระบบให้แล้วค่ะ',
        timestamp: hoursAgo(12)
      }
    ],
    activityLogs: [
      {
        id: 'log-18-3',
        timestamp: hoursAgo(12),
        actorName: 'วรรณา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ปิดเคส (CLOSED)',
        details: 'ปิดเคสสมบูรณ์: ตรวจสอบหลักฐาน POD และสถานะ 501 นำจ่ายสำเร็จเรียบร้อย'
      },
      {
        id: 'log-18-2',
        timestamp: hoursAgo(24),
        actorName: 'CEC 9 (นครราชสีมา)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบพร้อมรูปภาพ POD',
        details: 'ยืนยันนำจ่ายสำเร็จ ผู้รับลงชื่อรับด้วยตนเอง'
      },
      {
        id: 'log-18-1',
        timestamp: hoursAgo(48),
        actorName: 'ครูสมศรี ทองสุข (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอปิดงาน',
        details: 'แจ้งขอปิดงานคำสั่งซื้อ MO-240918'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED881122334TH']
  },

  // 19. DELAYED_DELIVERY + WAITING_CEC_REPLY (พื้นที่ชายแดนใต้ CEC 14)
  {
    id: 'TP-2026-0019',
    trackingNumber: 'ED773322119TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240919', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'DELAYED_DELIVERY',
    urgency: 'NORMAL',
    customerInquiry: 'อุปกรณ์ระบบเครือข่ายส่งไปยะลา เข้าสู่วันที่ 4 แล้ว ติดตามสถานะการส่งมอบในพื้นที่ครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 14,
    assignedCecName: 'CEC 14 (ชายแดนใต้)',
    assignedBranchName: 'ปณ.เมืองยะลา (95000)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 14 ตรวจสอบกับ ปณ.เมืองยะลา พัสดุถึงที่ทำการเรียบร้อย อยู่ระหว่างการนำจ่ายในพื้นที่เขตปลอดภัยรอบเช้าวันนี้ คาดส่งมอบก่อน 15:00 น.',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 14 เจ้าหน้าที่ อับดุลเลาะห์',
      branchNotes: 'ประสานสายนำจ่ายเขตเทศบาลนครยะลาเรียบร้อย'
    },
    dispatchedAt: hoursAgo(30),
    bagOpenedAt: '2026-10-05T10:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(42),
    retentionDeadline: hoursAhead(90),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-19-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'อุปกรณ์ระบบเครือข่ายส่งไปยะลา เข้าสู่วันที่ 4 แล้ว ติดตามสถานะการส่งมอบในพื้นที่ครับ',
        timestamp: hoursAgo(30)
      }
    ],
    activityLogs: [
      {
        id: 'log-19-2',
        timestamp: hoursAgo(30),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 14',
        details: 'ระบุ CEC 14 จากรหัสไปรษณีย์ 95000 ประสานงาน ปณ.เมืองยะลา'
      },
      {
        id: 'log-19-1',
        timestamp: hoursAgo(30),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผ่าน MyOrder',
        details: 'แจ้งติดตามพัสดุคำสั่งซื้อ MO-240919'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED773322119TH']
  },

  // 20. REDELIVERY_REQUEST + WAITING_CENTRAL_REVIEW (แอดมินโทรครั้งที่ 4 สำเร็จ รอนำจ่ายใหม่)
  {
    id: 'TP-2026-0020',
    trackingNumber: 'ED554433221TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240920', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'REDELIVERY_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'จนท. โทรหาลูกค้า 3 ครั้งเมื่อวานไม่ได้รับสาย วันนี้แอดมินติดต่อประสานได้แล้ว รบกวนเจ้าหน้าที่นำจ่ายใหม่อีกครั้งครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 6,
    assignedCecName: 'CEC 6 (ภาคเหนือตอนล่าง)',
    assignedBranchName: 'ปณ.เมืองนครสวรรค์ (60000)',
    createdAt: hoursAgo(28),
    dispatchedAt: hoursAgo(28),
    bagOpenedAt: '2026-10-05T08:30:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(40),
    retentionDeadline: hoursAhead(88),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-020-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายศักดิ์ชัย (จนท.นำจ่าย ปณ.นครสวรรค์)',
        calledAt: '2026-10-06T10:00:00.000Z',
        phoneNumber: '087-554-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 1 ติดต่อไม่ได้'
      },
      {
        id: 'call-020-2',
        attemptNumber: 2,
        callerRole: 'OFFICER',
        callerName: 'นายศักดิ์ชัย (จนท.นำจ่าย ปณ.นครสวรรค์)',
        calledAt: '2026-10-06T13:30:00.000Z',
        phoneNumber: '087-554-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย',
        note: 'โทรครั้งที่ 2 สายไม่ว่าง'
      },
      {
        id: 'call-020-3',
        attemptNumber: 3,
        callerRole: 'OFFICER',
        callerName: 'นายศักดิ์ชัย (จนท.นำจ่าย ปณ.นครสวรรค์)',
        calledAt: '2026-10-06T16:00:00.000Z',
        phoneNumber: '087-554-XXXX',
        outcome: 'NO_ANSWER',
        outcomeLabel: 'ไม่รับสาย (ครบ 3 ครั้ง)',
        note: 'โทรครบ 3 ครั้ง ส่งเรื่องต่อแอดมินโทรตาม'
      },
      {
        id: 'call-020-4',
        attemptNumber: 4,
        callerRole: 'ADMIN',
        callerName: 'พชร (แอดมิน MyOrder)',
        calledAt: '2026-10-07T08:45:00.000Z',
        phoneNumber: '087-554-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว (แอดมินโทรครั้งที่ 4)',
        note: 'ลูกค้าติดประชุมเมื่อวาน วันนี้นัดหมายรับสินค้าช่วง 14:00 น.'
      }
    ],
    cecReply: {
      answer: 'ปณ.เมืองนครสวรรค์ รับทราบการนัดหมายจากแอดมินแล้ว ได้จัดคิวนำจ่ายพิเศษช่วง 14:00 น. วันนี้เรียบร้อยครับ',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 6 เจ้าหน้าที่ พิสิษฐ์',
      branchNotes: 'ประสานหัวหน้าสายนำจ่ายนครสวรรค์แล้ว'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-20-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'จนท. โทรหาลูกค้า 3 ครั้งเมื่อวานไม่ได้รับสาย วันนี้แอดมินติดต่อประสานได้แล้ว รบกวนเจ้าหน้าที่นำจ่ายใหม่อีกครั้งครับ',
        timestamp: hoursAgo(28)
      },
      {
        id: 'msg-20-2',
        senderRole: 'CEC',
        senderName: 'CEC 6 (พิสิษฐ์)',
        message: 'สาขาจัดรอบนำจ่ายพิเศษ 14:00 น. วันนี้เรียบร้อยครับ',
        timestamp: hoursAgo(1)
      }
    ],
    activityLogs: [
      {
        id: 'log-20-3',
        timestamp: hoursAgo(1),
        actorName: 'พิสิษฐ์ (CEC 6)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'CEC ส่งคำตอบยืนยันการจัดคิวนำจ่ายพิเศษบ่ายนี้'
      },
      {
        id: 'log-20-2',
        timestamp: hoursAgo(2),
        actorName: 'พชร (แอดมิน MyOrder)',
        actorRole: 'MYORDER_ADMIN',
        action: 'บันทึกการโทรติดต่อของแอดมิน (ครั้งที่ 4)',
        details: 'ติดต่อผู้รับสำเร็จ นัดหมายนำจ่ายบ่ายนี้'
      },
      {
        id: 'log-20-1',
        timestamp: hoursAgo(28),
        actorName: 'คุณฟ้า อารียา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอนำจ่ายใหม่',
        details: 'แจ้งปัญหาคำสั่งซื้อ MO-240920'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED554433221TH']
  },

  // 21. RETURN_OR_REVERSE + CENTRAL_CONTACT_BRANCH (ระงับการตีกลับทันเวลา)
  {
    id: 'TP-2026-0021',
    trackingNumber: 'ED445566778TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240921', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'RETURN_OR_REVERSE',
    urgency: 'HIGH',
    customerInquiry: 'ผู้รับเข้าใจผิดคิดว่าไม่ได้สั่ง ขอยกเลิกการตีกลับและนำจ่ายใหม่ด่วนค่ะ ทางร้านประสานลูกค้าเข้าใจแล้ว',
    status: 'CENTRAL_CONTACT_BRANCH',
    assignedCecId: 8,
    assignedCecName: 'CEC 8 (ภาคอีสานตอนบน 2)',
    assignedBranchName: 'ปณ.เมืองสกลนคร (47000)',
    createdAt: hoursAgo(36),
    dispatchedAt: hoursAgo(4),
    bagOpenedAt: '2026-10-04T09:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(20),
    retentionDeadline: hoursAhead(68),
    isSlaExceeded: false,
    branchContactLogs: [
      {
        timestamp: hoursAgo(2),
        branchName: 'ปณ.เมืองสกลนคร',
        officerName: 'นายชาญชัย มิ่งขวัญ (หัวหน้าแผนกนำจ่าย)',
        officerPhone: '042-712-008 ต่อ 101',
        contactReason: 'ร้านค้าร้องขอระงับการส่งคืนสิ่งของด่วน และขอนำจ่ายใหม่',
        outcome: 'โทรระงับการตีกลับทันเวลา พัสดุยังถูกเก็บรักษาอยู่ที่ที่ทำการ นำออกจ่ายรอบบ่ายวันนี้',
        recordedBy: 'คุณนิภา (ปณ.ส่วนกลาง)'
      }
    ],
    chatHistory: [
      {
        id: 'msg-21-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'ผู้รับเข้าใจผิดคิดว่าไม่ได้สั่ง ขอยกเลิกการตีกลับและนำจ่ายใหม่ด่วนค่ะ ทางร้านประสานลูกค้าเข้าใจแล้ว',
        timestamp: hoursAgo(36)
      },
      {
        id: 'msg-21-2',
        senderRole: 'CENTRAL',
        senderName: 'นิภา (ปณ.ส่วนกลาง)',
        message: 'ส่วนกลางโทรประสาน หน.แผนกนำจ่าย ปณ.เมืองสกลนคร ระงับการตีกลับทันเวลา และจัดคิวนำจ่ายบ่ายนี้เรียบร้อยค่ะ',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-21-3',
        timestamp: hoursAgo(2),
        actorName: 'นิภา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'โทรประสานสาขาปลายทางโดยตรง',
        details: 'บันทึก Branch Contact Log: โทรสั่งการระงับการตีกลับ ปณ.สกลนคร ทันเวลา'
      },
      {
        id: 'log-21-2',
        timestamp: hoursAgo(4),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 8',
        details: 'ระบุ CEC 8 จากรหัสไปรษณีย์ 47000'
      },
      {
        id: 'log-21-1',
        timestamp: hoursAgo(36),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอระงับการตีกลับ',
        details: 'ขอยกเลิกการส่งคืนคำสั่งซื้อ MO-240921'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED445566778TH']
  },

  // 22. NOT_RECEIVED + ANSWER_SENT_TO_MERCHANT (ชี้แจงจุดส่งมอบข้างบ้านเรียบร้อย)
  {
    id: 'TP-2026-0022',
    trackingNumber: 'ED334455667TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240922', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'NOT_RECEIVED',
    urgency: 'HIGH',
    customerInquiry: 'ขึ้นสถานะนำจ่ายสำเร็จแต่ลูกค้ายังไม่ได้รับของที่ราชบุรี สอบถามบุรุษไปรษณีย์ว่าส่งให้ใครครับ',
    status: 'ANSWER_SENT_TO_MERCHANT',
    assignedCecId: 11,
    assignedCecName: 'CEC 11 (ภาคตะวันตก)',
    assignedBranchName: 'ปณ.เมืองราชบุรี (70000)',
    createdAt: hoursAgo(32),
    dispatchedAt: hoursAgo(32),
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(16),
    retentionDeadline: hoursAhead(64),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    callAttempts: [
      {
        id: 'call-022-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายสมจิตต์ (จนท.นำจ่าย ปณ.ราชบุรี)',
        calledAt: '2026-10-06T16:00:00.000Z',
        phoneNumber: '082-334-XXXX',
        outcome: 'CONFIRMED_RECEIVED',
        outcomeLabel: 'ส่งมอบเรียบร้อย',
        note: 'เข้าพบผู้รับและชี้จุดส่งมอบที่ฝากไว้กับคุณน้าข้างบ้านเรียบร้อย'
      }
    ],
    cecReply: {
      answer: 'เจ้าหน้าที่นำจ่าย ปณ.ราชบุรี เข้าพบผู้รับและชี้จุดส่งมอบที่ฝากไว้กับคุณน้าข้างบ้าน (ป้านวล) เรียบร้อยแล้ว ผู้รับได้รับของแล้ว',
      repliedAt: hoursAgo(10),
      repliedBy: 'CEC 11 เจ้าหน้าที่ ยงยุทธ'
    },
    centralReview: {
      reviewedAt: hoursAgo(8),
      reviewedBy: 'ปณ.ส่วนกลาง',
      approvedAnswer: 'เจ้าหน้าที่ ปณ.เมืองราชบุรี ประสานงานและส่งมอบพัสดุให้ผู้รับเรียบร้อยแล้ว โดยผู้รับได้รับของจากญาติข้างบ้านตามที่นัดหมายครับ',
      actionTaken: 'APPROVED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-22-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'ขึ้นสถานะนำจ่ายสำเร็จแต่ลูกค้ายังไม่ได้รับของที่ราชบุรี สอบถามบุรุษไปรษณีย์ว่าส่งให้ใครครับ',
        timestamp: hoursAgo(32)
      },
      {
        id: 'msg-22-2',
        senderRole: 'CENTRAL',
        senderName: 'ปณ.ส่วนกลาง',
        message: 'เจ้าหน้าที่ ปณ.เมืองราชบุรี ประสานงานและส่งมอบพัสดุให้ผู้รับเรียบร้อยแล้ว โดยผู้รับได้รับของจากญาติข้างบ้านตามที่นัดหมายครับ',
        timestamp: hoursAgo(8)
      }
    ],
    activityLogs: [
      {
        id: 'log-22-3',
        timestamp: hoursAgo(8),
        actorName: 'ปณ.ส่วนกลาง',
        actorRole: 'CENTRAL',
        action: 'อนุมัติคำตอบและส่งให้ร้านค้า',
        details: 'คำตอบผ่านการตรวจสอบคุณภาพและส่งกลับร้านค้าผ่าน MyOrder แล้ว'
      },
      {
        id: 'log-22-2',
        timestamp: hoursAgo(10),
        actorName: 'ยงยุทธ (CEC 11)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'เจ้าหน้าที่นำจ่ายเข้าชี้แจงกับผู้รับเรียบร้อย'
      },
      {
        id: 'log-22-1',
        timestamp: hoursAgo(32),
        actorName: 'คุณเอกสิทธิ์ ใจงาม (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งปัญหาผู้รับยังไม่ได้ของ',
        details: 'แจ้งปัญหาคำสั่งซื้อ MO-240922'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED334455667TH']
  },

  // 23. EXPEDITE_REQUEST + WAITING_CEC_REPLY (เปิดถุงเช้ามืด กำลังนำจ่าย)
  {
    id: 'TP-2026-0023',
    trackingNumber: 'ED223344556TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240923', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'EXPEDITE_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุอาหารเสริมผู้สูงอายุถึงอุบลราชธานีแล้ว ลูกค้าต้องใช้ด่วน รบกวนช่วยนำจ่ายรอบเช้าวันนี้ด้วยค่ะ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 10,
    assignedCecName: 'CEC 10 (ภาคอีสานตอนล่าง 2)',
    assignedBranchName: 'ปณ.เมืองอุบลราชธานี (34000)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'ปณ.เมืองอุบลราชธานี ได้จัดพัสดุลงสายนำจ่ายด่วนพิเศษรอบเช้าแล้ว บุรุษไปรษณีย์โทรแจ้งผู้รับว่าจะเข้าส่งมอบเวลา 11:30 น. วันนี้ครับ',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 10 เจ้าหน้าที่ สุวิทย์',
      branchNotes: 'ส่งมอบรอบเช้าเรียบร้อย'
    },
    dispatchedAt: hoursAgo(6),
    bagOpenedAt: '2026-10-07T01:30:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(80),
    retentionDeadline: hoursAhead(160),
    isSlaExceeded: false,
    callAttempts: [],
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-23-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'พัสดุอาหารเสริมผู้สูงอายุถึงอุบลราชธานีแล้ว ลูกค้าต้องใช้ด่วน รบกวนช่วยนำจ่ายรอบเช้าวันนี้ด้วยค่ะ',
        timestamp: hoursAgo(6)
      }
    ],
    activityLogs: [
      {
        id: 'log-23-2',
        timestamp: hoursAgo(6),
        actorName: 'ระบบ (Auto-Routing)',
        actorRole: 'CENTRAL',
        action: 'ส่งเคสตรงถึง CEC 10',
        details: 'ระบุ CEC 10 จากรหัสไปรษณีย์ 34000 ให้ตรวจสอบการนำจ่ายกับ ปณ.เมืองอุบลราชธานี'
      },
      {
        id: 'log-23-1',
        timestamp: hoursAgo(6),
        actorName: 'คุณนก ปัทมา (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอเร่งนำส่ง',
        details: 'แจ้งเร่งนำจ่ายคำสั่งซื้อ MO-240923'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED223344556TH']
  },

  // 24. CLOSE_WORK_REQUEST + CLOSED (กทม. ส่งถึงใน 1 วัน พร้อมภาพ POD)
  {
    id: 'TP-2026-0024',
    trackingNumber: 'ED112233445TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240924', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'CLOSE_WORK_REQUEST',
    urgency: 'NORMAL',
    customerInquiry: 'สายชาร์จส่งไปดอนเมือง ลูกค้าแจ้งได้รับของแล้วเรียบร้อย ตรวจสอบปิดงานให้ด้วยครับ',
    status: 'CLOSED',
    assignedCecId: 1,
    assignedCecName: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    assignedBranchName: 'ปณ.ดอนเมือง (10210)',
    createdAt: hoursAgo(24),
    dispatchedAt: hoursAgo(24),
    bagOpenedAt: '2026-10-06T08:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(48),
    retentionDeadline: hoursAhead(96),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    closeVerification: {
      verifiedAt: hoursAgo(6),
      verifiedBy: 'นิภา (ปณ.ส่วนกลาง)',
      verifiedRole: 'CENTRAL',
      category: 'CLOSE_WORK_REQUEST',
      centralStatusChecked: true,
      centralStatusText: '501 - นำจ่ายสำเร็จ',
      hasProofEvidence: true,
      proofPhotoUrl: POD_SAMPLE_IMAGE,
      recipientPhoneConfirmed: true,
      resolutionNotes: 'ตรวจสอบหลักฐาน POD และสถานะ 501 นำจ่ายสำเร็จเรียบร้อย',
      replySentToMerchant: 'พัสดุ ED112233445TH นำจ่ายสำเร็จเรียบร้อย มีภาพลายเซ็นผู้รับตัวจริง ตรวจสอบปิดงานเรียบร้อยครับ'
    },
    centralReview: {
      reviewedAt: hoursAgo(6),
      reviewedBy: 'นิภา (ปณ.ส่วนกลาง)',
      approvedAnswer: 'พัสดุ ED112233445TH นำจ่ายสำเร็จเรียบร้อย มีภาพลายเซ็นผู้รับตัวจริง ตรวจสอบปิดงานเรียบร้อยครับ',
      actionTaken: 'APPROVED'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-24-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'สายชาร์จส่งไปดอนเมือง ลูกค้าแจ้งได้รับของแล้วเรียบร้อย ตรวจสอบปิดงานให้ด้วยครับ',
        timestamp: hoursAgo(24)
      },
      {
        id: 'msg-24-2',
        senderRole: 'CENTRAL',
        senderName: 'นิภา (ปณ.ส่วนกลาง)',
        message: 'ตรวจสอบสถานะนำจ่ายสำเร็จและหลักฐาน POD เรียบร้อย ปิดเคสในระบบให้แล้วค่ะ',
        timestamp: hoursAgo(6)
      }
    ],
    activityLogs: [
      {
        id: 'log-24-3',
        timestamp: hoursAgo(6),
        actorName: 'นิภา (ปณ.ส่วนกลาง)',
        actorRole: 'CENTRAL',
        action: 'ปิดเคส (CLOSED)',
        details: 'ปิดเคสสมบูรณ์: ยืนยันสถานะ 501 พร้อมรูปหลักฐาน POD'
      },
      {
        id: 'log-24-2',
        timestamp: hoursAgo(10),
        actorName: 'CEC 1 (ดอนเมือง)',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบพร้อมรูปภาพ POD',
        details: 'ยืนยันนำจ่ายสำเร็จ ผู้รับลงชื่อรับด้วยตนเอง'
      },
      {
        id: 'log-24-1',
        timestamp: hoursAgo(24),
        actorName: 'คุณต้น ภาณุ (MyOrder)',
        actorRole: 'MERCHANT',
        action: 'ร้านค้าแจ้งขอปิดงาน',
        details: 'แจ้งขอปิดงานคำสั่งซื้อ MO-240924'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED112233445TH']
  },

  // ==========================================
  // เคสรอตรวจคำตอบเพิ่มเติม (WAITING_CENTRAL_REVIEW: TP-2026-0105 ถึง TP-2026-0110)
  // ==========================================
  {
    id: 'TP-2026-0105',
    trackingNumber: 'ED887711221TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240951', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'EXPEDITE_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าต้องการใช้เมาส์เกมมิ่งด่วนวันนี้ รบกวนเจ้าหน้าที่ตรวจสอบรอบนำจ่ายและเร่งส่งมอบให้ด้วยครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 7,
    assignedCecName: 'CEC 7 (ภาคอีสานตอนบน 1)',
    assignedBranchName: 'ปณ.เมืองขอนแก่น (40000)',
    createdAt: hoursAgo(2),
    dispatchedAt: hoursAgo(2),
    bagOpenedAt: '2026-10-06T08:30:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(48),
    retentionDeadline: hoursAhead(96),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['ED882194821TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [
      {
        id: 'call-105-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายธีระ (จนท.นำจ่าย ปณ.ขอนแก่น)',
        calledAt: '2026-10-07T09:15:00.000Z',
        phoneNumber: '081-772-XXXX',
        outcome: 'CONFIRMED_RECEIVED',
        outcomeLabel: 'โทรยืนยันแล้ว: ได้รับพัสดุจริง',
        note: 'ผู้รับได้รับสินค้าเรียบร้อยหน้าบ้าน'
      }
    ],
    cecReply: {
      answer: 'CEC 7 ตรวจสอบกับ ปณ.เมืองขอนแก่น เจ้าหน้าที่นำจ่ายส่งมอบสินค้าถึงมือคุณต้นเรียบร้อยเมื่อ 10:15 น. มีรูปถ่ายและลายเซ็นสมบูรณ์ในระบบ QMS ขอส่งผลให้ส่วนกลางอนุมัติแจ้งปิดงาน',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 7 เจ้าหน้าที่ อนันต์ ก.',
      branchNotes: 'ส่งมอบสำเร็จ ลายเซ็นตรงกับผู้รับ'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-105-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'ลูกค้าต้องการใช้เมาส์เกมมิ่งด่วนวันนี้ รบกวนเจ้าหน้าที่ตรวจสอบรอบนำจ่ายและเร่งส่งมอบให้ด้วยครับ',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-105-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 7',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'นำจ่ายสำเร็จ มีรูปถ่าย POD รอส่วนกลางตรวจสอบ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED882194821TH']!
  },
  {
    id: 'TP-2026-0106',
    trackingNumber: 'ED887711222TH',
    companyName: 'Beauty Box by Fah',
    contactPerson: 'คุณฟ้า อารียา',
    myOrderRef: { orderId: 'MO-240952', shopId: 'SHOP-04', shopName: 'Beauty Box by Fah' },
    category: 'CLOSE_WORK_REQUEST',
    urgency: 'NORMAL',
    customerInquiry: 'ลูกค้าแจ้งได้รับเซรั่มบำรุงผิวเรียบร้อยแล้วเมื่อวานเย็น แต่สถานะในระบบยังขึ้นออกนำจ่าย รบกวนตรวจสอบปิดงานให้หน่อยค่ะ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 1,
    assignedCecName: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    assignedBranchName: 'ปณ.ลาดพร้าว (10310)',
    createdAt: hoursAgo(3),
    dispatchedAt: hoursAgo(3),
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(24),
    retentionDeadline: hoursAhead(72),
    isSlaExceeded: false,
    deliveryProofPhotoUrl: KNOWN_PARCELS['ED901234561TH']?.deliveryProofPhotoUrl,
    recipientConfirmedReceived: true,
    callAttempts: [],
    cecReply: {
      answer: 'ปณ.ลาดพร้าว ตรวจสอบแล้ว บุรุษไปรษณีย์นำจ่ายเรียบร้อยเมื่อ 06/10 เวลา 16:30 น. แต่ระบบสื่อสารขัดข้องทำให้สแกนปิดสถานะล่าช้า ขณะนี้ยิงสถานะ 501 เข้าระบบ QMS เรียบร้อยแล้ว ขออนุมัติปิดเคส',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 1 เจ้าหน้าที่ วารุณี',
      branchNotes: 'ยิงสถานะ 501 อัปเดตเข้าระบบกลางเรียบร้อย'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-106-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณฟ้า อารียา (Beauty Box by Fah)',
        message: 'ลูกค้าแจ้งได้รับเซรั่มบำรุงผิวเรียบร้อยแล้วเมื่อวานเย็น แต่สถานะในระบบยังขึ้นออกนำจ่าย รบกวนตรวจสอบปิดงานให้หน่อยค่ะ',
        timestamp: hoursAgo(3)
      }
    ],
    activityLogs: [
      {
        id: 'log-106-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 1',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'อัปเดตสถานะ 501 ในระบบเรียบร้อย รอส่วนกลางอนุมัติ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234561TH']!
  },
  {
    id: 'TP-2026-0107',
    trackingNumber: 'ED887711223TH',
    companyName: 'HomeLiving Deco',
    contactPerson: 'คุณเอกสิทธิ์ ใจงาม',
    myOrderRef: { orderId: 'MO-240953', shopId: 'SHOP-05', shopName: 'HomeLiving Deco' },
    category: 'REDELIVERY_REQUEST',
    urgency: 'HIGH',
    customerInquiry: 'ลูกค้าแจ้งว่าเมื่อวานติดธุระด่วน วันนี้อยู่บ้านทั้งวัน รบกวนนำจ่ายใหม่ช่วงบ่ายวันนี้ด้วยครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 3,
    assignedCecName: 'CEC 3 (ภาคกลาง & ตะวันตก)',
    assignedBranchName: 'ปณ.พระนครศรีอยุธยา (13000)',
    createdAt: hoursAgo(4),
    dispatchedAt: hoursAgo(4),
    bagOpenedAt: '2026-10-05T08:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(20),
    retentionDeadline: hoursAhead(68),
    isSlaExceeded: false,
    callAttempts: [
      {
        id: 'call-107-1',
        attemptNumber: 1,
        callerRole: 'OFFICER',
        callerName: 'นายวิเชียร (จนท.นำจ่าย ปณ.อยุธยา)',
        calledAt: '2026-10-07T09:00:00.000Z',
        phoneNumber: '084-551-XXXX',
        outcome: 'ANSWERED',
        outcomeLabel: 'รับสายแล้ว',
        note: 'โทรนัดหมายส่งรอบบ่าย 13:00-14:30 น. ผู้รับยืนยันอยู่บ้าน'
      }
    ],
    cecReply: {
      answer: 'ปณ.พระนครศรีอยุธยา ได้โทรประสานผู้รับเรียบร้อยแล้ว นัดหมายนำจ่ายรอบบ่ายวันนี้ (13:00-14:30 น.) จัดลงสายส่งเรียบร้อยแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 3 เจ้าหน้าที่ อรอนงค์',
      branchNotes: 'ผู้รับรับสายยืนยันนัดหมายรอบบ่าย'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-107-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณเอกสิทธิ์ ใจงาม (HomeLiving Deco)',
        message: 'ลูกค้าแจ้งว่าเมื่อวานติดธุระด่วน วันนี้อยู่บ้านทั้งวัน รบกวนนำจ่ายใหม่ช่วงบ่ายวันนี้ด้วยครับ',
        timestamp: hoursAgo(4)
      }
    ],
    activityLogs: [
      {
        id: 'log-107-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 3',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'นัดหมายนำจ่ายใหม่รอบบ่ายเรียบร้อย รอส่วนกลางตรวจสอบ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234562TH']!
  },
  {
    id: 'TP-2026-0108',
    trackingNumber: 'ED887711224TH',
    companyName: 'ร้านผ้าไหมบ้านครูสมศรี',
    contactPerson: 'ครูสมศรี ทองสุข',
    myOrderRef: { orderId: 'MO-240954', shopId: 'SHOP-01', shopName: 'ร้านผ้าไหมบ้านครูสมศรี' },
    category: 'RETURN_OR_REVERSE',
    urgency: 'HIGH',
    customerInquiry: 'ผ้าไหมผืนงามถูกคีย์ส่งคืนต้นทางผิดพลาด ผู้รับยืนยันว่าพร้อมรับของและโอนเงินแล้ว ขอถอยสถานะนำจ่ายด่วนค่ะ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 3,
    assignedCecName: 'CEC 3 (ภาคกลาง & ตะวันตก)',
    assignedBranchName: 'ปณ.นครปฐม (73000)',
    createdAt: hoursAgo(2),
    dispatchedAt: hoursAgo(2),
    bagOpenedAt: '2026-10-05T10:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(26),
    retentionDeadline: hoursAhead(74),
    isSlaExceeded: false,
    callAttempts: [],
    cecReply: {
      answer: 'ปณ.นครปฐม ตรวจสอบและดักจับพัสดุได้ทันเวลา พัสดุยังไม่ได้ถูกส่งออก ได้ทำการถอยสถานะในระบบกลับเป็นรอการนำจ่ายแล้ว และจะนำออกส่งรอบวันนี้',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 3 เจ้าหน้าที่ ประทีป',
      branchNotes: 'ถอยสถานะตีกลับสำเร็จ พัสดุอยู่ที่โต๊ะนำจ่ายสาย 2'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-108-1',
        senderRole: 'CUSTOMER',
        senderName: 'ครูสมศรี ทองสุข (ร้านผ้าไหมบ้านครูสมศรี)',
        message: 'ผ้าไหมผืนงามถูกคีย์ส่งคืนต้นทางผิดพลาด ผู้รับยืนยันว่าพร้อมรับของและโอนเงินแล้ว ขอถอยสถานะนำจ่ายด่วนค่ะ',
        timestamp: hoursAgo(2)
      }
    ],
    activityLogs: [
      {
        id: 'log-108-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 3',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'ถอยสถานะตีกลับสำเร็จ รอส่วนกลางตรวจสอบ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234563TH']!
  },
  {
    id: 'TP-2026-0109',
    trackingNumber: 'ED887711225TH',
    companyName: 'Healthy Snack by Nok',
    contactPerson: 'คุณนก ปัทมา',
    myOrderRef: { orderId: 'MO-240955', shopId: 'SHOP-02', shopName: 'Healthy Snack by Nok' },
    category: 'DAMAGED_PARCEL',
    urgency: 'HIGH',
    customerInquiry: 'กล่องผลไม้อบกรอบถูกทับแบน สินค้าแตกละเอียด ขอคำแนะนำและเอกสาร ปณ.14 เพื่อทำเรื่องเคลมค่ะ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 2,
    assignedCecName: 'CEC 2 (กรุงเทพฯ ตอนใต้ & สมุทรปราการ)',
    assignedBranchName: 'ปณ.สมุทรสาคร (74000)',
    createdAt: hoursAgo(5),
    dispatchedAt: hoursAgo(5),
    bagOpenedAt: '2026-10-05T08:00:00.000Z',
    slaRouteType: 'SAME_REGION_OR_BKK',
    slaTargetDays: 3,
    slaDeadline: hoursAhead(20),
    retentionDeadline: hoursAhead(68),
    isSlaExceeded: false,
    callAttempts: [],
    cecReply: {
      answer: 'ปณ.สมุทรสาคร ออกบันทึกตรวจรับสิ่งของชำรุด ปณ.14 รับรองความเสียหายเนื่องจากถูกพัสดุชิ้นใหญ่ทับระหว่างขนส่ง ร้านค้าสามารถใช้ใบ ปณ.14 นี้ยื่นขอรับเงินชดใช้ที่ ปณ.ต้นทาง ได้เต็มวงเงิน',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 2 เจ้าหน้าที่ ชัยวัฒน์',
      branchNotes: 'ออกใบ ปณ.14 เลขที่ 44/2569 แนบในระบบสมบูรณ์'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-109-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณนก ปัทมา (Healthy Snack by Nok)',
        message: 'กล่องผลไม้อบกรอบถูกทับแบน สินค้าแตกละเอียด ขอคำแนะนำและเอกสาร ปณ.14 เพื่อทำเรื่องเคลมค่ะ',
        timestamp: hoursAgo(5)
      }
    ],
    activityLogs: [
      {
        id: 'log-109-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 2',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'ออกใบ ปณ.14 รับรองชดใช้ค่าเสียหาย รอส่วนกลางอนุมัติ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED901234564TH']!
  },
  {
    id: 'TP-2026-0110',
    trackingNumber: 'ED887711226TH',
    companyName: 'Gadget Corner BKK',
    contactPerson: 'คุณต้น ภาณุ',
    myOrderRef: { orderId: 'MO-240956', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },
    category: 'DELAYED_DELIVERY',
    urgency: 'HIGH',
    customerInquiry: 'พัสดุการ์ดจอค้างที่ศูนย์คัดแยกเด่นชัย 3 วัน ไม่มีความเคลื่อนไหว ช่วยติดตามค้นหาด่วนครับ',
    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 6,
    assignedCecName: 'CEC 6 (ภาคเหนือตอนล่าง)',
    assignedBranchName: 'ปณ.เด่นชัย (54110)',
    createdAt: hoursAgo(3),
    dispatchedAt: hoursAgo(3),
    bagOpenedAt: '2026-10-04T08:00:00.000Z',
    slaRouteType: 'CROSS_PROVINCE',
    slaTargetDays: 5,
    slaDeadline: hoursAhead(24),
    retentionDeadline: hoursAhead(72),
    isSlaExceeded: false,
    callAttempts: [],
    cecReply: {
      answer: 'CEC 6 ประสาน ศป.เด่นชัย ค้นหาถุงเมล์ตกค้างพบแล้ว สาเหตุเนื่องจากสติกเกอร์บาร์โค้ดเปื้อนสี ได้ทำการพิมพ์บาร์โค้ดใหม่และส่งต่อขึ้นรถเมล์เที่ยวเช้าไปยัง ปณ.เชียงราย เรียบร้อยแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 6 เจ้าหน้าที่ ทวีศักดิ์',
      branchNotes: 'พัสดุขึ้นรถเมล์ทะเบียน 70-1122 ไปเชียงรายแล้ว'
    },
    branchContactLogs: [],
    chatHistory: [
      {
        id: 'msg-110-1',
        senderRole: 'CUSTOMER',
        senderName: 'คุณต้น ภาณุ (Gadget Corner BKK)',
        message: 'พัสดุการ์ดจอค้างที่ศูนย์คัดแยกเด่นชัย 3 วัน ไม่มีความเคลื่อนไหว ช่วยติดตามค้นหาด่วนครับ',
        timestamp: hoursAgo(3)
      }
    ],
    activityLogs: [
      {
        id: 'log-110-1',
        timestamp: hoursAgo(1),
        actorName: 'CEC 6',
        actorRole: 'CEC',
        action: 'CEC ส่งคำตอบ',
        details: 'ค้นพบพัสดุตกหล่นและส่งต่อเรียบร้อย รอส่วนกลางตรวจสอบ'
      }
    ],
    parcelInfo: KNOWN_PARCELS['ED776512349TH']!
  },
];

// Parcels that are already out for delivery carry their delivery officer, as QMS would report it
// Seed cases get the same QMS destination check new cases get
export const INITIAL_CASES: CaseItem[] = SEED_CASES.map(c => {
  const parcelInfo = withDeliveryStaff(c.parcelInfo);
  const office = findPostOffice(parcelInfo.destZipCode);
  const cec = cecForRecipient(parcelInfo);
  const routingAlert = c.status === 'CLOSED' ? undefined : detectRoutingAlert(parcelInfo, cec?.id, c.createdAt);
  const normalized: CaseItem = {
    ...c, parcelInfo, routingAlert,
    creationSource: 'MERCHANT', shipmentId: shipmentKey(c.myOrderRef, c.trackingNumber), parcelCycleVerified: true,
    deliveryDisputed: c.category === 'NOT_RECEIVED', merchantEngaged: true,
    assignedCecId: cec?.id,
    assignedCecName: cec?.name,
    assignedBranchCode: office?.code,
    assignedBranchName: office ? `ปณ.${office.name}` : undefined
  };
  return c.status === 'ANSWER_SENT_TO_MERCHANT' && c.centralReview
    ? sendResolution(normalized, defaultClosureSettings(), c.centralReview.reviewedAt)
    : normalized;
});
