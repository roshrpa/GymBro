import { FOODS, MEAL_TEMPLATES } from '../data/foods.js';

function roundTo(n, step) {
  return Math.round(n / step) * step;
}

function makeItem(foodId, kcalShare) {
  const food = FOODS[foodId];
  let grams = (kcalShare / food.kcal) * 100;
  let label;
  if (food.piece) {
    const step = food.piece.grams >= 100 ? 0.5 : 1;
    let count = Math.max(step, roundTo(grams / food.piece.grams, step));
    grams = count * food.piece.grams;
    const plural = count === 1 ? '' : 's';
    label = `${count} ${food.piece.label}${food.piece.label.includes('(') ? '' : plural} (${Math.round(grams)} g)`;
  } else {
    grams = Math.max(5, roundTo(grams, 5));
    label = `${grams} g`;
  }
  const k = grams / 100;
  return {
    id: foodId,
    name: food.name,
    quantity: label,
    grams,
    kcal: Math.round(food.kcal * k),
    p: Math.round(food.p * k * 10) / 10,
    c: Math.round(food.c * k * 10) / 10,
    f: Math.round(food.f * k * 10) / 10,
  };
}

function sum(items) {
  return items.reduce(
    (t, i) => ({ kcal: t.kcal + i.kcal, p: t.p + i.p, c: t.c + i.c, f: t.f + i.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

const round1 = (t) => ({ kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) });

// pref: 'nonveg' | 'veg'
function buildMeals(templates, kcal) {
  return templates.map((m) => {
    const mealKcal = kcal * m.share;
    const items = m.items.map(([id, s]) => makeItem(id, mealKcal * s));
    return { name: m.name, time: m.time, items, total: round1(sum(items)) };
  });
}

export function buildDiet(targetKcal, proteinTarget, pref = 'nonveg') {
  const templates = MEAL_TEMPLATES[pref] || MEAL_TEMPLATES.nonveg;
  let meals = buildMeals(templates, targetKcal);
  let total = sum(meals.flatMap((m) => m.items));

  // If protein is well short of target, suggest whey scoops (max 2). The scoops' calories are
  // taken out of the meals so the day still lands on the calorie target.
  let addon = null;
  const gap = proteinTarget - total.p;
  if (gap > 15) {
    const scoops = Math.min(2, Math.ceil(gap / 24));
    addon = {
      name: 'Whey protein (optional, after workout)',
      quantity: `${scoops} scoop${scoops > 1 ? 's' : ''} (${scoops * 30} g)`,
      kcal: Math.round(FOODS.whey.kcal * 0.3 * scoops),
      p: Math.round(FOODS.whey.p * 0.3 * scoops),
      c: Math.round(FOODS.whey.c * 0.3 * scoops),
      f: Math.round(FOODS.whey.f * 0.3 * scoops),
    };
    meals = buildMeals(templates, targetKcal - addon.kcal);
    total = sum([...meals.flatMap((m) => m.items), addon]);
  }

  return { meals, addon, total: round1(total) };
}
