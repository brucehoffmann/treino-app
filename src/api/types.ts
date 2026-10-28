export type Equipment = { id: string; key: string; name: string };

export type MuscleGroup = { key: string; name: string };

export type ExerciseItem = {
  id: string;
  name: string;
  gifUrl: string | null;
  muscleGroups: MuscleGroup[];
};

export type ExercisePage = { items: ExerciseItem[]; nextCursor: string | null };

export type RunTemplate = {
  id: string;
  key: string;
  name: string;
  summary: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  repeats: number | null;
  restSeconds: number | null;
};

export type WorkoutSet = {
  id: string;
  position: number;
  reps: number | null;
  loadKg: number | null;
  durationSeconds: number | null;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  gifUrl: string | null;
  position: number;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  title: string;
  position: number;
  featured: boolean;
  activityType: "academia" | "corrida" | null;
  block: {
    exercises: WorkoutExercise[];
    runTemplateId: string | null;
    runTemplateKey: string | null;
    runTemplateName: string | null;
    distanceMeters: number | null;
    durationSeconds: number | null;
    repeats: number | null;
    restSeconds: number | null;
  } | null;
};

export type Me = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  profile: {
    goal: string;
    daysPerWeek: number;
    runs: boolean;
    lifts: boolean;
    equipmentIds: string[];
  } | null;
};

export type ProfileInput = {
  goal: string;
  daysPerWeek: number;
  runs: boolean;
  lifts: boolean;
  equipmentIds: string[];
};
