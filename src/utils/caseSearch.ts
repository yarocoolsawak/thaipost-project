import type { CaseItem } from '../types/case';

// Search shared by every case list: tracking number, case ID, order ID, shop, receiver or problem text.
// Pasting several tracking numbers (space / comma / new line separated) finds all of them.
export const matchesCaseSearch = (c: CaseItem, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const ids = [c.trackingNumber, c.id, c.myOrderRef?.orderId || ''].map(v => v.toLowerCase());
  const text = [c.companyName, c.parcelInfo.receiverName, c.customerInquiry].map(v => v.toLowerCase());
  if ([...ids, ...text].some(v => v.includes(q))) return true;
  const tokens = q.split(/[\s,]+/).filter(Boolean);
  return tokens.length > 1 && tokens.some(t => ids.some(v => v.includes(t)));
};
