"""Build the B0 business flow as a swimlane SVG (same file goes to the HTML preview and to Miro).

Layout rules (see ../miro-board-structure.md):
- one pool per stage of the work; inside a pool, one horizontal lane per actor (the lane says who does the step)
- every box of one kind has the same size; columns are 290 px apart and the flow only moves left to right
- a step in another lane is reached by an elbow line (right, then up or down in the gap, then right)
- error / alternative branches drop down inside their own lane; a yellow note hangs right under the box it explains
- checks run before the form (fail fast); the form asks only for what cannot be auto-filled
- a branch that rejoins another part of the flow ends in a numbered connector circle instead of a line going back
"""
import html
import pathlib
import re

OUT = pathlib.Path(__file__).parent

SIZE = {"task": (220, 90), "gw": (180, 116), "cap": (190, 76), "conn": (56, 56), "note": (240, 0), "timer": (220, 90)}
PITCH = 290          # distance between columns
X0 = 300             # centre of column 0 (lane headers take the left 160 px)
LANE_HEAD = 140
POOL_X = 20

FILL = {
    "main": ("#ffffff", "#1d2330"), "ok": ("#c8ecd0", "#2e8a5f"), "err": ("#f6c4bd", "#c0392b"),
    "val": ("#fff1b8", "#b8901c"), "alt": ("#d6e7fb", "#2f6fb0"), "edge": ("#e4d7f7", "#6b5bb5"),
    "wait": ("#fde0bf", "#c9762e"), "note": ("#fff6c2", "#c9ad3a"), "q": ("#fbd3e4", "#c2557f"), "conn": ("#1f4f8f", "#1f4f8f"),
}
LANE_COLOR = {"ร้านค้า": "#0f766e", "ระบบ": "#1f4f8f", "API ปณท": "#5d6676", "CS ส่วนกลาง": "#b45309", "สาขาปลายทาง": "#6b5bb5", "CEC": "#9d174d"}

POOLS = [
    ("Main flow · Phase 1 ร้านค้าแจ้งจากหน้าคำสั่งซื้อรอจัดส่ง → ระบบตอบได้จากสถานะ / ภาพ", ["ร้านค้า", "ระบบ", "API ปณท"]),
    ("③ ส่งถึงสาขาปลายทาง (CEC รับผิดชอบร่วม เห็นและแทรกได้) · ④ CS ตรวจข้อยกเว้น · CS เฝ้าดู SLA และเร่ง · ⑤ CS รีวิวคำตอบ", ["ระบบ", "สาขาปลายทาง", "CEC", "CS ส่วนกลาง"]),
    ("เหตุการณ์ระหว่างติดตาม · S12, S13, S17 และแชทเคส (รวมปิดแล้ว)", ["ร้านค้า", "ระบบ", "API ปณท", "สาขาปลายทาง"]),
    ("งานอัตโนมัติ · เกิน SLA 3 วัน ระบบแจ้ง ปณท เองโดยร้านค้าไม่ต้องกด · S18", ["ร้านค้า", "ระบบ", "สาขาปลายทาง"]),
    ("รอยืนยันและปิดเคส · ⑥ · S21–S24 · เซ็นรับแล้วไม่ได้รับของ ห้ามปิดอัตโนมัติทุกทาง", ["ร้านค้า", "ระบบ", "API ปณท", "CS ส่วนกลาง"]),
]
NOTE_ROW = 1         # yellow notes hang right under their box (that column has no branch below)

nodes = {}
edges = []


def n(nid, kind, pool, lane, col, row, text, cls="main"):
    h = len(text.split("\n")) * 24 + 26 if kind == "note" else None
    nodes[nid] = dict(kind=kind, pool=pool, lane=lane, col=col, row=row, text=text, cls=cls, h=h)


def e(a, b, label="", dashed=False, mode=None):
    """mode 'v': leave from the top/bottom of a (used when its right side already has an exit)."""
    edges.append((a, b, label, dashed, mode))


