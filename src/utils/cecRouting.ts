import type { CaseItem, CecInfo, ParcelInfo, RoutingAlert, RoutingAlertKind, TrackingEvent } from '../types/case';
import { findCecByZipCodeOrProvince, getCecLabel } from '../data/cecRegions';

// The CEC is known as soon as the shop reports: it comes from the recipient's postal code on the order
export const cecForRecipient = (parcel: ParcelInfo): CecInfo | undefined => findCecByZipCodeOrProvince(parcel.destZipCode);

export const ROUTING_ALERT_LABEL: Record<RoutingAlertKind, string> = {
  CEC_MISMATCH: 'CEC ไม่ตรงปลายทางจริง',
  WRONG_AREA: 'สาขาแจ้งผิดเขต / ที่อยู่ผิด',
  UNKNOWN_ZIP: 'ไม่พบ CEC ของรหัสไปรษณีย์'
};

// Statuses that put the parcel at its delivery office (EMS 1–2 digit codes and the 3-digit set)
const ARRIVED_AT_DEST_CODES = ['3', '35', '301', '302'];
const ARRIVED_AT_DEST_TEXT = /ถึงที่ทำการปลายทาง|เตรียมนำจ่าย|ระหว่างการนำจ่าย/;

// Statuses where the delivery office itself says the recipient's address is wrong
export const WRONG_AREA_CODES: Record<string, string> = {
  '40': 'ผิดเขต',
  '20': 'จ่าหน้าไม่ชัดเจน',
  '21': 'ไม่มีเลขบ้านตามจ่าหน้า',
  '26': 'ย้าย / ไม่ทราบที่อยู่ใหม่'
};

const eventKey = (e: TrackingEvent) => `${e.statusCode || e.status}@${e.location}@${e.timestamp}`;

/**
 * Compare where QMS says the parcel really is with the CEC picked from the recipient's postal code.
 * Only the latest delivery-office event counts: sorting centres along the way sit in other provinces.
 */
export function detectRoutingAlert(parcel: ParcelInfo, assignedCecId: number | undefined, nowIso: string): RoutingAlert | undefined {
  if (assignedCecId === undefined) {
    return {
      kind: 'UNKNOWN_ZIP',
      key: `zip@${parcel.destZipCode}`,
      detectedAt: nowIso,
      message: `รหัสไปรษณีย์ผู้รับ ${parcel.destZipCode} ไม่มีในตารางรหัสไปรษณีย์ → CEC ส่วนกลางต้องเลือก CEC เอง`
    };
  }

  const events = [...parcel.events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    const code = e.statusCode || '';
    const officeCec = e.officeZipCode ? findCecByZipCodeOrProvince(e.officeZipCode) : undefined;

    if (WRONG_AREA_CODES[code]) {
      return {
        kind: 'WRONG_AREA',
        key: eventKey(e),
        detectedAt: nowIso,
        statusCode: code,
        officeName: e.location,
        officeZipCode: e.officeZipCode,
        suggestedCecId: officeCec && officeCec.id !== assignedCecId ? officeCec.id : undefined,
        message: `${e.location} แจ้งสถานะ "${WRONG_AREA_CODES[code]}" (รหัส ${code}) ที่อยู่หรือรหัสไปรษณีย์ผู้รับ ${parcel.destZipCode} อาจพิมพ์ผิด`
      };
    }

    if (ARRIVED_AT_DEST_CODES.includes(code) || ARRIVED_AT_DEST_TEXT.test(e.status)) {
      if (!officeCec || officeCec.id === assignedCecId) return undefined;
      return {
        kind: 'CEC_MISMATCH',
        key: eventKey(e),
        detectedAt: nowIso,
        statusCode: code || undefined,
        officeName: e.location,
        officeZipCode: e.officeZipCode,
        suggestedCecId: officeCec.id,
        message: `พัสดุถึง ${e.location} (${e.officeZipCode}) ซึ่งอยู่ใน ${officeCec.name} แต่เคสส่งไป ${getCecLabel(assignedCecId)} ตามรหัสไปรษณีย์ผู้รับ ${parcel.destZipCode}`
      };
    }
  }
  return undefined;
}

/**
 * Alert to keep on the case after a QMS update. An alert central already dismissed stays dismissed,
 * and an alert disappears by itself once the parcel reaches an office of the assigned CEC.
 */
export function nextRoutingAlert(
  c: Pick<CaseItem, 'assignedCecId' | 'routingAlert' | 'routingAlertDismissedKey'>,
  parcel: ParcelInfo,
  nowIso: string
): { alert: RoutingAlert | undefined; isNew: boolean } {
  const found = detectRoutingAlert(parcel, c.assignedCecId, nowIso);
  if (!found || found.key === c.routingAlertDismissedKey) return { alert: undefined, isNew: false };
  if (c.routingAlert?.key === found.key) return { alert: c.routingAlert, isNew: false };
  return { alert: found, isNew: true };
}
