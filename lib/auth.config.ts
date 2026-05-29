import type { AuthConfig } from '@auth/core'

export const authConfig: AuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // Providers are added in auth.ts
}
