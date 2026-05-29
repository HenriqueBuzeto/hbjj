import { ReactNode } from 'react';

export interface User {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  neck: number;
  waist: number;
  hip: number;
  activity: string;
  goal: 'lose' | 'maintain' | 'gain';
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  caloriesGoal: number;
  
  // Jiu-Jitsu & Athlete details
  belt?: 'white' | 'blue' | 'purple' | 'brown' | 'black';
  trainingTime?: string;
  trainsGi?: boolean;
  trainsNoGi?: boolean;
  weeklyFrequency?: number;
  trainingHours?: string;
  team?: string;
  professor?: string;
  weightClass?: string;
  isCompetitor?: boolean;
  athleteGoal?: string[];
  intensityProfile?: 'light' | 'moderate' | 'strong' | 'competitor' | 'camp';
  city?: string;
  desiredWeight?: number;

  // Target Competition details
  competitionName?: string;
  competitionDate?: string;
  competitionModalities?: ('Gi' | 'No-Gi')[];
  competitionWeightLimit?: number;
  competitionPriority?: 'low' | 'medium' | 'high';
  weeksRemaining?: number;

  // SaaS Premium Additions
  recoveryScore?: number;
  recoveryLog?: RecoveryLog;
  chatHistory?: ChatMessage[];
  badges?: string[];
  photos?: {
    front?: string;
    side?: string;
    back?: string;
    week?: number;
  }[];
}

export interface RecoveryLog {
  sleepScore: number;       // 1-10
  muscleSoreness: number;   // 1-10
  stressLevel: number;      // 1-10
  fatigueLevel: number;     // 1-10
  injuryLevel: number;      // 1-10
  moodScore: number;        // 1-10
  energyLevel: number;      // 1-10
  lastUpdated?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface MealItem {
  name: string;
  cal: number;
  p?: number;
  c?: number;
  f?: number;
  serving?: string;
}

export interface Quest {
  id: number;
  title: string;
  target: number;
  current: number;
  type: string;
  xp: number;
  icon: ReactNode;
}

export interface DailyData {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    snack: MealItem[];
    dinner: MealItem[];
    [key: string]: MealItem[];
  };
  quests: Quest[];
}

export interface Workout {
  id: number;
  title: string;
  duration: string;
  level: string;
  kcal: number;
  image: string;
  category: string;
  description: string;
}

export interface News {
  id: number;
  category: string;
  title: string;
  readTime: string;
  image: string;
  content: string;
}

export interface FoodItem {
  id: number;
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  serving: string;
}

export interface ActivityLevel {
  label: string;
  factor: number;
}

export interface ChartData {
  date: string;
  calories: number;
  water: number;
  weight?: number;
}
