import { NextResponse } from 'next/server'
import { trainingSessionSchema } from '@/lib/validations/training'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
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

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const campId = searchParams.get('campId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { userId }
    if (campId) where.campId = campId
    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('Get training sessions error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sessões de treino' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await auth()

    if (!authsession?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = authSession.user.id

    const body = await request.json()
    const validatedData = trainingSessionSchema.parse(body)

    const trainingSession = await prisma.trainingSession.create({
      data: {
        userId,
        campId: validatedData.campId,
        title: validatedData.title,
        type: validatedData.type,
        modality: validatedData.modality,
        scheduledDate: new Date(validatedData.scheduledDate),
        scheduledTime: validatedData.scheduledTime,
        durationMinutes: validatedData.durationMinutes,
        intensity: validatedData.intensity,
        notes: validatedData.notes,
        exercises: validatedData.exercises
          ? {
              create: validatedData.exercises.map((ex: any, idx: number) => ({
                ...ex,
                orderIndex: idx,
              })),
            }
          : undefined,
      },
      include: {
        exercises: true,
      },
    })

    return NextResponse.json({ session: trainingSession }, { status: 201 })
  } catch (error: any) {
    console.error('Create training session error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar sessão de treino' },
      { status: 500 }
    )
  }
}
