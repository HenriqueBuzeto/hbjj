'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import { signIn } from '@/lib/auth';
import { ACTIVITY_LEVELS } from '@/data/mockData';

const BJJ_BELTS = [
  { key: 'white', label: 'Branca', color: 'border-zinc-300 bg-white text-zinc-900' },
  { key: 'blue', label: 'Azul', color: 'border-blue-600 bg-blue-600 text-white' },
  { key: 'purple', label: 'Roxa', color: 'border-purple-600 bg-purple-600 text-white' },
  { key: 'brown', label: 'Marrom', color: 'border-amber-800 bg-amber-800 text-white' },
  { key: 'black', label: 'Preta', color: 'border-red-600 bg-zinc-950 text-white' },
];

const INTENSITY_PROFILES = [
  { key: 'light', label: 'Leve (Prática recreativa)' },
  { key: 'moderate', label: 'Moderado (Treino regular 3x/semana)' },
  { key: 'strong', label: 'Forte (Treinos diários com alta intensidade)' },
  { key: 'competitor', label: 'Competidor (Preparação e Sparring intenso)' },
  { key: 'camp', label: 'Camp Intensivo (Rotina profissional focada em luta)' },
];

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
];

const SignupPage = () => {
  const router = useRouter();
  const { setUser } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
  });
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
  });

  const toggleGoal = (key: string) => {
    setFormData(prev => {
      const athleteGoal = prev.athleteGoal.includes(key)
        ? prev.athleteGoal.filter(g => g !== key)
        : [...prev.athleteGoal, key];
      return { ...prev, athleteGoal };
    });
  };

  const handleCheckboxChange = (field: 'trainsGi' | 'trainsNoGi' | 'isCompetitor') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const calculateCalories = () => {
    const weight = parseFloat(formData.weight) || 70;
    const height = parseFloat(formData.height) || 175;
    const age = parseFloat(formData.age) || 25;
    
    let activityFactor = 1.375; // Moderate/default
    if (formData.intensityProfile === 'light') activityFactor = 1.2;
    if (formData.intensityProfile === 'strong') activityFactor = 1.55;
    if (formData.intensityProfile === 'competitor' || formData.intensityProfile === 'camp') activityFactor = 1.725;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (formData.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    let tdee = bmr * activityFactor;

    // Ajuste baseado no objetivo
    if (formData.athleteGoal.includes('lose')) {
      tdee *= 0.85; // Déficit
    } else if (formData.athleteGoal.includes('strength')) {
      tdee *= 1.10; // Superávit leve
    }

    return Math.round(tdee);
  };

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Step 1: Register user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: authData.email,
          password: authData.password,
        }),
      })

      if (!registerResponse.ok) {
        const data = await registerResponse.json()
        setError(data.error || 'Erro ao registrar')
        setLoading(false)
        return
      }

      // Step 2: Login automatically
      const loginResult = await signIn('credentials', {
        email: authData.email,
        password: authData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        setError('Erro ao fazer login automático')
        setLoading(false)
        return
      }

      // Step 3: Complete onboarding with athlete and jiu-jitsu profiles
      await fetch('/api/onboarding/complete', {
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

      // Step 4: Create competition if provided
      if (formData.competitionName && formData.competitionDate) {
        await fetch('/api/competitions', {
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
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao completar cadastro')
      setLoading(false)
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name.length > 0 && 
             authData.email.length > 0 && 
             authData.password.length >= 6 &&
             formData.age && 
             formData.weight && 
             formData.height;
    }
    if (step === 2) {
      return formData.belt && formData.weeklyFrequency > 0;
    }
    if (step === 3) {
      return formData.athleteGoal.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 bg-zinc-950 border border-purple-500/20 shadow-xl shadow-purple-500/5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-1">
              HBJJ — Saúde & Jiu-Jitsu
            </h1>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Onboarding do Atleta
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Etapa {step} de 4
              </span>
              <span className="text-[10px] font-bold text-purple-400">
                {Math.round((step / 4) * 100)}%
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Step Wrapper with AnimatePresence */}
          <div className="min-h-[320px]">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Dados Pessoais & Físicos
                </h3>
                <Input
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome ou apelido de tatame"
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
                
                <Input
                  label="Senha"
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Gênero</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, gender: 'male' })}
                        className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          formData.gender === 'male'
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        Masculino
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, gender: 'female' })}
                        className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          formData.gender === 'female'
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        Feminino
                      </button>
                    </div>
                  </div>
                  <Input
                    label="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Idade"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                    required
                  />
                  <Input
                    label="Peso (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="80"
                    required
                  />
                  <Input
                    label="Altura (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="178"
                    required
                  />
                </div>
                
                <Input
                  label="Peso Desejado / Meta (kg)"
                  type="number"
                  value={formData.desiredWeight}
                  onChange={(e) => setFormData({ ...formData, desiredWeight: e.target.value })}
                  placeholder="Ex: 77"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Perfil no Jiu-Jitsu
                </h3>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Sua Faixa Atual</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BJJ_BELTS.map((b) => (
                      <button
                        key={b.key}
                        onClick={() => setFormData({ ...formData, belt: b.key as any })}
                        className={`py-2 px-1 rounded-lg border-2 text-[10px] font-black transition-all text-center ${b.color} ${
                          formData.belt === b.key ? 'ring-2 ring-purple-450 scale-105' : 'opacity-65'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Modalidade</label>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trainsGi}
                          onChange={() => handleCheckboxChange('trainsGi')}
                          className="accent-purple-500 w-4 h-4"
                        />
                        Treina Gi (Kimono)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trainsNoGi}
                          onChange={() => handleCheckboxChange('trainsNoGi')}
                          className="accent-purple-500 w-4 h-4"
                        />
                        Treina No-Gi
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center justify-between">
                      <span>Treinos/Semana</span>
                      <span className="text-purple-400 font-extrabold">{formData.weeklyFrequency}x</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={formData.weeklyFrequency}
                      onChange={(e) => setFormData({ ...formData, weeklyFrequency: parseInt(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer bg-zinc-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Academia / Equipe"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Ex: Alliance, Gracie"
                  />
                  <Input
                    label="Categoria de Peso (IBJJF)"
                    value={formData.weightClass}
                    onChange={(e) => setFormData({ ...formData, weightClass: e.target.value })}
                    placeholder="Ex: Médio, Leve"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <input
                    type="checkbox"
                    id="isCompetitor"
                    checked={formData.isCompetitor}
                    onChange={() => handleCheckboxChange('isCompetitor')}
                    className="accent-purple-500 w-5 h-5 cursor-pointer"
                  />
                  <label htmlFor="isCompetitor" className="text-xs font-bold text-zinc-200 cursor-pointer">
                    Eu pretendo competir / Sou competidor ativo
                  </label>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Objetivos & Intensidade
                </h3>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Seus Objetivos Principais (Selecione todos os aplicáveis)</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                    {GOAL_OPTIONS.map((o) => {
                      const selected = formData.athleteGoal.includes(o.key);
                      return (
                        <button
                          key={o.key}
                          onClick={() => toggleGoal(o.key)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            selected
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                              : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Perfil de Intensidade</label>
                  <div className="space-y-2">
                    {INTENSITY_PROFILES.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setFormData({ ...formData, intensityProfile: p.key as any })}
                        className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          formData.intensityProfile === p.key
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                            : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Próximo Campeonato (Foco principal)
                </h3>
                
                <p className="text-zinc-450 text-[10px] leading-relaxed">
                  Definir sua meta de campeonato ajuda a IA a ajustar o peso limite, a contagem de carboidratos, calorias e intensidade dos treinos semana a semana.
                </p>

                <Input
                  label="Nome do Campeonato"
                  value={formData.competitionName}
                  onChange={(e) => setFormData({ ...formData, competitionName: e.target.value })}
                  placeholder="Ex: IBJJF World Championship"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Data da Competição"
                    type="date"
                    value={formData.competitionDate}
                    onChange={(e) => setFormData({ ...formData, competitionDate: e.target.value })}
                  />
                  <Input
                    label="Peso Limite da Categoria (kg)"
                    type="number"
                    value={formData.competitionWeightLimit}
                    onChange={(e) => setFormData({ ...formData, competitionWeightLimit: e.target.value })}
                    placeholder="Ex: 82.3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Prioridade</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFormData({ ...formData, competitionPriority: p as any })}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                          formData.competitionPriority === p
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta!'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-900">
            {step > 1 && (
              <Button
                variant="outline"
                full
                onClick={() => setStep(step - 1)}
              >
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button
                full
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
              >
                Próximo
              </Button>
            ) : (
              <Button
                full
                onClick={handleSubmit}
                disabled={!isStepValid()}
              >
                Finalizar Cadastro
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
