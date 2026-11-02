# Data model: ระบบแจ้งปัญหาพัสดุ (ร่าง R1)

> **ปรับ 2 พ.ย. 2569 · B0 v10** ใช้คู่กับ [Business flow B0](flow-preview-b0.html)
> ชื่อตารางและ field เป็นภาษาอังกฤษเพื่อส่งต่อ Dev ได้ทันที ค่าที่ติด *(default)* ปรับได้

## ภาพรวม

ใช้ **ฐานข้อมูล 1 ก้อน** กับ **ที่เก็บไฟล์ 1 ถัง** (object storage) สำหรับไฟล์แนบ ภาพนำจ่าย และลายเซ็น ในฐานข้อมูลแบ่งเป็น 5 กลุ่ม รวม 20 ตาราง

| กลุ่ม | ตาราง | ข้อมูลมาจาก |
|---|---|---|
| A. ผู้ใช้และร้านค้า | `merchants`, `users` | ตั้งค่าโดยแอดมิน · ข้อมูลร้านตั้งต้นจาก `getMerchant` |
| B. พัสดุ (สำเนาจาก ปณท) | `shipments`, `parcels`, `parcel_events`, `parcel_media` | `getOrderByBarcode`, `getHistoryStatus`, webhook, API ภาพ (รอ ปณท) |
| C. เคส | `cases`, `case_messages`, `case_attachments`, `case_requests`, `cec_dispatches` | ร้านค้า, สาขาปลายทาง, CEC (ร่วม), CS (เฝ้าดู), ระบบ |
| D. ประวัติและแจ้งเตือน | `activity_log`, `api_call_log`, `notifications` | ระบบบันทึกเอง |
| E. ข้อมูลหลัก (master) | `cec_units`, `zip_office_cec`, `problem_types`, `status_codes`, `answer_templates`, `sla_rules` | ปณท และทีมโครงการ |

**ระยะการเชื่อมกับ MyOrder** (ปรับ 29 ต.ค. 2569 ตาม comment: กลับมาให้ร้านค้าแจ้งเอง)
- **Phase 1 (ระยะแรก):**
  - **ร้านค้าแจ้งเอง** จากปุ่ม "แจ้งปัญหา" ที่แถวออเดอร์ในหน้า MyOrder › จัดการออเดอร์ › คำสั่งซื้อรอจัดส่ง
  - ต้องเชื่อมกับ MyOrder ตั้งแต่ Phase 1: ปุ่มอ้าง `shipment_id` จากออเดอร์; server ตรวจสิทธิ์ร้านค้าและออเดอร์เอง พร้อมข้อมูลจัดสรรเลข วันสร้างออเดอร์ และรหัสไปรษณีย์ผู้รับ
  - หลังเปิดเคส ร้านค้าคุยกับ **สาขาปลายทางโดยตรง** ในแชทเคส (พิมพ์ / ส่งรูป) ส่งแล้วแจ้งเตือนสาขา CEC และ CS เห็น

**ผู้ตอบเคส บทบาท CS / CEC และ SLA** (ปรับ 30 ต.ค. 2569)
- **สาขาปลายทางเห็นทุกเคส** ตั้งแต่ระบุสาขาแล้ว รวมเคสที่ CS หรือระบบตอบเอง · สาขามีคนตอบประจำในระบบนี้ · การมองเห็นแยกจากการต้องลงมือตอบ · ถ้าหาเขตไม่ได้ CS จัดสาขาก่อน แล้วให้สาขาเห็นทันที
- **CEC รับผิดชอบร่วม** ทุกเคสในเขต เห็นทุกเคส และแทรกในแชทได้ (S19)
- ข้อความจากร้านค้าส่งตรงถึงสาขาปลายทาง CS ไม่ต้องรับเรื่องเอง
- **CS เฝ้าดู (monitoring)** ทุกเคส เห็นสถานะและเวลา SLA ที่เหลือ ระบบคำนวณให้
- **SLA 3 วัน** เริ่มนับเมื่อพัสดุมีสถานะ "ถึงสาขาปลายทาง" (`sla_start_at`) ครบกำหนด `sla_due_at` = +3 วัน · ยังไม่ถึงสาขาปลายทาง = ยังไม่เริ่มนับ
  - ใกล้ครบ: แจ้งเตือน CS อัตโนมัติ (ก่อนกี่ชั่วโมง default 24 · Q-13)
  - **เกิน 3 วัน:** งานอัตโนมัติทุกชั่วโมงหาพัสดุทุกออเดอร์ MyOrder ที่ถึงสาขาปลายทางเกิน 3 วันแต่ยังนำจ่ายไม่สำเร็จ แล้วเปิดเคสถึงสาขาเอง (`channel` = auto_sla) โดยร้านค้าไม่ต้องกด · เคยมีเคสแล้ว (รวมปิดแล้ว) = ไม่เปิดใหม่ตลอดอายุ shipment; เคสปิดหยุดเตือน SLA เคสเปิดแจ้งเตือนตามรอบที่กำหนด (S18)
  - จึงต้องเก็บสถานะพัสดุของ **ทุกออเดอร์** ไม่ใช่แค่พัสดุที่มีเคส (Q-13)
