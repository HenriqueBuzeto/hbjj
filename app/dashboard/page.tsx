'use client';

import React, { useMemo } from 'react';
import { 
  Flame, CheckCircle, Activity, Utensils, Droplets, Moon, Trophy, Calendar, Target, Award, Shield, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '@/components/ui/EmptyState';

const DashboardPage = () => {
  const router = useRouter();
  const { user: contextUser, dailyData } = useAppContext();

  // Buscar dados reais das APIs
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });

  const userId = userData?.user?.id;

  const { data: campData } = useQuery({
    queryKey: ['camp', 'active', userId],
    queryFn: async () => {
      const res = await fetch('/api/camp/active');
      if (!res.ok) throw new Error('Failed to fetch camp');
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: missionsData } = useQuery({
    queryKey: ['missions', 'today', userId],
    queryFn: async () => {
      const res = await fetch('/api/missions/today');
      if (!res.ok) throw new Error('Failed to fetch missions');
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: gamificationData } = useQuery({
    queryKey: ['gamification', userId],
    queryFn: async () => {
      const res = await fetch('/api/gamification');
      if (!res.ok) throw new Error('Failed to fetch gamification');
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: readinessData } = useQuery({
    queryKey: ['readiness', 'today', userId],
    queryFn: async () => {
      const res = await fetch('/api/readiness/today');
      if (!res.ok) throw new Error('Failed to fetch readiness');
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: planData } = useQuery({
    queryKey: ['athlete-plan', 'current', userId],
    queryFn: async () => {
      const res = await fetch('/api/athlete-plan/current');
      if (!res.ok) throw new Error('Failed to fetch athlete plan');
      return res.json();
    },
    enabled: !!userId,
  });

  // Usar dados reais das APIs
  const user = userData?.user;
  const camp = campData?.camp;
  const missions = missionsData?.missions || [];
  const gamification = gamificationData?.profile;
  const readiness = readinessData?.readinessLog;
  const athletePlan = planData?.plan;

  // Camp Phase calculations
  const campInfo = useMemo(() => {
    if (!camp || !camp.competition) return null;

    const compDate = new Date(camp.competition.eventDate);
    const today = new Date();
    const diffTime = compDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);

    let phase = 'Base / Construção';
    let phaseDesc = 'Treinos longos de Gi/No-Gi, volume alto de musculação.';
    let weekProgress = 25;

    if (weeks <= 1) {
      phase = 'Deload / Descanso Ativo';
      phaseDesc = 'Volume baixo, sem sparring forte, foco em bater peso.';
      weekProgress = 100;
    } else if (weeks <= 2) {
      phase = 'Pico de Sparring';
      phaseDesc = 'Simulação de luta com tempo real, ritmo de competição.';
      weekProgress = 85;
    } else if (weeks <= 4) {
      phase = 'Intensificação / Quedas';
      phaseDesc = 'Foco em força de pegada, entradas explosivas de quedas.';
      weekProgress = 60;
    }

    return {
      phase,
      phaseDesc,
      weekProgress,
      weeksRemaining: weeks > 0 ? weeks : 0,
      daysRemaining: diffDays > 0 ? diffDays : 0
    };
  }, [camp]);

  // Combat Readiness Calculations
  const combatReadiness = useMemo(() => {
    if (!readiness) {
      // Fallback para mock se não tiver readiness real
      const recovery = user?.recoveryScore || 82;
      const gas = 82; 
      const force = 76;
      const mobility = 90;
      const weightDiff = (user?.athleteProfile?.weightKg || 88) - (camp?.competition?.weightLimitKg || 82);
      const weightReadiness = Math.max(50, Math.min(100, Math.round(100 - (weightDiff > 0 ? weightDiff * 6 : 0))));
      const overall = Math.round((recovery + gas + force + mobility + weightReadiness) / 5);
      return { recovery, gas, force, mobility, weightReadiness, overall };
    }

    // Usar dados reais de readiness
    const recovery = readiness.recoveryScore || 82;
    const gas = readiness.gasScore || 82;
    const force = readiness.strengthScore || 76;
    const mobility = readiness.mobilityScore || 90;
    const weightReadiness = readiness.weightScore || 80;
    const overall = readiness.overallScore || Math.round((recovery + gas + force + mobility + weightReadiness) / 5);

    return {
      recovery,
      gas,
      force,
      mobility,
      weightReadiness,
      overall
    };
  }, [readiness, user, camp]);

  // Loading state
  if (status === 'loading' || isLoadingUser) {
    return (
      <MainLayout>
        <div className="p-5 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </MainLayout>
    );
  }

  // If user doesn't have a belt, onboarding is needed
  const needsOnboarding = !user?.jiuJitsuProfile?.belt;

  if (!user) {
    return (
      <MainLayout>
        <div className="p-5 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </MainLayout>
    );
  }

  if (needsOnboarding) {
    return (
      <MainLayout>
        <div className="p-5 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Complete seu onboarding</h1>
            <p className="text-zinc-400">Por favor, complete seu perfil para acessar o dashboard.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-zinc-800 border border-purple-500 overflow-hidden shadow-md">
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'hbjj'}&backgroundColor=09090b`} 
                  alt={`Avatar`}
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-[9px] font-black px-1.5 py-0.5 rounded text-white border border-black shadow">
                Lvl {gamification?.level || user?.level || 1}
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-white text-sm leading-none mb-1 flex items-center gap-1.5">
                Olá, {user?.name || 'Atleta'} 
                {user?.jiuJitsuProfile?.belt && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${
                    user.jiuJitsuProfile.belt === 'white' ? 'bg-white text-black border-zinc-300' :
                    user.jiuJitsuProfile.belt === 'blue' ? 'bg-blue-600 text-white border-blue-400' :
                    user.jiuJitsuProfile.belt === 'purple' ? 'bg-purple-600 text-white border-purple-400' :
                    user.jiuJitsuProfile.belt === 'brown' ? 'bg-amber-800 text-white border-amber-600' :
                    'bg-red-600 text-white border-red-500'
                  }`}>
                    Faixa {user.jiuJitsuProfile.belt === 'white' ? 'Branca' : user.jiuJitsuProfile.belt === 'blue' ? 'Azul' : user.jiuJitsuProfile.belt === 'purple' ? 'Roxa' : user.jiuJitsuProfile.belt === 'brown' ? 'Marrom' : 'Preta'}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{user?.jiuJitsuProfile?.team || 'Academia'}</p>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <Link href="/gamificacao">
              <div className="bg-zinc-950 border border-zinc-850 hover:border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center shadow-md cursor-pointer uppercase tracking-wider">
                <img src="/logo.png" alt="HBJJ Logo" className="w-3 h-3 mr-1 object-contain animate-pulse" /> 
                Streak: {gamification?.currentStreak || user?.streak || 0}
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Athlete Plan Summary Card */}
        {athletePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="bg-zinc-950 border border-purple-500/15 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black text-purple-450 uppercase tracking-widest">Seu Plano Personalizado</span>
                  <h3 className="text-sm font-extrabold text-white mt-0.5">{athletePlan.planType === 'competitor_with_weight_cut' ? 'Competidor com Corte' : athletePlan.planType === 'competitor_no_weight_cut' ? 'Competidor Performance' : athletePlan.planType === 'weight_loss' ? 'Emagrecimento' : athletePlan.planType === 'hobby' ? 'Hobby/Saúde' : 'Manutenção'}</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">{athletePlan.summary}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                  athletePlan.riskLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  athletePlan.riskLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {athletePlan.riskLevel === 'high' ? 'Alto Risco' : athletePlan.riskLevel === 'moderate' ? 'Risco Moderado' : 'Baixo Risco'}
                </div>
              </div>

              {/* Quick targets */}
              {athletePlan.targets && athletePlan.targets.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {athletePlan.targets.slice(0, 3).map((target: any, idx: number) => (
                    <div key={idx} className="bg-zinc-900/50 rounded-lg p-2 text-center">
                      <span className="text-[8px] font-bold text-zinc-500 block uppercase">{target.targetType}</span>
                      <span className="text-xs font-black text-white">{target.targetValue}{target.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ) : null}

        {/* Camp Inteligente & Phase Visualizer Card */}
        {campInfo ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-zinc-950 border border-purple-500/15 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black text-purple-450 uppercase tracking-widest">Camp Ativo</span>
                  <h3 className="text-sm font-extrabold text-white mt-0.5">{camp?.competition?.name || 'Competição'}</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">{campInfo.phase}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">{campInfo.daysRemaining}</span>
                  <span className="text-[9px] text-zinc-550 block font-bold uppercase leading-none">Dias</span>
                </div>
              </div>

              {/* Weight info */}
              <div className="flex justify-between items-center bg-zinc-900/50 rounded-lg p-2">
                <div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">Peso</span>
                  <div className="text-xs font-bold text-white">
                    {user?.athleteProfile?.weightKg || 88}kg → {camp?.competition?.weightLimitKg || 82}kg
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-red-400">
                    -{Math.round((user?.athleteProfile?.weightKg || 88) - (camp?.competition?.weightLimitKg || 82))}kg
                  </span>
                  <span className="text-[8px] text-zinc-550 block font-bold uppercase leading-none">Faltam</span>
                </div>
              </div>

              {/* Progress timeline bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-550 font-bold uppercase">
                  <span>Início</span>
                  <span>Competição</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${campInfo.weekProgress}%` }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <EmptyState
            type="camp"
            action={() => router.push('/treinos')}
            actionLabel="Criar meu primeiro camp"
          />
        )}

        {/* Combat Readiness Cards Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3.5"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={14} className="text-purple-500 animate-pulse" />
              Combat Readiness (Preparação Geral)
            </h3>
            <span className="text-sm font-black text-purple-450">{combatReadiness.overall}%</span>
          </div>

          <Card className="bg-zinc-950 border border-zinc-850 p-4 space-y-4">
            {/* Visual breakdown grid of readiness */}
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase">Gás</span>
                <div className="text-xs font-black text-white">{combatReadiness.gas}%</div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${combatReadiness.gas}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase">Força</span>
                <div className="text-xs font-black text-white">{combatReadiness.force}%</div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500" style={{ width: `${combatReadiness.force}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase">Mobilid</span>
                <div className="text-xs font-black text-white">{combatReadiness.mobility}%</div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${combatReadiness.mobility}%` }} />
                </div>
              </div>
              <div className="space-y-1 cursor-pointer" onClick={() => router.push('/recovery')}>
                <span className="text-[9px] font-bold text-purple-400 block uppercase">Recovery</span>
                <div className="text-xs font-black text-purple-400">{combatReadiness.recovery}%</div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${combatReadiness.recovery}%` }} />
                </div>
              </div>
              <div className="space-y-1 cursor-pointer" onClick={() => router.push('/evolucao')}>
                <span className="text-[9px] font-bold text-amber-400 block uppercase">Peso</span>
                <div className="text-xs font-black text-amber-400">{combatReadiness.weightReadiness}%</div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${combatReadiness.weightReadiness}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Shortcuts for Recovery Assessment & IA Coach */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            onClick={() => router.push('/recovery')}
            className="bg-zinc-950 border border-zinc-800 hover:border-purple-550/20 p-3.5 space-y-2 cursor-pointer flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-pink-400 uppercase tracking-wider">Recovery Center</span>
              <ChevronRight size={14} className="text-zinc-650" />
            </div>
            <p className="text-xs font-bold text-white leading-snug">Avaliar Prontidão de Luta</p>
            <p className="text-[9px] text-zinc-550 uppercase">Sono, dores e estresse</p>
          </Card>
          
          <Card 
            onClick={() => router.push('/coach')}
            className="bg-zinc-950 border border-zinc-800 hover:border-purple-550/20 p-3.5 space-y-2 cursor-pointer flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-purple-450 uppercase tracking-wider">Assistência IA</span>
              <ChevronRight size={14} className="text-zinc-650" />
            </div>
            <p className="text-xs font-bold text-white leading-snug">Falar com o Coach HBJJ</p>
            <p className="text-[9px] text-zinc-550 uppercase">Ajuste de treino em tempo real</p>
          </Card>
        </div>

        {/* Daily Quests / Missions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-extrabold text-white text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
            <Trophy size={15} className="text-purple-450" /> 
            Missões Diárias
          </h3>
          <div className="space-y-3">
            {dailyData?.quests?.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.08 }}
                className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3 shadow-md"
              >
                <div className="w-9 h-9 bg-purple-950/60 border border-purple-500/20 text-purple-450 rounded-xl flex items-center justify-center text-sm font-black">
                  {q.id}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-white">
                      {q.title}
                    </span>
                    <span className="text-[10px] font-bold text-purple-450">+{q.xp} XP</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((q.current/q.target)*100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className={`
                  w-7 h-7 rounded-xl flex items-center justify-center border transition-all
                  ${q.current >= q.target 
                    ? 'bg-purple-900/30 text-purple-450 border-purple-500/30' 
                    : 'bg-zinc-900 text-zinc-650 border-zinc-800'
                  }
                `}>
                  {q.current >= q.target ? (
                    <CheckCircle size={15} />
                  ) : (
                    <span className="text-[9px] font-black text-purple-400">+{q.xp}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
