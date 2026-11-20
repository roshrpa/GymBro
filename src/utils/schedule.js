import { dayKey, shiftDay } from './diary.js';
import { EXERCISES, MUSCLE_LABEL } from '../data/exercises.js';

export const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];
const HORIZON = 28; // days ahead that get re-arranged when the user changes a workout

// A "descriptor" says what a day is: { t:'plan', title } | { t:'custom', muscles:[...] } | { t:'rest' }
const weekdayOf = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

export const baseWorkout = (plan, key) => plan.find((w) => w.weekday === weekdayOf(key)) || null;

export function buildCustomWorkout(muscles) {
  const list = MUSCLES.filter((m) => muscles.includes(m));
  if (!list.length) return null;
  const per = Math.max(2, Math.round(6 / list.length));
  return {
    title: list.map((m) => MUSCLE_LABEL[m]).join(' + '),
    custom: true,
    blocks: list.map((m) => ({ muscle: m, items: EXERCISES[m].slice(0, Math.min(per, EXERCISES[m].length)) })),
  };
}

export function resolveDescriptor(desc, plan, fallbackKey) {
  if (!desc || desc.t === 'rest') return null;
  if (desc.t === 'custom') return buildCustomWorkout(desc.muscles || []);
  const found = plan.find((w) => w.title === desc.title);
  return found || (fallbackKey ? baseWorkout(plan, fallbackKey) : null);
}

export function descriptorFor(plan, overrides, key) {
  if (overrides && overrides[key]) return overrides[key];
  const b = baseWorkout(plan, key);
  return b ? { t: 'plan', title: b.title } : null;
}

export const workoutOn = (plan, overrides, key) => resolveDescriptor(descriptorFor(plan, overrides, key), plan, key);
export const isChanged = (overrides, key) => !!(overrides && overrides[key]);

// dates (from `fromKey`) that are normal training days in the plan
export function slotDates(plan, fromKey, horizon = HORIZON) {
  const out = [];
  for (let i = 0; i < horizon; i++) {
    const k = shiftDay(fromKey, i);
    if (baseWorkout(plan, k)) out.push(k);
  }
  return out;
}

export function same(a, b) {
  if (!a || !b || a.t !== b.t) return false;
  if (a.t === 'rest') return true;
  if (a.t === 'plan') return a.title === b.title;
  return [...(a.muscles || [])].sort().join() === [...(b.muscles || [])].sort().join();
}

// Returns the new overrides map after setting `key` to `desc`, re-arranging the days after it:
//  - the chosen workout appears later in the plan -> the two days are swapped
//  - otherwise (custom / rest / not coming up) -> it is inserted and the following days move back one slot
//  - on a normal rest day it simply adds an extra session
export function changeWorkout(plan, overrides, key, desc, todayKey = dayKey()) {
  const next = {};
  Object.keys(overrides || {}).forEach((k) => {
    if (k >= todayKey) next[k] = overrides[k];
  });
  const slots = slotDates(plan, key);
  if (!slots.length || slots[0] !== key) {
    next[key] = desc;
    return next;
  }
  let list = slots.map((d) => descriptorFor(plan, next, d));
  if (same(list[0], desc)) return next;
  const j = list.findIndex((x, i) => i > 0 && same(x, desc));
  if (j > 0) {
    [list[0], list[j]] = [list[j], list[0]];
  } else {
    list = [desc, ...list].slice(0, slots.length);
  }
  slots.forEach((d, i) => {
    const b = baseWorkout(plan, d);
    if (b && same(list[i], { t: 'plan', title: b.title })) delete next[d];
    else next[d] = list[i];
  });
  return next;
}

export function describe(desc, plan) {
  if (!desc) return 'Rest';
  if (desc.t === 'rest') return 'Rest day';
  const w = resolveDescriptor(desc, plan);
  return w ? w.title : 'Rest';
}
