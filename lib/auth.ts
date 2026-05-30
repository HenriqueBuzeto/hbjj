import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      athleteProfile: true,
      jiuJitsuProfile: true,
      gamificationProfile: true,
    },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  const passwordHash = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      gamificationProfile: {
        create: {
          level: 1,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
  })
}

