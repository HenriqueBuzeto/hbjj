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

    // Create nutrition targets based on profile type
    console.log('[Onboarding] Creating nutrition targets')
    const weightKg = athleteProfile?.weightKg || 70
    const isCompetitor = jiuJitsuProfile?.isCompetitor || false
    const intensityLevel = athleteProfile?.intensityLevel || 'moderate'
    
    // Calculate nutrition targets based on athlete profile and intensity
    let proteinTarget = Math.round(weightKg * 2.0) // 2g per kg
    let calorieTarget = Math.round(weightKg * 30) // Base: 30 kcal per kg
    
    // Adjust based on intensity level
    if (intensityLevel === 'light') {
      calorieTarget = Math.round(weightKg * 28)
      proteinTarget = Math.round(weightKg * 1.8)
    } else if (intensityLevel === 'moderate') {
      calorieTarget = Math.round(weightKg * 32)
      proteinTarget = Math.round(weightKg * 2.0)
    } else if (intensityLevel === 'heavy') {
      calorieTarget = Math.round(weightKg * 35)
      proteinTarget = Math.round(weightKg * 2.2)
    } else if (intensityLevel === 'competitor') {
      calorieTarget = Math.round(weightKg * 38)
      proteinTarget = Math.round(weightKg * 2.5)
    }
    
    // Extra boost for competitors
    if (isCompetitor) {
      calorieTarget = Math.round(calorieTarget * 1.1)
      proteinTarget = Math.round(proteinTarget * 1.1)
    }
    
    await prisma.nutritionTargets.upsert({
      where: { userId },
      update: {
        caloriesTarget: calorieTarget,
        proteinTargetG: proteinTarget,
        carbsTargetG: Math.round(calorieTarget * 0.45 / 4), // 45% of calories for athletes
        fatTargetG: Math.round(calorieTarget * 0.25 / 9), // 25% of calories for athletes
        waterTargetMl: isCompetitor ? 4000 : 3000, // More water for competitors
      },
      create: {
        userId,
        caloriesTarget: calorieTarget,
        proteinTargetG: proteinTarget,
        carbsTargetG: Math.round(calorieTarget * 0.45 / 4),
        fatTargetG: Math.round(calorieTarget * 0.25 / 9),
        waterTargetMl: isCompetitor ? 4000 : 3000,
      },
    })
    console.log('[Onboarding] Nutrition targets created')

    // Create initial daily missions based on profile
    console.log('[Onboarding] Creating initial daily missions')
    const today = new Date()
    let missions = []
    
    // Base missions for everyone
    missions.push({
      userId,
      date: today,
      title: 'Beber 3L de água',
      description: 'Meta diária de hidratação',
      category: 'water',
      xpReward: 10,
      status: 'pending',
    })
    
    missions.push({
      userId,
      date: today,
      title: 'Dormir 8h',
      description: 'Meta diária de sono',
      category: 'recovery',
      xpReward: 10,
      status: 'pending',
    })
    
    // Training-specific missions
    if (intensityLevel === 'light') {
      missions.push({
        userId,
        date: today,
        title: 'Treinar 30 minutos',
        description: 'Treino leve de manutenção',
        category: 'exercise',
        xpReward: 15,
        status: 'pending',
      })
    } else if (intensityLevel === 'moderate') {
      missions.push({
        userId,
        date: today,
        title: 'Treinar 60 minutos',
        description: 'Treino moderado de desenvolvimento',
        category: 'exercise',
        xpReward: 20,
        status: 'pending',
      })
    } else if (intensityLevel === 'heavy' || intensityLevel === 'competitor') {
      missions.push({
        userId,
        date: today,
        title: 'Treinar 90 minutos',
        description: 'Treino intenso de competição',
        category: 'exercise',
        xpReward: 30,
        status: 'pending',
      })
      missions.push({
        userId,
        date: today,
        title: 'Fazer alongamento',
        description: 'Recuperação muscular',
        category: 'recovery',
        xpReward: 15,
        status: 'pending',
      })
    }
    
    // Competitor-specific missions
    if (isCompetitor) {
      missions.push({
        userId,
        date: today,
        title: 'Revisar técnicas',
        description: 'Estudo de táticas e posições',
        category: 'exercise',
        xpReward: 15,
        status: 'pending',
      })
    }
    
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
