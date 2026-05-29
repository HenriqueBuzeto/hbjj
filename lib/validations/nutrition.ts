import { z } from 'zod'

export const nutritionTargetsSchema = z.object({
  caloriesTarget: z.number().min(500).max(10000).optional(),
  proteinTargetG: z.number().min(0).max(500).optional(),
  carbsTargetG: z.number().min(0).max(1000).optional(),
  fatTargetG: z.number().min(0).max(500).optional(),
  waterTargetMl: z.number().min(500).max(10000).optional(),
})

export const mealLogSchema = z.object({
  date: z.string().refine((val: string) => !isNaN(Date.parse(val)), 'Data inválida'),
  mealType: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(0).optional(),
    unit: z.string().optional(),
    calories: z.number().min(0),
    proteinG: z.number().min(0).optional(),
    carbsG: z.number().min(0).optional(),
    fatG: z.number().min(0).optional(),
  })).min(1),
})

export const hydrationLogSchema = z.object({
  date: z.string().refine((val: string) => !isNaN(Date.parse(val)), 'Data inválida'),
  amountMl: z.number().min(50).max(5000),
})

export type NutritionTargetsInput = z.infer<typeof nutritionTargetsSchema>
export type MealLogInput = z.infer<typeof mealLogSchema>
export type HydrationLogInput = z.infer<typeof hydrationLogSchema>
