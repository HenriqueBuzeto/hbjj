'use client'

import React, { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('E-mail do usuário não identificado na requisição.')
      return
    }

    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir a senha.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Erro de rede ao processar solicitação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.form
            key="reset-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Nova Senha
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2 leading-relaxed">
                Digite e confirme a nova senha para a conta:<br />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{email || 'desconhecido'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
                    <KeyRound className="w-5 h-5" />
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
                    <KeyRound className="w-5 h-5" />
                  </span>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-amber-500 text-sm py-3"
                  />
                </div>
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

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Redefinindo...' : 'Salvar Nova Senha'}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="reset-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Senha Alterada!
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs px-6 leading-relaxed">
                Sua senha foi redefinida com sucesso no banco de dados. Você já pode fazer login com sua nova credencial.
              </p>
            </div>

            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
            >
              Ir para o Login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  return (
    <AuthLayout title="Redefinir Senha" showBack={true} onBack={() => router.push('/forgot-password')}>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
