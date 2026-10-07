/**
 * Thailand Post Official Track & Trace Status Codes
 * Ref: https://track.thailandpost.com/developerGuide (API Console -> Status Item & Status Code)
 */

export type ThaiPostStatusCategory =
  | 'POSTING'      // เตรียมการและรับฝาก (101 - 104)
  | 'TRANSIT'      // ส่งต่อ / ศูนย์คัดแยก / ขนส่ง (201 - 220)
  | 'DELIVERY'     // อยู่ระหว่างนำจ่าย / ติดต่อผู้รับ (301 - 304)
  | 'EXCEPTION'    // นำจ่ายไม่สำเร็จ / ส่งคืนต้นทาง (401, 402, 203)
  | 'COMPLETED';   // นำจ่ายสำเร็จ / โอนเงิน (501, 901)

export interface ThaiPostStatusDefinition {
  code: string;
  descTh: string;
  descEn: string;
  category: ThaiPostStatusCategory;
  categoryTh: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  isBagOpenIndicator?: boolean; // บ่งชี้จุดเปิดถุง/ถึงที่ทำการปลายทาง (จุดเริ่มต้นนับ SLA)
  isSuccess?: boolean;          // นำจ่ายสำเร็จ
  isException?: boolean;        // มีปัญหา/ไม่สำเร็จ
}

