import { z } from 'zod'

export const trainingSessionSchema = z.object({
  campId: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum(['drilling', 'sparring', 'conditioning', 'technique', 'other']),
  modality: z.enum(['gi', 'nogi', 'both']).optional(),
  scheduledDate: z.string().refine((val: string) => !isNaN(Date.parse(val)), 'Data inválida'),
  scheduledTime: z.string().optional(),
  durationMinutes: z.number().min(5).max(300).optional(),
  intensity: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string().min(1),
    sets: z.number().min(1).optional(),
    reps: z.number().min(1).optional(),
    durationSeconds: z.number().min(1).optional(),
    restSeconds: z.number().min(0).optional(),
    loadKg: z.number().min(0).optional(),
    instructions: z.string().optional(),
    orderIndex: z.number().min(0),
  })).optional(),
})

export const completeTrainingSchema = z.object({
  caloriesBurned: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type TrainingSessionInput = z.infer<typeof trainingSessionSchema>
export type CompleteTrainingInput = z.infer<typeof completeTrainingSchema>
