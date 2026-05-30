import { NextResponse } from 'next/server'
import { athleteProfileSchema, jiuJitsuProfileSchema } from '@/lib/validations/athlete'
import { prisma } from '@/lib/prisma'
import { addXP } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('[Onboarding] Starting onboarding completion')
    const session = await getSession()
    console.log('[Onboarding] Session:', !!session, 'User ID:', session?.id)

    if (!session?.id) {
      console.log('[Onboarding] No authenticated user')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    if (!userId) {
      console.log('[Onboarding] No user ID')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { athleteProfile, jiuJitsuProfile } = body
    console.log('[Onboarding] Data received:', { athleteProfile: !!athleteProfile, jiuJitsuProfile: !!jiuJitsuProfile })

    // Validate and create/update athlete profile
    if (athleteProfile) {
      console.log('[Onboarding] Creating/updating athlete profile')
      const validatedAthlete = athleteProfileSchema.parse(athleteProfile)
      await prisma.athleteProfile.upsert({
        where: { userId },
        update: validatedAthlete,
        create: {
          userId,
          ...validatedAthlete,
        },
      })
      console.log('[Onboarding] Athlete profile created/updated')
    }

    // Validate and create/update jiu-jitsu profile
    if (jiuJitsuProfile) {
      console.log('[Onboarding] Creating/updating jiu-jitsu profile')
      const validatedJJ = jiuJitsuProfileSchema.parse(jiuJitsuProfile)
      await prisma.jiuJitsuProfile.upsert({
        where: { userId },
        update: validatedJJ,
        create: {
          userId,
          ...validatedJJ,
        },
      })
      console.log('[Onboarding] Jiu-Jitsu profile created/updated')
    }

    // Add XP for completing onboarding
    console.log('[Onboarding] Adding XP for onboarding')
    await addXP(userId, 100, 'onboarding', userId)
    console.log('[Onboarding] XP added successfully')

    // Create nutrition targets
    console.log('[Onboarding] Creating nutrition targets')
    const weightKg = athleteProfile?.weightKg || 70
    const isCompetitor = jiuJitsuProfile?.isCompetitor || false
    
    // Calculate nutrition targets based on athlete profile
    const proteinTarget = Math.round(weightKg * 2.0) // 2g per kg
    const calorieTarget = isCompetitor ? Math.round(weightKg * 35) : Math.round(weightKg * 30) // Higher calories for competitors
    
    await prisma.nutritionTargets.upsert({
      where: { userId },
      update: {
        caloriesTarget: calorieTarget,
        proteinTargetG: proteinTarget,
        carbsTargetG: Math.round(calorieTarget * 0.4 / 4), // 40% of calories
        fatTargetG: Math.round(calorieTarget * 0.3 / 9), // 30% of calories
      },
      create: {
        userId,
        caloriesTarget: calorieTarget,
        proteinTargetG: proteinTarget,
        carbsTargetG: Math.round(calorieTarget * 0.4 / 4),
        fatTargetG: Math.round(calorieTarget * 0.3 / 9),
      },
    })
    console.log('[Onboarding] Nutrition targets created')

    // Create initial daily missions
    console.log('[Onboarding] Creating initial daily missions')
    const today = new Date()
    const missions = [
      {
        userId,
        date: today,
        title: 'Beber 3L de água',
        description: 'Meta diária de hidratação',
        category: 'water',
        xpReward: 10,
        status: 'pending',
      },
      {
        userId,
        date: today,
        title: 'Dormir 8h',
        description: 'Meta diária de sono',
        category: 'recovery',
        xpReward: 10,
        status: 'pending',
      },
      {
        userId,
        date: today,
        title: 'Treinar hoje',
        description: 'Meta diária de treino',
        category: 'exercise',
        xpReward: 20,
        status: 'pending',
      },
    ]
    
    await prisma.dailyMission.createMany({
      data: missions,
      skipDuplicates: true,
    })
    console.log('[Onboarding] Initial daily missions created')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Onboarding] Complete onboarding error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao completar onboarding' },
      { status: 500 }
    )
  }
}
