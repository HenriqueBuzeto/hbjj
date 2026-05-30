import { NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Retorna array vazio por enquanto - alimentos serão criados pelo usuário
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching foods:', error)
    return NextResponse.json({ error: 'Erro ao buscar alimentos' }, { status: 500 })
  }
}
