import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBuild, isNewer, pickApkUrl, checkForUpdate } from '../src/utils/update.js';

test('parseBuild', () => {
  assert.equal(parseBuild('Latest Android build (build 12). Download'), 12);
  assert.equal(parseBuild('Build 7'), 7);
  assert.equal(parseBuild('no number'), null);
  assert.equal(parseBuild(undefined), null);
});
test('isNewer', () => {
  assert.equal(isNewer(5, 4), true);
  assert.equal(isNewer(4, 4), false);
  assert.equal(isNewer(null, 4), false);
});
test('pickApkUrl prefers the .apk asset', () => {
  const r = { html_url: 'h', assets: [{ name: 'x.txt', browser_download_url: 'a' }, { name: 'GymBro.apk', browser_download_url: 'b' }] };
  assert.equal(pickApkUrl(r), 'b');
  assert.equal(pickApkUrl({ html_url: 'h', assets: [] }), 'h');
});
test('checkForUpdate with fake fetch', async () => {
  const ok = async () => ({ ok: true, json: async () => ({ body: 'build 9', assets: [{ name: 'GymBro.apk', browser_download_url: 'u' }] }) });
  assert.deepEqual(await checkForUpdate(3, ok), { available: true, build: 9, url: 'u' });
  assert.equal((await checkForUpdate(9, ok)).available, false);
  assert.ok((await checkForUpdate(1, async () => ({ ok: false }))).error);
  assert.ok((await checkForUpdate(1, async () => { throw new Error('x'); })).error);
});