# ---------------- Pool 0: main flow ----------------
# Order rule: check the parcel first (fail fast), ask only for what cannot be auto-filled, last.
# shipment_id identifies an order shipment allocation; provider cycles must be verified, never guessed from order age.
S, R, A, C = "ร้านค้า", "ระบบ", "API ปณท", "CS ส่วนกลาง"
B, E = "สาขาปลายทาง", "CEC"
n("M1", "cap", 0, S, 0, 0, "START\nร้านค้าเปิดหน้า\nคำสั่งซื้อรอจัดส่ง", "ok")
n("M2", "task", 0, S, 1, 0, "กด \"แจ้งปัญหา\"\nที่แถวออเดอร์\n(เลขพัสดุดึงจากออเดอร์)")
n("NF1", "note", 0, S, 1, NOTE_ROW, "F-01 เลขพัสดุ · ไม่ต้องกรอก\n  ← ออเดอร์ MyOrder\nส่งไปพร้อม order_id\nวันสร้างออเดอร์ รหัสไปรษณีย์\nผู้รับ และร้านที่ล็อกอิน\nเลขต้องมี 13 ตัว EN123456789TH", "note")
n("S1", "gw", 0, R, 2, 0, "ออเดอร์มีเลขพัสดุ\nรูปแบบถูก?")
n("S1E", "task", 0, R, 2, 1, "ปุ่มแจ้งปัญหาใช้ไม่ได้\nให้ใส่หรือแก้เลขพัสดุ\nในออเดอร์ก่อน · S03", "val")
n("END1", "cap", 0, R, 2, 2, "END\nแก้เลขในออเดอร์", "err")
n("S2", "task", 0, A, 3, 0, "ดึงข้อมูลพัสดุ\nรายละเอียด ประวัติ ภาพ")
n("S3", "gw", 0, R, 4, 0, "API ตอบสำเร็จ?")
n("S3E", "task", 0, R, 4, 1, "ลองซ้ำอัตโนมัติ 3 ครั้ง\nไม่สำเร็จ แสดง Error\nให้ลองใหม่ภายหลัง · S06", "err")
n("END2", "cap", 0, R, 4, 2, "END\nไม่สร้างเคส", "err")
n("S4", "gw", 0, R, 5, 0, "พบพัสดุ\nในระบบ ปณท?")
n("S4E", "task", 0, R, 5, 1, "Error ไม่พบพัสดุนี้\nในระบบ ปณท\n· S04", "val")
n("END3", "cap", 0, R, 5, 2, "END\nไม่สร้างเคส", "err")
n("R1", "gw", 0, R, 6, 0, "ยืนยันรอบพัสดุ\nของ shipment ได้?")
n("R1E", "task", 0, R, 6, 1, "ยังยืนยันรอบไม่ได้ · S16\nพักข้อมูล / ภาพ ให้ CS ตรวจ\nไม่เลือกรอบแรกเอง", "edge")
n("R1END", "cap", 0, R, 6, 2, "END\nรอยืนยันแล้วลองใหม่", "wait")
n("NR", "note", 0, R, 9, NOTE_ROW, "ปณท จัดสรรเลขเป็นชุด\nreuse ได้เมื่อครบ 6 เดือน\nshipment_id = การจัดสรรต่อกล่อง\nผูก merchant + order_id + ลำดับส่ง\nรอบ ปณท ต้องมีหลักฐานยืนยัน\n6 เดือน / postcode ไม่ใช่ key\nสถานะ ภาพ webhook ต้องตรงรอบ\nกำกวม = พักให้ CS ตรวจ\nรายละเอียดดู data-model.md", "note")
n("S5", "gw", 0, R, 7, 0, "รอบนี้สแกนรับ\nที่ไปรษณีย์แล้ว?")
n("S5E", "task", 0, R, 7, 1, "Error พัสดุยังไม่ถูก\nสแกนรับ ยังแจ้งปัญหาไม่ได้\n· S14", "val")
n("END4", "cap", 0, R, 7, 2, "END\nไม่สร้างเคส", "err")
n("S5B", "gw", 0, R, 8, 0, "ปลายทางตรงกับ\nsnapshot ตอนส่ง?")
n("S5BE", "task", 0, R, 8, 1, "ข้อมูลปลายทางไม่ตรง\nพักให้ตรวจหลักฐานรอบ\nและ snapshot · S16", "val")
n("END4B", "cap", 0, R, 8, 2, "END\nรอยืนยันข้อมูล", "err")
n("S7", "task", 0, R, 11, 0, "แสดงข้อมูลพัสดุ\nอัตโนมัติ แนะนำประเภทปัญหา")
n("NF2", "note", 0, R, 11, NOTE_ROW, "แสดงอัตโนมัติ · ไม่ต้องกรอก\nสถานะล่าสุด / ประวัติ (รอบนี้)\n  ← getHistoryStatus\nผู้รับ ที่อยู่ รหัสไปรษณีย์ COD\n  ← getOrderByBarcode\nชื่อผู้เซ็นรับ วันที่นำจ่าย\n  ← getOrderByBarcode\nภาพนำจ่าย / ลายเซ็น\n  ← API ภาพ (รอ ปณท · Q-08)\nที่ทำการปลายทาง + CEC\n  ← PostOffice_68_07.xlsx (Q-02)\nร้านค้า + ผู้ติดต่อ\n  ← บัญชี MyOrder ที่ล็อกอิน\nประเภทปัญหาที่แนะนำ\n  ← กติกาตามรหัสสถานะ", "note")
n("S8", "gw", 0, S, 12, 0, "ได้คำตอบ\nจากหน้าจอแล้ว?")
n("S8Y", "task", 0, S, 12, 1, "ไม่ต้องเปิดเคส\nกด \"ได้คำตอบแล้ว\"\nบันทึกไว้วัดผล · S15", "ok")
n("END6", "cap", 0, S, 12, 2, "END\nได้คำตอบทันที", "ok")
n("S9", "task", 0, S, 13, 0, "① ยืนยันประเภทปัญหา\nกรอกเท่าที่จำเป็น\nแล้วกดส่ง")
n("NF3", "note", 0, S, 13, NOTE_ROW, "ช่องในฟอร์ม (ดูตาราง)\nF-02 ประเภท · เลือกไว้ให้แล้ว\nF-04 รายละเอียด · เฉพาะ อื่นๆ\nF-05 ไฟล์แนบ · ไม่บังคับ\nF-06/07 ผู้ติดต่อ · จากบัญชี\nF-08 อีเมลถึง ปณท · ระบบร่าง\nF-10 ที่อยู่/เบอร์ใหม่ · มีเงื่อนไข\nความเร่งด่วน · ระบบคำนวณ", "note")
n("S10", "gw", 0, R, 14, 0, "ข้อมูลครบ\nตามประเภท?")
n("S10E", "task", 0, R, 14, 1, "Error ใต้ช่องที่ขาด\nข้อมูลที่กรอกไว้ยังอยู่\n· S03", "val")
n("C1a", "conn", 0, R, 14, 2, "①\nแบบฟอร์ม")
n("S11", "task", 0, R, 15, 0, "สร้างเลขเคส TP-YYYY-NNNN\nunique ต่อ shipment_id\nสร้างพร้อมกันได้เคสเดียว")
n("S12", "task", 0, R, 16, 0, "ระบุสาขาปลายทาง + CEC\nให้เห็นเคสทันทีทุกเส้นทาง\nรวม CS / ระบบตอบเอง")
n("S13", "gw", 0, R, 17, 0, "พบสาขาปลายทาง\nในตาราง?")
n("S13E", "task", 0, R, 17, 1, "ติดป้าย ไม่พบสาขา\nให้ CS เลือก · S07", "alt")
n("C4a", "conn", 0, R, 17, 2, "④\nCS ตรวจ")
n("S14", "gw", 0, R, 18, 0, "ตอบได้จากสถานะ\nหรือภาพตามเกณฑ์?")
n("S14N", "task", 0, R, 18, 1, "ประเภทอื่นหรือข้อมูลไม่พอ\nเช่น ตีกลับ เปลี่ยนที่อยู่\nภาพไม่ชัด", "alt")
n("C3a", "conn", 0, R, 18, 2, "③\nส่งถึงสาขาปลายทาง")
n("S16", "task", 0, R, 19, 0, "เตรียมคำตอบอัตโนมัติ\nจากข้อความมาตรฐาน\n· S01")
n("S16G", "gw", 0, R, 20, 0, "ประเภทนี้ตั้งให้\nCS ตรวจก่อน?")
n("C5a", "conn", 0, R, 20, 1, "⑤\nCS รีวิวคำตอบ")
n("S18", "task", 0, R, 21, 0, "② ส่งคำตอบเข้าแชทเคส\nแจ้งเตือนร้านค้า + CS\nบันทึกผล / รุ่นคำตอบ")
n("S19", "conn", 0, R, 22, 0, "⑥\nรอยืนยัน / ปิดเคส")

