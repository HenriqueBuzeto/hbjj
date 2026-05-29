import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Login attempt for email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        const user = await getUserByEmail(credentials.email as string)
        console.log('[Auth] User found:', !!user)

        if (!user || !user.passwordHash) {
          console.log('[Auth] No user or password hash')
          return null
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        )
        console.log('[Auth] Password valid:', isValid)

        if (!isValid) {
          return null
        }

        console.log('[Auth] Login successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
