import re

# Update mockCases.ts to provide a rich queue of 18 WAITING_CENTRAL_REVIEW cases,
# ensuring all have recent createdAt (within today: hoursAgo(2) to hoursAgo(6))
# and complete cecReply payloads for the review modal.

with open("src/data/mockCases.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Helper replacements for specific cases:

# 1. TP-2026-0101 -> WAITING_CENTRAL_REVIEW
target_0101_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(6),"""

target_0101_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'เจ้าหน้าที่ ปณ.สันกำแพง ตรวจสอบและประสานบุรุษไปรษณีย์แล้ว ยืนยันนำจ่ายพัสดุให้คุณกิตติศักดิ์เรียบร้อยแล้ว มีภาพถ่ายหลักฐานและลายเซ็นสมบูรณ์ในระบบ QMS ขออนุญาตปิดงาน',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 5 เจ้าหน้าที่ สมพร น.',
      branchNotes: 'ส่งมอบที่บ้านผู้รับแล้ว ลายเซ็นตรงกับชื่อผู้รับจ่าหน้า'
    },"""

if target_0101_old in content:
    content = content.replace(target_0101_old, target_0101_new)
    print("Updated TP-2026-0101 to WAITING_CENTRAL_REVIEW")
else:
    print("Could not find exact TP-2026-0101 target")

# 2. TP-2026-0104 -> WAITING_CENTRAL_REVIEW
target_0104_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 9,
    assignedCecName: 'CEC 9 (ภาคตะวันออกเฉียงเหนือตอนล่าง 1)',
    assignedBranchName: 'ปณ.เมืองนครราชสีมา (นครราชสีมา)',
    createdAt: hoursAgo(5),"""

target_0104_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 9,
    assignedCecName: 'CEC 9 (ภาคตะวันออกเฉียงเหนือตอนล่าง 1)',
    assignedBranchName: 'ปณ.เมืองนครราชสีมา (นครราชสีมา)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'CEC 9 ตรวจสอบแล้ว พบว่า จนท.นำจ่ายกดรหัสผิดพลาด ได้ประสาน ปณ.เมืองนครราชสีมา ระงับการส่งคืนและถอยสถานะแล้ว พร้อมจัดรถนำจ่ายพิเศษรอบบ่ายวันนี้ ติดต่อผู้รับได้เรียบร้อย',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 9 เจ้าหน้าที่ ชาญชัย ว.',
      branchNotes: 'บุรุษไปรษณีย์โทรขอโทษผู้รับแล้ว นัดหมายส่งมอบ 14:00 น.'
    },"""

if target_0104_old in content:
    content = content.replace(target_0104_old, target_0104_new)
    print("Updated TP-2026-0104 to WAITING_CENTRAL_REVIEW")

# 3. TP-2026-0001 -> WAITING_CENTRAL_REVIEW
target_0001_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),"""

target_0001_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 5,
    assignedCecName: 'CEC 5 (ภาคเหนือตอนบน)',
    assignedBranchName: 'ปณ.สันกำแพง (เชียงใหม่)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 5 ตรวจสอบกับ ปณ.สันกำแพง แล้ว บุรุษไปรษณีย์ฝากพัสดุไว้ที่ป้อม รปภ. หมู่บ้านศุภาลัย มีลายเซ็น รปภ.สุรชัย และภาพถ่ายวางที่โต๊ะพัสดุ ได้โทรแจ้งผู้รับรับทราบแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 5 เจ้าหน้าที่ ธนพล ส.',
      branchNotes: 'โทรติดต่อผู้รับแล้ว ผู้รับแจ้งว่าเห็นกล่องที่ป้อม รปภ. เรียบร้อยแล้ว'
    },"""

if target_0001_old in content:
    content = content.replace(target_0001_old, target_0001_new)
    print("Updated TP-2026-0001 to WAITING_CENTRAL_REVIEW")

