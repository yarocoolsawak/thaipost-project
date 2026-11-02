import type { ActivityLog, CaseItem, IssueCategory, ParcelInfo } from '../types/case';

export type ClosureSettings = Record<IssueCategory, { enabled: boolean; hours: number }>;
export const CLOSURE_CATEGORIES: IssueCategory[] = ['EXPEDITE_REQUEST', 'CLOSE_WORK_REQUEST', 'REDELIVERY_REQUEST', 'RETURN_OR_REVERSE', 'CHANGE_ADDRESS_REQUEST', 'DELAYED_DELIVERY', 'NOT_RECEIVED', 'WRONG_BRANCH', 'DAMAGED_PARCEL', 'CANNOT_LOCATE', 'OTHER'];
export const defaultClosureSettings = (): ClosureSettings => Object.fromEntries(
  CLOSURE_CATEGORIES.map(category => [category, { enabled: category !== 'NOT_RECEIVED', hours: 72 }])
) as ClosureSettings;

export function normalizeClosureSettings(value: unknown): ClosureSettings {
  const defaults = defaultClosureSettings();
  if (!value || typeof value !== 'object') return defaults;
  for (const category of CLOSURE_CATEGORIES) {
    const input = (value as Partial<ClosureSettings>)[category];
    if (input && typeof input.enabled === 'boolean' && Number.isFinite(input.hours) && input.hours >= 1 && input.hours <= 720) {
      defaults[category] = { enabled: category !== 'NOT_RECEIVED' && input.enabled, hours: input.hours };
    }
  }
  return defaults;
}

export const requiresMerchantAcceptance = (c: Pick<CaseItem, 'category' | 'deliveryDisputed'>) => c.deliveryDisputed === true || c.category === 'NOT_RECEIVED';
export const shipmentKey = (ref: CaseItem['myOrderRef'], tracking: string) => `${ref.shopId}/${ref.orderId}/${tracking.trim().toUpperCase()}`;

const log = (c: CaseItem, now: string, action: string, details: string): ActivityLog => ({
  id: `lifecycle-${c.id}-${action}-${now}`, timestamp: now, actorName: 'ระบบอัตโนมัติ', actorRole: 'CENTRAL', action, details
});

// Only the current delivered status counts. Earlier delivered scans cannot override a correction.
export function isDelivered(c: CaseItem): boolean {
  return ['4', '9', '501'].includes(c.parcelInfo.currentStatusCode || '');
}

export function sendResolution(c: CaseItem, settings: ClosureSettings, now: string): CaseItem {
  if (c.status === 'CLOSED') return c;
  const rule = settings[c.category];
  const version = (c.resolutionVersion || 0) + 1;
  const protectedCase = requiresMerchantAcceptance(c);
  const deadline = new Date(Date.parse(now) + rule.hours * 3600000).toISOString();
  return {
    ...c, status: 'ANSWER_SENT_TO_MERCHANT', deliveryDisputed: protectedCase,
    resolutionVersion: version,
    confirmation: { version, sentAt: now, timeoutHours: rule.hours,
      dueAt: !protectedCase && rule.enabled ? deadline : undefined,
      followupAt: new Date(Date.parse(now) + (protectedCase ? 72 : rule.hours) * 3600000).toISOString(),
      reminderAt: !protectedCase && rule.enabled ? new Date(Date.parse(now) + Math.max(0, rule.hours - 24) * 3600000).toISOString() : undefined },
    activityLogs: [log(c, now, 'ส่งผลแก้ไข รอร้านค้ายืนยัน', protectedCase
      ? `รุ่น ${version}: เซ็นรับแล้วไม่ได้รับของ ห้ามปิดอัตโนมัติ ต้องร้านค้ายอมรับ; ติดตามใน 3 วัน`
      : `รุ่น ${version}: ${rule.enabled ? `รอ ${rule.hours} ชั่วโมง ครบกำหนด ${deadline}` : 'ปิดอัตโนมัติถูกปิดใช้งาน'} นับจากส่งผลแก้ไขสำเร็จ`), ...c.activityLogs]
  };
}

export function merchantFollowUp(c: CaseItem, now: string, disputed = false): CaseItem {
  return {
    ...c, status: 'WAITING_CEC_REPLY', merchantEngaged: true,
    deliveryDisputed: requiresMerchantAcceptance(c) || disputed,
    confirmation: undefined, closeReason: undefined, closedAt: undefined,
    acceptedAt: undefined, acceptedBy: undefined, acceptedResolutionVersion: undefined,
    activityLogs: [log(c, now, c.status === 'CLOSED' ? 'เปิดดำเนินการต่อในเคสเดิม' : 'ร้านค้าแจ้งปัญหาต่อ ยกเลิกเวลาปิด',
      `แจ้งข้อความใหม่ให้สาขา / CEC / CS; ${disputed ? 'เซ็นรับแล้วไม่ได้รับของ ต้องร้านค้ายอมรับเท่านั้น; ' : ''}ยกเลิก timer รุ่น ${c.confirmation?.version || '-'}; เก็บประวัติปิดเดิมไว้`), ...c.activityLogs]
  };
}

