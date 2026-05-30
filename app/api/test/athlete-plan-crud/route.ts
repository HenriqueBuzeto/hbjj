import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Create or get a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test-crud@example.com' },
      create: {
        email: 'test-crud@example.com',
        name: 'Test CRUD User',
        passwordHash: 'test',
        role: 'athlete',
        plan: 'free',
      },
      update: {},
    })

    const testUserId = testUser.id
    
    // Test INSERT - Create a plan profile
    const planProfile = await prisma.athletePlanProfile.create({
      data: {
        userId: testUserId,
        planType: 'competition',
        primaryGoal: 'lose_weight',
        intensityLevel: 'MODERATE',
        riskLevel: 'low',
        summary: 'Test plan for CRUD validation',
        isActive: true,
      },
    })

    console.log('[CRUD Test] INSERT successful - planProfile:', planProfile.id)

    // Test INSERT - Create a target
    const target = await prisma.athletePlanTarget.create({
      data: {
        userId: testUserId,
        planProfileId: planProfile.id,
        targetType: 'weight',
        currentValue: 88,
        targetValue: 82,
        weeklyTarget: 0.5,
        unit: 'kg',
      },
    })

    console.log('[CRUD Test] INSERT successful - target:', target.id)

    // Test INSERT - Create a recommendation
    const recommendation = await prisma.athletePlanRecommendation.create({
      data: {
        userId: testUserId,
        planProfileId: planProfile.id,
        category: 'nutrition',
        title: 'Test Recommendation',
        content: 'Test content for CRUD validation',
        priority: 'high',
        source: 'test',
      },
    })

    console.log('[CRUD Test] INSERT successful - recommendation:', recommendation.id)

    // Test INSERT - Create a weekly plan
    const weeklyPlan = await prisma.athleteWeeklyPlan.create({
      data: {
        userId: testUserId,
        planProfileId: planProfile.id,
        weekNumber: 1,
        phase: 'base',
        focus: 'Test focus',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('[CRUD Test] INSERT successful - weeklyPlan:', weeklyPlan.id)

    // Test INSERT - Create a daily plan item
    const dailyItem = await prisma.athleteDailyPlanItem.create({
      data: {
        userId: testUserId,
        weeklyPlanId: weeklyPlan.id,
        date: new Date(),
        type: 'training',
        title: 'Test Training',
        description: 'Test description',
        durationMinutes: 60,
        intensity: 'moderate',
      },
    })

    console.log('[CRUD Test] INSERT successful - dailyItem:', dailyItem.id)

    // Test READ - Get plan profile with relations
    const readPlan = await prisma.athletePlanProfile.findUnique({
      where: { id: planProfile.id },
      include: {
        targets: true,
        recommendations: true,
        weeklyPlans: {
          include: {
            dailyItems: true,
          },
        },
      },
    })

    console.log('[CRUD Test] READ successful - plan with relations:', readPlan?.targets.length, 'targets', readPlan?.recommendations.length, 'recommendations', readPlan?.weeklyPlans.length, 'weeklyPlans')

    // Test UPDATE - Update plan profile
    const updatedPlan = await prisma.athletePlanProfile.update({
      where: { id: planProfile.id },
      data: {
        summary: 'Updated summary for CRUD validation',
      },
    })

    console.log('[CRUD Test] UPDATE successful - planProfile:', updatedPlan.summary)

    // Test DELETE - Delete daily item
    await prisma.athleteDailyPlanItem.delete({
      where: { id: dailyItem.id },
    })

    console.log('[CRUD Test] DELETE successful - dailyItem')

    // Test DELETE - Delete weekly plan
    await prisma.athleteWeeklyPlan.delete({
      where: { id: weeklyPlan.id },
    })

    console.log('[CRUD Test] DELETE successful - weeklyPlan')

    // Test DELETE - Delete recommendation
    await prisma.athletePlanRecommendation.delete({
      where: { id: recommendation.id },
    })

    console.log('[CRUD Test] DELETE successful - recommendation')

    // Test DELETE - Delete target
    await prisma.athletePlanTarget.delete({
      where: { id: target.id },
    })

    console.log('[CRUD Test] DELETE successful - target')

    // Test DELETE - Delete plan profile
    await prisma.athletePlanProfile.delete({
      where: { id: planProfile.id },
    })

    console.log('[CRUD Test] DELETE successful - planProfile')

    return NextResponse.json({
      success: true,
      message: 'All CRUD operations successful',
      operations: {
        insert: true,
        read: true,
        update: true,
        delete: true,
      },
    })
  } catch (error: any) {
    console.error('[CRUD Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
