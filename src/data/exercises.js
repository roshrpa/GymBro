// sets/reps are sensible defaults for hypertrophy training.
export const EXERCISES = {
  chest: [
    { name: 'Barbell Bench Press', sets: 4, reps: '6-10', video: 'ooEsh_qvBrE' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', video: 'sh5ZsRpEZCw' },
    { name: 'Cable Chest Fly', sets: 3, reps: '12-15', video: 'J2h--eoHK_U' },
    { name: 'Push Ups', sets: 3, reps: '12-20', video: 'VlO9m6fT6VI' },
    { name: 'Decline Bench Press', sets: 3, reps: '8-12', video: 'Y2cJyPG_2VY' },
    { name: 'Dumbbell Fly', sets: 3, reps: '10-15', video: 'n2CYj9qOIow' },
  ],
  back: [
    { name: 'Lat Pulldown', sets: 4, reps: '8-12', video: 'scpVqUz8znI' },
    { name: 'Barbell Row', sets: 4, reps: '6-10', video: 'Nqh7q3zDCoQ' },
    { name: 'Seated Cable Row', sets: 3, reps: '10-12', video: 'cAeBmvpt31A' },
    { name: 'Pull Ups', sets: 3, reps: '6-12', video: '4XorXm1lAOg' },
    { name: 'Single Arm Dumbbell Row', sets: 3, reps: '10-12', video: 'i683AcFpOzw' },
    { name: 'Deadlift', sets: 3, reps: '5-6', video: 'rG4QqD9PR40' },
  ],
  shoulders: [
    { name: 'Overhead Shoulder Press', sets: 4, reps: '6-10', video: 'tK7rzJwvOJA' },
    { name: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', video: 'pzj8pmSH8d4' },
    { name: 'Rear Delt Fly', sets: 3, reps: '12-15', video: 'DeSJD3aFCnU' },
    { name: 'Front Raise', sets: 3, reps: '10-12', video: '7sNkeQ4ZUa4' },
    { name: 'Face Pull', sets: 3, reps: '12-15', video: 'DvjmJdEswQ4' },
    { name: 'Dumbbell Shrug', sets: 3, reps: '12-15', video: 'RLHxN6hq8NA' },
  ],
  biceps: [
    { name: 'Barbell Curl', sets: 3, reps: '8-12', video: '9BpYNH4nb_Q' },
    { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', video: 't24mTZKfpGg' },
    { name: 'Hammer Curl', sets: 3, reps: '10-12', video: 'Iz1kGNIfS3Y' },
    { name: 'Preacher Curl', sets: 3, reps: '10-12', video: 'jilTTmyEoYY' },
  ],
  triceps: [
    { name: 'Triceps Rope Pushdown', sets: 3, reps: '10-15', video: 'vPeQu_L-1n0' },
    { name: 'Skull Crushers', sets: 3, reps: '8-12', video: 'ShR_FM3-wm4' },
    { name: 'Overhead Triceps Extension', sets: 3, reps: '10-12', video: 'O7e8j8K3cJo' },
    { name: 'Close Grip Bench Press', sets: 3, reps: '8-10', video: 'gmUL66-HQcE' },
  ],
  legs: [
    { name: 'Barbell Squat', sets: 4, reps: '6-10', video: 'yUm28cOUXNo' },
    { name: 'Leg Press', sets: 3, reps: '10-12', video: 'p6SP92m6P-4' },
    { name: 'Romanian Deadlift', sets: 3, reps: '8-10', video: 'yjqRj72AuaE' },
    { name: 'Leg Extension', sets: 3, reps: '12-15', video: 'xAUvXdHu1sI' },
    { name: 'Lying Leg Curl', sets: 3, reps: '10-15', video: '3gZm9wGTsEo' },
    { name: 'Standing Calf Raise', sets: 4, reps: '12-20', video: 'KRJIKsY02nE' },
  ],
  core: [
    { name: 'Plank', sets: 3, reps: '45-60 sec', video: 'OBT5cBlp5_s' },
    { name: 'Hanging Leg Raise', sets: 3, reps: '10-15', video: 'JXztA3fLp50' },
    { name: 'Cable Crunch', sets: 3, reps: '12-15', video: 'bd63yN6g_9w' },
  ],
};

export const MUSCLE_LABEL = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
};

// Exercises with a `video` field (YouTube video id) play directly in the in-app player.
// The rest fall back to an in-app YouTube search for that exercise.
export function videoUrl(exerciseName) {
  const q = encodeURIComponent(`${exerciseName} proper form`);
  return `https://m.youtube.com/results?search_query=${q}`;
}

export function embedHtml(videoId) {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;background:#000;height:100%}iframe{border:0;width:100%;height:100%}</style></head>
<body><iframe src="https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></body></html>`;
}
