import { NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'

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

    // TODO: Enable after Prisma migration is resolved
    // const plan = await AthletePlanRepository.getCurrentPlan(userId)
    
    // For now, return a placeholder response
    // After migration is resolved, this will fetch the actual plan from database
    return NextResponse.json({ 
      success: true,
      plan: null,
      message: 'A funcionalidade de plano atual será ativada após a migration do Prisma ser resolvida. Use POST /api/athlete-plan/generate para gerar um novo plano.',
    })
  } catch (error: any) {
    console.error('[AthletePlan] Get current plan error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plano atual', message: error.message },
      { status: 500 }
    )
  }
}
