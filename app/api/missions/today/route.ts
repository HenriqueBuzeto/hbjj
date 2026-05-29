import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDailyMissions } from '@/lib/gamification'
import { startOfDay, endOfDay } from 'date-fns'
import { auth } from '@/lib/auth'

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

    // Generate missions if they don't exist
    await generateDailyMissions(userId)

    // Get missions for today
    const missions = await prisma.dailyMission.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { xpReward: 'desc' },
    })

    return NextResponse.json({ missions })
  } catch (error: any) {
    console.error('Get daily missions error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar missões diárias' },
      { status: 500 }
    )
  }
}
