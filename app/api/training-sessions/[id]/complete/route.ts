import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getSession()

    if (!authSession?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = authSession.id

    const body = await request.json()
    const { caloriesBurned, notes } = body

    // Update session
    const trainingSession = await prisma.trainingSession.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        caloriesEstimate: caloriesBurned,
        notes: notes || undefined,
      },
    })

    // Add XP for completing training
    await addXP(userId, 100, 'training', trainingSession.id)
    await updateStreak(userId)

    return NextResponse.json({ session: trainingSession })
  } catch (error: any) {
    console.error('Complete training session error:', error)
    return NextResponse.json(
      { error: 'Erro ao completar sessão de treino' },
      { status: 500 }
    )
  }
}
