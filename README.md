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
- Set-by-set logging (kg × reps) with last-time numbers and progressive-overload suggestions
- Rest timer (60s-3min, +/-15s, vibrates when rest is over)
- Personal records (PR badge), strength trend charts, body-weight log + chart
- Workout history calendar, weekly streak, this-week counter
- In-app demo video player (WebView) for every exercise
- Health screen: BMI + category, healthy weight range, BMR, calorie target for goal, protein and water targets
- Calculators: BMI, ideal weight (4 formulas), calories (BMR/TDEE + goal), macros, body fat (US Navy)
- Daily diet plan: calorie/protein/carb/fat targets and a 4-meal plan with food quantities (veg / non-veg)
- Profile (incl. experience, food preference, weight history) saved on the device (AsyncStorage)

## Data / Firebase later
`src/profileModel.js` defines the user document shape and `src/storage.js` is the only file that touches storage.
To add Firebase Auth + Firestore later, keep `loadProfile` / `saveProfile` and change their bodies to read/write `users/{uid}`.

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
- "Watch demo" plays inside the app (WebView). Every exercise has a `video` YouTube id in `src/data/exercises.js` that plays directly; the "Browse more demos" link opens an in-app YouTube search if a video is unavailable. Swap an id there to change a video.
- Health numbers are general estimates (Mifflin-St Jeor), not medical advice.

## Download the Android APK
Every push to `main` builds an APK automatically (GitHub Actions, `.github/workflows/build-apk.yml`).
1. Open the repo's **Releases** page and download `GymBro.apk` from the "latest" release (or **Actions** -> latest run -> Artifacts).
2. Copy it to your Android phone, open it, and allow "install unknown apps" when asked.

Alternative with an Expo account: `npx eas-cli build -p android --profile preview` gives a download link.
iPhones cannot install APKs; use Expo Go for iOS (see Run above).
