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

    // Create initial daily data with nutrition targets
    console.log('[Onboarding] Creating initial daily data')
    const weightKg = athleteProfile?.weightKg || 70
    const targetWeightKg = athleteProfile?.targetWeightKg || weightKg
    const isCompetitor = jiuJitsuProfile?.isCompetitor || false
    
    // Calculate nutrition targets based on athlete profile
    const proteinTarget = Math.round(weightKg * 2.0) // 2g per kg
    const calorieTarget = isCompetitor ? Math.round(weightKg * 35) : Math.round(weightKg * 30) // Higher calories for competitors
    
    await prisma.dailyData.upsert({
      where: { userId_date: { userId, date: new Date() } },
      update: {},
      create: {
        userId,
        date: new Date(),
        calories: 0,
        water: 0,
        sleep: 8,
        protein: 0,
        carbs: 0,
        fat: 0,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
        quests: [
          { id: '1', title: 'Beber 3L de água', completed: false, xp: 10 },
          { id: '2', title: 'Dormir 8h', completed: false, xp: 10 },
          { id: '3', title: 'Treinar hoje', completed: false, xp: 20 },
        ],
      },
    })
    console.log('[Onboarding] Initial daily data created')

    // Create nutrition targets
    console.log('[Onboarding] Creating nutrition targets')
    await prisma.nutritionTarget.upsert({
      where: { userId },
      update: {
        calories: calorieTarget,
        protein: proteinTarget,
        carbs: Math.round(calorieTarget * 0.4 / 4), // 40% of calories
        fat: Math.round(calorieTarget * 0.3 / 9), // 30% of calories
      },
      create: {
        userId,
        calories: calorieTarget,
        protein: proteinTarget,
        carbs: Math.round(calorieTarget * 0.4 / 4),
        fat: Math.round(calorieTarget * 0.3 / 9),
      },
    })
    console.log('[Onboarding] Nutrition targets created')

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
