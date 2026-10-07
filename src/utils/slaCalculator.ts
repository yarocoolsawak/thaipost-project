import type { CaseItem, SlaRouteType, TrackingEvent } from '../types/case';
import { findCecByZipCodeOrProvince } from '../data/cecRegions';

/**
 * Check if the shipment route is within Bangkok or within the same region.
 * SLA Rule:
 * - ภาคเดียวกัน หรือใน กทม. -> ส่งภายใน 3 วัน
 * - ข้ามจังหวัด (ต่างภาค) -> จัดส่งภายใน 3-5 วัน
 */
export function isSameRegionOrBkk(originZip?: string, destZip?: string): boolean {
  if (!originZip || !destZip) return true; // Default same region if unknown

  const cleanOrigin = originZip.trim().slice(0, 2);
  const cleanDest = destZip.trim().slice(0, 2);

  // Bangkok & Perimeter zip prefixes: 10 (กทม), 11 (สมุทรปราการ), 12 (นนทบุรี/ปทุมธานี)
  const bkkPrefixes = ['10', '11', '12'];
  const isOriginBkk = bkkPrefixes.includes(cleanOrigin);
  const isDestBkk = bkkPrefixes.includes(cleanDest);

  if (isOriginBkk && isDestBkk) {
    return true;
  }

  // Check if both zip codes belong to the same CEC region
  const originCec = findCecByZipCodeOrProvince(originZip);
  const destCec = findCecByZipCodeOrProvince(destZip);

  if (originCec && destCec && originCec.id === destCec.id) {
    return true;
  }

  return false;
}

/**
 * Returns SLA target delivery days:
 * - ภาคเดียวกัน หรือใน กทม. -> 3 วัน (72 ชม.)
 * - ข้ามจังหวัด -> 3-5 วัน (ใช้ 5 วันเป็นเกณฑ์สูงสุด SLA: 120 ชม.)
 */
export function getSlaTargetDays(originZip?: string, destZip?: string): number {
  return isSameRegionOrBkk(originZip, destZip) ? 3 : 5;
}

export function getSlaRouteType(originZip?: string, destZip?: string): SlaRouteType {
  return isSameRegionOrBkk(originZip, destZip) ? 'SAME_REGION_OR_BKK' : 'CROSS_PROVINCE';
}

/**
 * Locate the bag opening event (เปิดถุง / รับถุง) from tracking events.
 * SLA Rule: "จะนับ SLA ตั้งแต่ วันที่เปิดถุง"
 */
export function findBagOpenDate(events?: TrackingEvent[], fallbackIso?: string): string {
  if (!events || events.length === 0) {
    return fallbackIso || new Date().toISOString();
  }

  // 1. Search for explicit flag, status code 220 (Receive From Shipment / เปิดถุง), or text containing 'เปิดถุง' / 'รับถุง'
  const bagOpenEvent = events.find(
    e =>
      e.isBagOpenEvent ||
      e.statusCode === '220' ||
      e.status.includes('220') ||
      e.status.includes('เปิดถุง') ||
      e.description.includes('เปิดถุง') ||
      e.status.includes('รับถุง') ||
      e.description.includes('รับถุง')
  );

  if (bagOpenEvent) {
    return normalizeToIso(bagOpenEvent.timestamp);
  }

  // 2. Search for sorting center or destination arrival (where bag is opened)
  const arrivalEvent = events.find(
    e =>
      e.status.includes('ถึงศูนย์คัดแยก') ||
      e.status.includes('ถึงที่ทำการปลายทาง') ||
      e.status.includes('ส่งต่อ')
  );

  if (arrivalEvent) {
    return normalizeToIso(arrivalEvent.timestamp);
  }

  // 3. Fallback to first event or fallbackIso
  return normalizeToIso(events[0]?.timestamp || fallbackIso || new Date().toISOString());
}

/**
 * Normalize date strings (supports "YYYY-MM-DD HH:mm:ss" and ISO formats)
 */
function normalizeToIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.includes('T')) return dateStr;
  // Convert "YYYY-MM-DD HH:mm:ss"
  const parsed = new Date(dateStr.replace(' ', 'T'));
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Calculate SLA Deadline starting from Bag Open Date
 */
export function calculateSlaDeadline(bagOpenedAtIso: string, targetDays: number): string {
  const openTime = new Date(bagOpenedAtIso).getTime();
  const deadlineMs = openTime + targetDays * 24 * 3600 * 1000;
  return new Date(deadlineMs).toISOString();
}

/**
 * Calculate Retention Deadline:
 * SLA Rule: "และถ้าหากผู้รับไม่รับสินค้าก็จะนับ SLA หลังจากเปิดถุงอีก 7 วันในการเก็บพัสดุให้"
 */
export function calculateRetentionDeadline(bagOpenedAtIso: string, retentionDays = 7): string {
  const openTime = new Date(bagOpenedAtIso).getTime();
  const deadlineMs = openTime + retentionDays * 24 * 3600 * 1000;
  return new Date(deadlineMs).toISOString();
}

/**
 * Format date in Thai Buddhist Era format (e.g. 05/10/69 หรือ 05 ต.ค. 69)
 */
export function formatThaiDate(isoString?: string, format: 'short' | 'long' = 'short'): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const yearBe = (d.getFullYear() + 543).toString().slice(-2); // e.g. 69 for 2569

  if (format === 'short') {
    return `${day}/${month}/${yearBe}`;
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');

  return `${day} ${thaiMonths[d.getMonth()]} ${yearBe} ${hours}:${mins} น.`;
}

/**
 * Full SLA Assessment breakdown for a Case
 */
export function evaluateCaseSla(caseItem: CaseItem) {
  const originZip = caseItem.parcelInfo?.originZipCode;
  const destZip = caseItem.parcelInfo?.destZipCode;

  const routeType: SlaRouteType = caseItem.slaRouteType || getSlaRouteType(originZip, destZip);
  const targetDays = caseItem.slaTargetDays || (routeType === 'SAME_REGION_OR_BKK' ? 3 : 5);

  const bagOpenedAt =
    caseItem.bagOpenedAt ||
    caseItem.parcelInfo?.bagOpenedAt ||
    findBagOpenDate(caseItem.parcelInfo?.events, caseItem.createdAt);

  const slaDeadline = caseItem.slaDeadline || calculateSlaDeadline(bagOpenedAt, targetDays);
  const retentionDeadline =
    caseItem.retentionDeadline || calculateRetentionDeadline(bagOpenedAt, 7);

  const nowMs = Date.now();
  const deadlineMs = new Date(slaDeadline).getTime();
  const diffHours = Math.round((deadlineMs - nowMs) / (3600 * 1000));
  const isExceeded = caseItem.status !== 'CLOSED' && (caseItem.isSlaExceeded || diffHours <= 0);

  // Retention diff
  const retentionMs = new Date(retentionDeadline).getTime();
  const retentionDiffDays = Math.ceil((retentionMs - nowMs) / (24 * 3600 * 1000));
  const isRetentionExceeded = retentionDiffDays <= 0;

  return {
    routeType,
    routeLabel: routeType === 'SAME_REGION_OR_BKK' ? 'ใน กทม./ภาคเดียวกัน (SLA 3 วัน)' : 'ข้ามจังหวัด/ต่างภาค (SLA 3-5 วัน)',
    targetDays,
    bagOpenedAt,
    bagOpenedDateFormatted: formatThaiDate(bagOpenedAt, 'short'),
    slaDeadline,
    retentionDeadline,
    retentionDaysLeft: Math.max(0, retentionDiffDays),
    isRetentionExceeded,
    diffHours,
    isExceeded
  };
}
