import test from 'node:test';
import assert from 'node:assert/strict';
import {
  idealWeights, bodyFatNavy, calorieTargets, macroTargets, bmiValue,
} from '../src/utils/calculators.js';
import { buildDiet } from '../src/utils/diet.js';
import { applyProfileUpdate, migrateProfile } from '../src/profileModel.js';

test('ideal weight: Devine for 175 cm male ~70.5 kg', () => {
  const iw = idealWeights(175, 'male');
  assert.ok(Math.abs(iw.devine - 70.65) < 0.5, String(iw.devine));
  assert.ok(iw.avg > 60 && iw.avg < 75);
  assert.ok(idealWeights(165, 'female').devine < idealWeights(165, 'male').devine);
});

test('navy body fat is plausible and validates input', () => {
  const bf = bodyFatNavy({ sex: 'male', heightCm: 178, waistCm: 85, neckCm: 38 });
  assert.ok(bf > 12 && bf < 20, String(bf));
  assert.equal(bodyFatNavy({ sex: 'male', heightCm: 178, waistCm: 30, neckCm: 38 }), null);
  assert.equal(bodyFatNavy({ sex: 'female', heightCm: 165, waistCm: 75, neckCm: 32 }), null); // hip missing
  const f = bodyFatNavy({ sex: 'female', heightCm: 165, waistCm: 75, neckCm: 32, hipCm: 98 });
  assert.ok(f > 18 && f < 35, String(f));
});

test('calorie targets follow goal and never go below the safety floor', () => {
  const base = { weightKg: 75, heightCm: 175, age: 28, sex: 'male', activity: 1.55 };
  const m = calorieTargets({ ...base, goal: 'maintain' });
  assert.equal(calorieTargets({ ...base, goal: 'lose' }).target, m.target - 500);
  assert.equal(calorieTargets({ ...base, goal: 'gain' }).target, m.target + 300);
  const small = calorieTargets({ weightKg: 45, heightCm: 150, age: 50, sex: 'female', activity: 1.2, goal: 'lose' });
  assert.ok(small.target >= 1200 && small.flooredForSafety);
});

test('macros add up to calories', () => {
  const m = macroTargets(75, 2600, 'gain');
  const kcal = m.protein * 4 + m.carbs * 4 + m.fat * 9;
  assert.ok(Math.abs(kcal - 2600) < 25, String(kcal));
});

test('diet plan hits calories and protein for many profiles', () => {
  for (const pref of ['nonveg', 'veg']) {
    for (const [w, h, a, sex, goal, act] of [
      [60, 165, 24, 'female', 'lose', 1.375],
      [70, 172, 25, 'male', 'maintain', 1.55],
      [85, 180, 30, 'male', 'gain', 1.725],
      [95, 178, 35, 'male', 'lose', 1.55],
      [52, 158, 22, 'female', 'gain', 1.55],
    ]) {
      const c = calorieTargets({ weightKg: w, heightCm: h, age: a, sex, activity: act, goal });
      const m = macroTargets(w, c.target, goal);
      const d = buildDiet(c.target, m.protein, pref);
      const off = Math.abs(d.total.kcal - c.target) / c.target;
      assert.ok(off < 0.12, `${pref} ${w}kg ${goal}: kcal ${d.total.kcal} vs ${c.target}`);
      assert.ok(d.total.p >= m.protein * 0.85, `${pref} ${w}kg ${goal}: protein ${d.total.p} vs ${m.protein}`);
      for (const meal of d.meals) for (const it of meal.items) assert.ok(it.grams > 0 && it.quantity);
    }
  }
});

test('profile update tracks weight history and keeps createdAt', () => {
  const t1 = new Date('2026-11-01T00:00:00Z'), t2 = new Date('2026-11-08T00:00:00Z');
  const p1 = applyProfileUpdate(null, { name: 'A', weightKg: 80, heightCm: 175, age: 30, sex: 'male', goal: 'lose', daysPerWeek: 4 }, t1);
  const p2 = applyProfileUpdate(p1, { ...p1, weightKg: 79 }, t2);
  const p3 = applyProfileUpdate(p2, { ...p2, name: 'B' }, t2);
  assert.equal(p2.createdAt, p1.createdAt);
  assert.equal(p2.weightHistory.length, 2);
  assert.equal(p3.weightHistory.length, 2); // weight unchanged -> no new entry
  assert.equal(p3.dietPref, 'nonveg');
});

test('old profiles migrate with defaults', () => {
  const m = migrateProfile({ name: 'X', weightKg: 70, heightCm: 170, age: 20, sex: 'male', goal: 'gain', daysPerWeek: 3 });
  assert.equal(m.experience, 'beginner');
  assert.equal(m.weightHistory.length, 1);
  assert.equal(bmiValue(70, 170).toFixed(1), '24.2');
});
