import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'
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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = subDays(new Date(), days)
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    // Get training sessions completed
    const completedSessions = await prisma.trainingSession.count({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          gte: startDate,
        },
      },
    })

    // Get missions completed
    const completedMissions = await prisma.dailyMission.count({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          gte: startDate,
        },
      },
    })

    // Get weight progress
    const weightLogs = await prisma.bodyProgressLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
        weightKg: {
          not: null,
        },
      },
      orderBy: { date: 'asc' },
      select: { date: true, weightKg: true },
    })

    // Get readiness average
    const readinessLogs = await prisma.readinessLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
        overallScore: {
          not: null,
        },
      },
      select: { overallScore: true },
    })

    const avgReadiness = readinessLogs.length > 0
      ? readinessLogs.reduce((sum: number, log: any) => sum + log.overallScore, 0) / readinessLogs.length
      : 0

    // Get nutrition averages
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      select: {
        totalCalories: true,
        totalProteinG: true,
        totalCarbsG: true,
        totalFatG: true,
      },
    })

    const avgCalories = mealLogs.length > 0
      ? mealLogs.reduce((sum: number, log: any) => sum + log.totalCalories, 0) / mealLogs.length
      : 0

    const avgProtein = mealLogs.length > 0
      ? mealLogs.reduce((sum: number, log: any) => sum + log.totalProteinG, 0) / mealLogs.length
      : 0

    // Get today's hydration
    const hydrationLog = await prisma.hydrationLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfToday,
        },
      },
    })

    // Get XP earned
    const xpEvents = await prisma.xPEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
    })

    const xpEarned = xpEvents.reduce((sum: number, event: any) => sum + event.xpAmount, 0)

    return NextResponse.json({
      summary: {
        completedSessions,
        completedMissions,
        weightLogs,
        avgReadiness: Math.round(avgReadiness),
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        hydrationToday: hydrationLog?.amountMl || 0,
        xpEarned,
        period: `${days} dias`,
      },
    })
  } catch (error: any) {
    console.error('Get reports summary error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar relatório' },
      { status: 500 }
    )
  }
}
