'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Algo deu errado')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Erro ao enviar solicitação de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Recuperar Senha" showBack={true} onBack={() => router.push('/login')}>
      <div className="flex-1 flex flex-col justify-center min-h-[400px]">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="forgot-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Esqueceu sua senha?
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2 px-4 leading-relaxed">
                  Digite seu e-mail cadastrado abaixo. Enviaremos as instruções de redefinição.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    E-mail de Cadastro
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
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Enviando...' : 'Recuperar Senha'}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="forgot-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Instruções Enviadas!
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs px-4 leading-relaxed">
                  Se o e-mail **{email}** estiver registrado, você receberá um link para redefinir sua senha.
                </p>
              </div>

              {/* Dev Simulation Option to make it functional without SMTP setup */}
              <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left space-y-3">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">
                  Modo de Demonstração
                </span>
                <p className="text-zinc-650 dark:text-zinc-350 text-[11px] leading-relaxed">
                  Para fins de teste nesta demonstração, você pode clicar no botão abaixo para redefinir a senha do usuário **{email}** diretamente agora.
                </p>
                <Button
                  onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold"
                >
                  Redefinir Senha Agora
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => router.push('/login')}
                  className="text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold underline decoration-zinc-400 dark:decoration-zinc-700"
                >
                  Voltar para o Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  )
}
