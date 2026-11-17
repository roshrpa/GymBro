import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, workoutForWeekday } from '../src/data/splits.js';
import { EXERCISES, videoUrl } from '../src/data/exercises.js';
import { bmi, bmiCategory, summary } from '../src/utils/health.js';

test('plan has one workout per training day for 2-6 days', () => {
  for (const n of [2, 3, 4, 5, 6]) {
    const plan = buildPlan(n);
    assert.equal(plan.length, n);
    assert.equal(new Set(plan.map((d) => d.weekday)).size, n);
    for (const d of plan) {
      assert.ok(d.blocks.length > 0);
      for (const b of d.blocks) assert.ok(b.items.length > 0, `${n}d ${d.title} ${b.muscle} empty`);
    }
  }
});

test('requested exercise counts never exceed available exercises', () => {
  for (const n of [2, 3, 4, 5, 6]) {
    for (const d of buildPlan(n)) {
      for (const b of d.blocks) assert.ok(b.items.length <= EXERCISES[b.muscle].length);
    }
  }
});

test('5-day split is chest/back/shoulders/legs/arms', () => {
  const titles = buildPlan(5).map((d) => d.title);
  assert.deepEqual(titles, ['Chest Day', 'Back Day', 'Shoulder Day', 'Leg Day', 'Arms Day']);
});

test('weekday lookup returns null on rest day', () => {
  assert.equal(workoutForWeekday(buildPlan(3), 0), null);
  assert.equal(workoutForWeekday(buildPlan(3), 1).title, 'Push');
});

test('BMI and category', () => {
  assert.ok(Math.abs(bmi(70, 175) - 22.86) < 0.01);
  assert.equal(bmiCategory(22.9).label, 'Normal');
  assert.equal(bmiCategory(17).label, 'Underweight');
  assert.equal(bmiCategory(27).label, 'Overweight');
  assert.equal(bmiCategory(31).label, 'Obese');
});

test('summary numbers are sane', () => {
  const s = summary({ weightKg: 90, heightCm: 175, age: 28, sex: 'male', goal: 'lose', daysPerWeek: 4 });
  assert.equal(s.calories.target, s.calories.maintenance - 500);
  assert.ok(s.toHealthyRangeKg < 0);
  assert.ok(s.protein === 180);
});

test('video url is encoded', () => {
  assert.ok(videoUrl('Push Ups').startsWith('https://www.youtube.com/results?search_query=Push%20Ups'));
});