# 4. TP-2026-0002 -> fix createdAt to hoursAgo(3)
content = content.replace("id: 'TP-2026-0002',\n    trackingNumber: 'ED776512349TH',\n    companyName: 'Gadget Corner BKK',\n    contactPerson: 'คุณต้น ภาณุ',\n    myOrderRef: { orderId: 'MO-240891', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },\n    category: 'DELAYED_DELIVERY',\n    urgency: 'HIGH',\n    customerInquiry: 'พัสดุติดอยู่ที่หาดใหญ่มา 2 วันแล้ว ลูกค้าจำเป็นต้องใช้สินค้าคอมพิวเตอร์ด่วน',\n    status: 'WAITING_CENTRAL_REVIEW',\n    assignedCecId: 13,\n    assignedCecName: 'CEC 13 (ภาคใต้ตอนล่าง 1)',\n    assignedBranchName: 'ปณ.หาดใหญ่ (สงขลา)',\n    createdAt: hoursAgo(30),", "id: 'TP-2026-0002',\n    trackingNumber: 'ED776512349TH',\n    companyName: 'Gadget Corner BKK',\n    contactPerson: 'คุณต้น ภาณุ',\n    myOrderRef: { orderId: 'MO-240891', shopId: 'SHOP-03', shopName: 'Gadget Corner BKK' },\n    category: 'DELAYED_DELIVERY',\n    urgency: 'HIGH',\n    customerInquiry: 'พัสดุติดอยู่ที่หาดใหญ่มา 2 วันแล้ว ลูกค้าจำเป็นต้องใช้สินค้าคอมพิวเตอร์ด่วน',\n    status: 'WAITING_CENTRAL_REVIEW',\n    assignedCecId: 13,\n    assignedCecName: 'CEC 13 (ภาคใต้ตอนล่าง 1)',\n    assignedBranchName: 'ปณ.หาดใหญ่ (สงขลา)',\n    createdAt: hoursAgo(3),")

# 5. TP-2026-0005 -> WAITING_CENTRAL_REVIEW
target_0005_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.เมืองชลบุรี (20000)',
    createdAt: hoursAgo(18),"""

target_0005_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.เมืองชลบุรี (20000)',
    createdAt: hoursAgo(5),
    cecReply: {
      answer: 'CEC 4 ดึงภาพถ่ายใบรับและลายมือชื่อจากระบบ QMS สาขาเมืองชลบุรี เรียบร้อยแล้ว ผู้รับคุณเอกสิทธิ์ เซ็นรับด้วยตนเองเมื่อ 06/10 เวลา 11:20 น. แนบภาพถ่ายให้ร้านค้าแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 4 เจ้าหน้าที่ วิมลมาศ',
      branchNotes: 'เอกสาร POD อัปโหลดเข้าสู่ระบบสมบูรณ์'
    },"""

if target_0005_old in content:
    content = content.replace(target_0005_old, target_0005_new)
    print("Updated TP-2026-0005 to WAITING_CENTRAL_REVIEW")

# 6. TP-2026-0009 -> WAITING_CENTRAL_REVIEW
target_0009_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองสุราษฎร์ธานี (84000)',
    createdAt: hoursAgo(20),"""

target_0009_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 12,
    assignedCecName: 'CEC 12 (ภาคใต้ตอนบน)',
    assignedBranchName: 'ปณ.เมืองสุราษฎร์ธานี (84000)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 12 ตรวจสอบกับ ปณ.สุราษฎร์ธานี พบว่าพัสดุตกกระแทกระหว่างคัดแยกที่ศูนย์ทุ่งสง สาขาได้ออกเอกสารบันทึก ปณ.14 รับรองความเสียหายแล้ว ขอส่งให้ส่วนกลางอนุมัติจ่ายเงินชดใช้ตามสิทธิ์ EMS (2,000 บาท)',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 12 เจ้าหน้าที่ ไพโรจน์',
      branchNotes: 'มีใบ ปณ.14 แนบในระบบ และภาพถ่ายขวดแตกครบถ้วน'
    },"""

if target_0009_old in content:
    content = content.replace(target_0009_old, target_0009_new)
    print("Updated TP-2026-0009 to WAITING_CENTRAL_REVIEW")

