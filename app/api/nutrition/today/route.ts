import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    // Get nutrition targets
    const targets = await prisma.nutritionTargets.findUnique({
      where: { userId },
    })

    // Get meal logs for today
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
    })

    // Get hydration for today
    const hydrationLog = await prisma.hydrationLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: start,
        },
      },
    })

    // Calculate totals
    const totals = mealLogs.reduce(
      (acc: any, log: any) => ({
        calories: acc.calories + log.totalCalories,
        protein: acc.protein + log.totalProteinG,
        carbs: acc.carbs + log.totalCarbsG,
        fat: acc.fat + log.totalFatG,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    return NextResponse.json({
      targets,
      mealLogs,
      hydration: hydrationLog?.amountMl || 0,
      totals,
    })
  } catch (error: any) {
    console.error('Get nutrition today error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar nutrição de hoje' },
      { status: 500 }
    )
  }
}
