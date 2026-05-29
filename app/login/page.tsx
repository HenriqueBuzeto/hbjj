'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Lock, AlertTriangle } from 'lucide-react'

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('E-mail ou senha inválidos')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Bem-vindo de volta! Insira suas credenciais.">
      <form onSubmit={handleSubmit} className="space-y-5 mt-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="pl-10 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-amber-500 text-sm py-3"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-10 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-amber-500 text-sm py-3"
              />
            </div>
            
            {/* Forgot password option */}
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 text-red-650 dark:text-red-400 px-4 py-3 rounded-2xl text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Buttons and Footer */}
        <div className="space-y-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-650 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center pt-2">
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-amber-500 hover:text-amber-600 font-bold transition-colors"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