- ถ้าต้องการเร่ง CS หรือ CEC พิมพ์ข้อความ (F-13) ถึงสาขาปลายทางในเคสได้เลย
- **ตอบอัตโนมัติ:** CS ตั้งค่าเองแยกตามประเภทปัญหา (F-14, `problem_types.auto_answer_mode`): ส่งเลย หรือ CS ตรวจก่อน ทั้งสองแบบแจ้งเตือน CS
- CS ลงมือเองเฉพาะข้อยกเว้น: ไม่พบสาขา (S07), แจ้งเตือนสาขาไม่สำเร็จ (S08), สาขาจริงอยู่ที่อื่น (S12)
- รหัสสถานะที่นับเป็น "ถึงสาขาปลายทาง" และการนับวันหยุดรอ Q-03

**เคสเดิมและเลขพัสดุ reuse** (ยืนยันหลักการ 30 ต.ค. 2569; รายละเอียดจับคู่ด้านล่างเป็นแบบออกแบบ)
- ปณท จัดสรรชุดเลขให้ใช้และ reuse เลขได้หลัง 6 เดือน ระบบต้องเก็บหลายรอบของเลขเดียวกันได้โดยไม่ทับกัน
- **หนึ่ง shipment มีหนึ่งเคสตลอดอายุ** รวมเคสที่ปิดแล้ว ไม่แยกเคสใหม่ตามประเภทปัญหา; ร้านค้าคุยเรื่องต่อในเคสเดิมได้
- กดแจ้งแล้วพบเคสเดิม: แสดงว่าเคยแจ้งแล้ว ผลที่จบแล้ว สถานะพัสดุล่าสุดและเวลาอัปเดต ไม่สร้างเคสใหม่ ไม่ถาม F-09
- ร้านค้าส่งข้อความในเคสปิดแล้ว: เก็บ `case_id` เดิม เปลี่ยน `closed` → `waiting_handler` แจ้งเตือนสาขาว่ามีข้อความใหม่ CEC / CS เห็น เก็บประวัติการปิดเดิม; การเปิดเคสอ่านอย่างเดียวไม่เปลี่ยนสถานะ
- ตรวจเคสเดิมจาก `shipment_id` ในฐานข้อมูลก่อนเรียก ปณท; API ล่มยังอ่านและส่งข้อความได้ พร้อมระบุว่าใช้สถานะที่เก็บล่าสุด
- หน้า “คำสั่งซื้อสำเร็จ” ไม่มีปุ่มแจ้งเคส ไม่เพิ่มใน Phase 2; เคสเดิมเก็บประวัติไว้ การเข้าเคสเดิมจากลิงก์แจ้งเตือนต้องตรวจสิทธิ์ (ไม่ใช่การสร้างเคสใหม่)

### กติกาปิดเคสและรอร้านค้ายืนยัน (2 พ.ย. 2569 · S21–S24)
- แยก `close_reason` เป็น `merchant_accepted`, `delivered_auto`, `no_response_timeout`; Archived เป็นมุมมองของเคส closed ไม่ใช่หลักฐานว่าได้รับของ
- เคส auto_sla ที่ยังไม่เคยมีข้อความ/เรื่องจากร้านค้า ปิดด้วย delivered_auto ได้เมื่อสถานะนำจ่ายสำเร็จยืนยันตรง shipment/รอบ และเคสยังเปิด/ไม่มี delivery dispute
- เคสทั่วไปหลังส่งผลแก้ไขสำเร็จ → awaiting_merchant_confirmation; เริ่ม 72 ชั่วโมง (default ปรับแยกประเภทได้) เตือนเมื่อเหลือ 24 ชั่วโมง หากไม่ตอบจึงปิดด้วย no_response_timeout ห้ามเขียนว่าได้รับของหรือร้านค้ายอมรับ
- **เซ็นรับแล้วไม่ได้รับของ: delivery_disputed = true และ merchant_acceptance_required = true** ห้ามปิดอัตโนมัติทุกทาง แม้เคสเริ่มจาก auto_sla, webhook delivered ซ้ำ, ครบเวลา หรือเจ้าหน้าที่เปลี่ยนประเภท; ปิดได้เฉพาะ actor ร้านค้าที่มีสิทธิ์กดยอมรับและปิด
- เคสข้อยกเว้นใช้ confirmation_followup_at = ส่งผลแก้ไขสำเร็จ + 72 ชม. เพื่อแจ้ง CS/สาขาติดตาม แต่ confirmation_due_at = null (ไม่มีเวลาปิดอัตโนมัติ)
- ร้านค้ากดยังไม่จบหรือส่งข้อความ/รูป: ยกเลิก confirmation_due_at และ reminder ของรุ่นนั้น กลับ waiting_handler แจ้งสาขา และ merchant_engaged = true; เปิดอ่านไม่เปลี่ยน state
- เคสปิดแล้วร้านค้าส่งข้อความ: reactivated ใน case_id เดิม เก็บประวัติปิดเดิม; delivered_auto ถูกบล็อกเพราะ merchant_engaged; ถ้าเป็น dispute ยังคงบังคับร้านค้ายอมรับ
- timer ผูก resolution_version และเวลา delivered_to_merchant_at ของผลแก้ไขใหม่ที่ส่งสำเร็จ ไม่เริ่มตอน webhook/ร่างคำตอบ/โน้ตภายใน และไม่เริ่มซ้ำจากการส่งผลเดิมซ้ำ
- ใช้ค่า timeout ที่ snapshot ไว้ตอนเริ่มรุ่น ไม่เปลี่ยน deadline เก่าลับๆ เมื่อแก้ config; job ตรวจ deadline/state/resolution_version/merchant_engaged และข้อยกเว้นตามวิธีปิดอีกครั้งใน transaction เดียวกับ log/notification กัน race และการปิดซ้ำ; ถ้าอ่านข้อความใหม่ถูก commit ก่อน job ต้องไม่ปิดตาม timer เก่า
- log ปิดเก็บ actor, occurred_at, before/after, close_reason, shipment_id, parcel_id, provider_event_id หรือ resolution_version และค่า timeout ที่ใช้; การยอมรับเก็บ accepted_by/at/version แยกจากหมดเวลา
- ทางเข้าแจ้งเซ็นรับไม่ได้รับ: แจ้งเตือน/รายละเอียดติดตามพัสดุ ตรวจเคสเดิมก่อนสร้าง ไม่เพิ่มปุ่มเปิดเคสใหม่ในหน้ารายการคำสั่งซื้อสำเร็จ

