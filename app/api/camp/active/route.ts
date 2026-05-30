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

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const activeCamp = await prisma.trainingCamp.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        competition: true,
        campWeeks: {
          orderBy: { weekNumber: 'asc' },
        },
        trainingSessions: {
          where: {
            scheduledDate: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 7,
        },
      },
    })

    if (!activeCamp) {
      return NextResponse.json({ camp: null })
    }

    return NextResponse.json({ camp: activeCamp })
  } catch (error: any) {
    console.error('Get active camp error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar camp ativo' },
      { status: 500 }
    )
  }
}
