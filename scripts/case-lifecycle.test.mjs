import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = mkdtempSync(join(tmpdir(), 'thaipost-lifecycle-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), 'src/utils/caseLifecycle.ts',
  '--outDir', output, '--module', 'commonjs', '--moduleResolution', 'node', '--target', 'es2023',
  '--skipLibCheck', '--ignoreConfig', '--ignoreDeprecations', '6.0'], { cwd: root, stdio: 'pipe' });
const require = createRequire(import.meta.url);
const { acceptResolution, autoSlaEligible, defaultClosureSettings, evaluateLifecycle, merchantFollowUp, normalizeClosureSettings, sendResolution, shipmentKey } = require(join(output, 'utils/caseLifecycle.js'));
const start = '2026-11-02T00:00:00.000Z';
const at = hours => new Date(Date.parse(start) + hours * 3600000).toISOString();
const base = () => ({ id: 'TP-TEST', status: 'WAITING_CEC_REPLY', category: 'DELAYED_DELIVERY',
  creationSource: 'MERCHANT', shipmentId: 'shop/order/barcode', parcelCycleVerified: true, merchantEngaged: true,
  myOrderRef: { orderId: 'order', shopId: 'shop', shopName: 'shop' },
  parcelInfo: { currentStatusCode: '301', destZipCode: '10500', events: [] }, activityLogs: [], chatHistory: [] });

test('confirmation closes exactly at 72 hours, with timeout reason and no fabricated acceptance', () => {
  const sent = sendResolution(base(), defaultClosureSettings(), start);
  assert.equal(sent.confirmation.dueAt, at(72));
  assert.notEqual(evaluateLifecycle(sent, at(71.99)).status, 'CLOSED');
  const closed = evaluateLifecycle(sent, at(72));
  assert.equal(closed.closeReason, 'NO_RESPONSE_TIMEOUT');
  assert.equal(closed.acceptedBy, undefined);
  assert.match(closed.activityLogs[0].details, /ไม่มีการตอบกลับภายใน 3 วัน/);
  assert.equal(evaluateLifecycle(closed, at(90)), closed);
});

test('reminder is once at 24 hours remaining', () => {
  const sent = sendResolution(base(), defaultClosureSettings(), start);
  assert.equal(evaluateLifecycle(sent, at(47)), sent);
  const reminded = evaluateLifecycle(sent, at(48));
  assert.equal(reminded.confirmation.remindedAt, at(48));
  assert.equal(evaluateLifecycle(reminded, at(50)), reminded);
});

test('signed but not received never auto-closes, including a category change and repeated delivered events', () => {
  let c = sendResolution({ ...base(), category: 'NOT_RECEIVED', creationSource: 'AUTO_SLA', merchantEngaged: false, parcelInfo: { ...base().parcelInfo, currentStatusCode: '501' } }, defaultClosureSettings(), start);
  assert.equal(c.confirmation.dueAt, undefined);
  c = { ...c, category: 'OTHER' }; // sticky dispute flag survives category changes
  const followed = evaluateLifecycle(c, at(73));
  assert.notEqual(followed.status, 'CLOSED');
  assert.equal(followed.confirmation.escalatedAt, at(73));
  assert.equal(evaluateLifecycle(followed, at(1000)), followed);
  for (const role of ['CENTRAL', 'CEC', 'BRANCH', 'MYORDER_ADMIN']) assert.equal(acceptResolution(followed, role, 'staff', at(74)), followed);
  assert.equal(acceptResolution(followed, 'MERCHANT', 'shop', at(74)).closeReason, 'MERCHANT_ACCEPTED');
});

