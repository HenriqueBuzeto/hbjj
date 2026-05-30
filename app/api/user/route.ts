import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, athleteProfile, jiuJitsuProfile } = body

    // Atualizar dados básicos do usuário
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.passwordHash = await hashPassword(password)

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
      },
    })

    // Atualizar perfil de atleta se fornecido
    if (athleteProfile && user.athleteProfile) {
      await prisma.athleteProfile.update({
        where: { userId: session.id },
        data: athleteProfile,
      })
    }

    // Atualizar perfil de Jiu-Jitsu se fornecido
    if (jiuJitsuProfile && user.jiuJitsuProfile) {
      await prisma.jiuJitsuProfile.update({
        where: { userId: session.id },
        data: jiuJitsuProfile,
      })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}
