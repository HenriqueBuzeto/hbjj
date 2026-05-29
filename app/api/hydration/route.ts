import { NextResponse } from 'next/server'
import { hydrationLogSchema } from '@/lib/validations/nutrition'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
import { startOfDay } from 'date-fns'
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

    const body = await request.json()
    const validatedData = hydrationLogSchema.parse(body)

    const date = startOfDay(new Date(validatedData.date))

    // Upsert hydration log
    const existingLog = await prisma.hydrationLog.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    let hydrationLog

    if (existingLog) {
      // Add to existing
      hydrationLog = await prisma.hydrationLog.update({
        where: { id: existingLog.id },
        data: {
          amountMl: existingLog.amountMl + validatedData.amountMl,
        },
      })
    } else {
      // Create new
      hydrationLog = await prisma.hydrationLog.create({
        data: {
          userId,
          date,
          amountMl: validatedData.amountMl,
        },
      })
    }

    // Add XP for hydration (capped at once per day)
    if (!existingLog) {
      await addXP(userId, 20, 'hydration', hydrationLog.id)
    }

    return NextResponse.json({ hydrationLog })
  } catch (error: any) {
    console.error('Create hydration log error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao registrar hidratação' },
      { status: 500 }
    )
  }
}
