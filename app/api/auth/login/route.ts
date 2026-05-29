import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import { getUserByEmail, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await getUserByEmail(validatedData.email)

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // In a real implementation, you would set up a session/JWT here
    // For now, return user data (will be replaced with proper auth)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        athleteProfile: user.athleteProfile,
        jiuJitsuProfile: user.jiuJitsuProfile,
        gamificationProfile: user.gamificationProfile,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
