import { NextResponse } from 'next/server'
import { athleteProfileSchema, jiuJitsuProfileSchema } from '@/lib/validations/athlete'
import { prisma } from '@/lib/prisma'
import { addXP } from '@/lib/gamification'
import { auth } from '@/lib/auth'

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

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { athleteProfile, jiuJitsuProfile } = body

    // Validate and create/update athlete profile
    if (athleteProfile) {
      const validatedAthlete = athleteProfileSchema.parse(athleteProfile)
      await prisma.athleteProfile.upsert({
        where: { userId },
        update: validatedAthlete,
        create: {
          userId,
          ...validatedAthlete,
        },
      })
    }

    // Validate and create/update jiu-jitsu profile
    if (jiuJitsuProfile) {
      const validatedJJ = jiuJitsuProfileSchema.parse(jiuJitsuProfile)
      await prisma.jiuJitsuProfile.upsert({
        where: { userId },
        update: validatedJJ,
        create: {
          userId,
          ...validatedJJ,
        },
      })
    }

    // Add XP for completing onboarding
    await addXP(userId, 100, 'onboarding', userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Complete onboarding error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao completar onboarding' },
      { status: 500 }
    )
  }
}
