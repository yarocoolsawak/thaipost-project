import type { ParcelInfo } from '../types/case';

export const KNOWN_PARCELS: Record<string, ParcelInfo> = {
  'ED882194821TH': {
    trackingNumber: 'ED882194821TH',
    originPostOffice: 'ปณ.บางซื่อ (10800)',
    originZipCode: '10800',
    destPostOffice: 'ปณ.สันกำแพง จ.เชียงใหม่ (50130)',
    destZipCode: '50130',
    senderName: 'Shopee Official Mall Fulfillment (คลังบางซื่อ)',
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
    senderName: 'PowerBuy Official Warehouse',
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
    senderName: 'Banana IT Online (Com7)',
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
    senderName: 'Konvy Beauty Official',
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
    senderName: 'HomePro Express Fulfilment',
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
  }
};

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
    senderName: 'คลังสินค้าและศูนย์กระจายสินค้าคู่ค้า ปณท',
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
