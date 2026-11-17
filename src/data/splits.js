import { EXERCISES } from './exercises.js';

// Each day is a list of [muscle, numberOfExercises]
const SPLITS = {
  2: [
    { title: 'Full Body A', parts: [['chest', 2], ['back', 2], ['legs', 2], ['shoulders', 1]] },
    { title: 'Full Body B', parts: [['legs', 2], ['back', 2], ['chest', 1], ['shoulders', 2], ['biceps', 1], ['triceps', 1]] },
  ],
  3: [
    { title: 'Push', parts: [['chest', 3], ['shoulders', 2], ['triceps', 2]] },
    { title: 'Pull', parts: [['back', 4], ['biceps', 2], ['shoulders', 1]] },
    { title: 'Legs', parts: [['legs', 5], ['core', 1]] },
  ],
  4: [
    { title: 'Upper A', parts: [['chest', 2], ['back', 2], ['shoulders', 1], ['biceps', 1], ['triceps', 1]] },
    { title: 'Lower A', parts: [['legs', 5], ['core', 1]] },
    { title: 'Upper B', parts: [['back', 2], ['chest', 2], ['shoulders', 2], ['biceps', 1], ['triceps', 1]] },
    { title: 'Lower B', parts: [['legs', 5], ['core', 1]] },
  ],
  5: [
    { title: 'Chest Day', parts: [['chest', 5], ['core', 1]] },
    { title: 'Back Day', parts: [['back', 5], ['biceps', 1]] },
    { title: 'Shoulder Day', parts: [['shoulders', 5], ['core', 1]] },
    { title: 'Leg Day', parts: [['legs', 6]] },
    { title: 'Arms Day', parts: [['biceps', 3], ['triceps', 3]] },
  ],
  6: [
    { title: 'Push A', parts: [['chest', 3], ['shoulders', 2], ['triceps', 2]] },
    { title: 'Pull A', parts: [['back', 4], ['biceps', 2]] },
    { title: 'Legs A', parts: [['legs', 5]] },
    { title: 'Push B', parts: [['shoulders', 3], ['chest', 3], ['triceps', 2]] },
    { title: 'Pull B', parts: [['back', 4], ['biceps', 2], ['core', 1]] },
    { title: 'Legs B', parts: [['legs', 5], ['core', 1]] },
  ],
};

// JS getDay(): 0=Sun ... 6=Sat
const WEEKDAYS = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function buildPlan(daysPerWeek) {
  const n = Math.min(6, Math.max(2, Number(daysPerWeek) || 3));
  return SPLITS[n].map((d, i) => ({
    title: d.title,
    weekday: WEEKDAYS[n][i],
    blocks: d.parts.map(([muscle, count]) => ({
      muscle,
      items: EXERCISES[muscle].slice(0, count),
    })),
  }));
}

export function workoutForWeekday(plan, weekday) {
  return plan.find((d) => d.weekday === weekday) || null;
}
