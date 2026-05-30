'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAppContext } from '@/context/AppContext'
import { Mail, Lock, User, AlertTriangle, ChevronRight, Activity, Calendar, Trophy, Landmark } from 'lucide-react'

const BJJ_BELTS = [
  { key: 'white', label: 'Branca', color: 'border-zinc-300 bg-white text-zinc-950 dark:border-zinc-700' },
  { key: 'blue', label: 'Azul', color: 'border-blue-600 bg-blue-600 text-white' },
  { key: 'purple', label: 'Roxa', color: 'border-purple-600 bg-purple-600 text-white' },
  { key: 'brown', label: 'Marrom', color: 'border-amber-800 bg-amber-800 text-white' },
  { key: 'black', label: 'Preta', color: 'border-zinc-800 bg-zinc-950 text-white dark:border-zinc-700' },
]

const INTENSITY_PROFILES = [
  { key: 'light', label: 'Leve (Prática recreativa)' },
  { key: 'moderate', label: 'Moderado (Treino regular 3x/semana)' },
  { key: 'strong', label: 'Forte (Treinos diários intensos)' },
  { key: 'competitor', label: 'Competidor (Sparring e preparação)' },
  { key: 'camp', label: 'Camp Intensivo (Rotina profissional)' },
]

const GOAL_OPTIONS = [
  { key: 'competition', label: 'Preparação para Competição' },
  { key: 'lose', label: 'Emagrecimento / Ajuste de Peso' },
  { key: 'strength', label: 'Ganho de Força & Core' },
  { key: 'cardio', label: 'Melhorar Cardio / Gás' },
  { key: 'mobility', label: 'Melhorar Mobilidade' },
  { key: 'explosion', label: 'Melhorar Explosão' },
  { key: 'resistance', label: 'Melhorar Resistência' },
  { key: 'health', label: 'Treinar por Saúde' },
  { key: 'return', label: 'Voltar a treinar após pausa' },
]