### ตัวตนและการจับคู่รอบพัสดุ

**1. ตัวตนของ MyOrder**
- `shipment_id` เป็น ID ภายในที่ไม่เปลี่ยนตลอดการส่งกล่องนั้น ผูก `merchant_id + order_id + shipment_sequence` (ลำดับกล่อง/การจัดสรรเลข)
- ต้องผูก order ID แต่ **order ID อย่างเดียวไม่พอ**: หนึ่งออเดอร์มีหลายกล่องหรือเปลี่ยนเลข/ส่งใหม่ได้ จึงต้องมี shipment แยกแต่ละการจัดสรร
- เก็บ `barcode`, `allocated_at`, เลขอ้างอิงจัดสรรจาก ปณท ถ้ามี และข้อมูลผู้รับ ณ ตอนจัดสรรเป็น snapshot; หากเปลี่ยนที่อยู่ภายหลังไม่ใช้ค่าใหม่ตัดสินว่ารอบเดิมเป็นเลขผิด
- เลขถูก reuse ให้คนละออเดอร์ = สร้าง shipment ใหม่; เปลี่ยนเลข/ส่งทดแทนในออเดอร์เดิม = shipment ใหม่ ไม่แก้เลขทับแถวเดิม; กด retry API เพื่อสร้าง shipment เดิมต้องใช้ idempotency key เดิม
- บังคับไม่ให้เลขเดียวมี shipment ที่ยังใช้งานพร้อมกันหลายรายการในขอบเขตชุดเลขที่ได้รับ; ถ้าพบข้อมูลชนกัน พักให้ตรวจ ไม่เลือกออเดอร์ใดเอง

**2. รอบพัสดุของ ปณท**
- `parcel_id` เป็น ID ภายในของรอบรับฝากจริง ไม่ใช่เลขพัสดุ; ผูกกับ shipment เมื่อยืนยันแล้วเท่านั้น
- ใช้ provider shipment/allocation reference หรือ cycle ID ที่ ปณท รับรองเป็นหลัก ถ้า endpoint นั้นมีให้; เก็บ reference แยกจาก `order_id` ของ MyOrder
- ถ้าไม่มี reference: เทียบหลักฐานจัดสรรเลข/manifest/invoice ที่ตรวจสอบความหมายแล้วกับการรับฝากและขอบเขตรอบ เวลา ผู้รับ และปลายทางเป็นข้อมูลประกอบ ต้องจับคู่ได้เพียงรอบเดียว
- วันสร้างออเดอร์ วันที่รับฝาก postcode หรือช่วง 6 เดือน **ไม่ใช้เดี่ยวๆ ยืนยันรอบ**; ออเดอร์เก่าค้างนาน การนำเข้าย้อนหลัง หรือ webhook มาช้าทำให้เดาผิดได้
- ถ้ามีหลาย candidate, ประวัติไม่ครบ, ไม่พบรับฝากที่ยืนยัน, หรือข้อมูลขัดกัน ให้ `resolution_status = pending_review` และพักข้อมูล/ภาพ; CS ตรวจหลักฐานแล้วบันทึกผู้ยืนยัน เหตุผล และเวลายืนยัน ก่อนใช้ตอบหรือทำ SLA อัตโนมัติ ถ้าไม่มีหลักฐานให้รอ ปณท ไม่บังคับเลือกรอบ
- ไม่ตีความทุก acceptance scan ว่าเป็นรอบใหม่: การสแกนซ้ำหรือรับคืนอาจอยู่ในรอบเดิม; รอ ปณท ยืนยันความหมายรหัสและรูปแบบ cycle ref (Q-10)
- API ที่รับเพียง barcode อาจส่งรายละเอียดรอบล่าสุด ข้อมูลนั้นห้ามทับ snapshot ของออเดอร์เก่า; แสดงเฉพาะข้อมูลที่ยืนยันว่าเป็นรอบของ shipment นั้น

