import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { verifyPassword } from './auth'

// Simple session management using cookies
const SESSION_COOKIE_NAME = 'user_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionUser {
  id: string
  email: string
  name: string
}

export async function createSession(userId: string) {
  const cookieStore = await cookies()
  
  const sessionData = {
    userId,
    createdAt: Date.now(),
  }
  
  const sessionString = JSON.stringify(sessionData)
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie) {
    return null
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (Date.now() - sessionData.createdAt > SESSION_MAX_AGE * 1000) {
      await clearSession()
      return null
    }
    
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
    
    if (!user || !user.name) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error('Error parsing session:', error)
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  })
  
  if (!user || !user.passwordHash || !user.name) {
    return null
  }
  
  const isValid = await verifyPassword(password, user.passwordHash)
  
  if (!isValid) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
