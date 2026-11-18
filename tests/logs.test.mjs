import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRepRange, e1rm, setScore, lastPerformance, bestScore, personalRecords, exerciseTrend,
  suggestNext, sessionVolume, weekStart, workoutsThisWeek, weekStreak, monthWorkoutDays,
} from '../src/utils/logs.js';

const S = (y, m, d, sets, title = 'Push') => ({
  id: `${y}${m}${d}`, date: new Date(y, m - 1, d, 10).toISOString(), title, sets,
});
const bench = (kg, reps) => ({ exercise: 'Barbell Bench Press', kg, reps });

test('rep range parsing', () => {
  assert.deepEqual(parseRepRange('6-10'), { min: 6, max: 10 });
  assert.equal(parseRepRange('45-60 sec'), null);
});

test('e1rm and score', () => {
  assert.equal(e1rm(100, 0), 0);
  assert.ok(Math.abs(e1rm(100, 5) - 116.67) < 0.01);
  assert.equal(setScore({ kg: 0, reps: 15 }), 15);
});

test('last performance and best score', () => {
  const logs = [S(2026, 11, 2, [bench(60, 8)]), S(2026, 11, 9, [bench(67.5, 6), bench(60, 8)])];
  assert.deepEqual(lastPerformance(logs, 'Barbell Bench Press').map((s) => s.kg), [67.5, 60]);
  assert.equal(lastPerformance(logs, 'Deadlift'), null);
  assert.ok(bestScore(logs, 'Barbell Bench Press') > e1rm(60, 8));
});

test('personal records and trend', () => {
  const logs = [S(2026, 11, 2, [bench(60, 8)]), S(2026, 11, 9, [bench(70, 5)])];
  const pr = personalRecords(logs);
  assert.equal(pr.length, 1);
  assert.equal(pr[0].kg, 70);
  assert.equal(exerciseTrend(logs, 'Barbell Bench Press').length, 2);
});

test('progressive overload suggestion', () => {
  // hit top of 6-10 on all working sets -> add 2.5 kg
  let s = suggestNext([bench(60, 10), bench(60, 10)], '6-10');
  assert.equal(s.kg, 62.5);
  assert.equal(s.reps, 6);
  // not at top -> same weight, +1 rep
  s = suggestNext([bench(60, 8), bench(60, 7)], '6-10');
  assert.equal(s.kg, 60);
  assert.equal(s.reps, 9);
  // bodyweight at top -> no kg suggestion
  s = suggestNext([{ exercise: 'Push Ups', kg: 0, reps: 20 }], '12-20');
  assert.equal(s.kg, 0);
  // timed
  s = suggestNext([{ exercise: 'Plank', kg: 0, reps: 50 }], '45-60 sec');
  assert.equal(s.reps, 50);
  assert.equal(suggestNext(null, '6-10'), null);
});

test('volume', () => {
  assert.equal(sessionVolume({ sets: [bench(60, 10), bench(50, 10)] }), 1100);
});

test('weeks are Monday-based', () => {
  const wed = new Date(2026, 10, 18, 15); // Wed 18 Nov 2026
  const ws = weekStart(wed);
  assert.equal(ws.getDay(), 1);
  assert.equal(ws.getDate(), 16);
  const sun = new Date(2026, 10, 22, 23);
  assert.equal(weekStart(sun).getDate(), 16);
});

test('workouts this week and week streak', () => {
  const now = new Date(2026, 10, 18, 12); // Wed
  const logs = [
    S(2026, 11, 16, [bench(60, 8)]), // Mon this week
    S(2026, 11, 17, [bench(60, 8)]), // Tue this week
    S(2026, 11, 10, [bench(60, 8)]), // last week
    S(2026, 11, 3, [bench(60, 8)]), // 2 weeks ago
    S(2026, 10, 20, [bench(60, 8)]), // gap
  ];
  assert.equal(workoutsThisWeek(logs, now), 2);
  assert.equal(weekStreak(logs, now), 3);
  // nothing yet this week: streak continues from last week
  assert.equal(weekStreak(logs.slice(2, 4), now), 2);
  assert.equal(weekStreak([], now), 0);
  // a missed full week breaks it
  assert.equal(weekStreak([S(2026, 11, 3, [bench(60, 8)])], now), 0);
});

test('month workout days', () => {
  const logs = [S(2026, 11, 3, []), S(2026, 11, 17, []), S(2026, 10, 30, [])];
  assert.deepEqual([...monthWorkoutDays(logs, 2026, 10)].sort((a, b) => a - b), [3, 17]);
});
