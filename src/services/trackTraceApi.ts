import type { ParcelInfo, TrackingEvent } from '../types/case';

export const KNOWN_PARCELS: Record<string, ParcelInfo> = {
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
    currentPostalStatus: 'นำจ่ายสำเร็จแล้ว (ลงชื่อแทน)',
    signerName: 'สมศรี รปภ.หมู่บ้าน / นิติ',
    weightKg: 1.45,
    events: [
      {
        timestamp: '2026-09-20 09:15:22',
        status: 'รับฝาก',
        location: 'ปณ.บางซื่อ',
        description: 'รับฝากเข้าระบบเรียบร้อยแล้ว'
      },
      {
        timestamp: '2026-09-20 18:30:10',
        status: 'ส่งต่อ',
        location: 'ศป.EMS (กรุงเทพฯ)',
        description: 'สิ่งของออกจากศูนย์คัดแยก มุ่งหน้า ศป.เด่นชัย'
      },
      {
        timestamp: '2026-09-21 07:45:00',
        status: 'ถึงที่ทำการปลายทาง',
        location: 'ปณ.สันกำแพง',
        description: 'สิ่งของถึงที่ทำการปลายทางแล้ว รอนำจ่าย'
      },
      {
        timestamp: '2026-09-21 11:20:15',
        status: 'เตรียมการนำจ่าย',
        location: 'ปณ.สันกำแพง',
        description: 'เจ้าหน้าที่นำจ่าย นายสมพงษ์ นำส่งมอบ'
      },
      {
        timestamp: '2026-09-21 15:40:02',
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
    currentPostalStatus: 'อยู่ระหว่างการนำจ่าย (ล่าช้ากว่าปกติ)',
    signerName: undefined,
    weightKg: 3.20,
    events: [
      {
        timestamp: '2026-09-18 10:00:00',
        status: 'รับฝาก',
        location: 'ปณ.สำเหร่',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: '2026-09-18 20:10:00',
        status: 'ส่งต่อ',
        location: 'ศป.EMS',
        description: 'ส่งต่อไปยัง ศป.หาดใหญ่'
      },
      {
        timestamp: '2026-09-19 14:20:00',
        status: 'ถึงที่ทำการปลายทาง',
        location: 'ปณ.หาดใหญ่',
        description: 'สิ่งของถึงที่ทำการ'
      },
      {
        timestamp: '2026-09-20 09:30:00',
        status: 'เตรียมการนำจ่าย',
        location: 'ปณ.หาดใหญ่',
        description: 'เตรียมการนำจ่าย (นำจ่ายไม่สำเร็จ: บ้านปิด)'
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
    currentPostalStatus: 'ส่งต่อผิดศูนย์คัดแยก (กำลังแก้ไขเส้นทาง)',
    signerName: undefined,
    weightKg: 0.85,
    events: [
      {
        timestamp: '2026-09-19 14:10:00',
        status: 'รับฝาก',
        location: 'ปณ.มีนบุรี',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: '2026-09-20 02:40:00',
        status: 'ส่งต่อผิดเส้นทาง',
        location: 'ศป.อุดรธานี',
        description: 'พบพัสดุคัดแยกผิดสาย ส่งต่อกลับ ศป.ขอนแก่น'
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
    currentPostalStatus: 'อยู่ระหว่างตรวจสอบความเสียหาย',
    signerName: undefined,
    weightKg: 0.65,
    events: [
      {
        timestamp: '2026-09-17 11:00:00',
        status: 'รับฝาก',
        location: 'ปณ.ลาดพร้าว',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: '2026-09-18 16:20:00',
        status: 'ถึงศูนย์คัดแยกปลายทาง',
        location: 'ศป.ภูเก็ต',
        description: 'พบกล่องพัสดุยับเยิน มีคราบของเหลวซึม กำลังทำบันทึกความเสียหาย'
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
    currentPostalStatus: 'นำจ่ายสำเร็จเรียบร้อย',
    signerName: 'วิชัย (ผู้รับโดยตรง)',
    weightKg: 4.8,
    events: [
      {
        timestamp: '2026-09-22 09:00:00',
        status: 'รับฝาก',
        location: 'ปณ.บางพลี',
        description: 'รับฝากเข้าระบบ'
      },
      {
        timestamp: '2026-09-22 14:00:00',
        status: 'ถึงที่ทำการปลายทาง',
        location: 'ปณ.เมืองชลบุรี',
        description: 'รอนำจ่าย'
      },
      {
        timestamp: '2026-09-22 16:30:00',
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
    currentPostalStatus: 'นำจ่ายสำเร็จแล้ว (ลงชื่อแทน)',
    signerName: 'ป้าสมใจ (เพื่อนบ้าน)',
    weightKg: 0.9,
    events: [
      { timestamp: '2026-09-19 10:12:00', status: 'รับฝาก', location: 'ปณ.สุรินทร์', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: '2026-09-19 21:40:00', status: 'ส่งต่อ', location: 'ศป.นครราชสีมา', description: 'สิ่งของออกจากศูนย์คัดแยก' },
      { timestamp: '2026-09-20 08:05:00', status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองนครราชสีมา', description: 'สิ่งของถึงที่ทำการปลายทางแล้ว รอนำจ่าย' },
      { timestamp: '2026-09-20 13:22:00', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองนครราชสีมา', description: 'นำจ่ายสำเร็จ ผู้รับลงชื่อแทน: ป้าสมใจ (เพื่อนบ้าน)', recipientOrSigner: 'ป้าสมใจ (เพื่อนบ้าน)' }
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
    currentPostalStatus: 'อยู่ระหว่างขนส่ง (ยังไม่ถึงศูนย์ปลายทาง)',
    signerName: undefined,
    weightKg: 1.1,
    events: [
      { timestamp: '2026-09-18 15:30:00', status: 'รับฝาก', location: 'ปณ.สุรินทร์', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: '2026-09-19 02:10:00', status: 'ส่งต่อ', location: 'ศป.นครราชสีมา', description: 'สิ่งของออกจากศูนย์คัดแยก ยังไม่มีข้อมูลการรับเข้าศูนย์ปลายทาง' }
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
    currentPostalStatus: 'นำจ่ายสำเร็จแล้ว',
    signerName: 'อรอุมา (ผู้รับโดยตรง)',
    weightKg: 2.4,
    events: [
      { timestamp: '2026-09-19 09:00:00', status: 'รับฝาก', location: 'ปณ.ลำลูกกา', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-09-20 17:20:00', status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองสุราษฎร์ธานี', description: 'สิ่งของถึงที่ทำการปลายทาง' },
      { timestamp: '2026-09-21 10:45:00', status: 'นำจ่ายสำเร็จ', location: 'ปณ.เมืองสุราษฎร์ธานี', description: 'ผู้รับลงนามรับพัสดุ (กล่องบุบ)', recipientOrSigner: 'อรอุมา' }
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
    currentPostalStatus: 'ส่งต่อผิดเส้นทาง (กำลังตรวจสอบ)',
    signerName: undefined,
    weightKg: 1.6,
    events: [
      { timestamp: '2026-09-20 11:15:00', status: 'รับฝาก', location: 'ปณ.ลำลูกกา', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-09-21 04:50:00', status: 'ส่งต่อผิดเส้นทาง', location: 'ศป.พิษณุโลก', description: 'พบพัสดุคัดแยกผิดสาย อยู่ระหว่างตรวจสอบเส้นทางใหม่' }
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
    currentPostalStatus: 'นำจ่ายสำเร็จแล้ว (ฝากนิติบุคคล)',
    signerName: 'เคาน์เตอร์นิติบุคคลอาคาร',
    weightKg: 0.4,
    events: [
      { timestamp: '2026-09-20 13:00:00', status: 'รับฝาก', location: 'ปณ.หลักสี่', description: 'รับฝากเข้าระบบ (EMS)' },
      { timestamp: '2026-09-21 07:30:00', status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.บางรัก', description: 'สิ่งของถึงที่ทำการปลายทาง' },
      { timestamp: '2026-09-21 11:10:00', status: 'นำจ่ายสำเร็จ', location: 'ปณ.บางรัก', description: 'ฝากไว้กับเคาน์เตอร์นิติบุคคลอาคาร', recipientOrSigner: 'นิติบุคคลอาคาร' }
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
    currentPostalStatus: 'ถึงที่ทำการปลายทาง รอนำจ่าย',
    signerName: undefined,
    weightKg: 0.7,
    events: [
      { timestamp: '2026-09-21 16:00:00', status: 'รับฝาก', location: 'ปณ.หลักสี่', description: 'รับฝากเข้าระบบ' },
      { timestamp: '2026-09-22 09:40:00', status: 'ถึงที่ทำการปลายทาง', location: 'ปณ.เมืองชลบุรี', description: 'สิ่งของถึงที่ทำการปลายทาง รอนำจ่าย' }
    ]
  }
};

// Scripted future Track & Trace events for parcels that are still moving.
// Each "sync" reveals the next event, simulating a status update arriving from the ThaiPost API.
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
  ],
  'ED993812745TH': [
    {
      event: { status: 'ถึงศูนย์คัดแยกปลายทาง', location: 'ศป.ขอนแก่น', description: 'แก้ไขเส้นทางเรียบร้อย สิ่งของถึงศูนย์คัดแยกปลายทาง' },
      postalStatus: 'ถึงศูนย์คัดแยกปลายทาง'
    }
  ]
};

const formatEventTimestamp = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

const SIM_NOW = new Date('2026-09-23T11:00:00+07:00').getTime();
const stamp = (hoursAgo: number) => formatEventTimestamp(new Date(SIM_NOW - hoursAgo * 3600 * 1000));

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
 * Pull the latest Track & Trace status for a parcel we already hold.
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
  
  // Dynamically generate realistic ThaiPost Track & Trace data for arbitrary valid number
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
