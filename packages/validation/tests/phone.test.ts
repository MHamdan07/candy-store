import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePakistanPhone } from '../src/phone.ts';

test('normalizePakistanPhone correctly formats 0300 local format', () => {
  const res = normalizePakistanPhone('0300 1234567');
  assert.equal(res.isValid, true);
  assert.equal(res.normalized, '+923001234567');
  assert.equal(res.display, '+92 300 1234567');
  assert.equal(res.masked, '+92 300 ••••567');
});

test('normalizePakistanPhone handles dashes and unspaced numbers', () => {
  const res1 = normalizePakistanPhone('0321-7654321');
  assert.equal(res1.isValid, true);
  assert.equal(res1.normalized, '+923217654321');

  const res2 = normalizePakistanPhone('+923339876543');
  assert.equal(res2.isValid, true);
  assert.equal(res2.normalized, '+923339876543');
});

test('normalizePakistanPhone rejects invalid formats', () => {
  const res1 = normalizePakistanPhone('12345');
  assert.equal(res1.isValid, false);
  assert.ok(res1.error);

  const res2 = normalizePakistanPhone('02134567890'); // Landline Karachi code, not mobile
  assert.equal(res2.isValid, false);
});
