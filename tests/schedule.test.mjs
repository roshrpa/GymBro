import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from '../src/data/splits.js';
import { workoutOn, changeWorkout, buildCustomWorkout, slotDates } from '../src/utils/schedule.js';

const plan = buildPlan(4); // Mon Upper A, Tue Lower A, Thu Upper B, Fri Lower B
const FRI = '2026-11-20'; // Friday
const title = (o, k) => (workoutOn(plan, o, k) ? workoutOn(plan, o, k).title : 'Rest');

test('default schedule', () => {
  assert.equal(title({}, FRI), 'Lower B');
  assert.equal(title({}, '2026-11-23'), 'Upper A');
  assert.equal(title({}, '2026-11-21'), 'Rest');
});

test('custom muscles today pushes the skipped workout to the next training day', () => {
  const o = changeWorkout(plan, {}, FRI, { t: 'custom', muscles: ['chest', 'triceps'] }, FRI);
  assert.equal(title(o, FRI), 'Chest + Triceps');
  assert.equal(title(o, '2026-11-23'), 'Lower B'); // Mon
  assert.equal(title(o, '2026-11-24'), 'Upper A'); // Tue
  assert.equal(title(o, '2026-11-26'), 'Lower A'); // Thu
  assert.equal(title(o, '2026-11-27'), 'Upper B'); // Fri
});

test('picking a workout that is coming up swaps the two days', () => {
  const o = changeWorkout(plan, {}, FRI, { t: 'plan', title: 'Upper A' }, FRI);
  assert.equal(title(o, FRI), 'Upper A');
  assert.equal(title(o, '2026-11-23'), 'Lower B');
  assert.equal(title(o, '2026-11-24'), 'Lower A'); // untouched
});

test('rest today pushes everything back', () => {
  const o = changeWorkout(plan, {}, FRI, { t: 'rest' }, FRI);
  assert.equal(title(o, FRI), 'Rest');
  assert.equal(title(o, '2026-11-23'), 'Lower B');
});

test('extra session on a rest day does not move anything', () => {
  const o = changeWorkout(plan, {}, '2026-11-21', { t: 'custom', muscles: ['legs'] }, FRI);
  assert.equal(title(o, '2026-11-21'), 'Legs');
  assert.equal(title(o, FRI), 'Lower B');
  assert.equal(title(o, '2026-11-23'), 'Upper A');
});

test('choosing the same workout changes nothing, and past overrides are dropped', () => {
  const o = changeWorkout(plan, {}, FRI, { t: 'plan', title: 'Lower B' }, FRI);
  assert.deepEqual(o, {});
  const old = changeWorkout(plan, { '2026-11-01': { t: 'rest' } }, FRI, { t: 'rest' }, FRI);
  assert.equal(old['2026-11-01'], undefined);
});

test('custom workout has exercises for each muscle', () => {
  const w = buildCustomWorkout(['back', 'biceps']);
  assert.equal(w.blocks.length, 2);
  assert.ok(w.blocks.every((b) => b.items.length >= 2));
  assert.equal(buildCustomWorkout([]), null);
  assert.ok(slotDates(plan, FRI).length > 8);
});
