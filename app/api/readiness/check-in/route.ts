import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateReadinessScore } from '@/lib/readiness'
import { addXP, updateStreak } from '@/lib/gamification'
import { startOfDay } from 'date-fns'
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

    const userId = session.user.id

    const body = await request.json()
    const {
      gasScore,
      strengthScore,
      mobilityScore,
      recoveryScore,
      weightScore,
      notes,
    } = body

    const overallScore = calculateReadinessScore({
      gasScore,
      strengthScore,
      mobilityScore,
      recoveryScore,
      weightScore,
    })

    const today = startOfDay(new Date())

    const readinessLog = await prisma.readinessLog.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        gasScore,
        strengthScore,
        mobilityScore,
        recoveryScore,
        weightScore,
        overallScore,
        notes,
      },
      create: {
        userId,
        date: today,
        gasScore,
        strengthScore,
        mobilityScore,
        recoveryScore,
        weightScore,
        overallScore,
        notes,
      },
    })

    // Add XP for check-in
    await addXP(userId, 30, 'checkin', readinessLog.id)
    await updateStreak(userId)

    return NextResponse.json({ readiness: readinessLog })
  } catch (error: any) {
    console.error('Readiness check-in error:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar check-in' },
      { status: 500 }
    )
  }
}
