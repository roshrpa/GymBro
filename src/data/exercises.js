// sets/reps are sensible defaults for hypertrophy training.
export const EXERCISES = {
  chest: [
    { name: 'Barbell Bench Press', sets: 4, reps: '6-10' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '8-12' },
    { name: 'Cable Chest Fly', sets: 3, reps: '12-15' },
    { name: 'Push Ups', sets: 3, reps: '12-20' },
    { name: 'Decline Bench Press', sets: 3, reps: '8-12' },
    { name: 'Dumbbell Fly', sets: 3, reps: '10-15' },
  ],
  back: [
    { name: 'Lat Pulldown', sets: 4, reps: '8-12' },
    { name: 'Barbell Row', sets: 4, reps: '6-10' },
    { name: 'Seated Cable Row', sets: 3, reps: '10-12' },
    { name: 'Pull Ups', sets: 3, reps: '6-12' },
    { name: 'Single Arm Dumbbell Row', sets: 3, reps: '10-12' },
    { name: 'Deadlift', sets: 3, reps: '5-6' },
  ],
  shoulders: [
    { name: 'Overhead Shoulder Press', sets: 4, reps: '6-10' },
    { name: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15' },
    { name: 'Rear Delt Fly', sets: 3, reps: '12-15' },
    { name: 'Front Raise', sets: 3, reps: '10-12' },
    { name: 'Face Pull', sets: 3, reps: '12-15' },
    { name: 'Dumbbell Shrug', sets: 3, reps: '12-15' },
  ],
  biceps: [
    { name: 'Barbell Curl', sets: 3, reps: '8-12' },
    { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12' },
    { name: 'Hammer Curl', sets: 3, reps: '10-12' },
    { name: 'Preacher Curl', sets: 3, reps: '10-12' },
  ],
  triceps: [
    { name: 'Triceps Rope Pushdown', sets: 3, reps: '10-15' },
    { name: 'Skull Crushers', sets: 3, reps: '8-12' },
    { name: 'Overhead Triceps Extension', sets: 3, reps: '10-12' },
    { name: 'Close Grip Bench Press', sets: 3, reps: '8-10' },
  ],
  legs: [
    { name: 'Barbell Squat', sets: 4, reps: '6-10' },
    { name: 'Leg Press', sets: 3, reps: '10-12' },
    { name: 'Romanian Deadlift', sets: 3, reps: '8-10' },
    { name: 'Leg Extension', sets: 3, reps: '12-15' },
    { name: 'Lying Leg Curl', sets: 3, reps: '10-15' },
    { name: 'Standing Calf Raise', sets: 4, reps: '12-20' },
  ],
  core: [
    { name: 'Plank', sets: 3, reps: '45-60 sec' },
    { name: 'Hanging Leg Raise', sets: 3, reps: '10-15' },
    { name: 'Cable Crunch', sets: 3, reps: '12-15' },
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

// Short demo videos: opens YouTube Shorts search for correct form of this exercise.
export function videoUrl(exerciseName) {
  const q = encodeURIComponent(`${exerciseName} proper form shorts`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
