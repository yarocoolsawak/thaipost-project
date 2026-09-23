import type { EmailRequestType } from '../types/case';

export const DEFAULT_REQUEST_EMAIL_TO = 'thp_returns@thailandpost.com';

export const EMAIL_REQUEST_TYPE_LABEL: Record<EmailRequestType, string> = {
  RETURN_PARCEL: 'ขอระงับการจ่ายและตีกลับต้นทาง',
  CHANGE_ADDRESS: 'ขอแก้ไขจ่าหน้า/ที่อยู่ผู้รับใหม่',
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
