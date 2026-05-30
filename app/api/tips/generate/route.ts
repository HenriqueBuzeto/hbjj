import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

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

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
      },
    })

    if (!user || !user.athleteProfile || !user.jiuJitsuProfile) {
      return NextResponse.json(
        { error: 'Perfil incompleto' },
        { status: 400 }
      )
    }

    const belt = user.jiuJitsuProfile.belt || 'white'
    const intensityLevel = user.athleteProfile.intensityLevel || 'moderate'
    const isCompetitor = user.athleteProfile.isCompetitor || false

    // Generate daily tips
    const tips = generateDailyTips(belt, intensityLevel, isCompetitor)

    console.log('[Tips] Generated tips for user:', userId)

    return NextResponse.json({ 
      success: true, 
      tips 
    })
  } catch (error: any) {
    console.error('[Tips] Generate error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar dicas' },
      { status: 500 }
    )
  }
}

function generateDailyTips(belt: string, intensityLevel: string, isCompetitor: boolean) {
  const tips = []

  // Nutrition tips
  tips.push({
    category: 'nutrition',
    title: 'Hidratação',
    content: 'Beba pelo menos 3L de água por dia para manter o desempenho nos treinos.',
    priority: 'high',
  })

  tips.push({
    category: 'nutrition',
    title: 'Pré-treino',
    content: 'Coma uma refeição leve 1-2 horas antes do treino. Evite alimentos pesados.',
    priority: 'medium',
  })

  tips.push({
    category: 'nutrition',
    title: 'Pós-treino',
    content: 'Consuma proteína nos primeiros 30 minutos após o treino para recuperação muscular.',
    priority: 'high',
  })

  // Training tips based on belt
  if (belt === 'white') {
    tips.push({
      category: 'training',
      title: 'Foco na defesa',
      content: 'Concentre-se em aprender posições defensivas e sobreviver na posição inferior.',
      priority: 'high',
    })
    tips.push({
      category: 'training',
      title: 'Posições básicas',
      content: 'Domine as posições fundamentais: guarda, meia-guarda e montada.',
      priority: 'high',
    })
  } else if (belt === 'blue') {
    tips.push({
      category: 'training',
      title: 'Combinações',
      content: 'Comece a conectar técnicas e criar sequências de ataque.',
      priority: 'medium',
    })
    tips.push({
      category: 'training',
      title: 'Sparring inteligente',
      content: 'Não force técnicas. Foque em aplicar o que aprendeu na aula.',
      priority: 'high',
    })
  } else if (belt === 'purple') {
    tips.push({
      category: 'training',
      title: 'Jogo de passes',
      content: 'Desenvolva um sistema sólido de passes de guarda.',
      priority: 'medium',
    })
    tips.push({
      category: 'training',
      title: 'Ataques de costas',
      content: 'Aprimore seus ataques de costas e finalizações.',
      priority: 'medium',
    })
  } else if (belt === 'brown' || belt === 'black') {
    tips.push({
      category: 'training',
      title: 'Detalhes técnicos',
      content: 'Foque nos pequenos detalhes que fazem a diferença nas técnicas.',
      priority: 'medium',
    })
    tips.push({
      category: 'training',
      title: 'Estratégia',
      content: 'Desenvolva um jogo estratégico e planeje suas ações no sparring.',
      priority: 'high',
    })
  }

  // Recovery tips
  tips.push({
    category: 'recovery',
    title: 'Sono',
    content: 'Dormir 7-9 horas por noite é essencial para recuperação e desempenho.',
    priority: 'high',
  })

  tips.push({
    category: 'recovery',
    title: 'Alongamento',
    content: 'Alongue por 10-15 minutos após cada treino para prevenir lesões.',
    priority: 'medium',
  })

  tips.push({
    category: 'recovery',
    title: 'Descanso',
    content: 'Respeite os dias de descanso. O corpo se fortalece durante a recuperação.',
    priority: 'high',
  })

  // Competitor tips
  if (isCompetitor) {
    tips.push({
      category: 'competition',
      title: 'Preparação mental',
      content: 'Visualize suas técnicas e cenários de competição regularmente.',
      priority: 'high',
    })
    tips.push({
      category: 'competition',
      title: 'Corte de peso',
      content: 'Planeje o corte de peso com antecedência. Não faça cortes drásticos.',
      priority: 'high',
    })
    tips.push({
      category: 'competition',
      title: 'Análise de vídeo',
      content: 'Estude lutas de competidores do seu peso e faixa.',
      priority: 'medium',
    })
  }

  // Intensity-specific tips
  if (intensityLevel === 'heavy' || intensityLevel === 'competitor') {
    tips.push({
      category: 'training',
      title: 'Periodização',
      content: 'Varie a intensidade dos treinos ao longo da semana para evitar overtraining.',
      priority: 'high',
    })
  }

  return tips
}
