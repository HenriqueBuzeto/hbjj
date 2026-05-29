import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'
import { auth } from '@/lib/auth'
import { addXP } from '@/lib/gamification'

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
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = subDays(new Date(), days)

    const progressLogs = await prisma.bodyProgressLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      include: {
        photos: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ progressLogs })
  } catch (error: any) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar progresso' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const body = await request.json()
    const {
      date,
      weightKg,
      waistCm,
      chestCm,
      armCm,
      legCm,
      cardioScore,
      strengthScore,
      mobilityScore,
      recoveryScore,
      fatigueLevel,
      sleepHours,
      notes,
    } = body

    const progressLog = await prisma.bodyProgressLog.create({
      data: {
        userId,
        date: new Date(date),
        weightKg,
        waistCm,
        chestCm,
        armCm,
        legCm,
        cardioScore,
        strengthScore,
        mobilityScore,
        recoveryScore,
        fatigueLevel,
        sleepHours,
        notes,
      },
    })

    // Add XP for logging progress
    await addXP(userId, 20, 'progress', progressLog.id)

    return NextResponse.json({ progressLog }, { status: 201 })
  } catch (error: any) {
    console.error('Create progress log error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar registro de progresso' },
      { status: 500 }
    )
  }
}
