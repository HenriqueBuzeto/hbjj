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

    const userId = session.id

    // Get all badges
    const allBadges = await prisma.badge.findMany()

    // Get user's earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })
    const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId))

    // Mark badges as earned or not
    const badges = allBadges.map((badge: any) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
    }))

    return NextResponse.json({ badges })
  } catch (error: any) {
    console.error('Get badges error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar badges' },
      { status: 500 }
    )
  }
}