function autoClose(c: CaseItem, now: string, reason: 'DELIVERED_AUTO' | 'NO_RESPONSE_TIMEOUT'): CaseItem {
  const explanation = reason === 'DELIVERED_AUTO'
    ? 'ปิดอัตโนมัติ เนื่องจากสถานะพัสดุนำจ่ายสำเร็จแล้ว'
    : `ปิดอัตโนมัติ เนื่องจากไม่มีการตอบกลับภายใน ${(c.confirmation?.timeoutHours || 72) / 24} วัน`;
  return { ...c, status: 'CLOSED', closeReason: reason, closedAt: now, isSlaExceeded: false,
    activityLogs: [log(c, now, 'ปิดเคสอัตโนมัติ → Archived', `${explanation}; shipment=${c.shipmentId}; status=${c.parcelInfo.currentStatusCode}; resolution=${c.confirmation?.version || '-'}; ไม่ใช่ร้านค้ายอมรับ`), ...c.activityLogs] };
}

export function evaluateLifecycle(c: CaseItem, now: string): CaseItem {
  if (c.status === 'CLOSED') return c;
  const protectedCase = requiresMerchantAcceptance(c);
  if (!protectedCase && c.creationSource === 'AUTO_SLA' && c.parcelCycleVerified === true && !c.merchantEngaged && isDelivered(c)) {
    return autoClose(c, now, 'DELIVERED_AUTO');
  }
  const confirmation = c.confirmation;
  if (c.status !== 'ANSWER_SENT_TO_MERCHANT' || !confirmation || confirmation.version !== c.resolutionVersion) return c;
  const nowMs = Date.parse(now);
  if (protectedCase) {
    if (!confirmation.escalatedAt && nowMs >= Date.parse(confirmation.followupAt)) {
      return { ...c, deliveryDisputed: true, confirmation: { ...confirmation, dueAt: undefined, reminderAt: undefined, escalatedAt: now },
        activityLogs: [log(c, now, 'แจ้ง CS / สาขาติดตามเคสข้อยกเว้น', 'เซ็นรับแล้วไม่ได้รับของ รอร้านค้าครบ 3 วันแล้ว เคสยังเปิด ห้ามปิดแทนร้านค้า'), ...c.activityLogs] };
    }
    return c;
  }
  if (!confirmation.dueAt) return c;
  // Functional state updates call this against the latest message/version, cancelling stale jobs.
  if (nowMs >= Date.parse(confirmation.dueAt)) return autoClose(c, now, 'NO_RESPONSE_TIMEOUT');
  if (!confirmation.remindedAt && confirmation.reminderAt && nowMs >= Date.parse(confirmation.reminderAt)) {
    return { ...c, confirmation: { ...confirmation, remindedAt: now }, activityLogs: [log(c, now, 'แจ้งเตือนร้านค้าก่อนปิดอัตโนมัติ', `ผลแก้ไขรุ่น ${confirmation.version} ครบกำหนด ${confirmation.dueAt} กดยอมรับหรือแจ้งปัญหาต่อได้`), ...c.activityLogs] };
  }
  return c;
}

export function acceptResolution(c: CaseItem, actor: 'MERCHANT' | 'CENTRAL' | 'MYORDER_ADMIN' | 'CEC' | 'BRANCH', name: string, now: string, expectedVersion = c.resolutionVersion): CaseItem {
  if (expectedVersion !== c.resolutionVersion) return c;
  if (actor !== 'MERCHANT' || c.status !== 'ANSWER_SENT_TO_MERCHANT' || !c.confirmation || c.confirmation.version !== c.resolutionVersion) return c;
  return { ...c, status: 'CLOSED', closeReason: 'MERCHANT_ACCEPTED', closedAt: now,
    acceptedAt: now, acceptedBy: name, acceptedResolutionVersion: c.resolutionVersion, isSlaExceeded: false,
    activityLogs: [{ ...log(c, now, 'ร้านค้ายอมรับและปิดเคส → Archived', `ร้านค้ายอมรับผลแก้ไขรุ่น ${c.resolutionVersion}; ไม่ใช่ปิดเพราะหมดเวลา`), actorRole: 'MERCHANT', actorName: name }, ...c.activityLogs] };
}

// Only an explicit arrival event at the recipient's office starts the auto-report clock.
export function autoSlaEligible(parcel: ParcelInfo, now: string): boolean {
  if (['4', '9', '501', '203', '901'].includes(parcel.currentStatusCode || '')) return false;
  const arrivals = parcel.events.filter(event => ['3', '35', '301', '302'].includes(event.statusCode || '') && event.officeZipCode === parcel.destZipCode)
    .map(event => Date.parse(event.timestamp.replace(' ', 'T'))).filter(Number.isFinite);
  return arrivals.length > 0 && Date.parse(now) > Math.min(...arrivals) + 72 * 3600000;
}
