// The user data model. Kept free of React/storage so it can be tested, and so the same shape
// can later be written to Firebase (Auth uid -> document `users/{uid}`) without changes.
//
// {
//   schemaVersion: 1,
//   name, age, sex ('male'|'female'), heightCm, weightKg,
//   goal ('lose'|'maintain'|'gain'), daysPerWeek (2-6),
//   experience ('beginner'|'intermediate'|'advanced'), dietPref ('nonveg'|'veg'),
//   createdAt, updatedAt (ISO strings),
//   weightHistory: [{ date: ISO string, kg: number }]
// }
export const SCHEMA_VERSION = 1;

export function applyProfileUpdate(prev, next, now = new Date()) {
  const iso = now.toISOString();
  const history = Array.isArray(prev?.weightHistory) ? [...prev.weightHistory] : [];
  const last = history[history.length - 1];
  if (!last || last.kg !== next.weightKg) history.push({ date: iso, kg: next.weightKg });
  return {
    experience: 'beginner',
    dietPref: 'nonveg',
    ...next,
    schemaVersion: SCHEMA_VERSION,
    createdAt: prev?.createdAt || iso,
    updatedAt: iso,
    weightHistory: history.slice(-120),
  };
}

// Fill in defaults for profiles saved by older app versions.
export function migrateProfile(p) {
  if (!p) return null;
  return {
    experience: 'beginner',
    dietPref: 'nonveg',
    weightHistory: p.weightKg ? [{ date: p.updatedAt || new Date().toISOString(), kg: p.weightKg }] : [],
    ...p,
    schemaVersion: SCHEMA_VERSION,
  };
}