**3. Webhook, การดึงย้อนหลัง และภาพ**
- รับข้อมูลแล้วตรวจ source และจับคู่ provider ref → รอบที่ยืนยัน → shipment; ถ้าไม่มี ref ใช้เวลาเกิดเหตุการณ์ (`event_at`) และหลักฐานรอบ ห้ามใช้เวลาที่ server ได้รับ (`received_at`) เลือกออเดอร์ล่าสุด
- event ของรอบเก่าที่มาช้าเก็บในรอบเก่า; event ที่ยังระบุรอบไม่ได้เก็บ `resolution_status = pending_review` โดย `parcel_id` เป็น null ไม่อัปเดตเคส/สถานะ/ภาพของรอบใด
- กันส่งซ้ำด้วย provider event ID + source; หากไม่มีให้ใช้ fingerprint ของ payload ที่ normalize แล้วร่วมกับ source และเวลาเหตุการณ์ เก็บ raw payload/reference ไว้ตรวจ ไม่รวม event ข้ามรอบเพียงเพราะรหัสสถานะเหมือนกัน
- เก็บ event ทุกตัวตามรอบ; อัปเดต last status ตามเวลาเกิดเหตุการณ์และกติกาลำดับสถานะ ไม่ให้ event เก่าทับสถานะใหม่ ส่วน correction ของ ปณท ต้องเก็บ revision / audit
- เก็บ `sla_start_at` จากเหตุการณ์ถึงปลายทางที่ยืนยันของรอบนั้น ไม่เริ่มนับใหม่เพราะ webhook ซ้ำ; หากมี correction ให้คำนวณใหม่พร้อม audit
- ภาพ/ลายเซ็นต้องมี reference หรือเวลาถ่ายและหลักฐานที่ยืนยันรอบได้; URL ภาพที่ผูกแค่ barcode ยังใช้แสดงอัตโนมัติไม่ได้ ป้องกันภาพรอบใหม่แสดงในเคสเก่า
- การแก้การจับคู่ต้อง audit และย้ายเฉพาะข้อมูลที่ยืนยัน; ไม่ย้ายเคส ข้อความ หรือไฟล์ร้านค้าไปยังออเดอร์คนอื่นตาม event ใหม่

**4. การเปิดเคสและหยุดงานอัตโนมัติ**
- `UNIQUE(cases.shipment_id)` รวมเคสปิดแล้ว; ร้านค้าและ job ใช้ transaction / insert-on-conflict เดียวกัน ผู้แพ้ race รับเคสเดิม ไม่สร้างสองเคส
- job พิจารณาเฉพาะ shipment ที่ยืนยันรอบแล้ว ถึงปลายทางเกิน SLA และยังไม่จบ; shipment ที่ส่งสำเร็จ คืนต้นทางเสร็จ หรือยกเลิก ไม่เปิดเคสอัตโนมัติใหม่ ต้องตกลงรหัส terminal กับ ปณท
- เคยมีเคสประเภทใดก็ไม่สร้าง auto_sla เพิ่ม แม้เคสปิดแล้ว; เคสเปิดใช้ warning marker/cooldown ต่อเคสเพื่อไม่แจ้งเตือนซ้ำทุกชั่วโมง ส่วนเคสปิดหยุดเตือน SLA (ไม่ได้หยุดรับ/เก็บสถานะพัสดุ)
- ปิดแล้วร้านค้าพิมพ์ต่อเป็นการกลับมาทำงานในเคสเดิม ไม่ล้างประวัติ ไม่ล้างตัวกันสร้างซ้ำ และไม่รีเซ็ต SLA ขนส่ง; สถานะนำจ่ายสำเร็จปิดอัตโนมัติได้เฉพาะเคส auto_sla ที่ยังไม่มีเรื่องร้านค้าและไม่ใช่ข้อยกเว้น ตามกติกาด้านล่าง
- Q-06 ยืนยัน 2 พ.ย. 2569: เคสทั่วไปรอร้านค้ายืนยัน 72 ชั่วโมงหลังส่งผลแก้ไขสำเร็จ ปรับเวลาได้; ข้อยกเว้นเซ็นรับแล้วไม่ได้รับของต้องร้านค้ายอมรับเท่านั้น ส่วนรอบเตือน SLA ขนส่งยังเป็น Q-13

## A. ผู้ใช้และร้านค้า

