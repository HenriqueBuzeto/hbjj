import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}
