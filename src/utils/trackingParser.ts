// ThaiPost tracking numbers: 2 letters + 9 digits + 2 letters, e.g. EN100200310TH
const TRACKING_PATTERN = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export interface ParsedTrackingList {
  valid: string[];      // unique, in the order they were pasted
  invalid: string[];    // tokens that do not look like a tracking number
  duplicateCount: number;
}

// Accepts anything copied from Excel / LINE / email: newline, space, comma or semicolon separated
export function parseTrackingList(raw: string): ParsedTrackingList {
  const tokens = raw
    .toUpperCase()
    .split(/[\s,;|]+/)
    .map(t => t.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  let duplicateCount = 0;
  for (const token of tokens) {
    if (!TRACKING_PATTERN.test(token)) {
      if (!invalid.includes(token)) invalid.push(token);
    } else if (valid.includes(token)) {
      duplicateCount += 1;
    } else {
      valid.push(token);
    }
  }
  return { valid, invalid, duplicateCount };
}
