import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
        nutritionTargets: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if user has daily missions for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyMissions = await prisma.dailyMission.findMany({
      where: {
        userId,
        date: today,
      },
    })

    // Check onboarding completion status
    const hasAthleteProfile = !!user.athleteProfile
    const hasJiuJitsuProfile = !!user.jiuJitsuProfile
    const hasNutritionTargets = !!user.nutritionTargets
    const hasDailyMissions = dailyMissions.length > 0

    const isComplete = hasAthleteProfile && hasJiuJitsuProfile && hasNutritionTargets && hasDailyMissions

    // If user has profiles but missing initial data, create it automatically
    if (hasAthleteProfile && hasJiuJitsuProfile && !hasNutritionTargets) {
      console.log('[Onboarding Status] Creating missing nutrition targets for existing user')
      const weightKg = user.athleteProfile?.currentWeightKg || 70
      const isCompetitor = user.athleteProfile?.isCompetitor || false
      
      const proteinTarget = Math.round(weightKg * 2.0)
      const calorieTarget = isCompetitor ? Math.round(weightKg * 35) : Math.round(weightKg * 30)
      
      await prisma.nutritionTargets.create({
        data: {
          userId,
          caloriesTarget: calorieTarget,
          proteinTargetG: proteinTarget,
          carbsTargetG: Math.round(calorieTarget * 0.4 / 4),
          fatTargetG: Math.round(calorieTarget * 0.3 / 9),
          waterTargetMl: 3000,
        },
      })
    }

    if (hasAthleteProfile && hasJiuJitsuProfile && !hasDailyMissions) {
      console.log('[Onboarding Status] Creating missing daily missions for existing user')
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
    }

    return NextResponse.json({
      status: isComplete ? 'completed' : 'incomplete',
      steps: {
        athleteProfile: hasAthleteProfile,
        jiuJitsuProfile: hasJiuJitsuProfile,
        nutritionTargets: hasNutritionTargets,
        dailyMissions: hasDailyMissions,
      },
    })
  } catch (error: any) {
    console.error('Get onboarding status error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status de onboarding' },
      { status: 500 }
    )
  }
}
