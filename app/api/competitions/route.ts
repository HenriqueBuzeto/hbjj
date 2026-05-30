import { NextResponse } from 'next/server'
import { competitionSchema } from '@/lib/validations/athlete'
import { prisma } from '@/lib/prisma'
import { calculateDaysRemaining, calculateWeightToCut } from '@/lib/camp'
import { getSession } from '@/lib/simple-auth'

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

    const competitions = await prisma.competition.findMany({
      where: { userId },
      orderBy: { eventDate: 'asc' },
    })

    // Add calculated fields
    const competitionsWithCalcs = competitions.map((comp: any) => {
      const daysRemaining = calculateDaysRemaining(comp.eventDate)
      const weightToCut = comp.currentWeightKg && comp.weightLimitKg
        ? calculateWeightToCut(comp.currentWeightKg, comp.weightLimitKg)
        : null

      return {
        ...comp,
        daysRemaining,
        weightToCut,
      }
    })

    return NextResponse.json({ competitions: competitionsWithCalcs })
  } catch (error: any) {
    console.error('Get competitions error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar competições' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const validatedData = competitionSchema.parse(body)

    const eventDate = new Date(validatedData.eventDate)
    const daysRemaining = calculateDaysRemaining(eventDate)

    const competition = await prisma.competition.create({
      data: {
        userId,
        name: validatedData.name,
        organization: validatedData.organization,
        eventDate,
        modality: validatedData.modality,
        currentWeightKg: validatedData.currentWeightKg,
        targetWeightKg: validatedData.targetWeightKg,
        weightLimitKg: validatedData.weightLimitKg,
        daysRemaining,
        priority: validatedData.priority,
      },
    })

    return NextResponse.json({ competition }, { status: 201 })
  } catch (error: any) {
    console.error('Create competition error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar competição' },
      { status: 500 }
    )
  }
}
