import { hoursAgo } from './demoClock';

// Mock data simulating the MyOrder merchant platform integration.
// In production these would come from the MyOrder API (orders created by each shop).

export interface MyOrderShop {
  id: string;
  name: string;
  ownerName: string;
  province: string;
}

export type MyOrderStatus = 'PENDING_PAYMENT' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface MyOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface MyOrder {
  orderId: string;
  shopId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: MyOrderItem[];
  shippingService: 'EMS' | 'ลงทะเบียน' | 'e-Parcel';
  orderStatus: MyOrderStatus;
  trackingNumber?: string;
  shippedAt?: string;
  caseId?: string; // linked ThaiPost case once the shop reports a problem
}

export const MYORDER_SHOPS: MyOrderShop[] = [
  { id: 'SHOP-01', name: 'ร้านผ้าไหมบ้านครูสมศรี', ownerName: 'ครูสมศรี ทองสุข', province: 'สุรินทร์' },
  { id: 'SHOP-02', name: 'Healthy Snack by Nok', ownerName: 'คุณนก ปัทมา', province: 'ปทุมธานี' },
  { id: 'SHOP-03', name: 'Gadget Corner BKK', ownerName: 'คุณต้น ภาณุ', province: 'กรุงเทพมหานคร' },
  { id: 'SHOP-04', name: 'Beauty Box by Fah', ownerName: 'คุณฟ้า อารียา', province: 'กรุงเทพมหานคร' },
  { id: 'SHOP-05', name: 'HomeLiving Deco', ownerName: 'คุณเอกสิทธิ์ ใจงาม', province: 'สมุทรปราการ' }
];

