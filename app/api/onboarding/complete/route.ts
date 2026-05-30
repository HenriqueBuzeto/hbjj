import { NextResponse } from 'next/server'
import { athleteProfileSchema, jiuJitsuProfileSchema } from '@/lib/validations/athlete'
import { prisma } from '@/lib/prisma'
import { addXP } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('[Onboarding] Starting onboarding completion')
    const session = await getSession()
    console.log('[Onboarding] Session:', !!session, 'User ID:', session?.id)

    if (!session?.id) {
      console.log('[Onboarding] No authenticated user')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    if (!userId) {
      console.log('[Onboarding] No user ID')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { athleteProfile, jiuJitsuProfile } = body
    console.log('[Onboarding] Data received:', { athleteProfile: !!athleteProfile, jiuJitsuProfile: !!jiuJitsuProfile })

    // Validate and create/update athlete profile
    if (athleteProfile) {
      console.log('[Onboarding] Creating/updating athlete profile')
      const validatedAthlete = athleteProfileSchema.parse(athleteProfile)
      await prisma.athleteProfile.upsert({
        where: { userId },
        update: validatedAthlete,
        create: {
          userId,
          ...validatedAthlete,
        },
      })
      console.log('[Onboarding] Athlete profile created/updated')
    }

    // Validate and create/update jiu-jitsu profile
    if (jiuJitsuProfile) {
      console.log('[Onboarding] Creating/updating jiu-jitsu profile')
      const validatedJJ = jiuJitsuProfileSchema.parse(jiuJitsuProfile)
      await prisma.jiuJitsuProfile.upsert({
        where: { userId },
        update: validatedJJ,
        create: {
          userId,
          ...validatedJJ,
        },
      })
      console.log('[Onboarding] Jiu-Jitsu profile created/updated')
    }

    // Add XP for completing onboarding
    console.log('[Onboarding] Adding XP for onboarding')
    await addXP(userId, 100, 'onboarding', userId)
    console.log('[Onboarding] XP added successfully')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Onboarding] Complete onboarding error:', error)
    
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
