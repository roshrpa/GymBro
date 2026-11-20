import { STRENGTH_MET } from '../data/foodDb.js';

// local-date key, e.g. 2026-11-18
export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDay(key, delta) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + delta));
}

export const round = (n) => Math.round(n);

export function entriesFor(entries, key, kind) {
  return entries.filter((e) => e.date === key && (!kind || e.kind === kind));
}

export function foodTotals(entries, key) {
  const foods = entriesFor(entries, key, 'food');
  return {
    kcal: round(foods.reduce((s, e) => s + e.kcal, 0)),
    protein: round(foods.reduce((s, e) => s + (e.protein || 0), 0)),
  };
}

export function activityKcal(weightKg, met, minutes) {
  return round(met * weightKg * (minutes / 60));
}

// kcal burned by logged gym sessions on this day (duration capped to 3 h to ignore forgotten timers)
export function gymBurn(logs, weightKg, key) {
  return round(
    logs
      .filter((l) => dayKey(new Date(l.date)) === key)
      .reduce((s, l) => {
        const mins = Math.min(180, Math.max(5, (l.durationSec || 0) / 60));
        return s + activityKcal(weightKg, STRENGTH_MET, mins);
      }, 0)
  );
}

export function otherBurn(entries, key) {
  return round(entriesFor(entries, key, 'activity').reduce((s, e) => s + e.kcal, 0));
}

// target = daily calorie goal (already includes normal activity for the plan)
export function dayBalance({ target, eaten, gym, other }) {
  const burned = gym + other;
  const remaining = target - eaten; // vs goal
  const net = eaten - burned; // food minus workout burn
  return { burned, remaining, net, over: remaining < 0 };
}

// most recently used distinct foods, for one-tap re-adding
export function recentFoods(entries, limit = 8) {
  const seen = new Set();
  const out = [];
  for (const e of [...entries].reverse()) {
    if (e.kind !== 'food' || seen.has(e.name)) continue;
    seen.add(e.name);
    out.push(e);
    if (out.length >= limit) break;
  }
  return out;
}

export const MAX_DIARY_DAYS = 120;
export function pruneDiary(entries) {
  const cutoff = shiftDay(dayKey(), -MAX_DIARY_DAYS);
  return entries.filter((e) => e.date >= cutoff);
}

// Days (of month, 0-11 month) with any non-gym activity logged
export function monthActivityDays(entries, year, month) {
  const days = new Set();
  for (const e of entries) {
    if (e.kind !== 'activity') continue;
    const [y, m, d] = e.date.split('-').map(Number);
    if (y === year && m - 1 === month) days.add(d);
  }
  return days;
}

// number of distinct days this week (Mon-Sun) with a gym session or other activity
export function activeDaysThisWeek(logs, entries, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const keys = new Set();
  for (let i = 0; i < 7; i++) keys.add(dayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
  const active = new Set();
  logs.forEach((l) => {
    const k = dayKey(new Date(l.date));
    if (keys.has(k)) active.add(k);
  });
  entries.forEach((e) => {
    if (e.kind === 'activity' && keys.has(e.date)) active.add(e.date);
  });
  return active.size;
}