# 7. TP-2026-0015 -> WAITING_CENTRAL_REVIEW
target_0015_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.ศรีราชา (20110)',
    createdAt: hoursAgo(16),"""

target_0015_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 4,
    assignedCecName: 'CEC 4 (ภาคตะวันออก)',
    assignedBranchName: 'ปณ.ศรีราชา (20110)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'ปณ.ศรีราชา ติดต่อผู้รับรอบเช้าเรียบร้อยแล้ว ผู้รับยืนยันอยู่บ้านช่วงบ่ายวันนี้ ได้จัดลงสายนำจ่ายรอบ 13:30-15:00 น. เรียบร้อยแล้ว',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 4 เจ้าหน้าที่ อมรรัตน์',
      branchNotes: 'ประสานบุรุษไปรษณีย์สายอัสสัมชัญ นำจ่ายรอบบ่าย'
    },"""

if target_0015_old in content:
    content = content.replace(target_0015_old, target_0015_new)
    print("Updated TP-2026-0015 to WAITING_CENTRAL_REVIEW")

# 8. TP-2026-0019 -> WAITING_CENTRAL_REVIEW
target_0019_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 14,
    assignedCecName: 'CEC 14 (ชายแดนใต้)',
    assignedBranchName: 'ปณ.เมืองยะลา (95000)',
    createdAt: hoursAgo(30),"""

target_0019_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 14,
    assignedCecName: 'CEC 14 (ชายแดนใต้)',
    assignedBranchName: 'ปณ.เมืองยะลา (95000)',
    createdAt: hoursAgo(4),
    cecReply: {
      answer: 'CEC 14 ตรวจสอบกับ ปณ.เมืองยะลา พัสดุถึงที่ทำการเรียบร้อย อยู่ระหว่างการนำจ่ายในพื้นที่เขตปลอดภัยรอบเช้าวันนี้ คาดส่งมอบก่อน 15:00 น.',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 14 เจ้าหน้าที่ อับดุลเลาะห์',
      branchNotes: 'ประสานสายนำจ่ายเขตเทศบาลนครยะลาเรียบร้อย'
    },"""

if target_0019_old in content:
    content = content.replace(target_0019_old, target_0019_new)
    print("Updated TP-2026-0019 to WAITING_CENTRAL_REVIEW")

# 9. TP-2026-0020 -> fix createdAt to hoursAgo(5)
content = content.replace("createdAt: hoursAgo(48),", "createdAt: hoursAgo(5),")

# 10. TP-2026-0023 -> WAITING_CENTRAL_REVIEW
target_0023_old = """    status: 'WAITING_CEC_REPLY',
    assignedCecId: 10,
    assignedCecName: 'CEC 10 (ภาคอีสานตอนล่าง 2)',
    assignedBranchName: 'ปณ.เมืองอุบลราชธานี (34000)',
    createdAt: hoursAgo(6),"""

target_0023_new = """    status: 'WAITING_CENTRAL_REVIEW',
    assignedCecId: 10,
    assignedCecName: 'CEC 10 (ภาคอีสานตอนล่าง 2)',
    assignedBranchName: 'ปณ.เมืองอุบลราชธานี (34000)',
    createdAt: hoursAgo(3),
    cecReply: {
      answer: 'ปณ.เมืองอุบลราชธานี ได้จัดพัสดุลงสายนำจ่ายด่วนพิเศษรอบเช้าแล้ว บุรุษไปรษณีย์โทรแจ้งผู้รับว่าจะเข้าส่งมอบเวลา 11:30 น. วันนี้ครับ',
      repliedAt: hoursAgo(1),
      repliedBy: 'CEC 10 เจ้าหน้าที่ สุวิทย์',
      branchNotes: 'ส่งมอบรอบเช้าเรียบร้อย'
    },"""

if target_0023_old in content:
    content = content.replace(target_0023_old, target_0023_new)
    print("Updated TP-2026-0023 to WAITING_CENTRAL_REVIEW")

