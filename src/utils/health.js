export function bmi(weightKg, heightCm) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(value) {
  if (value < 18.5) return { label: 'Underweight', color: '#4da3ff' };
  if (value < 25) return { label: 'Normal', color: '#34c759' };
  if (value < 30) return { label: 'Overweight', color: '#ff9f0a' };
  return { label: 'Obese', color: '#ff453a' };
}

export function healthyWeightRange(heightCm) {
  const m = heightCm / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
}

// Mifflin-St Jeor
export function bmr({ weightKg, heightCm, age, sex }) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

const ACTIVITY = { 2: 1.375, 3: 1.45, 4: 1.55, 5: 1.65, 6: 1.725 };

export function dailyCalories(profile) {
  const tdee = bmr(profile) * (ACTIVITY[profile.daysPerWeek] || 1.45);
  const adjust = profile.goal === 'lose' ? -500 : profile.goal === 'gain' ? 300 : 0;
  return { maintenance: Math.round(tdee), target: Math.round(tdee + adjust) };
}

export function proteinGrams(weightKg, goal) {
  const perKg = goal === 'gain' ? 2.0 : goal === 'lose' ? 2.0 : 1.7;
  return Math.round(weightKg * perKg);
}

export function waterLitres(weightKg) {
  return Math.round((weightKg * 0.035 + 0.5) * 10) / 10; // +0.5L for training
}

export function summary(profile) {
  const b = bmi(profile.weightKg, profile.heightCm);
  const range = healthyWeightRange(profile.heightCm);
  const cal = dailyCalories(profile);
  let toGoal = 0;
  if (profile.weightKg > range.max) toGoal = -(profile.weightKg - range.max);
  else if (profile.weightKg < range.min) toGoal = range.min - profile.weightKg;
  return {
    bmi: b,
    category: bmiCategory(b),
    range,
    bmr: Math.round(bmr(profile)),
    calories: cal,
    protein: proteinGrams(profile.weightKg, profile.goal),
    water: waterLitres(profile.weightKg),
    toHealthyRangeKg: toGoal,
  };
}
