import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateReadinessScore, getReadinessCategory } from '@/lib/readiness'
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

    const userId = session.user.id

    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    const readinessLog = await prisma.readinessLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: start,
        },
      },
    })

    if (!readinessLog) {
      return NextResponse.json({ readiness: null })
    }

    const category = getReadinessCategory(readinessLog.overallScore || 0)

    return NextResponse.json({
      readiness: {
        ...readinessLog,
        category,
      },
    })
  } catch (error: any) {
    console.error('Get readiness today error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar readiness de hoje' },
      { status: 500 }
    )
  }
}