# Now add 6 new high-quality WAITING_CENTRAL_REVIEW cases (TP-2026-0105 to TP-2026-0110)
new_cases_code = """
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
    parcelInfo: {
      trackingNumber: 'ED887711221TH',
      originPostOffice: 'ปณ.บางซื่อ (10800)',
      destPostOffice: 'ปณ.เมืองขอนแก่น จ.ขอนแก่น (40000)',
      receiverName: 'คุณชานนท์ สิทธิเดช',
      receiverPhone: '081-772-XXXX',
      receiverAddress: '124/5 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
      status: 'นำจ่ายสำเร็จ (501)',
      statusCode: '501',
      signerName: 'ชานนท์ (ผู้รับตรงตัว)',
      bagOpenedAt: '2026-10-06T08:30:00.000Z',
      deliveryProofPhotoUrl: KNOWN_PARCELS['ED882194821TH']?.deliveryProofPhotoUrl
    }
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
    parcelInfo: {
      trackingNumber: 'ED887711222TH',
      originPostOffice: 'ปณ.คลองหลวง (12120)',
      destPostOffice: 'ปณ.ลาดพร้าว จ.กรุงเทพฯ (10310)',
      receiverName: 'คุณสุภาวดี มณีฉาย',
      receiverPhone: '089-223-XXXX',
      receiverAddress: '88/19 ซ.ลาดพร้าว 71 แขวงสะพานสอง เขตวังทองหลาง กทม. 10310',
      status: 'นำจ่ายสำเร็จ (501)',
      statusCode: '501',
      signerName: 'สุภาวดี (ผู้รับตรงตัว)',
      bagOpenedAt: '2026-10-05T09:00:00.000Z',
      deliveryProofPhotoUrl: KNOWN_PARCELS['ED901234561TH']?.deliveryProofPhotoUrl
    }
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
    parcelInfo: {
      trackingNumber: 'ED887711223TH',
      originPostOffice: 'ปณ.บางพลี (10540)',
      destPostOffice: 'ปณ.พระนครศรีอยุธยา จ.อยุธยา (13000)',
      receiverName: 'คุณจตุพร บุญช่วย',
      receiverPhone: '084-551-XXXX',
      receiverAddress: '55 หมู่ 3 ต.คลองสวนพลู อ.พระนครศรีอยุธยา จ.อยุธยา 13000',
      status: 'อยู่ระหว่างการนำจ่ายใหม่ (401)',
      statusCode: '401',
      bagOpenedAt: '2026-10-05T08:00:00.000Z'
    }
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
    parcelInfo: {
      trackingNumber: 'ED887711224TH',
      originPostOffice: 'ปณ.เมืองขอนแก่น (40000)',
      destPostOffice: 'ปณ.นครปฐม จ.นครปฐม (73000)',
      receiverName: 'คุณพิมลพรรณ สดใส',
      receiverPhone: '086-778-XXXX',
      receiverAddress: '12/4 ถ.ราชดำเนิน ต.พระปฐมเจดีย์ อ.เมือง จ.นครปฐม 73000',
      status: 'ถอยสถานะส่งคืนต้นทางแล้ว (401)',
      statusCode: '401',
      bagOpenedAt: '2026-10-05T10:00:00.000Z'
    }
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
    parcelInfo: {
      trackingNumber: 'ED887711225TH',
      originPostOffice: 'ปณ.บางขุนเทียน (10150)',
      destPostOffice: 'ปณ.สมุทรสาคร จ.สมุทรสาคร (74000)',
      receiverName: 'คุณรัชดา มั่นคง',
      receiverPhone: '089-991-XXXX',
      receiverAddress: '78/2 ถ.เอกชัย ต.มหาชัย อ.เมือง จ.สมุทรสาคร 74000',
      status: 'สิ่งของชำรุดเสียหาย (มีใบ ปณ.14)',
      statusCode: '303',
      bagOpenedAt: '2026-10-05T08:00:00.000Z'
    }
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
    parcelInfo: {
      trackingNumber: 'ED887711226TH',
      originPostOffice: 'ปณ.ดินแดง (10400)',
      destPostOffice: 'ปณ.เด่นชัย จ.แพร่ (54110)',
      receiverName: 'คุณเกรียงไกร ชัยชนะ',
      receiverPhone: '081-334-XXXX',
      receiverAddress: '99/1 ถ.ยันตรกิจโกศล ต.เด่นชัย อ.เด่นชัย จ.แพร่ 54110',
      status: 'ส่งต่อที่ทำการปลายทาง (301)',
      statusCode: '301',
      bagOpenedAt: '2026-10-04T08:00:00.000Z'
    }
  },
"""

# Insert new cases before the last `];`
idx = content.rfind("];")
if idx != -1:
    content = content[:idx] + new_cases_code + content[idx:]
    print("Appended 6 new WAITING_CENTRAL_REVIEW cases successfully")

with open("src/data/mockCases.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved updated mockCases.ts successfully")
