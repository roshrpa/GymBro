// Standard, widely used formulas. All outputs are estimates, not medical advice.

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', hint: 'Desk job, little exercise' },
  { value: 1.375, label: 'Light', hint: 'Exercise 1-3 days/week' },
  { value: 1.55, label: 'Moderate', hint: 'Exercise 3-5 days/week' },
  { value: 1.725, label: 'Active', hint: 'Hard exercise 6-7 days/week' },
  { value: 1.9, label: 'Very active', hint: 'Athlete / physical job + training' },
];

export function bmiValue(weightKg, heightCm) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

// Ideal body weight (kg) from four common formulas.
export function idealWeights(heightCm, sex) {
  const inches = Math.max(0, heightCm / 2.54 - 60); // inches over 5 ft
  const male = sex === 'male';
  const devine = (male ? 50 : 45.5) + 2.3 * inches;
  const robinson = (male ? 52 : 49) + (male ? 1.9 : 1.7) * inches;
  const miller = (male ? 56.2 : 53.1) + (male ? 1.41 : 1.36) * inches;
  const hamwi = (male ? 48 : 45.4) + (male ? 2.7 : 2.27) * inches;
  const avg = (devine + robinson + miller + hamwi) / 4;
  return { devine, robinson, miller, hamwi, avg };
}

// U.S. Navy body-fat estimate. Returns null if measurements are inconsistent.
export function bodyFatNavy({ sex, heightCm, waistCm, neckCm, hipCm }) {
  if (!(heightCm > 0 && waistCm > 0 && neckCm > 0)) return null;
  let bf;
  if (sex === 'male') {
    const d = waistCm - neckCm;
    if (d <= 0) return null;
    bf = 495 / (1.0324 - 0.19077 * Math.log10(d) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    if (!(hipCm > 0)) return null;
    const d = waistCm + hipCm - neckCm;
    if (d <= 0) return null;
    bf = 495 / (1.29579 - 0.35004 * Math.log10(d) + 0.221 * Math.log10(heightCm)) - 450;
  }
  if (!isFinite(bf) || bf < 2 || bf > 70) return null;
  return bf;
}

export function bodyFatCategory(bf, sex) {
  const bands =
    sex === 'male'
      ? [[6, 'Essential'], [14, 'Athletic'], [18, 'Fit'], [25, 'Average']]
      : [[14, 'Essential'], [21, 'Athletic'], [25, 'Fit'], [32, 'Average']];
  for (const [limit, label] of bands) if (bf < limit) return label;
  return 'Above average';
}

// Mifflin-St Jeor
export function bmrMifflin({ weightKg, heightCm, age, sex }) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

export function calorieTargets({ weightKg, heightCm, age, sex, activity, goal }) {
  const bmr = bmrMifflin({ weightKg, heightCm, age, sex });
  const tdee = bmr * activity;
  const adjust = goal === 'lose' ? -500 : goal === 'gain' ? 300 : 0;
  const floor = sex === 'male' ? 1500 : 1200; // do not suggest less than this
  const target = Math.max(floor, tdee + adjust);
  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(tdee),
    target: Math.round(target),
    adjust: Math.round(target - tdee),
    flooredForSafety: tdee + adjust < floor,
  };
}

export function macroTargets(weightKg, calories, goal) {
  const protein = Math.round(weightKg * (goal === 'lose' ? 2.0 : goal === 'gain' ? 1.8 : 1.6));
  const fat = Math.round(Math.max(0.6 * weightKg, (0.25 * calories) / 9));
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs, fiber: Math.round((calories / 1000) * 14) };
}

export function waterTarget(weightKg, trainingDay = true) {
  return Math.round((weightKg * 0.035 + (trainingDay ? 0.5 : 0)) * 10) / 10;
}
