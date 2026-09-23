import type { IssueCategory, UrgencyLevel } from '../types/case';
import { PARTNER_COMPANIES } from '../data/partnerCompanies';

export interface AIParsedResult {
  detectedTrackingNumber?: string;
  detectedCompany?: string;
  detectedContactPerson?: string;
  inquirySummary: string;
  suggestedCategory: IssueCategory;
  suggestedUrgency: UrgencyLevel;
  suggestedDraftReply: string;
  confidence: number;
}

export function parseCustomerChatMessage(rawText: string): AIParsedResult {
  const text = rawText.trim();
  
  // 1. Detect Thai Post tracking number pattern (e.g. ED882194821TH, EF123456789TH, etc.)
  const trackingRegex = /([A-Z]{2}\d{9}[A-Z]{2}|\d{13})/i;
  const trackingMatch = text.match(trackingRegex);
  const detectedTrackingNumber = trackingMatch ? trackingMatch[0].toUpperCase() : undefined;
  
  // 2. Detect Partner Company
  let detectedCompany = 'Shopee Official Mall';
  for (const company of PARTNER_COMPANIES) {
    if (text.toLowerCase().includes(company.name.toLowerCase().split(' ')[0])) {
      detectedCompany = company.name;
      break;
    }
  }
  
  // 3. Detect Issue Category & Urgency
  let suggestedCategory: IssueCategory = 'DELAYED_DELIVERY';
  let suggestedUrgency: UrgencyLevel = 'NORMAL';
  
  const lower = text.toLowerCase();
  if (lower.includes('ยังไม่ได้รับ') || lower.includes('ไม่ได้รับของ') || lower.includes('ขึ้นส่งแล้วแต่ไม่เห็น') || lower.includes('เซ็นรับแล้วแต่')) {
    suggestedCategory = 'NOT_RECEIVED';
    suggestedUrgency = 'HIGH';
  } else if (lower.includes('เสียหาย') || lower.includes('แตก') || lower.includes('หัก') || lower.includes('เปียก') || lower.includes('ยับเยิน')) {
    suggestedCategory = 'DAMAGED_PARCEL';
    suggestedUrgency = 'HIGH';
  } else if (lower.includes('ผิดสาขา') || lower.includes('ตีกลับ') || lower.includes('ผิดที่')) {
    suggestedCategory = 'WRONG_BRANCH';
    suggestedUrgency = 'NORMAL';
  } else if (lower.includes('หาไม่เจอ') || lower.includes('ไม่พบในระบบ') || lower.includes('หาย')) {
    suggestedCategory = 'CANNOT_LOCATE';
    suggestedUrgency = 'CRITICAL';
  } else if (lower.includes('ช้า') || lower.includes('ค้าง') || lower.includes('ด่วน') || lower.includes('หลายวัน')) {
    suggestedCategory = 'DELAYED_DELIVERY';
    if (lower.includes('ด่วน') || lower.includes('รีบมาก')) suggestedUrgency = 'HIGH';
  }
  
  // 4. Summarize Inquiry
  let inquirySummary = text;
  if (text.length > 120) {
    inquirySummary = text.slice(0, 117) + '...';
  }
  
  // 5. Draft response suggestion for Central / CEC
  let suggestedDraftReply = '';
  switch (suggestedCategory) {
    case 'NOT_RECEIVED':
      suggestedDraftReply = `จากการตรวจสอบพัสดุหมายเลข ${detectedTrackingNumber || '[เลขพัสดุ]'} เบื้องต้นเจ้าหน้าที่นำจ่ายได้นำส่งมอบ ณ สถานที่ปลายทางแล้ว โดยมีผู้ลงชื่อรับแทน ขอประสานงานที่ทำการไปรษณีย์ปลายทางตรวจสอบหลักฐานลายมือชื่อและจุดวางพัสดุเพื่อแจ้งให้ผู้รับทราบโดยเร็วครับ`;
      break;
    case 'DELAYED_DELIVERY':
      suggestedDraftReply = `พัสดุหมายเลข ${detectedTrackingNumber || '[เลขพัสดุ]'} ขณะนี้ส่งถึงที่ทำการไปรษณีย์ปลายทางแล้ว อยู่ระหว่างจัดเตรียมรอบนำจ่ายพิเศษในวันนี้ ขออภัยในความล่าช้าครับ`;
      break;
    case 'DAMAGED_PARCEL':
      suggestedDraftReply = `ขออภัยเป็นอย่างยิ่งสำหรับกรณีพัสดุ ${detectedTrackingNumber || '[เลขพัสดุ]'} ทางไปรษณีย์ไทยได้ส่งเรื่องให้ฝ่ายรับฝากและศูนย์คัดแยกตรวจสอบบันทึกสภาพสิ่งของ เพื่อดำเนินการเยียวยา/เคลมตามมาตรฐานทันทีครับ`;
      break;
    default:
      suggestedDraftReply = `ระบบได้รับเรื่องติดตามพัสดุหมายเลข ${detectedTrackingNumber || '[เลขพัสดุ]'} เรียบร้อยแล้ว ขณะนี้เจ้าหน้าที่ส่วนกลางกำลังประสานงานศูนย์ CEC ประจำพื้นที่เพื่อเร่งติดตามผลครับ`;
  }
  
  return {
    detectedTrackingNumber,
    detectedCompany,
    detectedContactPerson: 'เจ้าหน้าที่ประสานงาน LINE VIP',
    inquirySummary,
    suggestedCategory,
    suggestedUrgency,
    suggestedDraftReply,
    confidence: detectedTrackingNumber ? 0.95 : 0.72
  };
}