e("M1", "M2"); e("M2", "D0")
e("D0", "S1", "ไม่มี"); e("D0", "D1", "มี · รวมปิดแล้ว"); e("D1", "DE")
e("S1", "S2", "ใช่"); e("S1", "S1E", "ไม่"); e("S1E", "END1")
e("S2", "S3")
e("S3", "S4", "ใช่"); e("S3", "S3E", "ไม่"); e("S3E", "END2")
e("S4", "R1", "ใช่"); e("S4", "S4E", "ไม่"); e("S4E", "END3")
e("R1", "S5", "ได้"); e("R1", "R1E", "ไม่ได้ / กำกวม"); e("R1E", "R1END")
e("S5", "S5B", "ใช่"); e("S5", "S5E", "ไม่"); e("S5E", "END4")
e("S5B", "S7", "ใช่"); e("S5B", "S5BE", "ไม่"); e("S5BE", "END4B")
e("S7", "S8")
e("S8", "S9", "ไม่"); e("S8", "S8Y", "ใช่"); e("S8Y", "END6")
e("S9", "S10")
e("S10", "S11", "ใช่"); e("S10", "S10E", "ไม่"); e("S10E", "C1a")
e("S11", "S12"); e("S12", "S13")
e("S13", "S14", "ใช่"); e("S13", "S13E", "ไม่"); e("S13E", "C4a")
e("S14", "S16", "ใช่"); e("S14", "S14N", "ไม่"); e("S14N", "C3a")
e("S16", "S16G")
e("S16G", "S18", "ไม่ · ส่งเลย"); e("S16G", "C5a", "ใช่")
e("S18", "S19")

# First check the local shipment binding; viewing an existing case never depends on ThaiPost API.
for nd in nodes.values():
    if nd["pool"] == 0 and nd["col"] >= 2:
        nd["col"] += 1
n("D0", "gw", 0, R, 2, 0, "shipment นี้\nเคยมีเคสแล้ว?")
n("D1", "task", 0, R, 2, 1, "เปิดเคสเดิม + ผลที่จบแล้ว\nสถานะล่าสุด / เวลาอัปเดต\nพิมพ์ต่อได้ · S05, S11", "alt")
n("DE", "cap", 0, R, 2, 2, "END\nดู / แชทเคสเดิม", "ok")
n("NVIS", "note", 0, R, 17, NOTE_ROW, "สาขาและ CEC เห็นทุกเคส\nตั้งแต่ระบุผู้รับผิดชอบสำเร็จ\nรวมระบบตอบเอง / CS แก้เอง\nการเห็นเคส ≠ ต้องลงมือตอบ\nหาเขตไม่ได้ = CS จัดเขตก่อน", "note")

