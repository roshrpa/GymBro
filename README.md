# GymBuddy

A React Native (Expo) app for gym-goers.

## Features
- Onboarding: age, sex, height, weight, goal, workout days per week (2–6)
- Auto-generated weekly split
  - 2 days: Full Body A/B
  - 3 days: Push / Pull / Legs
  - 4 days: Upper / Lower ×2
  - 5 days: Chest / Back / Shoulders / Legs / Arms
  - 6 days: PPL ×2
- Today's workout on the home screen (rest-day aware)
- Per-exercise sets × reps, in-app demo video player (WebView), and mark-as-done
- Health screen: BMI + category, healthy weight range, BMR, calorie target for goal, protein and water targets
- Profile saved on the device (AsyncStorage)

## Run
```bash
npm install
npx expo install --fix   # aligns package versions with the installed Expo SDK
npx expo start
```
Scan the QR code with the Expo Go app on your phone.

## Test
```bash
npm test
```

## Notes
- "Watch demo" plays inside the app (WebView). Exercises with a `video` YouTube id in `src/data/exercises.js` play directly; others open an in-app YouTube search. Add more ids there.
- Health numbers are general estimates (Mifflin-St Jeor), not medical advice.
