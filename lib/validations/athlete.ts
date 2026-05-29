import { z } from 'zod'

export const athleteProfileSchema = z.object({
  age: z.number().min(10).max(100).optional(),
  heightCm: z.number().min(50).max(250).optional(),
  currentWeightKg: z.number().min(30).max(300).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),
  city: z.string().optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  mainGoal: z.enum(['lose', 'maintain', 'gain', 'performance']).optional(),
  intensityLevel: z.enum(['light', 'moderate', 'heavy', 'competitor']).optional(),
  isCompetitor: z.boolean().optional(),
})

export const jiuJitsuProfileSchema = z.object({
  belt: z.enum(['white', 'blue', 'purple', 'brown', 'black']).optional(),
  teamName: z.string().optional(),
  academyName: z.string().optional(),
  coachName: z.string().optional(),
  yearsTraining: z.number().min(0).max(50).optional(),
  trainsGi: z.boolean().optional(),
  trainsNogi: z.boolean().optional(),
  weeklySessions: z.number().min(1).max(14).optional(),
  preferredTrainingTime: z.string().optional(),
  weightCategory: z.string().optional(),
  fightingStyleNotes: z.string().optional(),
})

export const competitionSchema = z.object({
  name: z.string().min(1, 'Nome da competição é obrigatório'),
  organization: z.string().optional(),
  eventDate: z.string().refine((val: string) => !isNaN(Date.parse(val)), 'Data inválida'),
  modality: z.array(z.enum(['Gi', 'No-Gi', 'Both'])).min(1),
  currentWeightKg: z.number().min(30).max(300).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),
  weightLimitKg: z.number().min(30).max(300).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export type AthleteProfileInput = z.infer<typeof athleteProfileSchema>
export type JiuJitsuProfileInput = z.infer<typeof jiuJitsuProfileSchema>
export type CompetitionInput = z.infer<typeof competitionSchema>