### `merchants`: ร้านค้า
| Field | ประเภท | หมายเหตุ |
|---|---|---|
| `merchant_id` | PK, text | ตรงกับ `merchantId` ใน r_dservice |
| `shop_name` | text ≤150 | ตั้งต้นจาก `merchantName` |
| `contact_name` | text ≤100 | ผู้ติดต่อของร้าน ใช้เติม F-06 |
| `phone` | text 10 หลัก | ตั้งต้นจาก `merchantPhoneNumber` ใช้เติม F-07 |
| `email` | text ≤254 | ตั้งต้นจาก `merchantEmail` |
| `postcode` | text 5 หลัก | `merchantPostcode` |
| `status` | enum | active / suspended |
| `created_at`, `updated_at` | timestamp | |

### `users`: ผู้ใช้ทุก role
| Field | ประเภท | หมายเหตุ |
|---|---|---|
| `user_id` | PK | |
| `role` | enum | merchant / myorder_admin / cs / cec / branch (สาขาปลายทาง ใช้ระบบตอบ) / executive · สิทธิ์ในทีมร้านค้าตาม "จัดการบทบาท" (Q-01) |
| `merchant_id` | FK, nullable | เฉพาะ role ร้านค้า |
| `cec_id` | FK, nullable | เฉพาะ role CEC |
| `display_name` | text ≤100 | |
| `phone` | text 10 หลัก | |
| `email` | text ≤254 | |
| `is_active` | bool | |
| `last_login_at` | timestamp | |

## B. พัสดุ (สำเนาจาก ปณท)

ระบบเก็บสำเนาไว้เพื่อแสดงผลได้เร็ว และยังมีข้อมูลไว้ดูตอน API ล่ม ข้อมูลจริงยังเป็นของ ปณท

### `shipments`: การจัดสรรเลขให้การส่งแต่ละกล่องของ MyOrder
`shipment_id` PK · `merchant_id` FK · `order_id` · `shipment_sequence` · `barcode` · `allocated_at` · `provider_allocation_ref` nullable · `provider_order_ref` nullable · `manifest_ref` nullable · `recipient_snapshot` · `parcel_id` FK nullable, unique · `resolution_status` (unresolved / confirmed / pending_review) · `confirmed_by`, `confirmed_at`, `confirmation_evidence` · `supersedes_shipment_id` nullable · `created_at`, `updated_at`
- unique (`merchant_id`, `order_id`, `shipment_sequence`); barcode ไม่ unique ตลอดอายุระบบ
- provider ref unique เฉพาะขอบเขตที่ ปณท รับรอง; ผูก parcel ที่ยืนยันแล้วแบบ 1:1 สำหรับขอบเขต MyOrder
- สร้างจากระบบจัดสรรเลข/ออเดอร์ ตั้งแต่ก่อนมีเคส; ออเดอร์เก่าที่ไม่มีข้อมูลจัดสรรต้องจับคู่/ยืนยันก่อนเปิดเคสใหม่

### `parcels`: พัสดุ 1 แถวต่อรอบที่ยืนยันแล้ว
| Field | ประเภท | มาจาก |
|---|---|---|
| `parcel_id` | PK | ระบบสร้าง 1 ค่าต่อรอบ |
| `barcode` | text 13 | F-01 · **ไม่ unique** เพราะ ปณท ใช้เลขซ้ำ |
| `provider_cycle_id` | text, nullable | ID รอบจาก ปณท ถ้ามี; unique ตามขอบเขต source ที่ ปณท รับรอง |
| `cycle_start_at`, `cycle_end_at` | timestamp, nullable | ขอบเขตรอบที่ยืนยัน ใช้จับคู่ event; ไม่อนุมานจบรอบด้วย +6 เดือน |
| การเชื่อม shipment | ผ่าน `shipments.parcel_id` (unique) | หนึ่งรอบยืนยันต่อหนึ่ง shipment; ไม่เก็บ FK ซ้ำสองฝั่ง |
| `merchant_id` | FK | `merchantId` |
| `inv_no` | text | `invNo` |
| `service` | enum | EMS / Drop-off |
| `recipient_name` | text | `customerName` |
| `recipient_address` | text | `customerAddress`, `customerAmphur`, `customerProvince` |
| `recipient_zipcode` | text 5 | `customerZipcode` ใช้หา CEC |
| `cod_amount` | decimal | `productPrice` |
| `origin_office` | text | `postcodeName` |
| `created_date`, `received_date`, `delivered_date` | timestamp | `createdDate`, `receivedDate`, `deliverdDate` |
| `is_accepted` | bool | true เมื่อมีสถานะสแกนรับ (1, 2, 101, 102, 103) หรือมี `receivedDate` |
| `last_status_code`, `last_status_text`, `last_status_at`, `last_station` | | รายการล่าสุดจาก `getHistoryStatus` / webhook |
| `signer_name` | text | `signature` (เป็นชื่อ ไม่ใช่รูป) |
| `remark` | text | `remark` |
| `sla_start_at`, `sla_due_at` | timestamp, nullable | ใช้ตรวจ SLA ทุก shipment ก่อนมีเคส; เริ่มจาก event ที่ยืนยันรอบแล้ว |
| `last_synced_at` | timestamp | |

