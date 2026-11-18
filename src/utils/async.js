// Reject if a promise takes too long (Firestore calls can hang when the phone is offline).
export function withTimeout(promise, ms = 8000) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}
