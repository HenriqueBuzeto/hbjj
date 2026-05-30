import { NextResponse } from 'next/server'
import { mealLogSchema } from '@/lib/validations/nutrition'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    const body = await request.json()
    const validatedData = mealLogSchema.parse(body)

    const date = new Date(validatedData.date)

    // Calculate totals from items
    const totalCalories = validatedData.items.reduce(
      (sum: number, item: any) => sum + item.calories,
      0
    )
    const totalProtein = validatedData.items.reduce(
      (sum: number, item: any) => sum + (item.proteinG || 0),
      0
    )
    const totalCarbs = validatedData.items.reduce(
      (sum: number, item: any) => sum + (item.carbsG || 0),
      0
    )
    const totalFat = validatedData.items.reduce(
      (sum: number, item: any) => sum + (item.fatG || 0),
      0
    )

    // Create meal log with items
    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        date,
        mealType: validatedData.mealType,
        totalCalories,
        totalProteinG: totalProtein,
        totalCarbsG: totalCarbs,
        totalFatG: totalFat,
        items: {
          create: validatedData.items,
        },
      },
      include: {
        items: true,
      },
    })

    // Add XP for logging meal
    await addXP(userId, 10, 'nutrition', mealLog.id)

    return NextResponse.json({ mealLog }, { status: 201 })
  } catch (error: any) {
    console.error('Create meal log error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar registro de refeição' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const mealLogId = searchParams.get('id')

    if (!mealLogId) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const mealLog = await prisma.mealLog.update({
      where: { id: mealLogId },
      data: body,
      include: {
        items: true,
      },
    })

    return NextResponse.json({ mealLog })
  } catch (error: any) {
    console.error('Update meal log error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar registro de refeição' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const mealLogId = searchParams.get('id')

    if (!mealLogId) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    await prisma.mealLog.delete({
      where: { id: mealLogId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete meal log error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar registro de refeição' },
      { status: 500 }
    )
  }
}
