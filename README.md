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
- Per-exercise sets × reps, "Watch demo" short video link, and mark-as-done
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
- "Watch demo" opens a YouTube Shorts search for that exercise. To use your own videos later, add a `video` URL field per exercise in `src/data/exercises.js` and play it in `src/screens/Workout.js`.
- Health numbers are general estimates (Mifflin-St Jeor), not medical advice.