### `parcel_events`: ประวัติสถานะ
`event_id` PK · `parcel_id` FK nullable, unique · `resolution_status` · `provider_event_id` nullable · `provider_cycle_ref` nullable · `dedupe_key` · `raw_payload_ref` · `barcode` · `status_code` · `status_text` · `event_at` · `station` · `office_zipcode` (ใช้ตรวจ CEC ผิดเขต) · `source` (api / webhook) · `received_at`

### `parcel_media`: ภาพนำจ่ายและลายเซ็น
`media_id` PK · `parcel_id` FK · `barcode` · `type` (delivery_photo / signature) · `storage_key` (อยู่ในถังไฟล์) · `captured_at` · `provider_media_ref` · `cycle_verified_at` · `source`
**หมายเหตุ:** ยังรอ ปณท ยืนยัน API ภาพ (Q-08)

## C. เคส

### `cases`: เคส
| Field | ประเภท | หมายเหตุ |
|---|---|---|
| `case_id` | PK, `TP-YYYY-NNNN` | |
| `shipment_id` | FK, unique | 1 เคสตลอดอายุ shipment รวมปิดแล้ว; ใช้กันซ้ำทั้ง manual และ auto |
| `parcel_id` | FK | รอบพัสดุ · ใช้ตรวจ "มีเคสเปิดอยู่" |
| `barcode` | text 13 | ใช้ค้นหา |
| `order_id` | text | ออเดอร์ MyOrder ที่กดแจ้ง |
| `merchant_id` | FK | จากบัญชีที่ล็อกอิน |
| `reporter_user_id` | FK, nullable | ผู้ใช้ร้านค้าที่กดแจ้ง; null สำหรับ channel auto_sla บันทึก system actor ใน activity_log |
| `channel` | enum | myorder_pending_orders (Phase 1) / myorder_issue_page (Phase 2) / auto_sla (ระบบเปิดเองเมื่อเกิน SLA, S18) |
| `problem_type` | FK `problem_types` | F-02 |
| `detail` | text ≤1,000 | F-04 ถ้าไม่กรอก ระบบสรุปให้จากประเภทและสถานะ |
| `contact_name`, `contact_phone` | | F-06, F-07 จากบัญชีที่ล็อกอิน (สำเนาตอนแจ้ง) |
| `priority` | enum | normal / urgent / critical **ระบบคำนวณ** จาก SLA, ยอด COD, เคสซ้ำ |
| `status` | enum | ดู state ด้านล่าง |
| `cec_id` | FK | |
| `cec_source` | enum | auto / cs_manual / routing_alert |
| `routing_alert` | bool | สาขาจริงอยู่ CEC อื่น (S12) |
| `dest_office_code` | text | สาขาปลายทาง จาก `zip_office_cec` · ผู้ตอบทุกเคส |
| `sla_start_at` | timestamp | เวลาสถานะ "ถึงสาขาปลายทาง" ระบบใส่เองจาก webhook / `getHistoryStatus` · null = ยังไม่ถึง |
| `sla_due_at` | timestamp | `sla_start_at` + 3 วัน (`sla_rules`) |
| `last_nudge_at` | timestamp | ครั้งล่าสุดที่ CS ส่งข้อความเร่ง |
| `assignee_user_id` | FK, nullable | CS ที่ดูแลเฉพาะเคสข้อยกเว้น |
| `auto_answered` | bool | ตอบจากสถานะหรือภาพ (S01) |
| `delivery_disputed`, `merchant_acceptance_required` | bool | ข้อยกเว้นปิดอัตโนมัติ เก็บแยกจากประเภท ห้ามแก้ประเภทเพื่อล้าง flag |
| `merchant_engaged` | bool | ร้านค้าเคยแจ้ง/ส่งข้อความแล้ว บล็อก delivered_auto แต่เคสทั่วไปยังใช้ confirmation timeout รอบใหม่ได้ |
| `resolution_version`, `delivered_to_merchant_at` | int / timestamp | รุ่นผลแก้ไขที่ส่งถึงร้านค้าสำเร็จ |
| `confirmation_timeout_hours`, `confirmation_due_at` | int / timestamp nullable | snapshot จำนวนชั่วโมง (default 72); ข้อยกเว้น null ไม่มีเวลาปิด |
| `confirmation_reminder_at`, `confirmation_followup_at` | timestamp nullable | เตือนก่อนครบ 24 ชม.; ข้อยกเว้นติดตามเมื่อครบ 72 ชม. |
| `accepted_by`, `accepted_at`, `accepted_resolution_version` | nullable | หลักฐานร้านค้ากดยอมรับเท่านั้น ไม่เติมจาก timeout |
| `reactivated_at` | timestamp, nullable | ร้านค้าพิมพ์ต่อหลังปิด ใช้ case_id เดิม ไม่สร้างเคสใหม่ |
| `last_closed_at`, `last_closed_by`, `last_close_reason` | | สำเนาการปิดครั้งล่าสุด; ทุกครั้งเก็บใน activity_log |
| `sla_warning_sent_at`, `last_sla_reminder_at` | timestamp, nullable | กันเตือนซ้ำ; cooldown ต้องยืนยัน |
| `closed_at`, `closed_by`, `close_reason` | nullable | ข้อมูลการปิดปัจจุบัน; เมื่อส่งข้อความกลับมาให้สำเนาไป last_closed_* และ audit ก่อนเคลียร์ค่าเพื่อเปิดทำต่อ |
| `created_at`, `updated_at` | timestamp | |

