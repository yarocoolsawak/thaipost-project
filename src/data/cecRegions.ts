import type { CecInfo } from '../types/case';
import { findPostOffice, POST_OFFICE_GROUPS, POST_OFFICE_SOURCE } from './postOffices';

// Numeric ids are internal UI keys; the source CEC codes are ปน.1–4 / ปข.1–10.
export const CEC_REGIONS: CecInfo[] = POST_OFFICE_GROUPS.map(group => ({
  id: group.id,
  code: group.code,
  name: group.code,
  regionName: group.code.replace('CEC ', ''),
  officeCount: group.officeCount,
  sourceAsOf: POST_OFFICE_SOURCE.asOf
}));

const cecByCode = new Map(CEC_REGIONS.map(cec => [cec.code, cec]));

/** Compatibility name for existing callers; province is deliberately not a routing fallback. */
export function findCecByZipCodeOrProvince(zipCode?: string, _province?: string): CecInfo | undefined {
  const office = findPostOffice(zipCode);
  return office ? cecByCode.get(office.cecCode) : undefined;
}

export const getCecLabel = (id?: number): string =>
  CEC_REGIONS.find(cec => cec.id === id)?.name || 'ยังไม่ระบุ CEC';