export const THAILAND_POST_STATUSES: ThaiPostStatusDefinition[] = [
  // 100-series: รับฝาก
  {
    code: '101',
    descTh: 'เตรียมการฝากส่ง',
    descEn: 'Preload',
    category: 'POSTING',
    categoryTh: 'รับฝาก',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
    badgeBorder: '#CBD5E1'
  },
  {
    code: '102',
    descTh: 'รับฝากผ่านตัวแทน',
    descEn: 'Accepted by Agent',
    category: 'POSTING',
    categoryTh: 'รับฝาก',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
    badgeBorder: '#CBD5E1'
  },
  {
    code: '103',
    descTh: 'รับฝาก',
    descEn: 'Posting/Collection',
    category: 'POSTING',
    categoryTh: 'รับฝาก',
    badgeBg: '#ECFDF5',
    badgeColor: '#047857',
    badgeBorder: '#A7F3D0'
  },
  {
    code: '104',
    descTh: 'ผู้ฝากส่งขอถอนคืน / ยกเลิกการรับฝาก',
    descEn: 'Withdrawal / cancellation of posting by the sender',
    category: 'POSTING',
    categoryTh: 'รับฝาก',
    badgeBg: '#FEF2F2',
    badgeColor: '#B91C1C',
    badgeBorder: '#FECACA',
    isException: true
  },

  // 200-series: ส่งต่อ / ศูนย์คัดแยก / ระหว่างประเทศ
  {
    code: '201',
    descTh: 'ออกจากที่ทำการ/ศูนย์ไปรษณีย์',
    descEn: 'In transit',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '202',
    descTh: 'ดำเนินพิธีการศุลกากร',
    descEn: 'Perform customs clearance',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อ/ศุลกากร',
    badgeBg: '#F3E8FF',
    badgeColor: '#7E22CE',
    badgeBorder: '#E9D5FF'
  },
  {
    code: '203',
    descTh: 'ส่งคืนต้นทาง',
    descEn: 'Return to Sender',
    category: 'EXCEPTION',
    categoryTh: 'ส่งคืนต้นทาง',
    badgeBg: '#FEF2F2',
    badgeColor: '#DC2626',
    badgeBorder: '#FCA5A5',
    isException: true
  },
  {
    code: '204',
    descTh: 'ถึงที่ทำการแลกเปลี่ยนระหว่างประเทศขาออก',
    descEn: 'Arrival at outward office of exchange',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อระหว่างประเทศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '205',
    descTh: 'ถึงที่ทำการแลกเปลี่ยนระหว่างประเทศขาเข้า',
    descEn: 'Arrival at inward office of exchange',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อระหว่างประเทศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '206',
    descTh: 'ถึงที่ทำการไปรษณีย์',
    descEn: 'Arrival at post office',
    category: 'TRANSIT',
    categoryTh: 'ถึงที่ทำการ',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338CA',
    badgeBorder: '#C7D2FE',
    isBagOpenIndicator: true
  },
  {
    code: '208',
    descTh: 'ส่งออกจากที่ทำการแลกเปลี่ยนระหว่างประเทศขาออก',
    descEn: 'Departure From Outward OE',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อระหว่างประเทศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '209',
    descTh: 'ยกเลิกการส่งออก',
    descEn: 'Export cancellation',
    category: 'EXCEPTION',
    categoryTh: 'ยกเลิก',
    badgeBg: '#FEF2F2',
    badgeColor: '#DC2626',
    badgeBorder: '#FCA5A5',
    isException: true
  },
  {
    code: '210',
    descTh: 'ยกเลิกการนำเข้า',
    descEn: 'Import cancellation',
    category: 'EXCEPTION',
    categoryTh: 'ยกเลิก',
    badgeBg: '#FEF2F2',
    badgeColor: '#DC2626',
    badgeBorder: '#FCA5A5',
    isException: true
  },
  {
    code: '211',
    descTh: 'รับเข้า ณ ศูนย์คัดแยก',
    descEn: 'Item into sorting center',
    category: 'TRANSIT',
    categoryTh: 'ศูนย์คัดแยก',
    badgeBg: '#F0FDF4',
    badgeColor: '#15803D',
    badgeBorder: '#BBF7D0'
  },
  {
    code: '212',
    descTh: 'ส่งมอบให้สายการบิน',
    descEn: 'Hand over to carrier',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งทางอากาศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '213',
    descTh: 'สายการบินรับมอบ',
    descEn: 'Carrier received',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งทางอากาศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '214',
    descTh: 'ส่งข้อมูลให้ประเทศปลายทางตรวจสอบ',
    descEn: 'Information sent to the country of destination for verification',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อระหว่างประเทศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '215',
    descTh: 'ได้รับการอนุญาตให้นำเข้าประเทศปลายทาง',
    descEn: 'Item allowed to import into the country of destination',
    category: 'TRANSIT',
    categoryTh: 'ส่งต่อระหว่างประเทศ',
    badgeBg: '#ECFDF5',
    badgeColor: '#047857',
    badgeBorder: '#A7F3D0'
  },
  {
    code: '216',
    descTh: 'ถึงสนามบิน',
    descEn: 'The transport arrived at airport',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งทางอากาศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '217',
    descTh: 'อยู่ระหว่างการขนส่งที่ประเทศกลางทาง',
    descEn: 'The transport departed from transit airport',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งระหว่างทาง',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '218',
    descTh: 'ถึงคลังสินค้าสายการบินประเทศปลายทาง',
    descEn: 'The receptacles arrived at carrier facility at transport destination',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งทางอากาศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '219',
    descTh: 'สายการบินส่งมอบการไปรษณีย์ปลายทาง',
    descEn: 'The receptacles delivered to the destination post',
    category: 'TRANSIT',
    categoryTh: 'ขนส่งทางอากาศ',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    badgeBorder: '#BFDBFE'
  },
  {
    code: '220',
    descTh: 'ถึงที่ทำการ/ศูนย์ไปรษณีย์ (เปิดถุง/รับเข้า)',
    descEn: 'Receive From Shipment',
    category: 'TRANSIT',
    categoryTh: 'เปิดถุง/รับเข้า',
    badgeBg: '#E0E7FF',
    badgeColor: '#3730A3',
    badgeBorder: '#A5B4FC',
    isBagOpenIndicator: true // จุดเปิดถุงที่ใช้นับเริ่ม SLA
  },

  // 300-series: นำจ่าย & ติดต่อผู้รับ
  {
    code: '301',
    descTh: 'อยู่ระหว่างการนำจ่าย',
    descEn: 'Item out for physical delivery',
    category: 'DELIVERY',
    categoryTh: 'นำจ่าย',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    badgeBorder: '#7DD3FC'
  },
  {
    code: '302',
    descTh: 'นำจ่าย ณ จุดรับสิ่งของ',
    descEn: 'Item arrival at collection point for pick-up (by recipient)',
    category: 'DELIVERY',
    categoryTh: 'จุดรับสิ่งของ',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    badgeBorder: '#7DD3FC'
  },
  {
    code: '303',
    descTh: 'เจ้าหน้าที่ติดต่อผู้รับ',
    descEn: 'Contact recipient',
    category: 'DELIVERY',
    categoryTh: 'โทรติดต่อผู้รับ',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    badgeBorder: '#FDE68A'
  },
  {
    code: '304',
    descTh: 'เจ้าหน้าที่ติดต่อผู้รับไม่ได้',
    descEn: 'Unable to contact recipient',
    category: 'DELIVERY',
    categoryTh: 'ติดต่อไม่ได้',
    badgeBg: '#FEE2E2',
    badgeColor: '#991B1B',
    badgeBorder: '#FECACA',
    isException: true
  },

  // 400-series: นำจ่ายไม่สำเร็จ
  {
    code: '401',
    descTh: 'นำจ่ายไม่สำเร็จ',
    descEn: 'Unsuccessful (physical) delivery',
    category: 'EXCEPTION',
    categoryTh: 'นำจ่ายไม่สำเร็จ',
    badgeBg: '#FEE2E2',
    badgeColor: '#B91C1C',
    badgeBorder: '#FCA5A5',
    isException: true
  },
  {
    code: '402',
    descTh: 'ปิดประกาศ ณ ที่ทำการรับฝาก : กรุณาติดต่อ THP contact center 1545',
    descEn: 'Announcement available at post office, Please contact THP Contact Center 1545',
    category: 'EXCEPTION',
    categoryTh: 'ปิดประกาศ',
    badgeBg: '#FFFBEB',
    badgeColor: '#92400E',
    badgeBorder: '#FDE68A',
    isException: true
  },

  // 500 & 900 series: สำเร็จ
  {
    code: '501',
    descTh: 'นำจ่ายสำเร็จ',
    descEn: 'Final delivery',
    category: 'COMPLETED',
    categoryTh: 'นำจ่ายสำเร็จ',
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    badgeBorder: '#6EE7B7',
    isSuccess: true
  },
  {
    code: '901',
    descTh: 'โอนเงินให้ผู้ขายเรียบร้อยแล้ว',
    descEn: 'Successfully transfer money to seller',
    category: 'COMPLETED',
    categoryTh: 'โอนเงิน COD',
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    badgeBorder: '#6EE7B7',
    isSuccess: true
  }
];

