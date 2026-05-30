import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Testar se as tabelas existem e são acessíveis
    const tables = [
      'athletePlanProfile',
      'athletePlanTarget',
      'athletePlanRecommendation',
      'athleteWeeklyPlan',
      'athleteDailyPlanItem',
    ]

    const results: Record<string, any> = {}

    for (const table of tables) {
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        const count = await (prisma as any)[table].count()
        results[table] = {
          exists: true,
          count: count,
        }
      } catch (error: any) {
        results[table] = {
          exists: false,
          error: error.message,
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