**State เพิ่มสำหรับการยืนยัน:** `answered` → `awaiting_merchant_confirmation` → `closed`; ส่งข้อความ/ยังไม่จบ → `waiting_handler`; ข้อยกเว้นรอร้านค้ายอมรับโดยไม่มี deadline ปิด

**State ของเคส:** `new` → `answered` → `closed` (ตอบอัตโนมัติ), หรือ `new` → `waiting_handler` (ส่งถึง CEC / สาขาแล้ว) → `answered` → `closed` · ข้อยกเว้น `new` → `cs_review` → `waiting_handler` · ตั้งตรวจก่อน `new` → `answer_review` → `answered` · ร้านค้าถามต่อ รวมเคส `closed` = กลับเป็น `waiting_handler` ใน case_id เดิม; การเปิดอ่านเฉยๆ ไม่เปลี่ยน state

### `case_messages`: แชทในเคส (ร้านค้า ↔ สาขาปลายทาง · CEC แทรกได้ · CS เห็นทุกข้อความ)
`message_id` PK · `case_id` FK · `sender_type` (merchant / cec / branch / cs / system) · `sender_id` · `body` ≤1,000 (F-11, F-13) · `is_nudge` (ข้อความเร่งจาก CS) · `has_attachment` · `visibility` (merchant / internal) · `created_at` · `read_by_handler_at` · `read_by_merchant_at`
- ร้านค้าส่งข้อความหรือรูป → ส่งตรงถึงสาขาปลายทาง แจ้งเตือนสาขา รวมเคสปิดแล้วให้กลับเป็น waiting_handler พร้อมข้อความใหม่; เปลี่ยน state และบันทึก message/notification outbox ใน transaction เดียว
- สาขา (หรือ CEC) ตอบ → แจ้งเตือนร้านค้า
- CS และ CEC เห็นทุกข้อความ และส่งข้อความเร่งได้ (`is_nudge`)

### `case_attachments`: ไฟล์แนบ
`attachment_id` PK · `case_id` FK · `message_id` FK nullable (รูปในแชท) · `file_name` · `mime` (jpg / png / pdf) · `size_bytes` ≤5 MB · `storage_key` · `uploaded_by` · `created_at`

### `case_requests`: คำร้องถึง ปณท (ตีกลับ / เปลี่ยนที่อยู่ / นำจ่ายใหม่)
`request_id` PK · `case_id` FK · `request_type` · `new_address`, `new_phone` (F-10) · `email_to` · `subject` ≤200 · `body` ≤2,000 (F-08 ระบบร่างให้) · `sent_at` · `send_status` (sent / failed) · `external_ref`

### `cec_dispatches`: การส่งเคสถึงสาขาปลายทาง (CEC เห็นร่วม)
`dispatch_id` PK · `case_id` FK · `office_code` · `cec_id` FK · `channel` (line / email / system) · `message` · `sent_by` · `sent_at` · `send_status` (sent / failed / manual) · `reply_text` · `reply_by` · `reply_at`

## D. ประวัติและแจ้งเตือน

### `activity_log`: ประวัติการดำเนินการ
ใช้ทั้งเป็น timeline ของเคส, เป็นหลักฐานตรวจสอบ (audit) และเป็นข้อมูลวัดผล

**กติกา**
- เพิ่มได้อย่างเดียว ห้ามแก้หรือลบ
- ระยะเวลาเก็บตาม DPA (Q-09)

| Field | หมายเหตุ |
|---|---|
| `log_id` | PK |
| `occurred_at` | timestamp |
| `actor_type` | merchant / cs / cec / admin / system / thaipost_api |
| `actor_id` | user_id หรือชื่อ job |
| `action` | ดูรายการด้านล่าง |
| `entity_type`, `entity_id` | เช่น case / TP-2026-0025 |
| `case_id`, `shipment_id`, `parcel_id`, `barcode` | ใช้ค้นเร็ว |
| `before`, `after` | json เฉพาะ field ที่เปลี่ยน |
| `result` | success / blocked / failed พร้อมรหัสเหตุผล เช่น `NOT_ACCEPTED` |
| `ip`, `user_agent` | |

**Action ที่ต้องบันทึก**

