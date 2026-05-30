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

    const intensityLevel = user.athleteProfile.intensityLevel || 'moderate'
    const belt = user.jiuJitsuProfile.belt || 'white'
    const isCompetitor = user.athleteProfile.isCompetitor || false

    // Generate workouts based on profile
    const workouts = generateWorkouts(intensityLevel, belt, isCompetitor)

    // Save workouts to database
    const createdWorkouts = await prisma.trainingSession.createMany({
      data: workouts.map(w => ({
        userId,
        title: `${w.type.charAt(0).toUpperCase() + w.type.slice(1)} - ${w.intensity}`,
        type: w.type,
        scheduledDate: new Date(),
        durationMinutes: w.duration,
        intensity: w.intensity,
        status: 'scheduled',
        notes: w.notes,
      })),
      skipDuplicates: true,
    })

    console.log('[Workouts] Generated workouts for user:', userId)

    return NextResponse.json({ 
      success: true, 
      workouts,
      count: createdWorkouts.count 
    })
  } catch (error: any) {
    console.error('[Workouts] Generate error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar treinos' },
      { status: 500 }
    )
  }
}

function generateWorkouts(intensityLevel: string, belt: string, isCompetitor: boolean) {
  const baseWorkouts = [
    {
      type: 'jiu-jitsu',
      duration: 60,
      intensity: intensityLevel,
      exercises: [
        { name: 'Aquecimento', duration: 10, reps: '' },
        { name: 'Técnica de pé', duration: 15, reps: '' },
        { name: 'Luta de solo', duration: 20, reps: '' },
        { name: 'Sparring', duration: 15, reps: '' },
      ],
      notes: `Treino de Jiu-Jitsu nível ${belt}`,
    },
    {
      type: 'strength',
      duration: 45,
      intensity: intensityLevel,
      exercises: [
        { name: 'Agachamento', duration: 0, reps: '4x10' },
        { name: 'Supino', duration: 0, reps: '4x10' },
        { name: 'Deadlift', duration: 0, reps: '3x8' },
        { name: 'Puxada', duration: 0, reps: '4x12' },
      ],
      notes: 'Treino de força para Jiu-Jitsu',
    },
    {
      type: 'cardio',
      duration: 30,
      intensity: 'moderate',
      exercises: [
        { name: 'Corrida', duration: 20, reps: '' },
        { name: 'Burpees', duration: 0, reps: '3x15' },
        { name: 'Jump rope', duration: 10, reps: '' },
      ],
      notes: 'Cardio para condicionamento',
    },
  ]

  // Adjust based on intensity
  if (intensityLevel === 'light') {
    return baseWorkouts.map(w => ({
      ...w,
      duration: w.duration * 0.7,
      exercises: w.exercises.slice(0, 3),
    }))
  } else if (intensityLevel === 'heavy' || intensityLevel === 'competitor') {
    return baseWorkouts.map(w => ({
      ...w,
      duration: w.duration * 1.3,
      exercises: [...w.exercises, { name: 'Alongamento', duration: 10, reps: '' }],
    }))
  }

  // Add competitor-specific workouts
  if (isCompetitor) {
    baseWorkouts.push({
      type: 'competition',
      duration: 90,
      intensity: 'high',
      exercises: [
        { name: 'Simulação de luta', duration: 30, reps: '' },
        { name: 'Análise de vídeo', duration: 20, reps: '' },
        { name: 'Treino específico de queda', duration: 20, reps: '' },
        { name: 'Sparring com tempo real', duration: 20, reps: '' },
      ],
      notes: 'Treino específico para competição',
    })
  }

  return baseWorkouts
}
