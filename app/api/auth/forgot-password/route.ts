import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail não encontrado no sistema' },
        { status: 404 }
      )
    }

    // Success response simulating that password recovery instructions have been sent
    return NextResponse.json(
      { 
        success: true, 
        message: 'Instruções enviadas com sucesso!',
        email: user.email // pass back so we can offer direct redirection in demo environment
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro no servidor ao processar solicitação' },
      { status: 500 }
    )
  }
}
