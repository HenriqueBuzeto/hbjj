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

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      include: {
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil de gamificação não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Get gamification profile error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil de gamificação' },
      { status: 500 }
    )
  }
}
