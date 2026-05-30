import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    // Get mission
    const mission = await prisma.dailyMission.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!mission) {
      return NextResponse.json(
        { error: 'Missão não encontrada' },
        { status: 404 }
      )
    }

    if (mission.status === 'completed') {
      return NextResponse.json(
        { error: 'Missão já completada' },
        { status: 400 }
      )
    }

    // Update mission status
    const updatedMission = await prisma.dailyMission.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // Add XP
    await addXP(userId, mission.xpReward, 'mission', mission.id)
    await updateStreak(userId)

    return NextResponse.json({ mission: updatedMission })
  } catch (error: any) {
    console.error('Complete mission error:', error)
    return NextResponse.json(
      { error: 'Erro ao completar missão' },
      { status: 500 }
    )
  }
}
