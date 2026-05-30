import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AthletePlanEngine, AthletePlanRepository } from '@/lib/athlete-plan-engine'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('[Onboarding Test] Starting complete onboarding test')

    // Step 1: Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test-onboarding@example.com' },
      create: {
        email: 'test-onboarding@example.com',
        name: 'Test Onboarding User',
        passwordHash: 'test',
        role: 'athlete',
        plan: 'free',
      },
      update: {},
    })

    console.log('[Onboarding Test] User created/updated:', testUser.id)

    // Step 2: Create athlete profile
    const athleteProfile = await prisma.athleteProfile.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        age: 28,
        heightCm: 175,
        currentWeightKg: 88,
        targetWeightKg: 82,
        sex: 'male',
        mainGoal: 'lose_weight',
        intensityLevel: 'moderate',
        isCompetitor: true,
      },
      update: {
        age: 28,
        heightCm: 175,
        currentWeightKg: 88,
        targetWeightKg: 82,
        sex: 'male',
        mainGoal: 'lose_weight',
        intensityLevel: 'moderate',
        isCompetitor: true,
      },
    })

    console.log('[Onboarding Test] Athlete profile created:', athleteProfile.id)

    // Step 3: Create jiu-jitsu profile
    const jiuJitsuProfile = await prisma.jiuJitsuProfile.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        belt: 'purple',
        weeklySessions: 4,
        weightCategory: 'middleweight',
        academyName: 'Test Academy',
        coachName: 'Test Professor',
        yearsTraining: 5,
      },
      update: {
        belt: 'purple',
        weeklySessions: 4,
        weightCategory: 'middleweight',
        academyName: 'Test Academy',
        coachName: 'Test Professor',
        yearsTraining: 5,
      },
    })

    console.log('[Onboarding Test] Jiu-Jitsu profile created:', jiuJitsuProfile.id)

    // Step 4: Create competition
    const competition = await prisma.competition.upsert({
      where: { id: 'test-competition-id' },
      create: {
        id: 'test-competition-id',
        userId: testUser.id,
        name: 'Test Competition',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        modality: ['Gi', 'No-Gi'],
        weightLimitKg: 82,
        status: 'upcoming',
        priority: 'high',
      },
      update: {
        name: 'Test Competition',
        modality: ['Gi', 'No-Gi'],
        weightLimitKg: 82,
        status: 'upcoming',
        priority: 'high',
      },
    })

    console.log('[Onboarding Test] Competition created:', competition.id)

    // Step 5: Generate athlete plan
    const plan = await AthletePlanEngine.generatePlan({
      athleteProfile: {
        userId: testUser.id,
        name: testUser.name || undefined,
        age: athleteProfile.age || undefined,
        height: athleteProfile.heightCm || undefined,
        weight: athleteProfile.currentWeightKg || undefined,
        desiredWeight: athleteProfile.targetWeightKg || undefined,
        gender: athleteProfile.sex as 'male' | 'female',
        goal: athleteProfile.mainGoal as 'lose' | 'maintain' | 'gain',
      },
      jiuJitsuProfile: {
        belt: jiuJitsuProfile.belt as 'white' | 'blue' | 'purple' | 'brown' | 'black',
        intensityLevel: athleteProfile.intensityLevel as 'light' | 'moderate' | 'strong' | 'competitor' | 'camp',
        weeklyFrequency: jiuJitsuProfile.weeklySessions || undefined,
        isCompetitor: athleteProfile.isCompetitor,
        athleteGoal: athleteProfile.mainGoal ? [athleteProfile.mainGoal] : [],
      },
      competition: {
        id: competition.id,
        name: competition.name,
        eventDate: competition.eventDate,
        modalities: competition.modality as ('Gi' | 'No-Gi')[],
        weightLimit: competition.weightLimitKg || undefined,
        priority: competition.priority as 'low' | 'medium' | 'high',
      },
      readiness: {
        gasScore: 7,
        strengthScore: 8,
        recoveryScore: 7,
      },
    })

    console.log('[Onboarding Test] Plan generated:', plan.planType, plan.primaryGoal)

    // Step 6: Save plan to database
    await AthletePlanRepository.savePlan(testUser.id, plan)

    console.log('[Onboarding Test] Plan saved to database')

    // Step 7: Validate plan was persisted
    const savedPlan = await prisma.athletePlanProfile.findUnique({
      where: { userId: testUser.id, isActive: true },
      include: {
        targets: true,
        recommendations: true,
        weeklyPlans: {
          include: {
            dailyItems: true,
          },
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
    })

    console.log('[Onboarding Test] Plan retrieved from database:', savedPlan?.id)

    if (!savedPlan) {
      throw new Error('Plan was not persisted to database')
    }

    // Step 8: Validate plan structure
    const validation = {
      profileExists: !!savedPlan,
      profileMatches: savedPlan.planType === plan.planType,
      targetsExist: savedPlan.targets.length === plan.targets.length,
      recommendationsExist: savedPlan.recommendations.length === plan.recommendations.length,
      weeklyPlansExist: savedPlan.weeklyPlans.length === plan.weeklyPlans.length,
      dailyItemsExist: savedPlan.weeklyPlans.reduce((sum: number, wp: any) => sum + wp.dailyItems.length, 0) === plan.weeklyPlans.reduce((sum: number, wp: any) => sum + wp.dailyItems.length, 0),
    }

    console.log('[Onboarding Test] Validation results:', validation)

    return NextResponse.json({
      success: true,
      message: 'Complete onboarding test successful',
      validation,
      planSummary: {
        planType: savedPlan.planType,
        primaryGoal: savedPlan.primaryGoal,
        riskLevel: savedPlan.riskLevel,
        targetsCount: savedPlan.targets.length,
        recommendationsCount: savedPlan.recommendations.length,
        weeklyPlansCount: savedPlan.weeklyPlans.length,
        dailyItemsCount: savedPlan.weeklyPlans.reduce((sum: number, wp: any) => sum + wp.dailyItems.length, 0),
      },
    })
  } catch (error: any) {
    console.error('[Onboarding Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
