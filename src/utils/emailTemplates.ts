import type { EmailRequestType, IssueCategory } from '../types/case';

export const DEFAULT_REQUEST_EMAIL_TO = 'thp_returns@thailandpost.com';

export const EMAIL_REQUEST_TYPE_LABEL: Record<EmailRequestType, string> = {
  RETURN_PARCEL: 'ขอระงับการจ่ายและตีกลับต้นทาง',
  CHANGE_ADDRESS: 'ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่',
  REDELIVER: 'ขอยกเลิกตีกลับและนำจ่ายต่อ',
  SUBMIT_DOCS: 'ส่งเอกสารหลักฐานประกอบคำร้อง'
};

interface EmailDraftContext {
  trackingNumber: string;
  shopName: string;
  contactPerson: string;
  caseId?: string;
  originPostOffice?: string;
  destPostOffice?: string;
  receiverName?: string;
  receiverAddress?: string;
}

// Pre-filled subject/body for the official request email a shop sends to ThaiPost
export function buildEmailDraft(type: EmailRequestType, ctx: EmailDraftContext): { subject: string; body: string } {
  const tr = ctx.trackingNumber || '[เลขพัสดุ]';
  if (type === 'RETURN_PARCEL') {
    return {
      subject: `[คำร้องทางการ] ขอระงับการจ่ายและส่งคืนต้นทาง พัสดุ ${tr} (${ctx.shopName})`,
      body:
        `เรียน แผนกบริการลูกค้าและส่งต่อสิ่งของ บริษัท ไปรษณีย์ไทย จำกัด\n\n` +
        `ทางร้าน ${ctx.shopName} มีความประสงค์ขอระงับการนำจ่ายพัสดุหมายเลข ${tr} และขอให้ดำเนินการตีกลับสิ่งของส่งคืนผู้ส่งต้นทาง\n\n` +
        (ctx.originPostOffice ? `ต้นทาง: ${ctx.originPostOffice}\n` : '') +
        (ctx.destPostOffice ? `ปลายทางเดิม: ${ctx.destPostOffice}\n` : '') +
        (ctx.receiverName ? `ผู้รับ: ${ctx.receiverName}\n` : '') +
        `\nได้แนบเอกสารคำร้องมาพร้อมนี้ รบกวนระงับการนำจ่ายและส่งกลับตามที่อยู่ผู้ส่งต้นทางครับ\n\n` +
        `ขอแสดงความนับถือ,\n${ctx.contactPerson}`
    };
  }
  if (type === 'CHANGE_ADDRESS') {
    return {
      subject: `[คำร้องทางการ] ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่ พัสดุ ${tr} (${ctx.shopName})`,
      body:
        `เรียน เจ้าหน้าที่ไปรษณีย์ไทย ส่วนงานนำจ่าย\n\n` +
        `เนื่องด้วยพัสดุหมายเลข ${tr} มีข้อมูลจ่าหน้าคลาดเคลื่อน ทางผู้ส่งขอแจ้งแก้ไขข้อมูลผู้รับและที่อยู่จัดส่งใหม่ ดังนี้:\n\n` +
        `ชื่อผู้รับใหม่: [ระบุชื่อผู้รับ]\nเบอร์โทรศัพท์: [ระบุเบอร์โทร]\nที่อยู่จัดส่งใหม่: [ระบุที่อยู่ใหม่ พร้อมรหัสไปรษณีย์]\n\n` +
        (ctx.receiverAddress ? `(ที่อยู่เดิม: ${ctx.receiverAddress})\n\n` : '') +
        `ได้แนบหนังสือยืนยันจากผู้ส่งมาพร้อมนี้ ขอความกรุณาส่งต่อพัสดุตามที่อยู่ใหม่ครับ\n\n` +
        `ขอแสดงความนับถือ,\n${ctx.contactPerson}`
    };
  }
  if (type === 'REDELIVER') {
    return {
      subject: `[คำร้องทางการ] ขอยกเลิกการตีกลับและนำจ่ายต่อ พัสดุ ${tr} (${ctx.shopName})`,
      body:
        `เรียน เจ้าหน้าที่ไปรษณีย์ไทย ส่วนงานนำจ่าย\n\n` +
        `ทางร้าน ${ctx.shopName} ขอยกเลิกคำขอตีกลับพัสดุหมายเลข ${tr} และขอให้ดำเนินการนำจ่ายถึงผู้รับปลายทางตามเดิม\n\n` +
        (ctx.destPostOffice ? `ปลายทาง: ${ctx.destPostOffice}\n` : '') +
        (ctx.receiverName ? `ผู้รับ: ${ctx.receiverName}\n` : '') +
        `\nรบกวนถอยสถานะตีกลับและเร่งนำส่งให้ด้วยครับ\n\n` +
        `ขอแสดงความนับถือ,\n${ctx.contactPerson}`
    };
  }
  return {
    subject: ctx.caseId
      ? `[เอกสารเพิ่มเติม] ส่งหลักฐานประกอบเคส ${ctx.caseId} พัสดุ ${tr}`
      : `[เอกสารเพิ่มเติม] แนบหลักฐานประกอบการติดตาม พัสดุ ${tr} (${ctx.shopName})`,
    body:
      `เรียน เจ้าหน้าที่ไปรษณีย์ไทย\n\n` +
      `ทางร้าน ${ctx.shopName} ได้แนบเอกสารหลักฐานเพิ่มเติม สำหรับ${ctx.caseId ? `เคส ${ctx.caseId} ` : ''}พัสดุ ${tr} มาเพื่อประกอบการตรวจสอบครับ\n\n` +
      `ขอแสดงความนับถือ,\n${ctx.contactPerson}`
  };
}

// Which problem types must (or may) come with an official email to ThaiPost
export const EMAIL_RULES: Partial<Record<IssueCategory, { required: boolean; type: EmailRequestType; note: string }>> = {
  RETURN_OR_REVERSE: {
    required: true,
    type: 'RETURN_PARCEL',
    note: 'แจ้งตีกลับต้องส่งอีเมลคำร้องถึง ปณท ทุกครั้ง แก้ไขข้อความได้ก่อนส่ง'
  },
  CHANGE_ADDRESS_REQUEST: {
    required: true,
    type: 'CHANGE_ADDRESS',
    note: 'ขอเปลี่ยนที่อยู่ / เบอร์โทรผู้รับต้องส่งอีเมลคำร้องถึง ปณท ทุกครั้ง กรอกข้อมูลใหม่ในข้อความก่อนส่ง'
  },
  REDELIVERY_REQUEST: {
    required: false,
    type: 'REDELIVER',
    note: 'ถ้าเป็นการเปลี่ยนจากตีกลับมาเป็นเร่งนำส่ง ต้องส่งอีเมลด้วย'
  }
};