| กลุ่ม | Action |
|---|---|
| ตรวจเลขพัสดุ | `lookup` รวมผลที่ถูกปฏิเสธ: ออเดอร์ไม่มีเลข/รูปแบบผิด, ไม่พบ, ยังไม่สแกนรับ, ข้อมูลไม่ตรงออเดอร์ (เลขซ้ำ), API ล่ม |
| เลขพัสดุใช้ซ้ำ | `parcel_cycle_created`, `multiple_cycles_found`, `event_outside_case_cycle`, `cycle_resolution_pending`, `cycle_confirmed`, `cycle_binding_corrected` (S16, S17) |
| ไม่เปิดเคส | `self_served`: ร้านค้าได้คำตอบจากหน้าจอ |
| สร้างและแก้เคส | `case_created`, `field_changed`, `status_changed`, `chat_message_sent`, `chat_message_read`, `attachment_added` |
| CEC | `cec_assigned`, `cec_reassigned`, `routing_alert_raised`, `routing_alert_dismissed`, `dispatched`, `dispatch_failed`, `cec_replied` |
| ตอบและปิดเคส | `auto_answer_prepared`, `answer_confirmed`, `answer_sent`, `case_closed`, `case_reactivated` (ร้านค้าส่งข้อความหลังปิด ใช้ case_id เดิม) |
| ข้อมูลส่วนบุคคล | `personal_data_viewed`: เปิดดูที่อยู่ เบอร์ หรือภาพ (ตาม PDPA) |
| SLA และการเร่ง | `sla_started` (ถึงสาขาปลายทาง), `sla_warning`, `sla_breached`, `auto_sla_case_created`, `case_creation_deduplicated`, `nudge_sent` (CS / CEC), `cec_joined` |
| ตั้งค่า | `auto_answer_mode_changed` (F-14), `auto_answer_reviewed` |
| ระบบ | `export`, `login` |

### `api_call_log`: การเรียก API ปณท
`call_id` PK · `endpoint` · `barcode` · `request_at` · `http_status` · `error_code` · `latency_ms` · `attempt` (1–3) · `case_id` nullable
ใช้ทำ retry, เป็นหลักฐานเวลา API ล่ม และใช้วัด uptime

### `notifications`: การแจ้งเตือน
`notification_id` PK · `user_id` FK · `case_id` FK · `type` (new_chat_message / case_reactivated ถึงสาขา / answer_sent ถึงร้านค้า + CS / nudge / answer_review ถึง CS / sla_warning ถึง CS / auto_sla_case ถึงสาขา + CEC + ร้านค้า / routing_alert / send_failed) · `channel` (web / email / line) · `delivery_status` · `attempt_count` · `dedupe_key` · `sent_at` · `read_at`

## E. ข้อมูลหลัก (master)

| ตาราง | Field หลัก | ใช้ทำอะไร |
|---|---|---|
| `cec_units` | `cec_id`, `name`, `region`, `line_group`, `email`, `phone` | ปลายทางการส่งต่อ |
| `zip_office_cec` | `source_code`, `office_code`, `office_name`, `division`, `cec_id`, `source_as_of`, `source_row`, `source_hash`; `office_phone` nullable | ต้นฉบับ PostOffice_68_07.xlsx 1,200 รหัส; exact match ใน prototype · รอข้อมูลพื้นที่นำจ่ายและฉบับล่าสุด (Q-02) |
| `problem_types` | `code`, `name`, `required_fields`, `can_auto_answer`, `auto_answer_mode` (send_now / review_first · CS ตั้ง F-14), `suggest_when_status`, `needs_thaipost_request`, `sla_hours`, `confirmation_timeout_hours` (default 72), `auto_close_on_no_response` (false สำหรับ dispute บังคับ) | ตัวเลือก F-02, ประเภทที่ระบบแนะนำ, ช่องที่บังคับตามประเภท |
| `status_codes` | `code`, `text_th`, `myorder_label`, `is_accepted_scan`, `is_final` | แปลงรหัสสถานะ และตรวจว่าสแกนรับแล้ว |
| `answer_templates` | `template_id`, `problem_type`, `condition`, `text` | ข้อความมาตรฐานสำหรับตอบอัตโนมัติและให้ CS เลือก |
| `sla_rules` | `start_status` (ถึงสาขาปลายทาง), `duration_days` (3 *default*), `warn_before_hours`, `count_holidays` | คำนวณ `sla_start_at`, `sla_due_at` และเวลาแจ้งเตือน CS |

## ประเภทปัญหาที่ระบบแนะนำ (`problem_types.suggest_when_status`) *(default)*

| สถานะล่าสุด | ประเภทที่เลือกไว้ให้ |
|---|---|
| ระหว่างขนส่ง นานเกินเกณฑ์ | เร่งนำส่ง |
| ถึงสาขาปลายทาง / นำจ่ายไม่สำเร็จ | นำจ่ายใหม่ |
| รับพัสดุแล้ว (4, 9, 501) | ขอภาพหลักฐาน |
| ตีกลับ | ติดตามสถานะการตีกลับ |
| อื่นๆ | ติดตามสถานะ |

**Q-02 อัปเดต 30 ต.ค. 2569:** ได้ทะเบียนที่ทำการ 1,200 แห่ง/14 CEC จาก `sources/PostOffice_68_07.xlsx` ข้อมูล ณ 31 ก.ค. 2568 แล้ว; เก็บ source/version ไม่ใช้วันที่นำเข้าแทนวันมีผล และไม่อนุมานพื้นที่นำจ่ายหรือเบอร์ติดต่อจากไฟล์ ดู prototype-features.md
