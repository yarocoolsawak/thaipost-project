import directory from './postOffices.json';

export interface PostOffice {
  code: string;
  name: string;
  division: string;
  cecCode: string;
  sourceRow: number;
}

export const POST_OFFICE_SOURCE = {
  filename: directory.source,
  asOf: directory.asOf,
  asOfLabel: directory.asOfLabel,
  sha256: directory.sha256,
  sheet: directory.sheet
};
export const POST_OFFICES: readonly PostOffice[] = directory.offices;
export const POST_OFFICE_GROUPS = directory.groups;
const officesByCode = new Map(POST_OFFICES.map(office => [office.code, office]));

/** Exact source code lookup. Never infer a delivery office from a two-digit prefix. */
export function findPostOffice(code?: string): PostOffice | undefined {
  const normalized = code?.trim();
  return normalized && /^\d{5}$/.test(normalized) ? officesByCode.get(normalized) : undefined;
}

export function searchPostOffices(query: string, cecCode = ''): PostOffice[] {
  const terms = query.trim().toLocaleLowerCase('th').split(/\s+/).filter(Boolean);
  return POST_OFFICES.filter(office =>
    (!cecCode || office.cecCode === cecCode) &&
    terms.every(term => `${office.code} ${office.name} ${office.division} ${office.cecCode}`.toLocaleLowerCase('th').includes(term))
  );
}