# ---------------- Pool 1: destination branch answers; CEC and CS watch and can step in ----------------
n("Q0", "conn", 1, R, 0, 0, "③\nส่งถึงสาขาปลายทาง")
n("QX", "conn", 1, C, 0, 0, "④\nCS ตรวจ")
n("QXA", "task", 1, C, 1, 0, "CS เลือก / ย้าย\nสาขาปลายทางเอง\n· S07, S12", "alt")
n("Q1", "task", 1, R, 2, 0, "ส่งเคสถึงสาขาปลายทาง\nในระบบ CEC ที่ดูแลเห็นด้วย\nแจ้งเตือน + บันทึกผล")
n("Q2", "gw", 1, R, 3, 0, "แจ้งเตือน\nสำเร็จ?")
n("Q2N", "task", 1, C, 3, 0, "แจ้งเตือน CS\nCS โทรแจ้งสาขาแล้วบันทึก\n· S08", "err")
n("Q3", "task", 1, B, 4, 0, "สาขาปลายทางตรวจแล้ว\nตอบในแชทเคส\nร้านค้าเห็นทันที")
n("C2b", "conn", 1, B, 5, 0, "②\nส่งคำตอบ")
e("Q0", "Q1"); e("QX", "QXA"); e("QXA", "Q1")
e("Q1", "Q2")
e("Q2", "Q3", "ใช่ · S02"); e("Q2", "Q2N", "ไม่"); e("Q2N", "Q3")
e("Q3", "C2b")
# CEC: co-owner of every case in its area, watches and can step in
n("L0", "cap", 1, E, 6, 0, "START\nCEC เปิดหน้าเคสในเขต")
n("L1", "task", 1, E, 7, 0, "CEC เห็นทุกเคสในเขต\nสถานะ + SLA ที่เหลือ\n(ผู้รับผิดชอบร่วม)")
n("L2", "gw", 1, E, 8, 0, "ต้องแทรก?")
n("L2N", "cap", 1, E, 8, 1, "END\nเฝ้าดูต่อ", "ok")
n("L3", "task", 1, E, 9, 0, "CEC พิมพ์ในแชทเคส\nตามสาขา หรือตอบร้านค้าเอง\n· S19")
n("L4", "cap", 1, E, 10, 0, "END\nบันทึกในเคส", "ok")
e("L0", "L1"); e("L1", "L2"); e("L2", "L3", "ใช่"); e("L2", "L2N", "ไม่"); e("L3", "L4")
# CS: watches every case and the SLA the system counts; nudges the branch by message when needed
n("K0", "cap", 1, C, 6, 0, "START\nCS เปิดหน้า monitoring")
n("K1", "task", 1, C, 7, 0, "CS เห็นทุกเคส\nสถานะ + SLA ที่เหลือ\n(ระบบนับให้)")
n("NK", "note", 1, C, 7, NOTE_ROW, "SLA 3 วัน\nเริ่มนับเมื่อสถานะ = ถึงสาขาปลายทาง\nครบกำหนด = เวลานั้น + 3 วัน\nยังไม่ถึงสาขา = ยังไม่เริ่มนับ\nใกล้ครบ แจ้งเตือน CS อัตโนมัติ\nเกิน 3 วัน ระบบเปิดเคสเอง (S18)\nCS ไม่ต้องคำนวณเอง", "note")
n("K2", "gw", 1, C, 8, 0, "ต้องเร่ง?\n(ใกล้ / เกิน SLA)")
n("K2N", "cap", 1, C, 8, 1, "END\nเฝ้าดูต่อ", "ok")
n("K3", "task", 1, C, 9, 0, "CS พิมพ์ข้อความเร่ง\nถึงสาขาปลายทาง\nในเคส (F-13) · S09", "wait")
n("K4", "task", 1, B, 10, 0, "สาขาได้แจ้งเตือน\nตอบในแชทเคส")
n("C2c", "conn", 1, B, 11, 0, "②\nส่งคำตอบ")
e("K0", "K1"); e("K1", "K2")
e("K2", "K3", "ใช่"); e("K2", "K2N", "ไม่")
e("K3", "K4"); e("K4", "C2c")
# CS reviews an automatic answer when the problem type is set to "review first"
n("C5b", "conn", 1, C, 12, 0, "⑤\nCS รีวิวคำตอบ")
n("RV1", "task", 1, C, 13, 0, "CS ได้แจ้งเตือน\nรีวิว / แก้คำตอบ\nแล้วกดส่ง · S20")
n("NRV", "note", 1, C, 13, NOTE_ROW, "ตั้งค่าตอบอัตโนมัติ (F-14)\nCS ตั้งเองแยกตามประเภทปัญหา\n  ส่งเลย / CS ตรวจก่อน\nทั้งสองแบบแจ้งเตือน CS", "note")
n("C2d", "conn", 1, C, 14, 0, "②\nส่งคำตอบ")
e("C5b", "RV1"); e("RV1", "C2d")

# ---------------- Pool 2: events while a case is open ----------------
n("V0", "cap", 2, A, 0, 0, "QMS ส่งสถานะใหม่\n(webhook)")
n("VR", "gw", 2, R, 1, 0, "ยืนยัน shipment\nและรอบ event ได้?")
n("VRN", "task", 2, R, 1, 1, "พัก event ที่ยังจับคู่ไม่ได้\nยืนยันรอบใหม่ก่อนสร้าง\nห้ามทับรอบเดิม · S17", "edge")
n("VRE", "cap", 2, R, 1, 2, "END\nเคสเดิมไม่เปลี่ยน", "ok")
n("V1", "gw", 2, R, 2, 0, "สาขาจริงอยู่ที่อื่น\nหรือแจ้งผิดเขต?")
n("V1Y", "task", 2, R, 2, 1, "แจ้งเตือน CS\nตรวจและย้ายสาขา · S12", "edge")
n("C4g", "conn", 2, R, 3, 1, "④\nCS ตรวจ")
n("V2", "task", 2, R, 3, 0, "อัปเดตสถานะในเคส\nบันทึกประวัติ")
n("VS", "gw", 2, R, 4, 0, "สถานะ = ถึง\nสาขาปลายทาง?")
n("VSY", "task", 2, R, 4, 1, "เริ่มนับ SLA 3 วัน\nครบกำหนด = เวลาถึง + 3 วัน\nใกล้ครบ แจ้งเตือน CS · S13", "wait")
n("VSE", "cap", 2, R, 4, 2, "END\nSLA เริ่มนับแล้ว", "ok")
n("V3", "cap", 2, R, 5, 0, "END\nสถานะเป็นปัจจุบัน", "ok")
e("V0", "VR"); e("VR", "V1", "ใช่"); e("VR", "VRN", "ไม่"); e("VRN", "VRE")
e("V1", "V2", "ไม่"); e("V1", "V1Y", "ใช่"); e("V1Y", "C4g")
e("V2", "VS"); e("VS", "V3", "ไม่"); e("VS", "VSY", "ใช่"); e("VSY", "VSE")
# chat in a case: merchant <-> destination branch directly, CEC and CS see it
n("X0", "cap", 2, S, 7, 0, "ร้านค้าพิมพ์ / ส่งรูป\nในเคสเดิม แม้ปิดแล้ว (F-11)")
n("X1", "task", 2, R, 8, 0, "ยกเลิกเวลาปิด ส่งถึงสาขา\nรวมปิดแล้ว → รอสาขาตอบ\nแจ้งข้อความใหม่ ปณท เห็น")
n("X2", "task", 2, B, 9, 0, "สาขาปลายทางตอบในแชท\nพิมพ์ / ส่งรูป")
n("X3", "task", 2, R, 10, 0, "แจ้งเตือนร้านค้า\nบันทึกประวัติ")
n("X4", "conn", 2, R, 11, 0, "⑥\nรอยืนยัน / ปิดเคส")
e("X0", "X1"); e("X1", "X2"); e("X2", "X3"); e("X3", "X4")

