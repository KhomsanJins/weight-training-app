export type BreathingPattern = {
  inhale: number; // seconds
  holdIn: number; // seconds
  exhale: number; // seconds
  holdOut: number; // seconds
};

export type ExerciseEquipment = 'bodyweight' | 'dumbbell' | 'barbell' | 'machine' | 'cable' | 'band' | 'bench' | 'none';

export type Exercise = {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  description: string;
  defaultRest: number; // seconds
  equipment: ExerciseEquipment[];
  // Optional: Image or video URL later
};

export type Program = {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
};
