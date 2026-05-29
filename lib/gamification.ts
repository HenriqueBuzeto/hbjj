import { prisma } from './prisma'

export async function addXP(userId: string, amount: number, source: string, sourceId?: string) {
  // Update gamification profile
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw new Error('Gamification profile not found')
  }

  const newTotalXp = profile.totalXp + amount
  const newLevel = Math.floor(newTotalXp / 200) + 1 // Level up every 200 XP

  await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      totalXp: newTotalXp,
      level: newLevel,
      lastActivityDate: new Date(),
    },
  })

  // Log XP event
  await prisma.xPEvent.create({
    data: {
      userId,
      sourceType: source,
      sourceId,
      xpAmount: amount,
      description: `+${amount} XP from ${source}`,
    },
  })

  // Check for badge unlocks
  await checkBadgeUnlocks(userId, profile)

  return { newTotalXp, newLevel }
}

export async function updateStreak(userId: string) {
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId },
  })

  if (!profile) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActivity = profile.lastActivityDate
    ? new Date(profile.lastActivityDate)
    : null

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0)
    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      // Consecutive day
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          currentStreak: profile.currentStreak + 1,
          longestStreak: Math.max(profile.longestStreak, profile.currentStreak + 1),
          lastActivityDate: new Date(),
        },
      })
    } else if (diffDays > 1) {
      // Streak broken
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityDate: new Date(),
        },
      })
    }
  } else {
    // First activity
    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      },
    })
  }
}

async function checkBadgeUnlocks(userId: string, profile: any) {
  const badges = await prisma.badge.findMany()
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const earnedBadgeIds = new Set(userBadges.map((ub: { badgeId: string }) => ub.badgeId))

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue

    let shouldUnlock = false

    switch (badge.requirementType) {
      case 'level':
        shouldUnlock = badge.requirementValue !== null && profile.level >= badge.requirementValue
        break
      case 'total_xp':
        shouldUnlock = badge.requirementValue !== null && profile.totalXp >= badge.requirementValue
        break
      case 'streak':
        shouldUnlock = badge.requirementValue !== null && profile.longestStreak >= badge.requirementValue
        break
      default:
        break
    }

    if (shouldUnlock) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      })
    }
  }
}

export async function generateDailyMissions(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingMissions = await prisma.dailyMission.findMany({
    where: {
      userId,
      date: today,
    },
  })

  if (existingMissions.length > 0) {
    return existingMissions
  }

  const missions = [
    {
      userId,
      date: today,
      title: 'Beber 3L de água',
      description: 'Mantenha-se hidratado para melhor performance',
      category: 'water',
      xpReward: 50,
    },
    {
      userId,
      date: today,
      title: 'Consumir meta de proteína',
      description: 'Proteína é essencial para recuperação muscular',
      category: 'food',
      xpReward: 40,
    },
    {
      userId,
      date: today,
      title: 'Completar treino do dia',
      description: 'Consistência é a chave do progresso',
      category: 'exercise',
      xpReward: 100,
    },
    {
      userId,
      date: today,
      title: 'Fazer check-in de recuperação',
      description: 'Monitore seu corpo para evitar lesões',
      category: 'recovery',
      xpReward: 30,
    },
  ]

  return prisma.dailyMission.createMany({
    data: missions,
  })
}