# ---------------- Pool 3: automatic job, parcels past the 3-day SLA (merchant does not have to report) ----------------
n("J0", "cap", 3, R, 0, 0, "START\nตรวจอัตโนมัติ\nทุกชั่วโมง")
n("J1", "task", 3, R, 1, 0, "หาพัสดุทุกออเดอร์ MyOrder\nถึงปลายทางเกิน 3 วัน\nยังไม่จบ / รอบยืนยันแล้ว")
n("J2", "gw", 3, R, 2, 0, "shipment นี้\nเคยมีเคสแล้ว?")
n("J2Y", "task", 3, R, 2, 1, "ไม่เปิดซ้ำ รวมเคสปิดแล้ว\nเคสเปิดเตือนตามรอบที่กำหนด\nเคสปิดหยุดเตือน SLA · S18", "wait")
n("J2E", "cap", 3, R, 2, 2, "END\nใช้เคสเดิมเสมอ", "ok")
n("J3", "task", 3, R, 3, 0, "สร้างเคสอัตโนมัติ\nunique ต่อ shipment_id\nกันชนกับร้านค้ากด · S18")
n("J4", "task", 3, S, 4, 0, "ร้านค้าได้แจ้งเตือน\nระบบแจ้ง ปณท ให้แล้ว\nเห็นเคสที่แถวออเดอร์")
n("J5", "task", 3, R, 5, 0, "ระบุสาขาปลายทาง + CEC\nให้เห็นเคส / หาเขตไม่ได้\nส่ง CS จัดสาขา · S07")
n("C2e", "conn", 3, R, 6, 0, "③\nส่งถึงสาขาปลายทาง")
e("J0", "J1"); e("J1", "J2")
e("J2", "J3", "ไม่"); e("J2", "J2Y", "มี"); e("J2Y", "J2E")
e("J3", "J4"); e("J4", "J5"); e("J5", "C2e")

# ---------------- Pool 4: confirmation timeout and delivery auto-close ----------------
n("CL0", "conn", 4, R, 0, 0, "⑥\nรอยืนยัน / ปิดเคส")
n("CL1", "task", 4, R, 1, 0, "ส่งผลแก้ไขถึงร้านค้าแล้ว\nรอยืนยัน 72 ชม. default\nข้อยกเว้น: เตือนอย่างเดียว")
n("NCL", "note", 4, R, 1, NOTE_ROW, "เวลาเริ่ม = ส่งผลแก้ไขสำเร็จ\nผูกกับรุ่นคำตอบ ไม่ใช่ webhook\nเตือนเมื่อเหลือ 24 ชั่วโมง\nปรับจำนวนวันแยกประเภทได้\nข้อความร้านค้า = ยกเลิกเวลาปิด\nตอบรอบใหม่จึงเริ่มรอบใหม่\nโน้ตภายในไม่เริ่มเวลาใหม่\nเซ็นรับไม่ได้รับของ:\n  ห้ามปิดอัตโนมัติทุกประเภท\n  ปิดได้เมื่อร้านค้ายอมรับเท่านั้น", "note")
n("CL2", "gw", 4, S, 2, 0, "ร้านค้าตอบกลับ\nอย่างไร?")
n("CLNO", "task", 4, S, 2, 1, "ยังไม่จบ / ส่งข้อความ\nยกเลิกเวลาปิด กลับรอสาขา\nปิดแล้วก็ใช้เคสเดิม · S11", "alt")
n("CLBACK", "conn", 4, S, 2, 2, "③\nส่งถึงสาขาปลายทาง")
n("CLYES", "task", 4, R, 3, 0, "ร้านค้ากดยอมรับและปิด\nlog: ร้านค้ายอมรับ\nเก็บเข้า Archived · S21", "ok")
n("CLEND", "cap", 4, R, 4, 0, "END\nปิดโดยร้านค้ายอมรับ", "ok")
n("CLTIME", "task", 4, R, 3, 1, "ร้านค้าไม่ตอบ\nเตือนเมื่อเหลือ 24 ชั่วโมง\nครบ 72 ชม. ตรวจสิทธิ์ปิด")
n("CLCHECK", "gw", 4, R, 4, 1, "ข้อยกเว้น /\nเวลาปิดไม่ valid?")
n("CLHOLD", "task", 4, R, 4, 2, "ห้ามปิด: เซ็นรับไม่ได้รับ\nหรือมีข้อความ / รุ่นเปลี่ยน\nคงสถานะตามงานล่าสุด · S23", "wait")
n("CLHE", "cap", 4, R, 4, 3, "END\nเคสยังเปิด / รอร้านค้ายอมรับ", "wait")
n("CLCS", "task", 4, C, 5, 2, "เคสเซ็นรับไม่ได้รับครบ 3 วัน\nแจ้ง CS และสาขาติดตาม\nห้ามปิดแทนร้านค้า", "wait")
n("CLCSEND", "cap", 4, C, 6, 2, "END\nติดตามต่อ", "wait")
n("CLAUTO", "task", 4, R, 5, 1, "ปิดเพราะไม่ตอบใน 3 วัน\nไม่ใช่ร้านค้ายอมรับ\nlog + Archived · S22", "ok")
n("CLAEND", "cap", 4, R, 6, 1, "END\nปิดอัตโนมัติ: หมดเวลาตอบ", "ok")
e("CL0", "CL1"); e("CL1", "CL2")
e("CL2", "CLYES", "ยอมรับ"); e("CLYES", "CLEND")
e("CL2", "CLNO", "ยังไม่จบ / ข้อความ"); e("CLNO", "CLBACK")
e("CL2", "CLTIME", "ไม่ตอบ", mode="v"); e("CLTIME", "CLCHECK")
e("CLCHECK", "CLAUTO", "ไม่ · เปิดใช้งาน / ครบกำหนด")
e("CLAUTO", "CLAEND")
e("CLCHECK", "CLHOLD", "ใช่"); e("CLHOLD", "CLHE")
e("CLHOLD", "CLCS", "เฉพาะ dispute ครบ 3 วัน"); e("CLCS", "CLCSEND")
# Delivery closes only untouched, system-created tracking cases; a dispute always wins.
n("DL0", "cap", 4, A, 7, 0, "สถานะนำจ่ายสำเร็จ\nจาก ปณท")
n("DL1", "gw", 4, R, 8, 0, "ยืนยัน shipment\nและรอบตรง?")
n("DL1N", "cap", 4, R, 8, 1, "END\nพักข้อมูล รอตรวจรอบ", "wait")
n("DL2", "gw", 4, R, 9, 0, "auto_sla และยัง\nไม่มีเรื่องจากร้านค้า?")
n("DL2N", "cap", 4, R, 9, 1, "END\nไม่ปิด คงขั้นตอนยืนยัน", "wait")
n("DL3", "task", 4, R, 10, 0, "ไม่มีข้อยกเว้น จึงปิดได้\nlog: นำจ่ายสำเร็จ\nแจ้งร้านค้า + Archived · S24", "ok")
n("NDL", "note", 4, R, 10, NOTE_ROW, "ข้อยกเว้นเซ็นรับไม่ได้รับ\nมีผลทั้ง timeout และ delivered\nห้ามใช้เปลี่ยนประเภทหลบกฎ\nร้านค้าส่งข้อความหลังปิด:\n  กลับทำต่อเคสเดิม\n  ห้าม delivered ปิดซ้ำ\nเปิดอ่านอย่างเดียวไม่เปลี่ยน state\nlog เก็บ event id / เหตุผล / เวลา\nตรวจเงื่อนไขซ้ำใน transaction\nกัน webhook และ job ปิดซ้ำ", "note")
n("DL4", "cap", 4, R, 11, 0, "END\nปิดอัตโนมัติ: นำจ่ายสำเร็จ", "ok")
e("DL0", "DL1"); e("DL1", "DL2", "ตรง"); e("DL1", "DL1N", "ไม่ตรง / กำกวม")
e("DL2", "DL3", "ใช่ · ไม่ใช่ dispute"); e("DL2", "DL2N", "ไม่ / เคสปิดแล้ว")
e("DL3", "DL4")