export const MYORDER_ORDER_STATUS_META: Record<MyOrderStatus, { label: string; bg: string; color: string; border: string }> = {
  PENDING_PAYMENT: { label: 'รอชำระเงิน', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  READY_TO_SHIP: { label: 'รอจัดส่ง', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  SHIPPED: { label: 'จัดส่งแล้ว', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  DELIVERED: { label: 'ส่งถึงแล้ว', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  CANCELLED: { label: 'ยกเลิก', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' }
};

export const isShippedOrder = (o: MyOrder) =>
  !!o.trackingNumber && (o.orderStatus === 'SHIPPED' || o.orderStatus === 'DELIVERED');

export const orderTotal = (o: MyOrder) => o.items.reduce((sum, i) => sum + i.qty * i.price, 0);


export const INITIAL_MYORDER_ORDERS: MyOrder[] = [
  {
    orderId: 'MO-240901',
    shopId: 'SHOP-01',
    createdAt: hoursAgo(98),
    customerName: 'คุณวราภรณ์ ศรีสุข',
    customerPhone: '089-552-XXXX',
    shippingAddress: '55/7 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000',
    items: [{ name: 'ผ้าไหมมัดหมี่ลายโบราณ 2 เมตร', qty: 1, price: 2450 }],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'EN100200301TH',
    shippedAt: hoursAgo(97)
  },
  {
    orderId: 'MO-240902',
    shopId: 'SHOP-01',
    createdAt: hoursAgo(118),
    customerName: 'คุณธีรวัฒน์ บุญมา',
    customerPhone: '086-310-XXXX',
    shippingAddress: '12 ถ.ชยางกูร ต.ในเมือง อ.เมือง จ.อุบลราชธานี 34000',
    items: [
      { name: 'ผ้าไหมพื้นสีครามทอมือ', qty: 1, price: 1890 },
      { name: 'ผ้าขาวม้าไหม', qty: 2, price: 390 }
    ],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200302TH',
    shippedAt: hoursAgo(115),
    caseId: 'TP-2026-0008'
  },
  {
    orderId: 'MO-240903',
    shopId: 'SHOP-01',
    createdAt: hoursAgo(5),
    customerName: 'คุณมาลี จันทร์เพ็ญ',
    customerPhone: '082-114-XXXX',
    shippingAddress: '7 ซ.รามคำแหง 24 แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
    items: [{ name: 'ผ้าคลุมไหล่ไหม', qty: 1, price: 890 }],
    shippingService: 'e-Parcel',
    orderStatus: 'READY_TO_SHIP'
  },
  {
    orderId: 'MO-240904',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(76),
    customerName: 'คุณอรอุมา แก้วมณี',
    customerPhone: '081-907-XXXX',
    shippingAddress: '301/5 ถ.ตลาดใหม่ ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000',
    items: [
      { name: 'กราโนล่าธัญพืช 500g', qty: 3, price: 259 },
      { name: 'น้ำผึ้งดอกลำไย 1 ลิตร (ขวดแก้ว)', qty: 1, price: 420 }
    ],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'EN100200304TH',
    shippedAt: hoursAgo(74),
    caseId: 'TP-2026-0009'
  },
  {
    orderId: 'MO-240905',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(50),
    customerName: 'คุณพิมพ์ชนก ใจดี',
    customerPhone: '084-661-XXXX',
    shippingAddress: '88 ถ.บุญวาทย์ ต.สวนดอก อ.เมือง จ.ลำปาง 52000',
    items: [{ name: 'ชุดขนมคลีนรวม 6 ชิ้น', qty: 2, price: 349 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200305TH',
    shippedAt: hoursAgo(48)
  },
  {
    orderId: 'MO-240906',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(2),
    customerName: 'คุณศิริพร เพชรดี',
    customerPhone: '087-330-XXXX',
    shippingAddress: '19/2 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
    items: [{ name: 'อัลมอนด์อบเกลือ 250g', qty: 4, price: 189 }],
    shippingService: 'ลงทะเบียน',
    orderStatus: 'PENDING_PAYMENT'
  },
  {
    orderId: 'MO-240907',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(48),
    customerName: 'คุณชยพล รุ่งเรือง',
    customerPhone: '092-448-XXXX',
    shippingAddress: 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    items: [{ name: 'หูฟังไร้สาย ANC รุ่น Pro', qty: 1, price: 3290 }],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'EN100200307TH',
    shippedAt: hoursAgo(46),
    caseId: 'TP-2026-0010'
  },
  {
    orderId: 'MO-240908',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(28),
    customerName: 'คุณณัฐวุฒิ ทองดี',
    customerPhone: '083-201-XXXX',
    shippingAddress: '9/99 หมู่ 5 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000',
    items: [
      { name: 'สายชาร์จ USB-C 2 เมตร', qty: 2, price: 290 },
      { name: 'Power Bank 20000mAh', qty: 1, price: 890 }
    ],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200308TH',
    shippedAt: hoursAgo(26)
  },
  {
    orderId: 'MO-240921',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(54),
    customerName: 'คุณวรรณา ศรีสวัสดิ์',
    customerPhone: '089-552-XXXX',
    // Postal code typed wrong: the address is in Nakhon Ratchasima (30000)
    shippingAddress: '45/2 ถ.มิตรภาพ ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 38000',
    items: [{ name: 'ลำโพงบลูทูธ กันน้ำ', qty: 1, price: 1590 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200321TH',
    shippedAt: hoursAgo(50),
    caseId: 'TP-2026-0025'
  },
  {
    orderId: 'MO-240909',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(30),
    customerName: 'คุณปิยะ สายทอง',
    customerPhone: '090-771-XXXX',
    shippingAddress: '45 ถ.ประชาอุทิศ แขวงราษฎร์บูรณะ กรุงเทพฯ 10140',
    items: [{ name: 'เมาส์ไร้สาย', qty: 1, price: 590 }],
    shippingService: 'e-Parcel',
    orderStatus: 'CANCELLED'
  },

  // ---------- Orders behind the long-running ThaiPost cases (TP-2026-0001 .. 0007) ----------
  {
    orderId: 'MO-240890',
    shopId: 'SHOP-04',
    createdAt: hoursAgo(80),
    customerName: 'คุณพัชราภรณ์ วงศ์สว่าง',
    customerPhone: '081-445-XXXX',
    shippingAddress: '128/4 หมู่ 3 ต.บวกค้าง อ.สันกำแพง จ.เชียงใหม่ 50130',
    items: [{ name: 'เซ็ตสกินแคร์ผิวใส 5 ชิ้น', qty: 1, price: 1590 }],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'ED882194821TH',
    shippedAt: hoursAgo(74),
    caseId: 'TP-2026-0001'
  },
  {
    orderId: 'MO-240891',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(126),
    customerName: 'นายธนาธิป เจริญกิจ',
    customerPhone: '089-771-XXXX',
    shippingAddress: '45/12 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
    items: [{ name: 'SSD NVMe 1TB', qty: 2, price: 2190 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'ED776512349TH',
    shippedAt: hoursAgo(121),
    caseId: 'TP-2026-0002'
  },
  {
    orderId: 'MO-240892',
    shopId: 'SHOP-04',
    createdAt: hoursAgo(150),
    customerName: 'คุณกัญญารัตน์ มรกต',
    customerPhone: '082-998-XXXX',
    shippingAddress: '78/2 ถ.พังงา ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000',
    items: [
      { name: 'รองพื้นเนื้อแมตต์ 30ml', qty: 2, price: 890 },
      { name: 'เซรั่มวิตามินซี 50ml', qty: 1, price: 1250 }
    ],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EF123984512TH',
    shippedAt: hoursAgo(143),
    caseId: 'TP-2026-0003'
  },
  {
    orderId: 'MO-240893',
    shopId: 'SHOP-03',
    createdAt: hoursAgo(118),
    customerName: 'ศ.ดร. นันทวัน รัตนโกสินทร์',
    customerPhone: '086-123-XXXX',
    shippingAddress: '123/9 ม.ขอนแก่น ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    items: [{ name: 'โน้ตบุ๊ก 14 นิ้ว รุ่น Air', qty: 1, price: 28900 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'ED993812745TH',
    shippedAt: hoursAgo(113),
    caseId: 'TP-2026-0004'
  },
  {
    orderId: 'MO-240894',
    shopId: 'SHOP-05',
    createdAt: hoursAgo(34),
    customerName: 'วิชัย การช่าง',
    customerPhone: '085-334-XXXX',
    shippingAddress: '88/5 หมู่ 2 ต.เสม็ด อ.เมืองชลบุรี จ.ชลบุรี 20000',
    items: [{ name: 'ชั้นวางของไม้สัก 4 ชั้น', qty: 1, price: 2890 }],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'ED551029384TH',
    shippedAt: hoursAgo(26),
    caseId: 'TP-2026-0005'
  },
  {
    orderId: 'MO-240895',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(28),
    customerName: 'คุณศุภชัย ทิพย์พนม',
    customerPhone: '084-221-XXXX',
    shippingAddress: '44 ถ.เทวาภิบาล ต.ในเมือง อ.เมือง จ.ร้อยเอ็ด 45000',
    items: [{ name: 'กราโนล่าธัญพืช 500g', qty: 2, price: 259 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'ED114477223TH',
    shippedAt: hoursAgo(24),
    caseId: 'TP-2026-0006'
  },
  {
    orderId: 'MO-240896',
    shopId: 'SHOP-05',
    createdAt: hoursAgo(54),
    customerName: 'คุณภัทรดนัย',
    customerPhone: '081-998-XXXX',
    shippingAddress: 'คอนโด LPN จตุจักร ถ.พหลโยธิน กรุงเทพฯ 10900',
    items: [{ name: 'โคมไฟตั้งโต๊ะเซรามิก', qty: 1, price: 1190 }],
    shippingService: 'EMS',
    orderStatus: 'DELIVERED',
    trackingNumber: 'ED332211998TH',
    shippedAt: hoursAgo(48),
    caseId: 'TP-2026-0007'
  },

  // ---------- Shipped orders still in progress (good candidates for bulk "เร่งนำส่ง") ----------
  {
    orderId: 'MO-240910',
    shopId: 'SHOP-01',
    createdAt: hoursAgo(64),
    customerName: 'คุณจิราพร แสงทอง',
    customerPhone: '081-220-XXXX',
    shippingAddress: '99 ถ.ศรีจันทร์ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    items: [{ name: 'ผ้าไหมแพรวา 2 เมตร', qty: 1, price: 3200 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200310TH',
    shippedAt: hoursAgo(60)
  },
  {
    orderId: 'MO-240911',
    shopId: 'SHOP-01',
    createdAt: hoursAgo(74),
    customerName: 'คุณเพ็ญศรี ดอยคำ',
    customerPhone: '089-118-XXXX',
    shippingAddress: '15 หมู่ 2 ต.หนองควาย อ.หางดง จ.เชียงใหม่ 50230',
    items: [{ name: 'ผ้าไหมพื้นสีชมพู', qty: 1, price: 1690 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200311TH',
    shippedAt: hoursAgo(70)
  },
  {
    orderId: 'MO-240912',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(55),
    customerName: 'คุณวิภาวี ศรีทอง',
    customerPhone: '086-552-XXXX',
    shippingAddress: '22/1 ถ.ราชวิถี ต.พระปฐมเจดีย์ อ.เมือง จ.นครปฐม 73000',
    items: [{ name: 'กราโนล่าธัญพืช 500g', qty: 4, price: 259 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200312TH',
    shippedAt: hoursAgo(52)
  },
  {
    orderId: 'MO-240913',
    shopId: 'SHOP-02',
    createdAt: hoursAgo(44),
    customerName: 'คุณสุรเชษฐ์ มั่นคง',
    customerPhone: '082-771-XXXX',
    shippingAddress: '88/12 ม.พฤกษา ต.บางรักพัฒนา อ.บางบัวทอง จ.นนทบุรี 11110',
    items: [{ name: 'ชุดขนมคลีนรวม 6 ชิ้น', qty: 1, price: 349 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200313TH',
    shippedAt: hoursAgo(40)
  },
  {
    orderId: 'MO-240914',
    shopId: 'SHOP-04',
    createdAt: hoursAgo(62),
    customerName: 'คุณอัญชลี บุญเรือง',
    customerPhone: '084-903-XXXX',
    shippingAddress: '7 ถ.โพศรี ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000',
    items: [{ name: 'ครีมกันแดด SPF50', qty: 2, price: 450 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200314TH',
    shippedAt: hoursAgo(58)
  },
  {
    orderId: 'MO-240915',
    shopId: 'SHOP-05',
    createdAt: hoursAgo(70),
    customerName: 'คุณกิตติพงษ์ ทะเลงาม',
    customerPhone: '085-640-XXXX',
    shippingAddress: '120/8 ถ.สุขุมวิท ต.ศรีราชา อ.ศรีราชา จ.ชลบุรี 20110',
    items: [{ name: 'ตะกร้าหวายสาน', qty: 2, price: 590 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200315TH',
    shippedAt: hoursAgo(66)
  },
  {
    orderId: 'MO-240916',
    shopId: 'SHOP-05',
    createdAt: hoursAgo(49),
    customerName: 'คุณนภาพร จันทร์หอม',
    customerPhone: '087-215-XXXX',
    shippingAddress: '31 ถ.บรมไตรโลกนาถ ต.ในเมือง อ.เมือง จ.พิษณุโลก 65000',
    items: [{ name: 'แจกันเซรามิกทรงสูง', qty: 1, price: 890 }],
    shippingService: 'EMS',
    orderStatus: 'SHIPPED',
    trackingNumber: 'EN100200316TH',
    shippedAt: hoursAgo(45)
  }
];
