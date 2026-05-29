/**
 * Utility functions for health and nutrition calculations
 */

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Harris-Benedict Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy'
): number {
  const factors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
  };
  return Math.round(bmr * factors[activityLevel]);
}

export function calculateCalorieGoal(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  const adjustments = {
    lose: 0.85, // 15% deficit
    maintain: 1.0,
    gain: 1.15, // 15% surplus
  };
  return Math.round(tdee * adjustments[goal]);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals);
}

export function getBMICategory(bmi: number): {
  category: string;
  color: string;
} {
  if (bmi < 18.5) {
    return { category: 'Abaixo do peso', color: 'blue' };
  } else if (bmi < 25) {
    return { category: 'Peso normal', color: 'green' };
  } else if (bmi < 30) {
    return { category: 'Sobrepeso', color: 'yellow' };
  } else {
    return { category: 'Obesidade', color: 'red' };
  }
}