# ---------------- Open questions (pink) ----------------
QS = [
    ("Q-01 สิทธิ์ในทีมร้านค้า", "ใครในทีมแจ้งปัญหา / แชทได้\nตั้งที่ จัดการบทบาท"),
    ("Q-02 ได้ตาราง CEC แล้ว", "1,200 แห่ง · ข้อมูล 31 ก.ค. 68\nรอยืนยันรุ่นล่าสุด / พื้นที่นำจ่าย"),
    ("Q-03 สถานะถึงสาขาปลายทาง", "รหัสสถานะไหน = ถึงสาขาปลายทาง\n3 วันนับวันหยุดด้วยไหม"),
    ("Q-04 ✓ ตอบแล้ว", "CS ตั้งเองต่อประเภท: ส่งเลย\nหรือตรวจก่อน · แจ้ง CS ทุกครั้ง"),
    ("Q-05 ✓ ตอบแล้ว", "สาขามีคนตอบประจำ\nสาขาและ CEC ใช้ระบบนี้"),
    ("Q-06 ✓ ยืนยัน 2 พ.ย.", "รอร้านค้า 72 ชม. · ยกเว้น dispute\nเซ็นรับไม่ได้รับ ต้องร้านค้ายอมรับ"),
    ("Q-07 ดูเคสและแชทที่ไหน", "Phase 1 เปิดจากแถวออเดอร์\nหรือเปิดหน้า ติดตามปัญหา ด้วย"),
    ("Q-08 API ภาพนำจ่าย", "ปณท ให้ภาพ/ลายเซ็นได้ไหม\nไม่ได้ = แสดงแค่สถานะ + ชื่อผู้รับ"),
    ("Q-09 เก็บประวัติกี่ปี", "ระยะเวลาเก็บ activity log\nตาม DPA และใครดูได้"),
    ("Q-10 ยืนยัน API รอบพัสดุ", "reuse 6 เดือน ยืนยันแล้ว\nรอ cycle id / allocation ref ใน API"),
    ("Q-11 ✓ ตอบแล้ว", "ใกล้ครบ 3 วัน แจ้ง CS · เกิน\nระบบเปิดเคสถึงสาขาเอง"),
    ("Q-12 ✓ ตอบแล้ว", "สาขาเห็นทุกเคส รวม CS ตอบเอง\nCEC รับผิดชอบร่วม แทรกได้"),
    ("Q-13 ติดตามทุกออเดอร์", "ได้สถานะพัสดุทุกออเดอร์ไหม\nกี่ชิ้น/วัน · ใกล้ครบ = กี่ ชม."),
]

# click / input count panel (merchant side, Phase 1)
COUNT = [
    "นับการคลิก / การกรอก (ร้านค้า · Phase 1)",
    "Happy path: คลิก 2 · กรอก 0",
    "  กดแจ้งปัญหาที่แถวออเดอร์ 1 · กดส่ง 1",
    "  ประเภทแนะนำไม่ตรง +1 คลิก",
    "ได้คำตอบจากหน้าจอ (S15): คลิก 2 · กรอก 0",
    "เปลี่ยนที่อยู่ / อื่นๆ: คลิก 3 · กรอก 1",
    "มีเคสเดิม (รวมปิด): คลิก 2 · กรอก 1",
    "Error ก่อนกรอก: คลิก 1 · กรอก 0",
    "CS เคสปกติ: แค่ดู · เร่ง: คลิก 2 · กรอก 1",
    "v4 แอดมินกรอกแทน: คลิก 2 · กรอก 1",
    "เดิม (v2): คลิก 4 · กรอก 2",
]



