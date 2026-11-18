import test from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout } from '../src/utils/async.js';

test('resolves when fast', async () => {
  assert.equal(await withTimeout(Promise.resolve(5), 100), 5);
});
test('rejects when slow', async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 30), /timeout/);
});
test('propagates original rejection', async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error('boom')), 100), /boom/);
});
