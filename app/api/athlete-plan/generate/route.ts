import { NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'
import { AthletePlanEngine, AthletePlanRepository } from '@/lib/athlete-plan-engine'
import { z } from 'zod'

// Validation schema
const generatePlanSchema = z.object({
  // Optional - if not provided, will fetch from database
  athleteProfile: z.object({
    weight: z.number().optional(),
    desiredWeight: z.number().optional(),
    height: z.number().optional(),
    age: z.number().optional(),
    gender: z.enum(['male', 'female']).optional(),
    goal: z.enum(['lose', 'maintain', 'gain']).optional(),
  }).optional(),
  jiuJitsuProfile: z.object({
    belt: z.enum(['white', 'blue', 'purple', 'brown', 'black']).optional(),
    intensityLevel: z.enum(['light', 'moderate', 'strong', 'competitor', 'camp']).optional(),
    weeklyFrequency: z.number().optional(),
    isCompetitor: z.boolean().optional(),
    athleteGoal: z.array(z.string()).optional(),
  }).optional(),
  competition: z.object({
    name: z.string(),
    eventDate: z.string(),
    modalities: z.array(z.enum(['Gi', 'No-Gi'])),
    weightLimit: z.number().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
  readiness: z.object({
    gasScore: z.number().optional(),
    strengthScore: z.number().optional(),
    mobilityScore: z.number().optional(),
    recoveryScore: z.number().optional(),
    weightScore: z.number().optional(),
  }).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    // Parse and validate request body
    const body = await request.json()
    const validationResult = generatePlanSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error },
        { status: 400 }
      )
    }

    const { athleteProfile: inputProfile, jiuJitsuProfile: inputJiuJitsu, competition: inputCompetition, readiness: inputReadiness } = validationResult.data

    // Fetch user data from database if not provided
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Build athlete profile
    const athleteProfile = {
      userId,
      name: user.name || undefined,
      age: user.athleteProfile?.age || inputProfile?.age,
      height: user.athleteProfile?.heightCm || inputProfile?.height,
      weight: user.athleteProfile?.currentWeightKg || inputProfile?.weight,
      desiredWeight: user.athleteProfile?.targetWeightKg || inputProfile?.desiredWeight,
      gender: (user.athleteProfile?.sex as 'male' | 'female') || inputProfile?.gender,
      goal: (user.athleteProfile?.mainGoal as 'lose' | 'maintain' | 'gain') || inputProfile?.goal,
    }

    // Build jiu-jitsu profile
    const jiuJitsuProfile = {
      belt: user.jiuJitsuProfile?.belt as 'white' | 'blue' | 'purple' | 'brown' | 'black' || inputJiuJitsu?.belt,
      intensityLevel: (user.athleteProfile?.intensityLevel as 'light' | 'moderate' | 'strong' | 'competitor' | 'camp') || inputJiuJitsu?.intensityLevel,
      weeklyFrequency: user.jiuJitsuProfile?.weeklySessions || inputJiuJitsu?.weeklyFrequency,
      isCompetitor: user.athleteProfile?.isCompetitor || inputJiuJitsu?.isCompetitor,
      athleteGoal: user.athleteProfile?.mainGoal ? [user.athleteProfile.mainGoal] : inputJiuJitsu?.athleteGoal,
    }

    // Build competition (from input or fetch from database)
    let competition
    if (inputCompetition) {
      competition = {
        ...inputCompetition,
        eventDate: new Date(inputCompetition.eventDate),
      }
    } else {
      // Fetch active competition from database
      const activeCompetition = await prisma.competition.findFirst({
        where: {
          userId,
          status: { in: ['upcoming', 'active'] },
        },
        orderBy: { eventDate: 'asc' },
      })

      if (activeCompetition) {
        competition = {
          id: activeCompetition.id,
          name: activeCompetition.name,
          eventDate: activeCompetition.eventDate,
          modalities: activeCompetition.modality as ('Gi' | 'No-Gi')[],
          weightLimit: activeCompetition.weightLimitKg || undefined,
          priority: activeCompetition.priority as 'low' | 'medium' | 'high' || undefined,
        }
      }
    }

    // Fetch latest readiness if not provided
    let readiness = inputReadiness
    if (!readiness) {
      const latestReadiness = await prisma.readinessLog.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      })

      if (latestReadiness) {
        readiness = {
          gasScore: latestReadiness.gasScore || undefined,
          strengthScore: latestReadiness.strengthScore || undefined,
          mobilityScore: latestReadiness.mobilityScore || undefined,
          recoveryScore: latestReadiness.recoveryScore || undefined,
          weightScore: latestReadiness.weightScore || undefined,
        }
      }
    }

    // Generate plan using AthletePlanEngine
    const plan = await AthletePlanEngine.generatePlan({
      athleteProfile,
      jiuJitsuProfile,
      competition,
      readiness,
    })

    // Save plan to database (logs for now until migration is resolved)
    await AthletePlanRepository.savePlan(userId, plan)

    console.log('[AthletePlanEngine] Generated plan for user:', userId, plan.planType, plan.primaryGoal)

    return NextResponse.json({ 
      success: true, 
      plan,
    })
  } catch (error: any) {
    console.error('[AthletePlanEngine] Generate plan error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar plano', message: error.message },
      { status: 500 }
    )
  }
}