def esc(s):
    return html.escape(s, quote=True)


def text_block(cx, cy, lines, size=15, weight=400, color="#1d2330", lh=1.3):
    total = (len(lines) - 1) * size * lh
    y0 = cy - total / 2 + size * 0.35
    out = [f'<text x="{cx}" text-anchor="middle" font-size="{size}" font-weight="{weight}" fill="{color}">']
    for i, ln in enumerate(lines):
        out.append(f'<tspan x="{cx}" y="{y0 + i * size * lh:.1f}">{esc(ln)}</tspan>')
    out.append("</text>")
    return "".join(out)


def box_h(nd):
    if nd["kind"] == "note":
        return nd["h"]
    if nd["kind"] == "conn":
        return SIZE["conn"][1] + 36   # circle + caption
    return SIZE[nd["kind"]][1]


# ---------------- layout: pools → lanes → rows ----------------
max_col = max(nd["col"] for nd in nodes.values())
W = X0 + max_col * PITCH + 200
ROW_PAD = 26
y = 30
pool_boxes = []      # (title, top, bottom, [(lane, top, bottom)])
for p, (title, lanes) in enumerate(POOLS):
    top = y
    y += 44                                              # pool title
    lane_boxes = []
    for lane in lanes:
        members = [nd for nd in nodes.values() if nd["pool"] == p and nd["lane"] == lane]
        ltop = y
        y += ROW_PAD
        note_bottom = 0
        for r in sorted({nd["row"] for nd in members}):
            row = [nd for nd in members if nd["row"] == r]
            boxes = [nd for nd in row if nd["kind"] != "note"]
            rh = max((box_h(nd) for nd in boxes), default=0)
            for nd in row:
                nd["cx"] = X0 + nd["col"] * PITCH
                if nd["kind"] == "note":
                    # notes hang just under the box above them and do not stretch the row,
                    # so error / END rows in other columns stay compact
                    nd["cy"] = y - ROW_PAD + nd["h"] / 2
                    note_bottom = max(note_bottom, y - ROW_PAD + nd["h"] + ROW_PAD)
                else:
                    # centred so a row's lines stay straight
                    nd["cy"] = y + rh / 2
            if rh:
                y += rh + ROW_PAD * 2
        y = max(y, note_bottom, ltop + 150)
        lane_boxes.append((lane, ltop, y))
    pool_boxes.append((title, top, y, lane_boxes))
    y += 50


def half(nd):
    if nd["kind"] == "note":
        return SIZE["note"][0] / 2, nd["h"] / 2
    w, h = SIZE[nd["kind"]]
    return w / 2, h / 2


parts = []
for title, top, bottom, lanes in pool_boxes:
    parts.append(f'<rect x="{POOL_X}" y="{top}" width="{W - 2 * POOL_X}" height="{bottom - top}" rx="10" fill="#ffffff" stroke="#9aa3b0" stroke-width="2"/>')
    parts.append(f'<text x="{POOL_X + 20}" y="{top + 30}" font-size="20" font-weight="700" fill="#1d2330">{esc(title)}</text>')
    for i, (lane, lt, lb) in enumerate(lanes):
        col = LANE_COLOR[lane]
        parts.append(f'<rect x="{POOL_X}" y="{lt}" width="{W - 2 * POOL_X}" height="{lb - lt}" fill="{"#f7f8fa" if i % 2 == 0 else "#eef1f5"}" stroke="#c9cfd8"/>')
        parts.append(f'<rect x="{POOL_X}" y="{lt}" width="{LANE_HEAD}" height="{lb - lt}" fill="{col}"/>')
        parts.append(text_block(POOL_X + LANE_HEAD / 2, (lt + lb) / 2, lane.split(" "), 17, 700, "#ffffff"))

# edges first (under boxes); lines only move right, never back left
for a, b, label, dashed, mode in edges:
    na, nb = nodes[a], nodes[b]
    wa, ha = half(na); wb, hb = half(nb)
    dash = ' stroke-dasharray="7 6"' if dashed else ""
    lx = ly = None
    anchor_attr = "start"
    if abs(na["cy"] - nb["cy"]) < 1:                       # same row: straight
        x1, y1, x2, y2 = na["cx"] + wa, na["cy"], nb["cx"] - wb, nb["cy"]
        d = f"M{x1},{y1} L{x2},{y2}"
        lx, ly, anchor_attr = (x1 + x2) / 2, y1 - 10, "middle"
    elif na["cx"] == nb["cx"]:                             # same column: straight up or down
        down = nb["cy"] > na["cy"]
        x1 = na["cx"]; y1 = na["cy"] + (ha if down else -ha); y2 = nb["cy"] - (hb if down else -hb)
        if nb["kind"] == "conn" and down:
            y2 = nb["cy"] - hb
        d = f"M{x1},{y1} L{x1},{y2}"
        lx, ly = x1 + 8, (y1 + y2) / 2
    elif mode == "v":                                      # out of the top/bottom, then right
        down = nb["cy"] > na["cy"]
        x1 = na["cx"]; y1 = na["cy"] + (ha if down else -ha)
        x2 = nb["cx"] - wb
        d = f"M{x1},{y1} L{x1},{nb['cy']} L{x2},{nb['cy']}"
        lx, ly = x1 + 8, y1 + (30 if down else -18)
    else:                                                  # elbow into another lane: right, up/down in the gap, right
        x1, y1 = na["cx"] + wa, na["cy"]
        x2 = nb["cx"] - wb
        xm = x2 - 35
        d = f"M{x1},{y1} L{xm},{y1} L{xm},{nb['cy']} L{x2},{nb['cy']}"
        lx, ly = x1 + 6, y1 - 10
    parts.append(f'<path d="{d}" fill="none" stroke="#3b4350" stroke-width="2" marker-end="url(#arr)"{dash}/>')
    if label:
        parts.append(f'<text x="{lx}" y="{ly}" text-anchor="{anchor_attr}" font-size="14" font-weight="600" fill="#3b4350">{esc(label)}</text>')

