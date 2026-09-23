import type { CecInfo } from '../types/case';

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

export function getCecByZipCodeOrProvince(zipCode: string, province?: string): CecInfo {
  // Zip code prefix logic
  if (!zipCode && !province) return CEC_REGIONS[0];
  
  const prefix = zipCode.slice(0, 2);
  
  if (prefix === '10' || prefix === '11') {
    return CEC_REGIONS[0]; // CEC 1 / 2 BKK
  } else if (prefix === '12' || prefix === '13' || prefix === '14' || prefix === '18') {
    return CEC_REGIONS[2]; // CEC 3
  } else if (prefix === '20' || prefix === '21' || prefix === '22' || prefix === '23' || prefix === '24' || prefix === '25') {
    return CEC_REGIONS[3]; // CEC 4 East
  } else if (prefix === '50' || prefix === '51' || prefix === '52' || prefix === '53' || prefix === '55' || prefix === '57' || prefix === '58') {
    return CEC_REGIONS[4]; // CEC 5 Chiang Mai
  } else if (prefix === '60' || prefix === '61' || prefix === '62' || prefix === '63' || prefix === '64' || prefix === '65' || prefix === '66' || prefix === '67') {
    return CEC_REGIONS[5]; // CEC 6 Phitsanulok
  } else if (prefix === '40' || prefix === '41' || prefix === '42' || prefix === '43' || prefix === '38') {
    return CEC_REGIONS[6]; // CEC 7 Khon Kaen
  } else if (prefix === '47' || prefix === '48' || prefix === '49' || prefix === '46' || prefix === '44' || prefix === '45') {
    return CEC_REGIONS[7]; // CEC 8 Sakon Nakhon
  } else if (prefix === '30' || prefix === '31' || prefix === '32' || prefix === '36') {
    return CEC_REGIONS[8]; // CEC 9 Korat
  } else if (prefix === '33' || prefix === '34' || prefix === '35' || prefix === '37') {
    return CEC_REGIONS[9]; // CEC 10 Ubon
  } else if (prefix === '70' || prefix === '71' || prefix === '72' || prefix === '73' || prefix === '74' || prefix === '75' || prefix === '76' || prefix === '77') {
    return CEC_REGIONS[10]; // CEC 11 Ratchaburi
  } else if (prefix === '80' || prefix === '81' || prefix === '82' || prefix === '83' || prefix === '84' || prefix === '85' || prefix === '86') {
    return CEC_REGIONS[11]; // CEC 12 Surat Thani
  } else if (prefix === '90' || prefix === '91' || prefix === '92' || prefix === '93') {
    return CEC_REGIONS[12]; // CEC 13 Songkhla
  } else if (prefix === '94' || prefix === '95' || prefix === '96') {
    return CEC_REGIONS[13]; // CEC 14 Deep South
  }

  // Fallback province matching
  if (province) {
    const found = CEC_REGIONS.find(c => c.provinces.some(p => province.includes(p)));
    if (found) return found;
  }

  return CEC_REGIONS[0];
}
