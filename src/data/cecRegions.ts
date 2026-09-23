import type { CecInfo, ParcelInfo } from '../types/case';

export const CEC_REGIONS: CecInfo[] = [
  {
    id: 1,
    code: 'CEC-01',
    name: 'CEC 1 (กรุงเทพฯ ตอนเหนือ & ปทุมธานี)',
    regionName: 'กรุงเทพฯ เหนือ / ปทุมธานี / นนทบุรี',
    provinces: ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี'],
    memberCount: 480,
    contactEmail: 'cec01@thailandpost.com',
    phone: '02-573-0001'
  },
  {
    id: 2,
    code: 'CEC-02',
    name: 'CEC 2 (กรุงเทพฯ ตอนใต้ & สมุทรปราการ)',
    regionName: 'กรุงเทพฯ ใต้ / สมุทรปราการ',
    provinces: ['กรุงเทพมหานคร', 'สมุทรปราการ'],
    memberCount: 460,
    contactEmail: 'cec02@thailandpost.com',
    phone: '02-573-0002'
  },
  {
    id: 3,
    code: 'CEC-03',
    name: 'CEC 3 (ภาคกลาง & ตะวันตก)',
    regionName: 'พระนครศรีอยุธยา / สระบุรี / ลพบุรี / สิงห์บุรี / อ่างทอง',
    provinces: ['พระนครศรีอยุธยา', 'สระบุรี', 'ลพบุรี', 'สิงห์บุรี', 'อ่างทอง', 'ชัยนาท'],
    memberCount: 390,
    contactEmail: 'cec03@thailandpost.com',
    phone: '035-241-003'
  },
  {
    id: 4,
    code: 'CEC-04',
    name: 'CEC 4 (ภาคตะวันออก)',
    regionName: 'ชลบุรี / ระยอง / จันทบุรี / ตราด / ฉะเชิงเทรา',
    provinces: ['ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'สระแก้ว'],
    memberCount: 420,
    contactEmail: 'cec04@thailandpost.com',
    phone: '038-278-004'
  },
  {
    id: 5,
    code: 'CEC-05',
    name: 'CEC 5 (ภาคเหนือตอนบน)',
    regionName: 'เชียงใหม่ / เชียงราย / ลำปาง / ลำพูน / แม่ฮ่องสอน',
    provinces: ['เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'แม่ฮ่องสอน', 'พะเยา', 'แพร่', 'น่าน'],
    memberCount: 450,
    contactEmail: 'cec05@thailandpost.com',
    phone: '053-241-005'
  },
  {
    id: 6,
    code: 'CEC-06',
    name: 'CEC 6 (ภาคเหนือตอนล่าง)',
    regionName: 'พิษณุโลก / นครสวรรค์ / สุโขทัย / กำแพงเพชร / ตาก',
    provinces: ['พิษณุโลก', 'นครสวรรค์', 'สุโขทัย', 'กำแพงเพชร', 'พิจิตร', 'เพชรบูรณ์', 'ตาก', 'อุตรดิตถ์', 'อุทัยธานี'],
    memberCount: 380,
    contactEmail: 'cec06@thailandpost.com',
    phone: '055-258-006'
  },
  {
    id: 7,
    code: 'CEC-07',
    name: 'CEC 7 (ภาคอีสานตอนบน 1)',
    regionName: 'ขอนแก่น / อุดรธานี / หนองคาย / เลย / หนองบัวลำภู',
    provinces: ['ขอนแก่น', 'อุดรธานี', 'หนองคาย', 'เลย', 'หนองบัวลำภู', 'บึงกาฬ'],
    memberCount: 410,
    contactEmail: 'cec07@thailandpost.com',
    phone: '043-221-007'
  },
  {
    id: 8,
    code: 'CEC-08',
    name: 'CEC 8 (ภาคอีสานตอนบน 2)',
    regionName: 'สกลนคร / นครพนม / มุกดาหาร / กาฬสินธุ์',
    provinces: ['สกลนคร', 'นครพนม', 'มุกดาหาร', 'กาฬสินธุ์', 'มหาสารคาม', 'ร้อยเอ็ด'],
    memberCount: 360,
    contactEmail: 'cec08@thailandpost.com',
    phone: '042-712-008'
  },
  {
    id: 9,
    code: 'CEC-09',
    name: 'CEC 9 (ภาคอีสานตอนล่าง 1)',
    regionName: 'นครราชสีมา / ชัยภูมิ / บุรีรัมย์',
    provinces: ['นครราชสีมา', 'ชัยภูมิ', 'บุรีรัมย์', 'สุรินทร์'],
    memberCount: 430,
    contactEmail: 'cec09@thailandpost.com',
    phone: '044-245-009'
  },
  {
    id: 10,
    code: 'CEC-10',
    name: 'CEC 10 (ภาคอีสานตอนล่าง 2)',
    regionName: 'อุบลราชธานี / ศรีสะเกษ / ยโสธร / อำนาจเจริญ',
    provinces: ['อุบลราชธานี', 'ศรีสะเกษ', 'ยโสธร', 'อำนาจเจริญ'],
    memberCount: 350,
    contactEmail: 'cec10@thailandpost.com',
    phone: '045-244-010'
  },
  {
    id: 11,
    code: 'CEC-11',
    name: 'CEC 11 (ภาคตะวันตก & เพชรบุรี)',
    regionName: 'ราชบุรี / นครปฐม / สุพรรณบุรี / กาญจนบุรี / เพชรบุรี',
    provinces: ['ราชบุรี', 'นครปฐม', 'สุพรรณบุรี', 'กาญจนบุรี', 'สมุทรสาคร', 'สมุทรสงคราม', 'เพชรบุรี', 'ประจวบคีรีขันธ์'],
    memberCount: 380,
    contactEmail: 'cec11@thailandpost.com',
    phone: '032-337-011'
  },
  {
    id: 12,
    code: 'CEC-12',
    name: 'CEC 12 (ภาคใต้ตอนบน)',
    regionName: 'สุราษฎร์ธานี / นครศรีธรรมราช / ชุมพร / ระนอง',
    provinces: ['สุราษฎร์ธานี', 'นครศรีธรรมราช', 'ชุมพร', 'ระนอง', 'กระบี่', 'พังงา', 'ภูเก็ต'],
    memberCount: 420,
    contactEmail: 'cec12@thailandpost.com',
    phone: '077-282-012'
  },
  {
    id: 13,
    code: 'CEC-13',
    name: 'CEC 13 (ภาคใต้ตอนล่าง 1)',
    regionName: 'สงขลา / ตรัง / พัทลุง / สตูล',
    provinces: ['สงขลา', 'ตรัง', 'พัทลุง', 'สตูล'],
    memberCount: 390,
    contactEmail: 'cec13@thailandpost.com',
    phone: '074-235-013'
  },
  {
    id: 14,
    code: 'CEC-14',
    name: 'CEC 14 (ชายแดนใต้)',
    regionName: 'ยะลา / ปัตตานี / นราธิวาส',
    provinces: ['ยะลา', 'ปัตตานี', 'นราธิวาส'],
    memberCount: 310,
    contactEmail: 'cec14@thailandpost.com',
    phone: '073-212-014'
  }
];

const ZIP_PREFIX_TO_CEC_INDEX: Record<string, number> = {
  '10': 0, '11': 0,                                              // CEC 1 / 2 BKK
  '12': 2, '13': 2, '14': 2, '18': 2,                            // CEC 3
  '20': 3, '21': 3, '22': 3, '23': 3, '24': 3, '25': 3,          // CEC 4 East
  '50': 4, '51': 4, '52': 4, '53': 4, '55': 4, '57': 4, '58': 4, // CEC 5 Chiang Mai
  '60': 5, '61': 5, '62': 5, '63': 5, '64': 5, '65': 5, '66': 5, '67': 5, // CEC 6 Phitsanulok
  '38': 6, '40': 6, '41': 6, '42': 6, '43': 6,                   // CEC 7 Khon Kaen
  '44': 7, '45': 7, '46': 7, '47': 7, '48': 7, '49': 7,          // CEC 8 Sakon Nakhon
  '30': 8, '31': 8, '32': 8, '36': 8,                            // CEC 9 Korat
  '33': 9, '34': 9, '35': 9, '37': 9,                            // CEC 10 Ubon
  '70': 10, '71': 10, '72': 10, '73': 10, '74': 10, '75': 10, '76': 10, '77': 10, // CEC 11 Ratchaburi
  '80': 11, '81': 11, '82': 11, '83': 11, '84': 11, '85': 11, '86': 11,           // CEC 12 Surat Thani
  '90': 12, '91': 12, '92': 12, '93': 12,                        // CEC 13 Songkhla
  '94': 13, '95': 13, '96': 13                                   // CEC 14 Deep South
};

// Strict lookup: returns undefined when the zip/province does not map to any CEC
export function findCecByZipCodeOrProvince(zipCode?: string, province?: string): CecInfo | undefined {
  const index = zipCode ? ZIP_PREFIX_TO_CEC_INDEX[zipCode.slice(0, 2)] : undefined;
  if (index !== undefined) return CEC_REGIONS[index];

  // Fallback province matching
  if (province) {
    return CEC_REGIONS.find(c => c.provinces.some(p => province.includes(p)));
  }
  return undefined;
}

export function getCecByZipCodeOrProvince(zipCode: string, province?: string): CecInfo {
  return findCecByZipCodeOrProvince(zipCode, province) || CEC_REGIONS[0];
}

// Track & Trace statuses that confirm the parcel has reached (or been handled by) its destination area
const DESTINATION_CONFIRMED_STATUSES = [
  'ถึงศูนย์คัดแยกปลายทาง',
  'ถึงที่ทำการปลายทาง',
  'เตรียมการนำจ่าย',
  'นำจ่ายไม่สำเร็จ',
  'นำจ่ายสำเร็จ'
];

export function isDestinationConfirmed(parcel: ParcelInfo): boolean {
  return parcel.events.some(e => DESTINATION_CONFIRMED_STATUSES.includes(e.status));
}

/**
 * Decide which CEC owns a case from the live parcel status.
 * While the parcel is still in transit / misrouted we cannot tell which CEC should handle it,
 * so the case stays blank until a later Track & Trace update confirms the destination.
 */
export function resolveCecFromParcel(parcel: ParcelInfo): CecInfo | undefined {
  if (!isDestinationConfirmed(parcel)) return undefined;
  return findCecByZipCodeOrProvince(parcel.destZipCode, parcel.destPostOffice);
}