test('delivery auto-close requires source, verified cycle, no merchant involvement, and a current delivered code', () => {
  const delivered = { ...base(), creationSource: 'AUTO_SLA', merchantEngaged: false, parcelInfo: { ...base().parcelInfo, currentStatusCode: '501' } };
  assert.equal(evaluateLifecycle(delivered, start).closeReason, 'DELIVERED_AUTO');
  for (const override of [{ creationSource: 'MERCHANT' }, { parcelCycleVerified: false }, { merchantEngaged: true }, { deliveryDisputed: true }, { category: 'NOT_RECEIVED' }, { parcelInfo: { ...delivered.parcelInfo, currentStatusCode: '401' } }]) {
    const c = { ...delivered, ...override };
    assert.notEqual(evaluateLifecycle(c, at(1000)).status, 'CLOSED');
  }
});

test('merchant follow-up cancels timer, reactivates archived case, preserves log, and blocks delivered re-close', () => {
  const closed = evaluateLifecycle(sendResolution(base(), defaultClosureSettings(), start), at(72));
  const reopened = merchantFollowUp(closed, at(73), true);
  assert.equal(reopened.id, closed.id);
  assert.equal(reopened.confirmation, undefined);
  assert.equal(reopened.status, 'WAITING_CEC_REPLY');
  assert.equal(reopened.activityLogs.length, closed.activityLogs.length + 1);
  const delivered = { ...reopened, creationSource: 'AUTO_SLA', parcelInfo: { ...reopened.parcelInfo, currentStatusCode: '501' } };
  assert.notEqual(evaluateLifecycle(delivered, at(1000)).status, 'CLOSED');
});

test('new result starts a new version; old timer/acceptance cannot close it', () => {
  const old = sendResolution(base(), defaultClosureSettings(), start);
  const replied = merchantFollowUp(old, at(71));
  assert.notEqual(evaluateLifecycle(replied, at(72)).status, 'CLOSED');
  const next = sendResolution(replied, defaultClosureSettings(), at(72));
  assert.equal(next.resolutionVersion, 2);
  assert.equal(next.confirmation.dueAt, at(144));
  assert.notEqual(evaluateLifecycle(next, at(73)).status, 'CLOSED');
  assert.equal(acceptResolution(next, 'MERCHANT', 'shop', at(73), 1), next);
});

test('configuration snapshots existing deadline; disabling timeout still permits merchant acceptance', () => {
  const settings = defaultClosureSettings();
  const first = sendResolution(base(), settings, start);
  settings.DELAYED_DELIVERY.hours = 120;
  assert.equal(first.confirmation.dueAt, at(72));
  assert.equal(sendResolution(base(), settings, start).confirmation.dueAt, at(120));
  settings.DELAYED_DELIVERY.enabled = false;
  const disabled = sendResolution(base(), settings, start);
  assert.notEqual(evaluateLifecycle(disabled, at(1000)).status, 'CLOSED');
  assert.equal(acceptResolution(disabled, 'MERCHANT', 'shop', at(1)).status, 'CLOSED');
  assert.equal(normalizeClosureSettings({ NOT_RECEIVED: { enabled: true, hours: 1 } }).NOT_RECEIVED.enabled, false);
  assert.equal(normalizeClosureSettings({ OTHER: { enabled: true, hours: -3 } }).OTHER.hours, 72);
});

test('auto SLA starts only on exact destination-office arrival, skips terminal parcels, and requires more than 72 hours', () => {
  const parcel = { ...base().parcelInfo, events: [{ timestamp: start, statusCode: '301', officeZipCode: '10500' }] };
  assert.equal(autoSlaEligible(parcel, at(72)), false);
  assert.equal(autoSlaEligible(parcel, at(73)), true);
  assert.equal(autoSlaEligible({ ...parcel, currentStatusCode: '501' }, at(73)), false);
  assert.equal(autoSlaEligible({ ...parcel, events: [{ ...parcel.events[0], officeZipCode: '10100' }] }, at(73)), false);
  assert.notEqual(shipmentKey({ shopId: 'A', orderId: 'one' }, ' same '), shipmentKey({ shopId: 'A', orderId: 'two' }, 'SAME'));
});
