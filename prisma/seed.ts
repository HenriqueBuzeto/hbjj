import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Seed Badges
  const badges = [
    {
      name: 'Primeiro Treino',
      description: 'Completou sua primeira sessão de treino',
      icon: '🥋',
      requirementType: 'first_training',
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
      requirementType: 'weight_goal',
      requirementValue: 1,
    },
    {
      name: 'Camp Completo',
      description: 'Completou um camp de 8 semanas',
      icon: '🏆',
      requirementType: 'camp_completed',
      requirementValue: 1,
    },
    {
      name: 'Nutrição em Dia',
      description: 'Bateu meta de proteína por 7 dias seguidos',
      icon: '🥗',
      requirementType: 'nutrition_streak',
      requirementValue: 7,
    },
    {
      name: 'Hidratado',
      description: 'Bateu meta de água por 7 dias seguidos',
      icon: '💧',
      requirementType: 'hydration_streak',
      requirementValue: 7,
    },
    {
      name: 'Competidor',
      description: 'Se inscreveu em uma competição',
      icon: '🎯',
      requirementType: 'competition_registered',
      requirementValue: 1,
    },
    {
      name: 'Nível 5',
      description: 'Alcançou o nível 5',
      icon: '⭐',
      requirementType: 'level',
      requirementValue: 5,
    },
    {
      name: 'Nível 10',
      description: 'Alcançou o nível 10',
      icon: '🌟',
      requirementType: 'level',
      requirementValue: 10,
    },
    {
      name: 'XP Master',
      description: 'Acumulou 1000 XP',
      icon: '🎖️',
      requirementType: 'total_xp',
      requirementValue: 1000,
    },
    {
      name: 'Missões Diárias',
      description: 'Completou 100 missões',
      icon: '✅',
      requirementType: 'missions_completed',
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

  // Seed Sample YouTube Videos
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
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
