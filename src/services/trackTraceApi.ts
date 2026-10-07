import type { ParcelInfo, TrackingEvent } from '../types/case';
import { eventStamp, formatEventTimestamp } from '../data/demoClock';

export const POD_SAMPLE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f1f5f9'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='2'/><rect x='40' y='40' width='320' height='160' rx='6' fill='%23e2e8f0'/><text x='200' y='125' font-family='sans-serif' font-size='15' font-weight='bold' fill='%23475569' text-anchor='middle'>📦 ภาพถ่ายหลักฐานการจัดส่ง (POD)</text><text x='200' y='150' font-family='sans-serif' font-size='12' fill='%2364748b' text-anchor='middle'>ส่งมอบพัสดุหน้าประตูบ้าน / ผู้รับรับมอบ</text><text x='45' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='%230f172a'>พัสดุ: ไปรษณีย์ไทย EMS</text><text x='45' y='250' font-family='sans-serif' font-size='11' fill='%2316a34a'>✓ บันทึกพิกัด GPS &amp; วันที่นำจ่ายสำเร็จ</text></svg>";

export const KNOWN_PARCELS: Record<string, ParcelInfo> = {
  // 1. เคสตัวอย่างที่ 1: แจ้งปิดงาน (ปลายทางได้รับแล้วแต่สถานะยังไม่สำเร็จ)
  'ED901234561TH': {
    trackingNumber: 'ED901234561TH',
    originPostOffice: 'ปณ.บางซื่อ (10800)',
    originZipCode: '10800',
    destPostOffice: 'ปณ.สันกำแพง จ.เชียงใหม่ (50130)',
    destZipCode: '50130',
    senderName: 'Beauty Box by Fah (MyOrder)',
    receiverName: 'คุณกิตติศักดิ์ ชัยมงคล',
    receiverPhone: '081-992-XXXX',
    receiverAddress: '88/12 ต.ต้นเปา อ.สันกำแพง จ.เชียงใหม่ 50130',
    currentPostalStatus: '501 - นำจ่ายสำเร็จ',
    currentStatusCode: '501',
    signerName: 'กิตติศักดิ์ (ผู้รับโดยตรง)',
    weightKg: 1.20,
    bagOpenedAt: '2026-10-03T10:30:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    recipientConfirmedAt: '2026-10-05T14:20:00.000Z',
    events: [
      { timestamp: '2026-10-02 09:15:00', statusCode: '103', status: 'รับฝาก', location: 'ปณ.บางซื่อ', description: 'รับฝากเข้าระบบ EMS' },
      { timestamp: '2026-10-02 21:00:00', statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.EMS', description: 'ส่งต่อไปยัง ศป.เด่นชัย' },
      { timestamp: '2026-10-03 10:30:00', statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ศป.เด่นชัย', description: 'เปิดถุงและคัดแยกส่งต่อไปยังที่ทำการปลายทาง', isBagOpenEvent: true },
      { timestamp: '2026-10-04 08:30:00', statusCode: '206', status: 'ถึงที่ทำการไปรษณีย์', location: 'ปณ.สันกำแพง', description: 'สิ่งของถึงที่ทำการปลายทาง รอนำจ่าย' },
      { timestamp: '2026-10-05 11:45:00', statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.สันกำแพง', description: 'ผู้รับลงนามรับพัสดุเรียบร้อย', recipientOrSigner: 'กิตติศักดิ์' }
    ]
  },

  // 2. เคสตัวอย่างที่ 2: เร่งนำจ่ายใหม่อีกครั้ง / นำจ่ายใหม่ (ร้านค้าแจ้งผู้รับยังไม่ได้รับการติดต่อ)
  'ED901234562TH': {
    trackingNumber: 'ED901234562TH',
    originPostOffice: 'ปณ.คลองจั่น (10240)',
    originZipCode: '10240',
    destPostOffice: 'ปณ.เมืองขอนแก่น (40000)',
    destZipCode: '40000',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'คุณธวัชชัย รัตนวงศ์',
    receiverPhone: '089-881-XXXX',
    receiverAddress: '159 ถ.รื่นรมย์ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    currentPostalStatus: '401 - นำจ่ายไม่สำเร็จ (รอนำจ่ายใหม่)',
    currentStatusCode: '401',
    signerName: undefined,
    weightKg: 2.10,
    bagOpenedAt: '2026-10-04T09:00:00.000Z',
    events: [
      { timestamp: '2026-10-03 14:00:00', statusCode: '103', status: 'รับฝาก', location: 'ปณ.คลองจั่น', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-10-04 09:00:00', statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ศป.ขอนแก่น', description: 'เปิดถุงคัดแยกส่งต่อไป ปณ.เมืองขอนแก่น', isBagOpenEvent: true },
      { timestamp: '2026-10-05 08:30:00', statusCode: '301', status: 'อยู่ระหว่างการนำจ่าย', location: 'ปณ.เมืองขอนแก่น', description: 'เจ้าหน้าที่เตรียมการนำจ่าย' },
      { timestamp: '2026-10-05 16:30:00', statusCode: '304', status: 'เจ้าหน้าที่ติดต่อผู้รับไม่ได้', location: 'ปณ.เมืองขอนแก่น', description: 'โทรติดต่อ 3 ครั้งไม่รับสาย' },
      { timestamp: '2026-10-05 17:00:00', statusCode: '401', status: 'นำจ่ายไม่สำเร็จ', location: 'ปณ.เมืองขอนแก่น', description: 'นำจ่ายไม่สำเร็จ: เจ้าหน้าที่ติดต่อผู้รับไม่ได้' }
    ]
  },

  // 3. เคสตัวอย่างที่ 3: แจ้งตีกลับ / ถอยสถานะตีกลับและแจ้งนำส่งใหม่
  'ED901234563TH': {
    trackingNumber: 'ED901234563TH',
    originPostOffice: 'ปณ.สำเหร่ (10600)',
    originZipCode: '10600',
    destPostOffice: 'ปณ.หาดใหญ่ จ.สงขลา (90110)',
    destZipCode: '90110',
    senderName: 'HomeLiving Deco (MyOrder)',
    receiverName: 'คุณนพดล สุวรรณมาศ',
    receiverPhone: '085-321-XXXX',
    receiverAddress: '45/8 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
    currentPostalStatus: '203 - ส่งคืนต้นทาง',
    currentStatusCode: '203',
    signerName: undefined,
    weightKg: 3.50,
    bagOpenedAt: '2026-10-03T11:00:00.000Z',
    events: [
      { timestamp: '2026-10-01 10:00:00', statusCode: '103', status: 'รับฝาก', location: 'ปณ.สำเหร่', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-10-03 11:00:00', statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ศป.หาดใหญ่', description: 'เปิดถุงและค้างระหว่างส่งต่อ', isBagOpenEvent: true },
      { timestamp: '2026-10-07 08:15:00', statusCode: '203', status: 'ส่งคืนต้นทาง', location: 'ศป.หาดใหญ่', description: 'ส่งคืนต้นทางโดยยังไม่มีการนำจ่าย (ขอตรวจสอบถอยสถานะ)' }
    ]
  },

  // 4. เคสตัวอย่างที่ 4: ขอเร่งนำส่ง (จนท.ลงสถานะปฏิเสธรับ ผู้รับยืนยันไม่ได้ปฏิเสธรับ)
  'ED901234564TH': {
    trackingNumber: 'ED901234564TH',
    originPostOffice: 'ปณ.ลำลูกกา (12150)',
    originZipCode: '12150',
    destPostOffice: 'ปณ.เมืองนครราชสีมา (30000)',
    destZipCode: '30000',
    senderName: 'Healthy Snack by Nok (MyOrder)',
    receiverName: 'คุณวิมลวรรณ บุญครอง',
    receiverPhone: '086-778-XXXX',
    receiverAddress: '12/4 ถ.จอมพล ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000',
    currentPostalStatus: '401 - นำจ่ายไม่สำเร็จ (ระบุผู้รับปฏิเสธรับ)',
    currentStatusCode: '401',
    signerName: undefined,
    weightKg: 1.80,
    bagOpenedAt: '2026-10-04T12:00:00.000Z',
    events: [
      { timestamp: '2026-10-03 11:00:00', statusCode: '103', status: 'รับฝาก', location: 'ปณ.ลำลูกกา', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-10-04 12:00:00', statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ศป.นครราชสีมา', description: 'เปิดถุงคัดแยกส่งต่อ', isBagOpenEvent: true },
      { timestamp: '2026-10-06 14:00:00', statusCode: '301', status: 'อยู่ระหว่างการนำจ่าย', location: 'ปณ.เมืองนครราชสีมา', description: 'เจ้าหน้าที่ออกนำจ่าย' },
      { timestamp: '2026-10-06 15:30:00', statusCode: '401', status: 'นำจ่ายไม่สำเร็จ', location: 'ปณ.เมืองนครราชสีมา', description: 'นำจ่ายไม่สำเร็จ: ลงบันทึกว่าผู้รับปฏิเสธรับ' }
    ]
  },

  'ED882194821TH': {
    trackingNumber: 'ED882194821TH',
    originPostOffice: 'ปณ.บางซื่อ (10800)',
    originZipCode: '10800',
    destPostOffice: 'ปณ.สันกำแพง จ.เชียงใหม่ (50130)',
    destZipCode: '50130',
    senderName: 'Beauty Box by Fah (MyOrder)',
    receiverName: 'คุณพัชราภรณ์ วงศ์สว่าง',
    receiverPhone: '081-445-XXXX',
    receiverAddress: '128/4 หมู่ 3 ต.บวกค้าง อ.สันกำแพง จ.เชียงใหม่ 50130',
    currentPostalStatus: '501 - นำจ่ายสำเร็จแล้ว (ลงชื่อแทน)',
    currentStatusCode: '501',
    signerName: 'สมศรี (รปภ. นิติบุคคล)',
    weightKg: 1.45,
    bagOpenedAt: '2026-10-04T08:30:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    recipientConfirmedAt: '2026-10-05T15:00:00.000Z',
    events: [
      {
        timestamp: eventStamp(73.74),
        statusCode: '103',
        status: 'รับฝาก',
        location: 'ปณ.บางซื่อ',
        description: 'รับฝากเข้าระบบเรียบร้อยแล้ว'
      },
      {
        timestamp: eventStamp(64.5),
        statusCode: '201',
        status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์',
        location: 'ศป.EMS (กรุงเทพฯ)',
        description: 'สิ่งของออกจากศูนย์คัดแยก มุ่งหน้า ศป.เด่นชัย'
      },
      {
        timestamp: eventStamp(51.25),
        statusCode: '220',
        status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
        location: 'ศป.เด่นชัย',
        description: 'สิ่งของถึงศูนย์คัดแยกปลายทาง เปิดถุงเพื่อนำจ่าย',
        isBagOpenEvent: true
      },
      {
        timestamp: eventStamp(47.66),
        statusCode: '301',
        status: 'อยู่ระหว่างการนำจ่าย',
        location: 'ปณ.สันกำแพง',
        description: 'เจ้าหน้าที่นำจ่าย นายสมพงษ์ นำส่งมอบ'
      },
      {
        timestamp: eventStamp(43.33),
        statusCode: '501',
        status: 'นำจ่ายสำเร็จ',
        location: 'ปณ.สันกำแพง',
        description: 'นำจ่ายสำเร็จ ผู้รับลงชื่อแทน: สมศรี (รปภ.)',
        recipientOrSigner: 'สมศรี (รปภ. นิติบุคคล)'
      }
    ]
  },
  'ED776512349TH': {
    trackingNumber: 'ED776512349TH',
    originPostOffice: 'ปณ.สำเหร่ (10600)',
    originZipCode: '10600',
    destPostOffice: 'ปณ.หาดใหญ่ จ.สงขลา (90110)',
    destZipCode: '90110',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'นายธนาธิป เจริญกิจ',
    receiverPhone: '089-771-XXXX',
    receiverAddress: '45/12 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
    currentPostalStatus: '401 - นำจ่ายไม่สำเร็จ (บ้านปิด / รอนำจ่ายใหม่)',
    currentStatusCode: '401',
    signerName: undefined,
    weightKg: 3.20,
    bagOpenedAt: '2026-10-03T14:00:00.000Z',
    events: [
      {
        timestamp: eventStamp(121),
        statusCode: '103',
        status: 'รับฝาก',
        location: 'ปณ.สำเหร่',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: eventStamp(110.83),
        statusCode: '201',
        status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์',
        location: 'ศป.EMS',
        description: 'ส่งต่อไปยัง ศป.หาดใหญ่'
      },
      {
        timestamp: eventStamp(92.67),
        statusCode: '220',
        status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
        location: 'ศป.หาดใหญ่',
        description: 'เปิดถุงและคัดแยกส่งมอบที่ทำการปลายทาง',
        isBagOpenEvent: true
      },
      {
        timestamp: eventStamp(73.5),
        statusCode: '301',
        status: 'อยู่ระหว่างการนำจ่าย',
        location: 'ปณ.หาดใหญ่',
        description: 'เตรียมการนำจ่าย'
      },
      {
        timestamp: eventStamp(70.0),
        statusCode: '304',
        status: 'เจ้าหน้าที่ติดต่อผู้รับไม่ได้',
        location: 'ปณ.หาดใหญ่',
        description: 'โทรติดต่อผู้รับ 3 ครั้งไม่มีผู้รับสาย'
      },
      {
        timestamp: eventStamp(68.0),
        statusCode: '401',
        status: 'นำจ่ายไม่สำเร็จ',
        location: 'ปณ.หาดใหญ่',
        description: 'นำจ่ายไม่สำเร็จ: บ้านปิด'
      }
    ]
  },
  'ED993812745TH': {
    trackingNumber: 'ED993812745TH',
    originPostOffice: 'ปณ.มีนบุรี (10510)',
    originZipCode: '10510',
    destPostOffice: 'ปณ.เมืองขอนแก่น (40000)',
    destZipCode: '40000',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'ศ.ดร. นันทวัน รัตนโกสินทร์',
    receiverPhone: '086-123-XXXX',
    receiverAddress: '123/9 ม.ขอนแก่น ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    currentPostalStatus: '220 - ถึงที่ทำการ/ศูนย์ไปรษณีย์ (แก้ไขเส้นทางถึง ศป.ขอนแก่น)',
    currentStatusCode: '220',
    signerName: undefined,
    weightKg: 0.85,
    bagOpenedAt: '2026-10-06T08:00:00.000Z',
    events: [
      {
        timestamp: eventStamp(92.83),
        statusCode: '103',
        status: 'รับฝาก',
        location: 'ปณ.มีนบุรี',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: eventStamp(80.33),
        statusCode: '201',
        status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์',
        location: 'ศป.อุดรธานี',
        description: 'พบพัสดุคัดแยกผิดสาย ส่งต่อกลับ ศป.ขอนแก่น'
      },
      {
        timestamp: eventStamp(6),
        statusCode: '220',
        status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
        location: 'ศป.ขอนแก่น',
        description: 'แก้ไขเส้นทางเรียบร้อย สิ่งของถึงศูนย์คัดแยกปลายทาง เปิดถุงเพื่อนำจ่าย',
        isBagOpenEvent: true
      }
    ]
  },
  'EF123984512TH': {
    trackingNumber: 'EF123984512TH',
    originPostOffice: 'ปณ.ลาดพร้าว (10310)',
    originZipCode: '10310',
    destPostOffice: 'ปณ.เมืองภูเก็ต (83000)',
    destZipCode: '83000',
    senderName: 'Beauty Box by Fah (MyOrder)',
    receiverName: 'คุณกัญญารัตน์ มรกต',
    receiverPhone: '082-998-XXXX',
    receiverAddress: '78/2 ถ.พังงา ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000',
    currentPostalStatus: '220 - ถึงที่ทำการ/ศูนย์ไปรษณีย์ (พบชำรุดเสียหาย ณ ศูนย์คัดแยก)',
    currentStatusCode: '220',
    signerName: undefined,
    weightKg: 0.65,
    bagOpenedAt: '2026-10-03T11:00:00.000Z',
    events: [
      {
        timestamp: eventStamp(144),
        statusCode: '103',
        status: 'รับฝาก',
        location: 'ปณ.ลาดพร้าว',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: eventStamp(114.67),
        statusCode: '220',
        status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
        location: 'ศป.ภูเก็ต',
        description: 'พบกล่องพัสดุยับเยิน มีคราบของเหลวซึม กำลังทำบันทึกความเสียหาย',
        isBagOpenEvent: true
      }
    ]
  },
  'ED551029384TH': {
    trackingNumber: 'ED551029384TH',
    originPostOffice: 'ปณ.บางพลี (10540)',
    originZipCode: '10540',
    destPostOffice: 'ปณ.เมืองชลบุรี (20000)',
    destZipCode: '20000',
    senderName: 'HomeLiving Deco (MyOrder)',
    receiverName: 'วิชัย การช่าง',
    receiverPhone: '085-334-XXXX',
    receiverAddress: '88/5 หมู่ 2 ต.เสม็ด อ.เมืองชลบุรี จ.ชลบุรี 20000',
    currentPostalStatus: '501 - นำจ่ายสำเร็จ',
    currentStatusCode: '501',
    signerName: 'วิชัย (ผู้รับโดยตรง)',
    weightKg: 4.8,
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    recipientConfirmedAt: '2026-10-06T10:00:00.000Z',
    events: [
      {
        timestamp: eventStamp(26),
        statusCode: '103',
        status: 'รับฝาก',
        location: 'ปณ.บางพลี',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: eventStamp(21),
        statusCode: '220',
        status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
        location: 'ปณ.เมืองชลบุรี',
        description: 'เปิดถุงและรอนำจ่าย',
        isBagOpenEvent: true
      },
      {
        timestamp: eventStamp(18.5),
        statusCode: '501',
        status: 'นำจ่ายสำเร็จ',
        location: 'ปณ.เมืองชลบุรี',
        description: 'ผู้รับลงนามรับพัสดุเรียบร้อย',
        recipientOrSigner: 'วิชัย'
      }
    ]
  },

  // ---------- MyOrder merchant parcels ----------
  'EN100200301TH': {
    trackingNumber: 'EN100200301TH',
    originPostOffice: 'ปณ.สุรินทร์ (32000)',
    originZipCode: '32000',
    destPostOffice: 'ปณ.เมืองนครราชสีมา (30000)',
    destZipCode: '30000',
    senderName: 'ร้านผ้าไหมบ้านครูสมศรี (MyOrder)',
    receiverName: 'คุณวราภรณ์ ศรีสุข',
    receiverPhone: '089-552-XXXX',
    receiverAddress: '55/7 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000',
    currentPostalStatus: '501 - นำจ่ายสำเร็จแล้ว (ลงชื่อแทน)',
    currentStatusCode: '501',
    signerName: 'ป้าสมใจ (เพื่อนบ้าน)',
    weightKg: 0.9,
    bagOpenedAt: '2026-10-03T09:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(96.8), statusCode: '103', status: 'รับฝาก', location: 'ปณ.สุรินทร์', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: eventStamp(85.33), statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.นครราชสีมา', description: 'สิ่งของออกจากศูนย์คัดแยก' },
      { timestamp: eventStamp(74.92), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองนครราชสีมา', description: 'สิ่งของถึงที่ทำการปลายทางแล้ว รอนำจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(69.63), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองนครราชสีมา', description: 'นำจ่ายสำเร็จ ผู้รับลงชื่อแทน: ป้าสมใจ (เพื่อนบ้าน)', recipientOrSigner: 'ป้าสมใจ (เพื่อนบ้าน)' }
    ]
  },
  'EN100200302TH': {
    trackingNumber: 'EN100200302TH',
    originPostOffice: 'ปณ.สุรินทร์ (32000)',
    originZipCode: '32000',
    destPostOffice: 'ปณ.เมืองอุบลราชธานี (34000)',
    destZipCode: '34000',
    senderName: 'ร้านผ้าไหมบ้านครูสมศรี (MyOrder)',
    receiverName: 'คุณธีรวัฒน์ บุญมา',
    receiverPhone: '086-310-XXXX',
    receiverAddress: '12 ถ.ชยางกูร ต.ในเมือง อ.เมือง จ.อุบลราชธานี 34000',
    currentPostalStatus: '201 - อยู่ระหว่างขนส่ง (ยังไม่ถึงศูนย์ปลายทาง)',
    currentStatusCode: '201',
    signerName: undefined,
    weightKg: 1.1,
    events: [
      { timestamp: eventStamp(115.5), statusCode: '103', status: 'รับฝาก', location: 'ปณ.สุรินทร์', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: eventStamp(104.83), statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.นครราชสีมา', description: 'สิ่งของออกจากศูนย์คัดแยก ยังไม่มีข้อมูลการรับเข้าศูนย์ปลายทาง' }
    ]
  },
  'EN100200304TH': {
    trackingNumber: 'EN100200304TH',
    originPostOffice: 'ปณ.ลำลูกกา (12150)',
    originZipCode: '12150',
    destPostOffice: 'ปณ.เมืองสุราษฎร์ธานี (84000)',
    destZipCode: '84000',
    senderName: 'Healthy Snack by Nok (MyOrder)',
    receiverName: 'คุณอรอุมา แก้วมณี',
    receiverPhone: '081-907-XXXX',
    receiverAddress: '301/5 ถ.ตลาดใหม่ ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000',
    currentPostalStatus: '501 - นำจ่ายสำเร็จแล้ว (พัสดุเสียหาย)',
    currentStatusCode: '501',
    signerName: 'อรอุมา (ผู้รับโดยตรง)',
    weightKg: 2.4,
    bagOpenedAt: '2026-10-04T10:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(98), statusCode: '103', status: 'รับฝาก', location: 'ปณ.ลำลูกกา', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(65.67), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองสุราษฎร์ธานี', description: 'สิ่งของถึงที่ทำการปลายทาง', isBagOpenEvent: true },
      { timestamp: eventStamp(48.25), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองสุราษฎร์ธานี', description: 'ผู้รับลงนามรับพัสดุ (กล่องบุบ)', recipientOrSigner: 'อรอุมา' }
    ]
  },
  'EN100200305TH': {
    trackingNumber: 'EN100200305TH',
    originPostOffice: 'ปณ.ลำลูกกา (12150)',
    originZipCode: '12150',
    destPostOffice: 'ปณ.เมืองลำปาง (52000)',
    destZipCode: '52000',
    senderName: 'Healthy Snack by Nok (MyOrder)',
    receiverName: 'คุณพิมพ์ชนก ใจดี',
    receiverPhone: '084-661-XXXX',
    receiverAddress: '88 ถ.บุญวาทย์ ต.สวนดอก อ.เมือง จ.ลำปาง 52000',
    currentPostalStatus: '201 - ส่งต่อผิดเส้นทาง (กำลังตรวจสอบ)',
    currentStatusCode: '201',
    signerName: undefined,
    weightKg: 1.6,
    events: [
      { timestamp: eventStamp(71.75), statusCode: '103', status: 'รับฝาก', location: 'ปณ.ลำลูกกา', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(54.17), statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.พิษณุโลก', description: 'พบพัสดุคัดแยกผิดสาย อยู่ระหว่างตรวจสอบเส้นทางใหม่' }
    ]
  },
  'EN100200307TH': {
    trackingNumber: 'EN100200307TH',
    originPostOffice: 'ปณ.หลักสี่ (10210)',
    originZipCode: '10210',
    destPostOffice: 'ปณ.บางรัก (10500)',
    destZipCode: '10500',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'คุณชยพล รุ่งเรือง',
    receiverPhone: '092-448-XXXX',
    receiverAddress: 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    currentPostalStatus: '501 - นำจ่ายสำเร็จแล้ว (ฝากนิติบุคคล)',
    currentStatusCode: '501',
    signerName: 'เคาน์เตอร์นิติบุคคลอาคาร',
    weightKg: 0.4,
    bagOpenedAt: '2026-10-05T08:30:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(70), statusCode: '103', status: 'รับฝาก', location: 'ปณ.หลักสี่', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: eventStamp(51.5), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.บางรัก', description: 'สิ่งของถึงที่ทำการปลายทาง', isBagOpenEvent: true },
      { timestamp: eventStamp(47.83), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.บางรัก', description: 'ฝากไว้กับเคาน์เตอร์นิติบุคคลอาคาร', recipientOrSigner: 'นิติบุคคลอาคาร' }
    ]
  },
  'EN100200308TH': {
    trackingNumber: 'EN100200308TH',
    originPostOffice: 'ปณ.หลักสี่ (10210)',
    originZipCode: '10210',
    destPostOffice: 'ปณ.เมืองชลบุรี (20000)',
    destZipCode: '20000',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'คุณณัฐวุฒิ ทองดี',
    receiverPhone: '083-201-XXXX',
    receiverAddress: '9/99 หมู่ 5 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000',
    currentPostalStatus: '206 - ถึงที่ทำการไปรษณีย์ รอนำจ่าย',
    currentStatusCode: '206',
    signerName: undefined,
    weightKg: 0.7,
    bagOpenedAt: '2026-10-06T09:00:00.000Z',
    events: [
      { timestamp: eventStamp(43), statusCode: '103', status: 'รับฝาก', location: 'ปณ.หลักสี่', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(25.33), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองชลบุรี', description: 'สิ่งของถึงที่ทำการปลายทาง รอนำจ่าย', isBagOpenEvent: true }
    ]
  },
  'ED662244118TH': {
    trackingNumber: 'ED662244118TH',
    originPostOffice: 'ปณ.คลองหลวง (12120)',
    originZipCode: '12120',
    destPostOffice: 'ปณ.มาบตาพุด (21150)',
    destZipCode: '21150',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'ฝ่ายจัดซื้อ โรงงานไทยโพลี',
    receiverPhone: '038-683-XXXX',
    receiverAddress: '88/1 นิคมอุตสาหกรรมมาบตาพุด ต.มาบตาพุด อ.เมือง จ.ระยอง 21150',
    currentPostalStatus: '220 - ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
    currentStatusCode: '220',
    signerName: undefined,
    weightKg: 5.4,
    bagOpenedAt: '2026-10-03T08:00:00.000Z',
    events: [
      { timestamp: eventStamp(110), statusCode: '103', status: 'รับฝาก', location: 'ปณ.คลองหลวง', description: 'รับฝากเข้าระบบ (EMS ขนาดใหญ่)' },
      { timestamp: eventStamp(98), statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.ศรีราชา', description: 'สิ่งของออกจากศูนย์คัดแยก' },
      { timestamp: eventStamp(88), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.มาบตาพุด', description: 'สิ่งของถึงที่ทำการปลายทาง เปิดถุงแต่ยังไม่ลงคิวจ่าย', isBagOpenEvent: true }
    ]
  },
  'ED881122334TH': {
    trackingNumber: 'ED881122334TH',
    originPostOffice: 'ปณ.สุรินทร์ (32000)',
    originZipCode: '32000',
    destPostOffice: 'ปณ.เมืองนครราชสีมา (30000)',
    destZipCode: '30000',
    senderName: 'ร้านผ้าไหมบ้านครูสมศรี (MyOrder)',
    receiverName: 'คุณพรเพ็ญ ฤดีสุข',
    receiverPhone: '081-445-XXXX',
    receiverAddress: '45/8 ถ.สุรนารายณ์ ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000',
    currentPostalStatus: '501 - นำจ่ายสำเร็จ',
    currentStatusCode: '501',
    signerName: 'พรเพ็ญ (ผู้รับโดยตรง)',
    weightKg: 1.2,
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(65), statusCode: '103', status: 'รับฝาก', location: 'ปณ.สุรินทร์', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(48), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองนครราชสีมา', description: 'เปิดถุงและคัดแยกนำจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(24), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองนครราชสีมา', description: 'ผู้รับลงนามรับพัสดุเรียบร้อย', recipientOrSigner: 'พรเพ็ญ' }
    ]
  },
  'ED773322119TH': {
    trackingNumber: 'ED773322119TH',
    originPostOffice: 'ปณ.มีนบุรี (10510)',
    originZipCode: '10510',
    destPostOffice: 'ปณ.เมืองยะลา (95000)',
    destZipCode: '95000',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'นายมูฮัมหมัด สาและ',
    receiverPhone: '089-974-XXXX',
    receiverAddress: '12/4 ถ.พิพิธภักดี ต.สะเตง อ.เมือง จ.ยะลา 95000',
    currentPostalStatus: '206 - ถึงที่ทำการไปรษณีย์ รอนำจ่าย',
    currentStatusCode: '206',
    signerName: undefined,
    weightKg: 0.95,
    bagOpenedAt: '2026-10-05T10:00:00.000Z',
    events: [
      { timestamp: eventStamp(80), statusCode: '103', status: 'รับฝาก', location: 'ปณ.มีนบุรี', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(55), statusCode: '201', status: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์', location: 'ศป.หาดใหญ่', description: 'ส่งต่อมายัง ศป.ยะลา' },
      { timestamp: eventStamp(30), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองยะลา', description: 'เปิดถุงรอนำจ่าย', isBagOpenEvent: true }
    ]
  },
  'ED554433221TH': {
    trackingNumber: 'ED554433221TH',
    originPostOffice: 'ปณ.ลาดพร้าว (10310)',
    originZipCode: '10310',
    destPostOffice: 'ปณ.เมืองนครสวรรค์ (60000)',
    destZipCode: '60000',
    senderName: 'Beauty Box by Fah (MyOrder)',
    receiverName: 'คุณกิตติศักดิ์ พรหมมา',
    receiverPhone: '087-554-XXXX',
    receiverAddress: '99/2 ถ.สวรรค์วิถี ต.ปากน้ำโพ อ.เมือง จ.นครสวรรค์ 60000',
    currentPostalStatus: '401 - นำจ่ายไม่สำเร็จ (รอนำจ่ายใหม่)',
    currentStatusCode: '401',
    signerName: undefined,
    weightKg: 1.5,
    bagOpenedAt: '2026-10-05T08:30:00.000Z',
    events: [
      { timestamp: eventStamp(50), statusCode: '103', status: 'รับฝาก', location: 'ปณ.ลาดพร้าว', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(32), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองนครสวรรค์', description: 'เปิดถุงเตรียมนำจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(18), statusCode: '401', status: 'นำจ่ายไม่สำเร็จ', location: 'ปณ.เมืองนครสวรรค์', description: 'โทรติดต่อผู้รับ 3 ครั้งไม่รับสาย' }
    ]
  },
  'ED445566778TH': {
    trackingNumber: 'ED445566778TH',
    originPostOffice: 'ปณ.คลองหลวง (12120)',
    originZipCode: '12120',
    destPostOffice: 'ปณ.เมืองสกลนคร (47000)',
    destZipCode: '47000',
    senderName: 'Healthy Snack by Nok (MyOrder)',
    receiverName: 'คุณสุทิน บุญรักษา',
    receiverPhone: '086-778-XXXX',
    receiverAddress: '15/3 ถ.เจริญเมือง ต.ธาตุเชิงชุม อ.เมือง จ.สกลนคร 47000',
    currentPostalStatus: '206 - ถึงที่ทำการไปรษณีย์ (ระงับตีกลับนำส่งใหม่)',
    currentStatusCode: '206',
    signerName: undefined,
    weightKg: 2.1,
    bagOpenedAt: '2026-10-04T09:00:00.000Z',
    events: [
      { timestamp: eventStamp(72), statusCode: '103', status: 'รับฝาก', location: 'ปณ.คลองหลวง', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(48), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองสกลนคร', description: 'เปิดถุงเตรียมนำจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(12), statusCode: '401', status: 'นำจ่ายไม่สำเร็จ', location: 'ปณ.เมืองสกลนคร', description: 'ผู้รับเข้าใจผิดขอปฏิเสธรับ' },
      { timestamp: eventStamp(4), statusCode: '206', status: 'ถึงที่ทำการไปรษณีย์', location: 'ปณ.เมืองสกลนคร', description: 'ส่วนกลางแจ้งระงับการส่งคืน จัดรอบนำจ่ายใหม่บ่ายนี้' }
    ]
  },
  'ED334455667TH': {
    trackingNumber: 'ED334455667TH',
    originPostOffice: 'ปณ.หลักสี่ (10210)',
    originZipCode: '10210',
    destPostOffice: 'ปณ.เมืองราชบุรี (70000)',
    destZipCode: '70000',
    senderName: 'HomeLiving Deco (MyOrder)',
    receiverName: 'คุณสายใจ ทองดี',
    receiverPhone: '082-334-XXXX',
    receiverAddress: '72/5 ถ.สมบูรณ์กุล ต.หน้าเมือง อ.เมือง จ.ราชบุรี 70000',
    currentPostalStatus: '501 - นำจ่ายสำเร็จ (ฝากญาติข้างบ้าน)',
    currentStatusCode: '501',
    signerName: 'คุณน้าข้างบ้าน (ป้านวล)',
    weightKg: 3.2,
    bagOpenedAt: '2026-10-05T09:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(60), statusCode: '103', status: 'รับฝาก', location: 'ปณ.หลักสี่', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(38), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองราชบุรี', description: 'เปิดถุงเตรียมนำจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(16), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองราชบุรี', description: 'ฝากไว้กับคุณน้าข้างบ้าน (ป้านวล)', recipientOrSigner: 'ป้านวล (ข้างบ้าน)' }
    ]
  },
  'ED223344556TH': {
    trackingNumber: 'ED223344556TH',
    originPostOffice: 'ปณ.บางพลี (10540)',
    originZipCode: '10540',
    destPostOffice: 'ปณ.เมืองอุบลราชธานี (34000)',
    destZipCode: '34000',
    senderName: 'Healthy Snack by Nok (MyOrder)',
    receiverName: 'คุณชัยณรงค์ อินทร์แป้น',
    receiverPhone: '084-221-XXXX',
    receiverAddress: '110 ถ.อุปราช ต.ในเมือง อ.เมือง จ.อุบลราชธานี 34000',
    currentPostalStatus: '301 - อยู่ระหว่างการนำจ่าย',
    currentStatusCode: '301',
    signerName: undefined,
    weightKg: 1.8,
    bagOpenedAt: '2026-10-07T01:30:00.000Z',
    events: [
      { timestamp: eventStamp(24), statusCode: '103', status: 'รับฝาก', location: 'ปณ.บางพลี', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(8), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.เมืองอุบลราชธานี', description: 'เปิดถุงช่วงเช้ามืด', isBagOpenEvent: true },
      { timestamp: eventStamp(2), statusCode: '301', status: 'อยู่ระหว่างการนำจ่าย', location: 'ปณ.เมืองอุบลราชธานี', description: 'เจ้าหน้าที่นำจ่ายนำพัสดุออกส่งมอบ' }
    ]
  },
  'ED112233445TH': {
    trackingNumber: 'ED112233445TH',
    originPostOffice: 'ปณ.จตุจักร (10900)',
    originZipCode: '10900',
    destPostOffice: 'ปณ.ดอนเมือง (10210)',
    destZipCode: '10210',
    senderName: 'Gadget Corner BKK (MyOrder)',
    receiverName: 'คุณธวัชชัย รุ่งเรือง',
    receiverPhone: '081-998-XXXX',
    receiverAddress: '33/9 สรงประภา ซอย 12 แขวงดอนเมือง เขตดอนเมือง กรุงเทพฯ 10210',
    currentPostalStatus: '501 - นำจ่ายสำเร็จ',
    currentStatusCode: '501',
    signerName: 'ธวัชชัย (รับด้วยตนเอง)',
    weightKg: 0.35,
    bagOpenedAt: '2026-10-06T08:00:00.000Z',
    deliveryProofPhotoUrl: POD_SAMPLE_IMAGE,
    recipientConfirmedReceived: true,
    events: [
      { timestamp: eventStamp(30), statusCode: '103', status: 'รับฝาก', location: 'ปณ.จตุจักร', description: 'รับฝากเข้าระบบ' },
      { timestamp: eventStamp(18), statusCode: '220', status: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)', location: 'ปณ.ดอนเมือง', description: 'เปิดถุงและจัดคิวจ่าย', isBagOpenEvent: true },
      { timestamp: eventStamp(8), statusCode: '501', status: 'นำจ่ายสำเร็จ', location: 'ปณ.ดอนเมือง', description: 'ผู้รับลงชื่อรับด้วยตนเอง', recipientOrSigner: 'ธวัชชัย' }
    ]
  }
};

// Scripted future QMS parcel events for parcels that are still moving.
// Each "sync" reveals the next event, simulating a status update arriving from QMS.
const UPCOMING_EVENTS: Record<string, { event: Omit<TrackingEvent, 'timestamp'>; postalStatus: string }[]> = {
  'EN100200302TH': [
    {
      event: { status: 'ถึงศูนย์คัดแยกปลายทาง', location: 'ศป.อุบลราชธานี', description: 'สิ่งของถึงศูนย์คัดแยกปลายทาง เตรียมส่งต่อที่ทำการ' },
      postalStatus: 'ถึงศูนย์คัดแยกปลายทาง'
    },
    {
      event: { status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองอุบลราชธานี', description: 'สิ่งของถึงที่ทำการปลายทาง รอนำจ่าย' },
      postalStatus: 'ถึงที่ทำการปลายทาง รอนำจ่าย'
    }
  ],
  'EN100200305TH': [
    {
      event: { status: 'ถึงศูนย์คัดแยกปลายทาง', location: 'ศป.ลำปาง', description: 'แก้ไขเส้นทางเรียบร้อย สิ่งของถึงศูนย์คัดแยกปลายทาง' },
      postalStatus: 'ถึงศูนย์คัดแยกปลายทาง'
    }
  ]
};


// ---------- More MyOrder parcels (compact specs, used e.g. for bulk "เร่งนำส่ง" reports) ----------
type ParcelStage = 'IN_TRANSIT' | 'AT_DEST' | 'DELIVERY_FAILED';

interface ParcelSpec {
  trackingNumber: string;
  origin: [office: string, zip: string];
  dest: [office: string, zip: string, sortingCenter: string];
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  stage: ParcelStage;
  shippedHoursAgo: number;
}

const stamp = eventStamp;

function registerParcel(spec: ParcelSpec) {
  const [originOffice, originZip] = spec.origin;
  const [destOffice, destZip, sortingCenter] = spec.dest;
  const h = spec.shippedHoursAgo;
  const events: TrackingEvent[] = [
    { timestamp: stamp(h), status: 'รับฝาก', location: originOffice, description: 'รับฝากเข้าระบบ (EMS)' },
    { timestamp: stamp(h - 10), status: 'ส่งต่อ', location: 'ศป.หลักสี่', description: 'สิ่งของออกจากศูนย์คัดแยก' }
  ];
  let status = 'อยู่ระหว่างขนส่ง (ยังไม่ถึงศูนย์ปลายทาง)';
  if (spec.stage !== 'IN_TRANSIT') {
    events.push({ timestamp: stamp(h - 22), status: 'ถึงที่ทำการปลายทาง', location: destOffice, description: 'สิ่งของถึงที่ทำการปลายทาง รอนำจ่าย' });
    status = 'ถึงที่ทำการปลายทาง รอนำจ่าย';
  }
  if (spec.stage === 'DELIVERY_FAILED') {
    events.push({ timestamp: stamp(h - 28), status: 'นำจ่ายไม่สำเร็จ', location: destOffice, description: 'นำจ่ายไม่สำเร็จ: ติดต่อผู้รับไม่ได้' });
    status = 'นำจ่ายไม่สำเร็จ (รอนำจ่ายใหม่)';
  }
  KNOWN_PARCELS[spec.trackingNumber] = {
    trackingNumber: spec.trackingNumber,
    originPostOffice: `${originOffice} (${originZip})`,
    originZipCode: originZip,
    destPostOffice: `${destOffice} (${destZip})`,
    destZipCode: destZip,
    senderName: spec.senderName,
    receiverName: spec.receiverName,
    receiverPhone: spec.receiverPhone,
    receiverAddress: spec.receiverAddress,
    currentPostalStatus: status,
    signerName: undefined,
    weightKg: 1.0,
    events
  };
  if (spec.stage === 'IN_TRANSIT') {
    UPCOMING_EVENTS[spec.trackingNumber] = [
      {
        event: { status: 'ถึงศูนย์คัดแยกปลายทาง', location: sortingCenter, description: 'สิ่งของถึงศูนย์คัดแยกปลายทาง เตรียมส่งต่อที่ทำการ' },
        postalStatus: 'ถึงศูนย์คัดแยกปลายทาง'
      }
    ];
  }
}

[
  {
    trackingNumber: 'EN100200310TH', origin: ['ปณ.สุรินทร์', '32000'], dest: ['ปณ.เมืองขอนแก่น', '40000', 'ศป.ขอนแก่น'],
    senderName: 'ร้านผ้าไหมบ้านครูสมศรี (MyOrder)', receiverName: 'คุณจิราพร แสงทอง', receiverPhone: '081-220-XXXX',
    receiverAddress: '99 ถ.ศรีจันทร์ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000', stage: 'AT_DEST', shippedHoursAgo: 60
  },
  {
    trackingNumber: 'EN100200311TH', origin: ['ปณ.สุรินทร์', '32000'], dest: ['ปณ.หางดง', '50230', 'ศป.เชียงใหม่'],
    senderName: 'ร้านผ้าไหมบ้านครูสมศรี (MyOrder)', receiverName: 'คุณเพ็ญศรี ดอยคำ', receiverPhone: '089-118-XXXX',
    receiverAddress: '15 หมู่ 2 ต.หนองควาย อ.หางดง จ.เชียงใหม่ 50230', stage: 'DELIVERY_FAILED', shippedHoursAgo: 70
  },
  {
    trackingNumber: 'EN100200312TH', origin: ['ปณ.ลำลูกกา', '12150'], dest: ['ปณ.เมืองนครปฐม', '73000', 'ศป.นครปฐม'],
    senderName: 'Healthy Snack by Nok (MyOrder)', receiverName: 'คุณวิภาวี ศรีทอง', receiverPhone: '086-552-XXXX',
    receiverAddress: '22/1 ถ.ราชวิถี ต.พระปฐมเจดีย์ อ.เมือง จ.นครปฐม 73000', stage: 'IN_TRANSIT', shippedHoursAgo: 52
  },
  {
    trackingNumber: 'EN100200313TH', origin: ['ปณ.ลำลูกกา', '12150'], dest: ['ปณ.บางบัวทอง', '11110', 'ศป.นนทบุรี'],
    senderName: 'Healthy Snack by Nok (MyOrder)', receiverName: 'คุณสุรเชษฐ์ มั่นคง', receiverPhone: '082-771-XXXX',
    receiverAddress: '88/12 ม.พฤกษา ต.บางรักพัฒนา อ.บางบัวทอง จ.นนทบุรี 11110', stage: 'AT_DEST', shippedHoursAgo: 40
  },
  {
    trackingNumber: 'EN100200314TH', origin: ['ปณ.ลาดพร้าว', '10310'], dest: ['ปณ.เมืองอุดรธานี', '41000', 'ศป.อุดรธานี'],
    senderName: 'Beauty Box by Fah (MyOrder)', receiverName: 'คุณอัญชลี บุญเรือง', receiverPhone: '084-903-XXXX',
    receiverAddress: '7 ถ.โพศรี ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', stage: 'IN_TRANSIT', shippedHoursAgo: 58
  },
  {
    trackingNumber: 'EN100200315TH', origin: ['ปณ.บางพลี', '10540'], dest: ['ปณ.ศรีราชา', '20110', 'ศป.ชลบุรี'],
    senderName: 'HomeLiving Deco (MyOrder)', receiverName: 'คุณกิตติพงษ์ ทะเลงาม', receiverPhone: '085-640-XXXX',
    receiverAddress: '120/8 ถ.สุขุมวิท ต.ศรีราชา อ.ศรีราชา จ.ชลบุรี 20110', stage: 'DELIVERY_FAILED', shippedHoursAgo: 66
  },
  {
    trackingNumber: 'EN100200316TH', origin: ['ปณ.บางพลี', '10540'], dest: ['ปณ.เมืองพิษณุโลก', '65000', 'ศป.พิษณุโลก'],
    senderName: 'HomeLiving Deco (MyOrder)', receiverName: 'คุณนภาพร จันทร์หอม', receiverPhone: '087-215-XXXX',
    receiverAddress: '31 ถ.บรมไตรโลกนาถ ต.ในเมือง อ.เมือง จ.พิษณุโลก 65000', stage: 'AT_DEST', shippedHoursAgo: 45
  }
].forEach(spec => registerParcel(spec as ParcelSpec));

/**
 * Pull the latest parcel status from QMS for a parcel we already hold (mock).
 * Returns the same object when there is nothing new.
 */
export async function fetchTrackingUpdate(current: ParcelInfo): Promise<ParcelInfo> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const next = (UPCOMING_EVENTS[current.trackingNumber] || []).find(
    u => !current.events.some(e => e.status === u.event.status && e.location === u.event.location)
  );
  if (!next) return current;

  return {
    ...current,
    currentPostalStatus: next.postalStatus,
    events: [...current.events, { ...next.event, timestamp: formatEventTimestamp(new Date()) }]
  };
}

export async function fetchThaiPostTrackAndTrace(trackingNumber: string): Promise<ParcelInfo> {
  // Simulate network latency ~300ms
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const cleanNumber = trackingNumber.trim().toUpperCase();
  
  if (KNOWN_PARCELS[cleanNumber]) {
    return KNOWN_PARCELS[cleanNumber];
  }
  
  // Dynamically generate realistic QMS parcel data for an arbitrary valid number
  const digits = cleanNumber.replace(/\D/g, '') || '123456789';
  const destZip = '10' + (parseInt(digits.slice(0, 3) || '100', 10) % 900 + 100).toString().slice(0, 3);
  
  return {
    trackingNumber: cleanNumber,
    originPostOffice: 'ปณ.คลองจั่น (10240)',
    originZipCode: '10240',
    destPostOffice: `ปณ.ปลายทาง (${destZip})`,
    destZipCode: destZip,
    senderName: 'ร้านค้า MyOrder',
    receiverName: 'ลูกค้าผู้รับพัสดุปลายทาง',
    receiverPhone: '08X-XXX-' + digits.slice(-4),
    receiverAddress: `อาคารพาณิชย์/ที่พักอาศัย เลขที่ ${digits.slice(0, 2)}/${digits.slice(2, 4)} รหัสไปรษณีย์ ${destZip}`,
    currentPostalStatus: 'อยู่ระหว่างการคัดแยกเพื่อส่งมอบที่ทำการปลายทาง',
    signerName: undefined,
    weightKg: 1.25,
    events: [
      {
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        status: 'รับฝาก',
        location: 'ปณ.คลองจั่น',
        description: 'รับฝากเข้าระบบไปรษณีย์ด่วนพิเศษ (EMS)'
      },
      {
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        status: 'ส่งต่อ',
        location: 'ศูนย์คัดแยกหลัก ปณท',
        description: 'สิ่งของออกจากศูนย์คัดแยก มุ่งหน้าศูนย์กระจายปลายทาง'
      },
      {
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        status: 'ถึงศูนย์คัดแยกปลายทาง',
        location: `ศป.เขต (${destZip.slice(0, 2)})`,
        description: 'เตรียมส่งต่อไปยังที่ทำการไปรษณีย์ปลายทาง'
      }
    ]
  };
}
