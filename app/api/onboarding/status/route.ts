import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check onboarding completion status
    const hasAthleteProfile = !!user.athleteProfile
    const hasJiuJitsuProfile = !!user.jiuJitsuProfile

    const isComplete = hasAthleteProfile && hasJiuJitsuProfile

    return NextResponse.json({
      status: isComplete ? 'completed' : 'incomplete',
      steps: {
        athleteProfile: hasAthleteProfile,
        jiuJitsuProfile: hasJiuJitsuProfile,
      },
    })
  } catch (error: any) {
    console.error('Get onboarding status error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status de onboarding' },
      { status: 500 }
    )
  }
}
