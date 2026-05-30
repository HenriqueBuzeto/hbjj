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

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
        gamificationProfile: true,
        nutritionTargets: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Integrate profile data into user object
    const integratedUser = {
      ...user,
      belt: user.jiuJitsuProfile?.belt || null,
      weight: user.athleteProfile?.currentWeightKg || null,
      competitionWeightLimit: user.jiuJitsuProfile?.weightCategory || null,
      competitionName: user.jiuJitsuProfile?.teamName || null,
      competitionDate: user.athleteProfile?.mainGoal === 'performance' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : null,
      team: user.jiuJitsuProfile?.teamName || null,
      professor: user.jiuJitsuProfile?.coachName || null,
      weeklyFrequency: user.jiuJitsuProfile?.weeklySessions || null,
      desiredWeight: user.athleteProfile?.targetWeightKg || null,
      city: user.athleteProfile?.city || null,
      level: user.gamificationProfile?.level || 1,
      xp: user.gamificationProfile?.totalXp || 0,
      nextLevelXp: Math.round((user.gamificationProfile?.level || 1) * 100 * 1.25),
      streak: user.gamificationProfile?.currentStreak || 0,
      recoveryScore: null,
      recoveryLog: null,
      photos: [],
      chatHistory: [],
      badges: [],
    }

    return NextResponse.json({ user: integratedUser })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
