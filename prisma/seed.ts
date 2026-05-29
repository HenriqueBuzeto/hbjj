import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Prevent running seed in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Seed skipped: Cannot run in production environment')
    return
  }

  console.log('🌱 Starting seed...')

  // ============================================
  // SEED BADGES
  // ============================================
  const badges = [
    {
      name: 'Primeiro Treino',
      description: 'Completou sua primeira sessão de treino',
      icon: '🥋',
      requirementType: 'camps',
      requirementValue: 1,
    },
    {
      name: 'Consistente',
      description: 'Manteve streak de 7 dias',
      icon: '🔥',
      requirementType: 'streak',
      requirementValue: 7,
    },
    {
      name: 'Atleta Dedicado',
      description: 'Manteve streak de 30 dias',
      icon: '💪',
      requirementType: 'streak',
      requirementValue: 30,
    },
    {
      name: 'Foco no Peso',
      description: 'Atingiu peso alvo da competição',
      icon: '⚖️',
      requirementType: 'missions',
      requirementValue: 10,
    },
    {
      name: 'Camp Completo',
      description: 'Completou um camp de 8 semanas',
      icon: '🏆',
      requirementType: 'camps',
      requirementValue: 1,
    },
    {
      name: 'Nutrição em Dia',
      description: 'Bateu meta de proteína por 7 dias seguidos',
      icon: '🥗',
      requirementType: 'missions',
      requirementValue: 7,
    },
    {
      name: 'Hidratado',
      description: 'Bateu meta de água por 7 dias seguidos',
      icon: '💧',
      requirementType: 'missions',
      requirementValue: 7,
    },
    {
      name: 'Competidor',
      description: 'Se inscreveu em uma competição',
      icon: '🎯',
      requirementType: 'missions',
      requirementValue: 1,
    },
    {
      name: 'Nível 5',
      description: 'Alcançou o nível 5',
      icon: '⭐',
      requirementType: 'xp',
      requirementValue: 1600,
    },
    {
      name: 'Nível 10',
      description: 'Alcançou o nível 10',
      icon: '🌟',
      requirementType: 'xp',
      requirementValue: 8100,
    },
    {
      name: 'XP Master',
      description: 'Acumulou 1000 XP',
      icon: '🎖️',
      requirementType: 'xp',
      requirementValue: 1000,
    },
    {
      name: 'Missões Diárias',
      description: 'Completou 100 missões',
      icon: '✅',
      requirementType: 'missions',
      requirementValue: 100,
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }

  console.log('✅ Badges seeded')

  // ============================================
  // SEED TEST USER
  // ============================================
  const passwordHash = await bcrypt.hash('test123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@hbjj.com' },
    update: {},
    create: {
      email: 'test@hbjj.com',
      name: 'Test Athlete',
      passwordHash,
      role: 'athlete',
      plan: 'free',
      athleteProfile: {
        create: {
          age: 25,
          heightCm: 175,
          currentWeightKg: 77.5,
          targetWeightKg: 73.0,
          city: 'São Paulo',
          sex: 'male',
          mainGoal: 'performance',
          intensityLevel: 'heavy',
          isCompetitor: true,
        },
      },
      jiuJitsuProfile: {
        create: {
          belt: 'blue',
          teamName: 'Alliance',
          academyName: 'Alliance SP',
          coachName: 'Professor Test',
          yearsTraining: 3,
          trainsGi: true,
          trainsNogi: true,
          weeklySessions: 5,
          preferredTrainingTime: 'evening',
          weightCategory: '76kg',
          fightingStyleNotes: 'Pass guard, half guard specialist',
        },
      },
      nutritionTargets: {
        create: {
          caloriesTarget: 2500,
          proteinTargetG: 180,
          carbsTargetG: 250,
          fatTargetG: 70,
          waterTargetMl: 3500,
        },
      },
      gamificationProfile: {
        create: {
          level: 1,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
    include: {
      athleteProfile: true,
      jiuJitsuProfile: true,
      nutritionTargets: true,
      gamificationProfile: true,
    },
  })

  console.log('✅ Test user seeded:', testUser.email)

  // ============================================
  // SEED SAMPLE COMPETITION
  // ============================================
  const competition = await prisma.competition.create({
    data: {
      userId: testUser.id,
      name: 'Campeonato Paulista de Jiu-Jitsu',
      organization: 'Federação Paulista',
      eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      modality: ['Gi', 'No-Gi'],
      currentWeightKg: 77.5,
      targetWeightKg: 73.0,
      weightLimitKg: 76.0,
      daysRemaining: 60,
      status: 'upcoming',
      priority: 'high',
    },
  })

  console.log('✅ Competition seeded:', competition.name)

  // ============================================
  // SEED TRAINING CAMP
  // ============================================
  const camp = await prisma.trainingCamp.create({
    data: {
      userId: testUser.id,
      competitionId: competition.id,
      name: 'Camp Campeonato Paulista',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      currentPhase: 'base',
      totalWeeks: 8,
      currentWeek: 1,
      status: 'planned',
      campWeeks: {
        create: Array.from({ length: 8 }, (_, i) => ({
          weekNumber: i + 1,
          phaseName: i < 3 ? 'base' : i < 6 ? 'build' : i < 7 ? 'peak' : 'taper',
          goal: `Week ${i + 1} goals`,
          volumeLevel: i < 3 ? 'medium' : i < 6 ? 'high' : 'low',
          intensityLevel: i < 3 ? 'low' : i < 6 ? 'high' : 'medium',
        })),
      },
    },
  })

  console.log('✅ Training camp seeded:', camp.name)

  // ============================================
  // SEED TRAINING SESSIONS
  // ============================================
  const today = new Date()
  const sessions = [
    {
      title: 'Drilling - Passagem de Guarda',
      type: 'drilling',
      modality: 'gi',
      scheduledDate: today,
      scheduledTime: '18:00',
      durationMinutes: 60,
      intensity: 'medium',
      status: 'completed',
      caloriesEstimate: 400,
      completedAt: today,
      campId: camp.id,
    },
    {
      title: 'Sparring - 5 Rounds',
      type: 'sparring',
      modality: 'gi',
      scheduledDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      scheduledTime: '18:00',
      durationMinutes: 90,
      intensity: 'high',
      status: 'scheduled',
      caloriesEstimate: 600,
      campId: camp.id,
    },
  ]

  for (const session of sessions) {
    await prisma.trainingSession.create({
      data: {
        ...session,
        userId: testUser.id,
      },
    })
  }

  console.log('✅ Training sessions seeded')

  // ============================================
  // SEED MEAL LOGS
  // ============================================
  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner']
  for (let i = 0; i < 3; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    for (const mealType of mealTypes) {
      await prisma.mealLog.create({
        data: {
          userId: testUser.id,
          date,
          mealType,
          totalCalories: Math.floor(Math.random() * 500) + 300,
          totalProteinG: Math.floor(Math.random() * 30) + 20,
          totalCarbsG: Math.floor(Math.random() * 50) + 30,
          totalFatG: Math.floor(Math.random() * 20) + 10,
          items: {
            create: [
              {
                name: 'Protein Shake',
                quantity: 1,
                unit: 'scoop',
                calories: 120,
                proteinG: 24,
                carbsG: 3,
                fatG: 1,
              },
            ],
          },
        },
      })
    }
  }

  console.log('✅ Meal logs seeded')

  // ============================================
  // SEED HYDRATION LOGS
  // ============================================
  for (let i = 0; i < 5; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    await prisma.hydrationLog.upsert({
      where: {
        userId_date: {
          userId: testUser.id,
          date,
        },
      },
      update: {
        amountMl: 3000 + Math.floor(Math.random() * 1000),
      },
      create: {
        userId: testUser.id,
        date,
        amountMl: 3000 + Math.floor(Math.random() * 1000),
      },
    })
  }

  console.log('✅ Hydration logs seeded')

  // ============================================
  // SEED BODY PROGRESS
  // ============================================
  await prisma.bodyProgressLog.create({
    data: {
      userId: testUser.id,
      date: today,
      weightKg: 77.5,
      waistCm: 85,
      chestCm: 100,
      armCm: 35,
      legCm: 58,
      cardioScore: 7,
      strengthScore: 8,
      mobilityScore: 6,
      recoveryScore: 7,
      fatigueLevel: 3,
      sleepHours: 7.5,
    },
  })

  console.log('✅ Body progress log seeded')

  // ============================================
  // SEED READINESS LOG
  // ============================================
  await prisma.readinessLog.create({
    data: {
      userId: testUser.id,
      date: today,
      gasScore: 7,
      strengthScore: 8,
      mobilityScore: 6,
      recoveryScore: 7,
      weightScore: 7,
    },
  })

  console.log('✅ Readiness log seeded')

  // ============================================
  // SEED DAILY MISSIONS
  // ============================================
  const missions = [
    {
      title: 'Beber 3L de água',
      description: 'Mantenha-se hidratado durante o dia',
      category: 'water',
      xpReward: 10,
    },
    {
      title: 'Registrar todas as refeições',
      description: 'Mantenha o controle da sua nutrição',
      category: 'food',
      xpReward: 15,
    },
    {
      title: 'Treinar hoje',
      description: 'Complete sua sessão de treino',
      category: 'exercise',
      xpReward: 25,
    },
    {
      title: 'Registrar prontidão',
      description: 'Avalie seu estado de recuperação',
      category: 'recovery',
      xpReward: 10,
    },
  ]

  for (const mission of missions) {
    await prisma.dailyMission.create({
      data: {
        userId: testUser.id,
        date: today,
        ...mission,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        completedAt: Math.random() > 0.5 ? today : null,
      },
    })
  }

  console.log('✅ Daily missions seeded')

  // ============================================
  // SEED XP EVENTS
  // ============================================
  await prisma.xPEvent.create({
    data: {
      userId: testUser.id,
      gamificationProfileId: testUser.gamificationProfile?.id,
      sourceType: 'mission',
      xpAmount: 25,
      description: 'Completed training session',
    },
  })

  console.log('✅ XP events seeded')

  // ============================================
  // SEED YOUTUBE VIDEOS
  // ============================================
  const videos = [
    {
      title: 'Passagem de Guarda Básica',
      channelName: 'Danaher John',
      youtubeVideoId: 'abc123',
      url: 'https://youtube.com/watch?v=abc123',
      thumbnailUrl: 'https://img.youtube.com/vi/abc123/default.jpg',
      category: 'technique',
      beltLevel: 'white',
      modality: 'gi',
    },
    {
      title: 'Defesa de Triângulo',
      channelName: 'Lachlan Giles',
      youtubeVideoId: 'def456',
      url: 'https://youtube.com/watch?v=def456',
      thumbnailUrl: 'https://img.youtube.com/vi/def456/default.jpg',
      category: 'technique',
      beltLevel: 'blue',
      modality: 'nogi',
    },
    {
      title: 'Leg Drag Pass',
      channelName: 'Gordon Ryan',
      youtubeVideoId: 'ghi789',
      url: 'https://youtube.com/watch?v=ghi789',
      thumbnailUrl: 'https://img.youtube.com/vi/ghi789/default.jpg',
      category: 'technique',
      beltLevel: 'purple',
      modality: 'nogi',
    },
    {
      title: 'Berimbolo Setup',
      channelName: 'Mikey Musumeci',
      youtubeVideoId: 'jkl012',
      url: 'https://youtube.com/watch?v=jkl012',
      thumbnailUrl: 'https://img.youtube.com/vi/jkl012/default.jpg',
      category: 'technique',
      beltLevel: 'brown',
      modality: 'gi',
    },
  ]

  for (const video of videos) {
    await prisma.youtubeVideo.upsert({
      where: { youtubeVideoId: video.youtubeVideoId },
      update: {},
      create: video,
    })
  }

  console.log('✅ YouTube videos seeded')

  console.log('🎉 Seed completed successfully!')
  console.log('📧 Test user credentials:')
  console.log('   Email: test@hbjj.com')
  console.log('   Password: test123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