# nodes
for nid, nd in nodes.items():
    kind, cx, cy = nd["kind"], nd["cx"], nd["cy"]
    w, h = SIZE[kind]
    fill, stroke = FILL[nd["cls"]]
    lines = nd["text"].split("\n")
    if kind in ("task", "timer"):
        parts.append(f'<rect x="{cx - w/2}" y="{cy - h/2}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        parts.append(text_block(cx, cy, lines, 15))
    elif kind == "gw":
        pts = f"{cx},{cy - h/2} {cx + w/2},{cy} {cx},{cy + h/2} {cx - w/2},{cy}"
        parts.append(f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        parts.append(text_block(cx, cy, lines, 14))
    elif kind == "cap":
        parts.append(f'<rect x="{cx - w/2}" y="{cy - h/2}" width="{w}" height="{h}" rx="{h/2}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        parts.append(text_block(cx, cy, lines, 14, 600))
    elif kind == "conn":
        num, cap = lines
        fill, stroke = FILL["conn"]
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{w/2}" fill="{fill}" stroke="{stroke}"/>')
        parts.append(text_block(cx, cy, [num], 24, 700, "#ffffff"))
        parts.append(text_block(cx, cy + w / 2 + 18, [cap], 13, 600, "#1f4f8f"))
    elif kind == "note":
        hh = nd["h"]
        parts.append(f'<rect x="{cx - w/2}" y="{cy - hh/2}" width="{w}" height="{hh}" fill="{fill}" stroke="{stroke}"/>')
        y0 = cy - hh / 2 + 24
        for i, ln in enumerate(lines):
            parts.append(f'<text x="{cx - w/2 + 12}" y="{y0 + i * 24}" font-size="13.5" font-weight="{700 if i == 0 else 400}" fill="#4a3c00" xml:space="preserve">{esc(ln)}</text>')

# open questions row
qy = y + 50
parts.append(f'<text x="44" y="{qy - 40}" font-size="20" font-weight="700" fill="#1d2330">Open questions</text>')
for i, (t, body) in enumerate(QS):
    x = 40 + i * 300
    parts.append(f'<rect x="{x}" y="{qy - 20}" width="270" height="150" fill="#fbd3e4" stroke="#c2557f"/>')
    parts.append(f'<text x="{x + 14}" y="{qy + 10}" font-size="16" font-weight="700" fill="#3d1426">{esc(t)}</text>')
    for j, ln in enumerate(body.split("\n")):
        parts.append(f'<text x="{x + 14}" y="{qy + 40 + j * 24}" font-size="14.5" fill="#3d1426">{esc(ln)}</text>')

cx0 = 40 + len(QS) * 300 + 20
parts.append(f'<rect x="{cx0}" y="{qy - 20}" width="420" height="{len(COUNT) * 26 + 24}" fill="#eef1f5" stroke="#5d6676"/>')
for j, ln in enumerate(COUNT):
    parts.append(f'<text x="{cx0 + 14}" y="{qy + 10 + j * 26}" font-size="{16 if j == 0 else 14.5}" font-weight="{700 if j == 0 else 400}" fill="#1d2330" xml:space="preserve">{esc(ln)}</text>')

# legend
ly = qy + len(COUNT) * 26 + 60
legend = [("Main / Task", "main"), ("Happy · END สำเร็จ", "ok"), ("Validation", "val"), ("Error · END ไม่สำเร็จ", "err"),
          ("Alternative", "alt"), ("Edge", "edge"), ("Timeout / จุดรอ", "wait")]
lx = 40
for label, cls in legend:
    f, s = FILL[cls]
    parts.append(f'<rect x="{lx}" y="{ly}" width="26" height="18" fill="{f}" stroke="{s}" stroke-width="2"/>')
    parts.append(f'<text x="{lx + 34}" y="{ly + 14}" font-size="14" fill="#1d2330">{esc(label)}</text>')
    lx += 34 + len(label) * 9 + 40
parts.append(f'<text x="{lx + 20}" y="{ly + 14}" font-size="14" fill="#1d2330">เลนสี = ผู้ทำขั้นนั้น · วงกลมเลข ①–⑥ = ไปต่อที่ขั้นที่มีเลขเดียวกัน (ไม่ลากเส้นย้อนซ้าย)</text>')
H = ly + 50

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
       f'font-family="Sarabun, Tahoma, sans-serif">'
       '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
       '<path d="M0,0 L10,5 L0,10 z" fill="#3b4350"/></marker></defs>'
       f'<rect width="{W}" height="{H}" fill="#ffffff"/>' + "".join(parts) + "</svg>")
(OUT / "b0-flow.svg").write_text(svg, encoding="utf-8")
print("nodes", len(nodes), "edges", len(edges), "size", W, H)

# Keep the preview and the SVG used for Miro in sync on every build.
preview = OUT.parent / "flow-preview-b0.html"
markup = preview.read_text(encoding="utf-8")
markup, replaced = re.subn(r'<svg xmlns=.*?</svg>', lambda _: svg, markup, count=1, flags=re.S)
if replaced != 1:
    raise ValueError("Expected one embedded flow SVG in the HTML preview")
preview.write_text(markup, encoding="utf-8")
