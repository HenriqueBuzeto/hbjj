import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'
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

    const readinessLogs = await prisma.readinessLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ history: readinessLogs })
  } catch (error: any) {
    console.error('Get readiness history error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de readiness' },
      { status: 500 }
    )
  }
}
