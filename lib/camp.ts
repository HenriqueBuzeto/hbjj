import { differenceInDays, addWeeks, startOfDay } from 'date-fns'
import { prisma } from './prisma'

export interface CampGenerationInput {
  userId: string
  competitionId: string
  startDate: Date
  totalWeeks: number
}

export async function generateCamp(input: CampGenerationInput) {
  const competition = await prisma.competition.findUnique({
    where: { id: input.competitionId },
  })

  if (!competition) {
    throw new Error('Competition not found')
  }

  // Check if user already has an active camp
  const activeCamp = await prisma.trainingCamp.findFirst({
    where: {
      userId: input.userId,
      status: 'active',
    },
  })

  if (activeCamp) {
    throw new Error('User already has an active camp')
  }

  const endDate = addWeeks(input.startDate, input.totalWeeks)

  // Create camp
  const camp = await prisma.trainingCamp.create({
    data: {
      userId: input.userId,
      competitionId: input.competitionId,
      name: `Camp para ${competition.name}`,
      startDate: input.startDate,
      endDate,
      totalWeeks: input.totalWeeks,
      currentWeek: 1,
      status: 'active',
    },
  })

  // Generate camp weeks
  const weeks = generateCampPhases(input.totalWeeks)

  for (const week of weeks) {
    await prisma.campWeek.create({
      data: {
        campId: camp.id,
        weekNumber: week.weekNumber,
        phaseName: week.phaseName,
        goal: week.goal,
        volumeLevel: week.volumeLevel,
        intensityLevel: week.intensityLevel,
        notes: week.notes,
      },
    })
  }

  return camp
}

function generateCampPhases(totalWeeks: number) {
  const weeks = []

  for (let i = 1; i <= totalWeeks; i++) {
    let phaseName = 'base'
    let goal = 'Construir base aeróbica e técnica'
    let volumeLevel = 'medium'
    let intensityLevel = 'medium'
    let notes = ''

    const percentage = i / totalWeeks

    if (percentage < 0.3) {
      phaseName = 'base'
      goal = 'Construir base aeróbica e técnica'
      volumeLevel = 'medium'
      intensityLevel = 'medium'
      notes = 'Foco em técnica e consistência'
    } else if (percentage < 0.6) {
      phaseName = 'build'
      goal = 'Aumentar volume e intensidade gradualmente'
      volumeLevel = 'high'
      intensityLevel = 'medium-high'
      notes = 'Aumentar carga de treino'
    } else if (percentage < 0.85) {
      phaseName = 'peak'
      goal = 'Máxima intensidade para competição'
      volumeLevel = 'medium'
      intensityLevel = 'high'
      notes = 'Treino específico para competição'
    } else {
      phaseName = 'taper'
      goal = 'Reduzir volume, manter intensidade'
      volumeLevel = 'low'
      intensityLevel = 'medium'
      notes = 'Recuperação para dia da competição'
    }

    weeks.push({
      weekNumber: i,
      phaseName,
      goal,
      volumeLevel,
      intensityLevel,
      notes,
    })
  }

  return weeks
}

export function calculateDaysRemaining(eventDate: Date): number {
  const today = startOfDay(new Date())
  const event = startOfDay(eventDate)
  return differenceInDays(event, today)
}

export function calculateWeightToCut(
  currentWeightKg: number,
  weightLimitKg: number
): number {
  const weightToCut = currentWeightKg - weightLimitKg
  return Math.max(0, weightToCut)
}
