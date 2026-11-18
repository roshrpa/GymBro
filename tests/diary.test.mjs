import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, shiftDay, foodTotals, gymBurn, activityKcal, dayBalance, recentFoods, pruneDiary } from '../src/utils/diary.js';
import { FOOD_DB } from '../src/data/foodDb.js';

test('dayKey and shiftDay', () => {
  assert.equal(dayKey(new Date(2026, 10, 18)), '2026-11-18');
  assert.equal(shiftDay('2026-11-01', -1), '2026-10-31');
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
});

test('food totals sum a day only', () => {
  const e = [
    { kind: 'food', date: '2026-11-18', name: 'Chapati', kcal: 312, protein: 9 },
    { kind: 'food', date: '2026-11-18', name: 'Dal', kcal: 150, protein: 9 },
    { kind: 'food', date: '2026-11-17', name: 'Rice', kcal: 205, protein: 4 },
  ];
  assert.deepEqual(foodTotals(e, '2026-11-18'), { kcal: 462, protein: 18 });
});

test('activity kcal uses MET x kg x hours', () => {
  assert.equal(activityKcal(70, 7, 30), 245);
});

test('gym burn from sessions, capped and floored', () => {
  const logs = [{ date: new Date(2026, 10, 18, 18).toISOString(), durationSec: 3600 }];
  assert.equal(gymBurn(logs, 70, '2026-11-18'), 350);
  assert.equal(gymBurn(logs, 70, '2026-11-17'), 0);
  const long = [{ date: new Date(2026, 10, 18, 9).toISOString(), durationSec: 99999 }];
  assert.equal(gymBurn(long, 70, '2026-11-18'), 1050);
});

test('balance: over target when eaten > target', () => {
  const b = dayBalance({ target: 2000, eaten: 2300, gym: 300, other: 100 });
  assert.equal(b.remaining, -300);
  assert.equal(b.over, true);
  assert.equal(b.net, 1900);
});

test('food db sane and recent foods distinct', () => {
  assert.ok(FOOD_DB.length > 80);
  assert.ok(FOOD_DB.every((f) => f.kcal >= 0 && f.name && f.serving));
  const e = [
    { kind: 'food', name: 'A', date: 'x' },
    { kind: 'food', name: 'B', date: 'x' },
    { kind: 'food', name: 'A', date: 'x' },
  ];
  assert.deepEqual(recentFoods(e).map((x) => x.name), ['A', 'B']);
});

test('prune drops old entries', () => {
  const old = { kind: 'food', date: '2020-01-01', kcal: 1 };
  const now = { kind: 'food', date: dayKey(), kcal: 1 };
  assert.deepEqual(pruneDiary([old, now]), [now]);
});
