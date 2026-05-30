import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDailyMissions } from '@/lib/gamification'
import { startOfDay, endOfDay } from 'date-fns'
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
