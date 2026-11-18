// Workout log logic (pure, testable). A log entry ("session"):
// { id, date: ISO, title, durationSec, sets: [{ exercise, muscle, kg, reps }] }

export function parseRepRange(reps) {
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(String(reps).trim());
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null; // null for timed e.g. "45-60 sec"
}

// Epley estimated one-rep max
export function e1rm(kg, reps) {
  return kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0;
}

// Comparable strength score: estimated 1RM for weighted sets, reps for bodyweight sets.
export function setScore(s) {
  return s.kg > 0 ? e1rm(s.kg, s.reps) : s.reps;
}

const byDate = (a, b) => new Date(a.date) - new Date(b.date);

export function sessionsWith(logs, exercise) {
  return [...logs]
    .sort(byDate)
    .map((l) => ({ date: l.date, sets: l.sets.filter((s) => s.exercise === exercise) }))
    .filter((x) => x.sets.length > 0);
}

export function lastPerformance(logs, exercise) {
  const s = sessionsWith(logs, exercise);
  return s.length ? s[s.length - 1].sets : null;
}

export function bestScore(logs, exercise) {
  let best = 0;
  for (const x of sessionsWith(logs, exercise)) for (const s of x.sets) best = Math.max(best, setScore(s));
  return best;
}

export function personalRecords(logs) {
  const best = {};
  for (const l of [...logs].sort(byDate)) {
    for (const s of l.sets) {
      const score = setScore(s);
      if (!best[s.exercise] || score > best[s.exercise].score) {
        best[s.exercise] = { exercise: s.exercise, kg: s.kg, reps: s.reps, score, date: l.date };
      }
    }
  }
  return Object.values(best).sort((a, b) => a.exercise.localeCompare(b.exercise));
}

export function exerciseTrend(logs, exercise) {
  return sessionsWith(logs, exercise).map((x) => ({
    date: x.date,
    score: Math.max(...x.sets.map(setScore)),
  }));
}

const round25 = (n) => Math.round(n / 2.5) * 2.5;

// Progressive overload suggestion from the last time this exercise was done.
export function suggestNext(lastSets, repsStr) {
  if (!lastSets || lastSets.length === 0) return null;
  const range = parseRepRange(repsStr);
  const topKg = Math.max(...lastSets.map((s) => s.kg || 0));
  const working = lastSets.filter((s) => (s.kg || 0) === topKg);
  const bestReps = Math.max(...working.map((s) => s.reps));

  if (!range) {
    return { kg: topKg, reps: bestReps, note: `Last time: ${bestReps} sec. Try to beat it.` };
  }
  const hitTop = working.every((s) => s.reps >= range.max);
  if (hitTop && topKg > 0) {
    const kg = round25(topKg + 2.5);
    return { kg, reps: range.min, note: `You hit ${range.max} reps. Try ${kg} kg × ${range.min}+` };
  }
  if (hitTop) {
    return { kg: 0, reps: range.max, note: `You hit ${range.max} reps. Add weight or a harder variation.` };
  }
  const reps = Math.min(range.max, bestReps + 1);
  return {
    kg: topKg,
    reps,
    note: topKg > 0 ? `Aim for ${reps} reps at ${topKg} kg` : `Aim for ${reps} reps`,
  };
}

export function sessionVolume(session) {
  return session.sets.reduce((t, s) => t + (s.kg || 0) * s.reps, 0);
}

// ---- dates (Monday-based weeks, local time) ----
export function weekStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export function workoutsThisWeek(logs, now = new Date()) {
  const start = weekStart(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return logs.filter((l) => {
    const t = new Date(l.date);
    return t >= start && t < end;
  }).length;
}

// Consecutive weeks (ending this week, or last week if none yet this week) with >= 1 workout.
export function weekStreak(logs, now = new Date()) {
  const weeks = new Set(logs.map((l) => weekStart(new Date(l.date)).getTime()));
  const cursor = weekStart(now);
  if (!weeks.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
  let n = 0;
  while (weeks.has(cursor.getTime())) {
    n++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return n;
}

// Set of day-of-month numbers that have a workout (month is 0-11).
export function monthWorkoutDays(logs, year, month) {
  const days = new Set();
  for (const l of logs) {
    const t = new Date(l.date);
    if (t.getFullYear() === year && t.getMonth() === month) days.add(t.getDate());
  }
  return days;
}

export function formatKg(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
