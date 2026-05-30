import { NextResponse } from 'next/server'
import { nutritionTargetsSchema } from '@/lib/validations/nutrition'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
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
    const validatedData = nutritionTargetsSchema.parse(body)

    const targets = await prisma.nutritionTargets.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData,
      },
    })

    return NextResponse.json({ targets })
  } catch (error: any) {
    console.error('Update nutrition targets error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar metas nutricionais' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const targets = await prisma.nutritionTargets.findUnique({
      where: { userId },
    })

    return NextResponse.json({ targets })
  } catch (error: any) {
    console.error('Get nutrition targets error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar metas nutricionais' },
      { status: 500 }
    )
  }
}