const SignupPage = () => {
  const router = useRouter()
  const { setUser } = useAppContext()
  
  // 5 onboarding steps:
  // 1: Account credentials (Name, Email, Password, Confirm Password)
  // 2: Personal & Physical Stats (Age, Weight, Height, City, Gender)
  // 3: Jiu-Jitsu Profile (Belt, Frequency, Team, Weight Class, Competidor)
  // 4: Goals & Intensity Profile
  // 5: Main Tournament Target
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    age: '',
    weight: '',
    height: '',
    desiredWeight: '',
    city: '',
    
    // BJJ details
    belt: 'white' as 'white' | 'blue' | 'purple' | 'brown' | 'black',
    trainingTime: '',
    trainsGi: true,
    trainsNoGi: false,
    weeklyFrequency: 3,
    trainingHours: '12:00',
    team: '',
    professor: '',
    weightClass: '',
    isCompetitor: false,
    athleteGoal: [] as string[],
    intensityProfile: 'moderate' as 'light' | 'moderate' | 'strong' | 'competitor' | 'camp',

    // Competition details
    competitionName: '',
    competitionDate: '',
    competitionModalities: [] as ('Gi' | 'No-Gi')[],
    competitionWeightLimit: '',
    competitionPriority: 'medium' as 'low' | 'medium' | 'high',
  })

  const toggleGoal = (key: string) => {
    setFormData(prev => {
      const athleteGoal = prev.athleteGoal.includes(key)
        ? prev.athleteGoal.filter(g => g !== key)
        : [...prev.athleteGoal, key]
      return { ...prev, athleteGoal }
    })
  }

  const handleCheckboxChange = (field: 'trainsGi' | 'trainsNoGi' | 'isCompetitor') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    console.log('[Signup] Starting registration process')

    try {
      // Step 1: Register user
      console.log('[Signup] Step 1: Registering user')
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: authData.email,
          password: authData.password,
        }),
      })

      console.log('[Signup] Register response status:', registerResponse.status)

      if (!registerResponse.ok) {
        const data = await registerResponse.json()
        console.error('[Signup] Register error:', data)
        setError(data.error || 'Erro ao registrar')
        setLoading(false)
        return
      }

      console.log('[Signup] User registered successfully')

      // Step 2: Login automatically
      console.log('[Signup] Step 2: Logging in automatically')
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
        }),
      })

      console.log('[Signup] Login response status:', loginResponse.status)

      if (!loginResponse.ok) {
        const data = await loginResponse.json()
        console.error('[Signup] Login error:', data.error)
        setError('Erro ao fazer login automático')
        setLoading(false)
        return
      }

      console.log('[Signup] Login successful')

      // Step 3: Complete onboarding
      console.log('[Signup] Step 3: Completing onboarding')
      const onboardingResponse = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteProfile: {
            gender: formData.gender,
            age: parseFloat(formData.age) || 25,
            weightKg: parseFloat(formData.weight) || 70,
            heightCm: parseFloat(formData.height) || 175,
            city: formData.city,
          },
          jiuJitsuProfile: {
            belt: formData.belt,
            trainingTimeYears: formData.trainingTime ? parseFloat(formData.trainingTime) : undefined,
            trainsGi: formData.trainsGi,
            trainsNoGi: formData.trainsNoGi,
            weeklyFrequency: formData.weeklyFrequency,
            preferredTrainingTime: formData.trainingHours,
            team: formData.team,
            professor: formData.professor,
            targetWeightClass: formData.weightClass,
            isCompetitor: formData.isCompetitor,
            goals: formData.athleteGoal,
            intensityProfile: formData.intensityProfile,
          },
        }),
      })

      console.log('[Signup] Onboarding response status:', onboardingResponse.status)

      if (!onboardingResponse.ok) {
        const data = await onboardingResponse.json()
        console.error('[Signup] Onboarding error:', data)
        setError(data.error || 'Erro ao completar onboarding')
        setLoading(false)
        return
      }

      console.log('[Signup] Onboarding completed successfully')

      // Step 4: Create competition if target is set
      if (formData.competitionName && formData.competitionDate) {
        console.log('[Signup] Step 4: Creating competition')
        const competitionResponse = await fetch('/api/competitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.competitionName,
            organization: formData.team || 'N/A',
            eventDate: formData.competitionDate,
            modality: formData.competitionModalities[0] || 'both',
            currentWeightKg: parseFloat(formData.weight) || 70,
            targetWeightKg: parseFloat(formData.desiredWeight) || undefined,
            weightLimitKg: parseFloat(formData.competitionWeightLimit) || undefined,
            priority: formData.competitionPriority,
          }),
        })

        console.log('[Signup] Competition response status:', competitionResponse.status)
      }

      console.log('[Signup] Redirecting to dashboard')
      router.push('/dashboard')
    } catch (err) {
      console.error('[Signup] Registration error:', err)
      setError('Erro ao completar cadastro')
      setLoading(false)
    }
  }

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.name.trim().length > 0 &&
        authData.email.trim().length > 0 &&
        authData.password.length >= 6 &&
        authData.password === confirmPassword
      )
    }
    if (step === 2) {
      return (
        formData.age.trim().length > 0 &&
        formData.weight.trim().length > 0 &&
        formData.height.trim().length > 0
      )
    }
    if (step === 3) {
      return !!formData.belt && formData.weeklyFrequency > 0
    }
    if (step === 4) {
      return formData.athleteGoal.length > 0
    }
    return true
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push('/login')
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Criar Conta'
      case 2:
        return 'Dados Pessoais'
      case 3:
        return 'Perfil no Jiu-Jitsu'
      case 4:
        return 'Objetivos'
      case 5:
        return 'Meta de Competição'
      default:
        return 'Cadastro'
    }
  }

  return (
    <AuthLayout title={getStepTitle()} showBack={true} onBack={handleBack}>
      <div className="flex-1 flex flex-col justify-between mt-4">
        {/* Progress Bar Header inside card */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">
              Passo {step} de 5
            </span>
            <span className="text-[10px] font-bold text-amber-500">
              {Math.round((step / 5) * 100)}%
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Dynamic form steps */}
        <div className="flex-1 min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-2">
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                    Insira seus dados principais para começar seu onboarding.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 dark:text-zinc-500">
                      <User className="w-4 h-4" />
                    </span>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome ou apelido de tatame"
                      required
                      className="pl-9 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 dark:text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                      className="pl-9 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 dark:text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        type="password"
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        placeholder="Mín. 6 dígitos"
                        required
                        className="pl-9 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 dark:text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        required
                        className="pl-9 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                      />
                    </div>
                  </div>
                </div>

                {authData.password && confirmPassword && authData.password !== confirmPassword && (
                  <p className="text-[11px] text-red-500 font-semibold text-center">
                    As senhas não coincidem
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-2">Gênero</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                        formData.gender === 'male'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                        formData.gender === 'female'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Idade"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 28"
                    required
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                  />
                  <Input
                    label="Cidade"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Curitiba"
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Peso (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="80"
                    required
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                  />
                  <Input
                    label="Altura (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="180"
                    required
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                  />
                  <Input
                    label="Meta (kg)"
                    type="number"
                    value={formData.desiredWeight}
                    onChange={(e) => setFormData({ ...formData, desiredWeight: e.target.value })}
                    placeholder="77"
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-2">
                    Graduação (Faixa)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BJJ_BELTS.map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, belt: b.key as any })}
                        className={`py-2 rounded-lg border-2 text-[10px] font-black transition-all text-center active:scale-95 ${b.color} ${
                          formData.belt === b.key
                            ? 'ring-2 ring-amber-500 scale-105 opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5">Modalidade</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trainsGi}
                          onChange={() => handleCheckboxChange('trainsGi')}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        Kimono (Gi)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trainsNoGi}
                          onChange={() => handleCheckboxChange('trainsNoGi')}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        Sem Kimono (No-Gi)
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1 flex items-center justify-between">
                      <span>Treinos/Semana</span>
                      <span className="text-amber-500 font-extrabold">{formData.weeklyFrequency}x</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={formData.weeklyFrequency}
                      onChange={(e) => setFormData({ ...formData, weeklyFrequency: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Equipe"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Ex: Alliance, Gracie"
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                  />
                  <Input
                    label="Categoria IBJJF"
                    value={formData.weightClass}
                    onChange={(e) => setFormData({ ...formData, weightClass: e.target.value })}
                    placeholder="Ex: Médio, Leve"
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    id="isCompetitor"
                    checked={formData.isCompetitor}
                    onChange={() => handleCheckboxChange('isCompetitor')}
                    className="accent-amber-500 w-4 h-4 cursor-pointer rounded"
                  />
                  <label htmlFor="isCompetitor" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    Eu pretendo competir / Sou competidor ativo
                  </label>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-2">
                    Objetivos (Selecione um ou mais)
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {GOAL_OPTIONS.map((o) => {
                      const selected = formData.athleteGoal.includes(o.key)
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => toggleGoal(o.key)}
                          className={`w-full py-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all active:scale-[0.99] ${
                            selected
                              ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-bold'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-2">
                    Perfil de Intensidade
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {INTENSITY_PROFILES.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, intensityProfile: p.key as any })}
                        className={`w-full py-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all active:scale-[0.99] ${
                          formData.intensityProfile === p.key
                            ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-1 bg-amber-500/5 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10">
                  <p className="text-[10px] leading-relaxed text-amber-600 dark:text-amber-400">
                    Opcional: Informe se há algum campeonato alvo planejado. A IA otimizará seu peso, treinos e dieta para este evento.
                  </p>
                </div>

                <Input
                  label="Nome do Campeonato"
                  value={formData.competitionName}
                  onChange={(e) => setFormData({ ...formData, competitionName: e.target.value })}
                  placeholder="Ex: Sul Brasileiro IBJJF"
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm py-2.5"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Data do Evento"
                    type="date"
                    value={formData.competitionDate}
                    onChange={(e) => setFormData({ ...formData, competitionDate: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                  />
                  <Input
                    label="Peso Limite (kg)"
                    type="number"
                    value={formData.competitionWeightLimit}
                    onChange={(e) => setFormData({ ...formData, competitionWeightLimit: e.target.value })}
                    placeholder="Ex: 82.3"
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-2">
                    Prioridade de Preparação
                  </label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, competitionPriority: p as any })}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all active:scale-95 ${
                          formData.competitionPriority === p
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-650 dark:text-red-400 px-3 py-2 rounded-xl text-[11px] flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          {step > 1 && (
            <Button
              variant="outline"
              full
              onClick={() => setStep(step - 1)}
              className="rounded-2xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 text-sm font-semibold active:scale-95"
            >
              Voltar
            </Button>
          )}
          {step < 5 ? (
            <Button
              full
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-2xl py-3 text-sm font-bold shadow-md active:scale-95"
            >
              Próximo
            </Button>
          ) : (
            <Button
              full
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl py-3 text-sm font-bold shadow-lg shadow-orange-500/10 active:scale-95"
            >
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

export default SignupPage
