import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCamp } from '@/lib/camp'
import { getSession } from '@/lib/simple-auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { competitionId, startDate, totalWeeks = 8 } = body

    if (!competitionId || !startDate) {
      return NextResponse.json(
        { error: 'competitionId e startDate são obrigatórios' },
        { status: 400 }
      )
    }

    // Verify competition belongs to user
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        userId,
      },
    })

    if (!competition) {
      return NextResponse.json(
        { error: 'Competição não encontrada' },
        { status: 404 }
      )
    }

    const camp = await generateCamp({
      userId,
      competitionId,
      startDate: new Date(startDate),
      totalWeeks,
    })

    return NextResponse.json({ camp }, { status: 201 })
  } catch (error: any) {
    console.error('Generate camp error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar camp' },
      { status: 500 }
    )
  }
}