export const STATUS_CODE_MAP = new Map<string, ThaiPostStatusDefinition>(
  THAILAND_POST_STATUSES.map(s => [s.code, s])
);

/**
 * ดึงคำอธิบายสถานะจากรหัส code
 */
export function getThaiPostStatus(code?: string): ThaiPostStatusDefinition | undefined {
  if (!code) return undefined;
  return STATUS_CODE_MAP.get(code.trim());
}

/**
 * ตรวจสอบว่าเป็นสถานะนำจ่ายสำเร็จ (501 / 901) หรือไม่
 */
export function isDeliverySuccess(codeOrText?: string): boolean {
  if (!codeOrText) return false;
  const trimmed = codeOrText.trim();
  if (trimmed === '501' || trimmed === '901') return true;
  return trimmed.includes('501') || trimmed.includes('สำเร็จ') || trimmed.includes('รับพัสดุแล้ว');
}

/**
 * ตรวจสอบว่าเป็นสถานะนำจ่ายไม่สำเร็จ / มีปัญหา (401, 402, 203, 304) หรือไม่
 */
export function isDeliveryProblem(codeOrText?: string): boolean {
  if (!codeOrText) return false;
  const trimmed = codeOrText.trim();
  if (['401', '402', '203', '304', '104'].includes(trimmed)) return true;
  return (
    trimmed.includes('401') ||
    trimmed.includes('ไม่สำเร็จ') ||
    trimmed.includes('ส่งคืนต้นทาง') ||
    trimmed.includes('ตีกลับ') ||
    trimmed.includes('ติดต่อไม่ได้')
  );
}

/**
 * ตรวจสอบว่าเป็นสถานะเปิดถุง / รับเข้าที่ทำการปลายทาง (220, 206) ที่ใช้นับเริ่ม SLA หรือไม่
 */
export function isBagOpenEventStatus(code?: string, text?: string): boolean {
  if (code === '220' || code === '206') return true;
  if (!text) return false;
  return (
    text.includes('เปิดถุง') ||
    text.includes('Receive From Shipment') ||
    text.includes('ถึงที่ทำการ') ||
    text.includes('ถึงศูนย์คัดแยกปลายทาง')
  );
}
