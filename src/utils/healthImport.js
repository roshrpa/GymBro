// Turns Health Connect exercise sessions (from Samsung Health etc.) into diary activity items.
// Pure functions so they can be unit-tested. Exercise type codes follow Android's ExerciseSessionRecord.
export const EXERCISE_NAMES = {
  0: 'Workout', 2: 'Badminton', 8: 'Cycling', 9: 'Cycling (stationary)', 14: 'Cricket', 16: 'Dancing',
  25: 'Elliptical', 36: 'HIIT', 37: 'Hiking', 44: 'Martial arts', 48: 'Pilates', 53: 'Rowing',
  54: 'Rowing machine', 55: 'Rugby', 56: 'Running', 57: 'Running (treadmill)', 64: 'Football',
  66: 'Squash', 68: 'Stair climbing', 70: 'Strength training', 73: 'Swimming', 74: 'Swimming',
  75: 'Table tennis', 76: 'Tennis', 78: 'Volleyball', 79: 'Walking', 81: 'Weightlifting', 83: 'Yoga',
};
const MET = {
  0: 5, 2: 5.5, 8: 7.5, 9: 6.8, 14: 4.8, 16: 5, 25: 5, 36: 8, 37: 6, 44: 8, 48: 3.5, 53: 6, 54: 7,
  55: 8, 56: 9.8, 57: 9.8, 64: 7, 66: 10, 68: 8, 70: 5, 73: 6, 74: 6, 75: 4, 76: 7, 78: 3.5, 79: 3.5,
  81: 5, 83: 2.5,
};

const ts = (x) => Date.parse(x);
const within = (rec, s, e) => ts(rec.startTime) >= s - 60000 && ts(rec.endTime) <= e + 60000;

export function normalizeSessions({ sessions = [], calories = [], distances = [], weightKg = 70 }) {
  const seen = new Set();
  const out = [];
  for (const ses of sessions) {
    const s = ts(ses.startTime);
    const e = ts(ses.endTime);
    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) continue;
    const minutes = Math.round((e - s) / 60000);
    if (minutes < 1) continue;
    const key = `${s}-${e}`;
    if (seen.has(key)) continue; // same session reported by two sources
    seen.add(key);
    const type = ses.exerciseType;
    const name = EXERCISE_NAMES[type] || (ses.title && String(ses.title).trim()) || 'Workout';
    let kcal = calories
      .filter((r) => within(r, s, e))
      .reduce((sum, r) => sum + ((r.energy && r.energy.inKilocalories) || 0), 0);
    if (!(kcal > 0)) kcal = (MET[type] || 5) * weightKg * (minutes / 60);
    const meters = distances.filter((r) => within(r, s, e)).reduce((sum, r) => sum + ((r.distance && r.distance.inMeters) || 0), 0);
    out.push({
      hcId: (ses.metadata && ses.metadata.id) || key,
      name,
      minutes,
      kcal: Math.round(kcal),
      distanceKm: meters > 0 ? Math.round(meters / 100) / 10 : 0,
      start: ses.startTime,
    });
  }
  return out.sort((a, b) => ts(a.start) - ts(b.start));
}
