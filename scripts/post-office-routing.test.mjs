import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = mkdtempSync(join(tmpdir(), 'thaipost-routing-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  join(root, 'node_modules/typescript/bin/tsc'),
  'src/data/mockCases.ts', 'src/data/postOffices.ts', 'src/data/cecRegions.ts', 'src/utils/cecRouting.ts',
  '--outDir', output, '--module', 'commonjs', '--moduleResolution', 'node',
  '--target', 'es2023', '--resolveJsonModule', '--esModuleInterop', '--skipLibCheck', '--ignoreConfig',
  '--ignoreDeprecations', '6.0'
], { cwd: root, stdio: 'pipe' });
const require = createRequire(import.meta.url);
const { findPostOffice, searchPostOffices, POST_OFFICES } = require(join(output, 'data/postOffices.js'));
const { CEC_REGIONS, findCecByZipCodeOrProvince } = require(join(output, 'data/cecRegions.js'));
const { detectRoutingAlert } = require(join(output, 'utils/cecRouting.js'));
const { INITIAL_CASES } = require(join(output, 'data/mockCases.js'));

test('all imported offices have a unique exact code and a source CEC', () => {
  assert.equal(POST_OFFICES.length, 1200);
  assert.equal(new Set(POST_OFFICES.map(office => office.code)).size, 1200);
  assert.equal(CEC_REGIONS.length, 14);
  assert.equal(CEC_REGIONS.reduce((sum, group) => sum + group.officeCount, 0), 1200);
  for (const office of POST_OFFICES) {
    assert.equal(findCecByZipCodeOrProvince(office.code)?.code, office.cecCode);
  }
});

test('same two-digit prefix can belong to different CECs', () => {
  assert.equal(findCecByZipCodeOrProvince('10100')?.code, 'CEC ปน.1');
  assert.equal(findCecByZipCodeOrProvince('10500')?.code, 'CEC ปน.3');
  assert.equal(findPostOffice('10500')?.name, 'บางรัก');
});

test('unknown or malformed codes never fall back to a prefix, province, or CEC 1', () => {
  for (const code of ['50210', '99999', '10', '105000', 'abc', undefined]) {
    assert.equal(findPostOffice(code), undefined);
    assert.equal(findCecByZipCodeOrProvince(code, 'กรุงเทพมหานคร'), undefined);
  }
  assert.equal(findPostOffice(' 10500 ')?.name, 'บางรัก');
});

test('search combines code, name, and exact group filters', () => {
  assert.equal(searchPostOffices('บางรัก', 'CEC ปน.3').some(office => office.code === '10500'), true);
  assert.equal(searchPostOffices('10500', 'CEC ปข.4').length, 0);
  assert.equal(searchPostOffices('', 'CEC ปข.5').length, 136);
});

test('all seeded case assignments are resolved from the imported source, not legacy numeric CECs', () => {
  for (const item of INITIAL_CASES) {
    const office = findPostOffice(item.parcelInfo.destZipCode);
    assert.equal(item.assignedCecName, office?.cecCode);
    assert.equal(item.assignedBranchCode, office?.code);
    assert.equal(item.assignedBranchName, office ? `ปณ.${office.name}` : undefined);
  }
});

test('routing notices use exact delivery-office groups and ignore transit sorting centres', () => {
  const parcel = {
    destZipCode: '10500', events: [{ timestamp: '2026-10-30T00:00:00Z',
      status: 'ถึงที่ทำการปลายทาง', statusCode: '301', location: 'ปณ.พลับพลาไชย', officeZipCode: '10100' }]
  };
  const assigned = findCecByZipCodeOrProvince('10500').id;
  const alert = detectRoutingAlert(parcel, assigned, '2026-10-30T01:00:00Z');
  assert.equal(alert?.kind, 'CEC_MISMATCH');
  assert.equal(alert?.suggestedCecId, findCecByZipCodeOrProvince('10100').id);
  assert.match(alert.message, /CEC ปน\.1/);
  assert.equal(detectRoutingAlert({ ...parcel, events: [{ ...parcel.events[0], statusCode: '201', status: 'อยู่ระหว่างขนส่ง' }] }, assigned, ''), undefined);
  assert.equal(detectRoutingAlert({ ...parcel, destZipCode: '99999' }, undefined, '')?.kind, 'UNKNOWN_ZIP');
});

test('archived source matches the import provenance hash', () => {
  // Provenance hash is generated at import time; verify it against the stored source.
  const metadata = JSON.parse(readFileSync(join(root, 'src/data/postOffices.json'), 'utf8'));
  const { createHash } = require('node:crypto');
  const source = readFileSync(join(root, 'docs/knowledge-base/sources', metadata.source));
  assert.equal(createHash('sha256').update(source).digest('hex'), metadata.sha256);
});
