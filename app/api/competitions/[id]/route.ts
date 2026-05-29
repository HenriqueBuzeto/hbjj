import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const competition = await prisma.competition.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        trainingCamps: true,
      },
    })

    if (!competition) {
      return NextResponse.json(
        { error: 'Competição não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ competition })
  } catch (error: any) {
    console.error('Get competition error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar competição' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const competition = await prisma.competition.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ competition })
  } catch (error: any) {
    console.error('Update competition error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar competição' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    await prisma.competition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete competition error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar competição' },
      { status: 500 }
    )
  }
}
