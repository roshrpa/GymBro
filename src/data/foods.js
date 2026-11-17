// Approximate nutrition per 100 g (cooked weight unless noted), based on USDA FoodData Central
// and standard Indian food composition values. Real foods vary; treat as estimates.
export const FOODS = {
  oats: { name: 'Oats (dry)', kcal: 389, p: 16.9, c: 66, f: 6.9 },
  egg: { name: 'Whole egg', kcal: 143, p: 12.6, c: 0.7, f: 9.5, piece: { label: 'egg', grams: 50 } },
  banana: { name: 'Banana', kcal: 89, p: 1.1, c: 22.8, f: 0.3, piece: { label: 'banana', grams: 118 } },
  apple: { name: 'Apple', kcal: 52, p: 0.3, c: 13.8, f: 0.2, piece: { label: 'apple', grams: 182 } },
  milk: { name: 'Milk (whole)', kcal: 61, p: 3.2, c: 4.8, f: 3.3 },
  curd: { name: 'Curd / plain yogurt', kcal: 61, p: 3.5, c: 4.7, f: 3.3 },
  paneer: { name: 'Paneer', kcal: 265, p: 18, c: 1.2, f: 20 },
  rice: { name: 'Cooked white rice', kcal: 130, p: 2.7, c: 28.2, f: 0.3 },
  chapati: { name: 'Chapati (whole wheat)', kcal: 297, p: 9.8, c: 46, f: 7.5, piece: { label: 'chapati', grams: 40 } },
  chicken: { name: 'Chicken breast (cooked)', kcal: 165, p: 31, c: 0, f: 3.6 },
  fish: { name: 'Fish, grilled/curry (cooked)', kcal: 128, p: 26, c: 0, f: 2.7 },
  dal: { name: 'Dal / lentils (cooked)', kcal: 116, p: 9, c: 20.1, f: 0.4 },
  chickpeas: { name: 'Chickpeas (cooked)', kcal: 164, p: 8.9, c: 27.4, f: 2.6 },
  soya: { name: 'Soya chunks (dry weight)', kcal: 345, p: 52, c: 33, f: 0.5 },
  veg: { name: 'Mixed vegetables (cooked)', kcal: 65, p: 3.3, c: 13.1, f: 0.2 },
  peanuts: { name: 'Peanuts', kcal: 567, p: 25.8, c: 16.1, f: 49.2 },
  whey: { name: 'Whey protein', kcal: 400, p: 80, c: 8, f: 6, piece: { label: 'scoop (30 g)', grams: 30 } },
};

// share = fraction of that meal's calories coming from the food
export const MEAL_TEMPLATES = {
  nonveg: [
    { name: 'Breakfast', time: '7-9 am', share: 0.25, items: [['egg', 0.4], ['oats', 0.4], ['banana', 0.2]] },
    { name: 'Lunch', time: '12-2 pm', share: 0.3, items: [['rice', 0.45], ['chicken', 0.3], ['dal', 0.15], ['veg', 0.1]] },
    { name: 'Snack', time: '4-5 pm', share: 0.15, items: [['curd', 0.35], ['peanuts', 0.3], ['apple', 0.35]] },
    { name: 'Dinner', time: '7-9 pm', share: 0.3, items: [['chapati', 0.4], ['fish', 0.4], ['veg', 0.1], ['dal', 0.1]] },
  ],
  veg: [
    { name: 'Breakfast', time: '7-9 am', share: 0.25, items: [['oats', 0.4], ['paneer', 0.3], ['banana', 0.15], ['milk', 0.15]] },
    { name: 'Lunch', time: '12-2 pm', share: 0.3, items: [['rice', 0.45], ['dal', 0.25], ['paneer', 0.2], ['veg', 0.1]] },
    { name: 'Snack', time: '4-5 pm', share: 0.15, items: [['curd', 0.35], ['peanuts', 0.3], ['apple', 0.35]] },
    { name: 'Dinner', time: '7-9 pm', share: 0.3, items: [['chapati', 0.4], ['soya', 0.3], ['chickpeas', 0.2], ['veg', 0.1]] },
  ],
};
