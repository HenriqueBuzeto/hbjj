'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, LogOut, Settings, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PerfilPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { user, setUser } = useAppContext();
  const queryClient = useQueryClient();

  // Buscar dados do perfil
  const { data: athleteData } = useQuery({
    queryKey: ['athlete-profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile/athlete');
      if (!res.ok) throw new Error('Failed to fetch athlete profile');
      return res.json();
    },
    enabled: !!session,
  });

  const { data: jiuJitsuData } = useQuery({
    queryKey: ['jiu-jitsu-profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile/jiu-jitsu');
      if (!res.ok) throw new Error('Failed to fetch jiu-jitsu profile');
      return res.json();
    },
    enabled: !!session,
  });

  // Logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleResetProfile = () => {
    // Reset user to default or trigger registration flow
    if (confirm("Deseja refazer o onboarding e resetar seu perfil de atleta?")) {
      setUser({
        name: "Usuário",
        gender: "male",
        age: 25,
        weight: 70,
        height: 175,
        neck: 35,
        waist: 80,
        hip: 95,
        activity: "moderate",
        goal: "lose",
        level: 1,
        xp: 0,
        nextLevelXp: 150,
        streak: 0,
        caloriesGoal: 2000,
      });
      window.location.href = "/signup";
    }
  };

  return (
    <MainLayout>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="text-purple-500" />
            Perfil do Atleta
          </h1>
        </motion.div>

        {/* User Info Details Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-950 border border-zinc-800 p-5 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border-4 border-purple-500 overflow-hidden shadow-lg shadow-purple-500/10">
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.name || 'hbjj'}&backgroundColor=09090b`} 
                  alt={`Avatar de ${user.name}`}
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-600 border border-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                Lvl {user.level}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-black text-white">{user.name}</h2>
              <p className="text-zinc-500 text-xs mt-0.5">{user.city || 'Cidade não cadastrada'}</p>
            </div>

            {user.belt && (
              <span className={`px-4 py-1 text-xs font-black rounded-full border uppercase ${
                user.belt === 'white' ? 'bg-white text-black border-zinc-300' :
                user.belt === 'blue' ? 'bg-blue-600 text-white border-blue-400' :
                user.belt === 'purple' ? 'bg-purple-600 text-white border-purple-400' :
                user.belt === 'brown' ? 'bg-amber-800 text-white border-amber-600' :
                'bg-red-600 text-white border-red-500'
              }`}>
                Faixa {user.belt === 'white' ? 'Branca' : user.belt === 'blue' ? 'Azul' : user.belt === 'purple' ? 'Roxa' : user.belt === 'brown' ? 'Marrom' : 'Preta'}
              </span>
            )}
          </Card>
        </motion.div>

        {/* Jiu-Jitsu Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} />
            Ficha do Tatame
          </h3>
          <Card className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Equipe / Academia</span>
              <span className="text-white font-extrabold">{user.team || '--'}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Professor</span>
              <span className="text-white font-extrabold">{user.professor || '--'}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Frequência Semanal</span>
              <span className="text-white font-extrabold">{user.weeklyFrequency ? `${user.weeklyFrequency}x por semana` : '--'}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Categoria de Peso</span>
              <span className="text-white font-extrabold">{user.weightClass || '--'}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-zinc-500 font-bold">Treinos Específicos</span>
              <span className="text-white font-extrabold">
                {user.trainsGi ? 'Gi (Kimono)' : ''} {user.trainsNoGi ? 'No-Gi (Sem Kimono)' : ''}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Goals & Targets Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-xs font-extrabold text-pink-400 uppercase tracking-widest flex items-center gap-2">
            <Target size={14} />
            Metas de Peso & Preparação
          </h3>
          <Card className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Peso Atual</span>
              <span className="text-white font-extrabold">{user.weight} kg</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Peso Desejado (Foco)</span>
              <span className="text-white font-extrabold">{user.desiredWeight ? `${user.desiredWeight} kg` : '--'}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-bold">Campeonato Cadastrado</span>
              <span className="text-white font-extrabold">{user.competitionName || 'Nenhum'}</span>
            </div>
            {user.competitionWeightLimit && (
              <div className="flex justify-between text-xs py-1">
                <span className="text-zinc-500 font-bold">Peso Limite do Campeonato</span>
                <span className="text-purple-400 font-extrabold">{user.competitionWeightLimit} kg</span>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Unlocked Badges / Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-2">
              <Award size={14} />
              Medalhas Conquistadas
            </h3>
            <Link href="/gamificacao" className="text-[10px] font-black uppercase text-purple-400 hover:underline">Ver Todas</Link>
          </div>
          <Card className="bg-zinc-950 border border-zinc-800 p-4">
            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {user.badges.map((bId) => {
                  const badgeMap: Record<string, { title: string; icon: string }> = {
                    'consistent': { title: 'Consistente', icon: '🥋' },
                    'weight-focus': { title: 'Foco no Peso', icon: '⚖️' },
                    'open-match': { title: 'Rei do Open', icon: '🔥' },
                    'mind-blinded': { title: 'Blindado', icon: '🧠' },
                    'gas-comp': { title: 'Super Gás', icon: '⚡' },
                    'elite': { title: 'Elite BJJ', icon: '👑' },
                  };
                  const currentBadge = badgeMap[bId] || { title: 'Conquista', icon: '🏆' };
                  return (
                    <div key={bId} className="flex flex-col items-center text-center p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <span className="text-2xl mb-1">{currentBadge.icon}</span>
                      <span className="text-[9px] font-black text-white uppercase tracking-tight truncate w-full">{currentBadge.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 text-center py-2">Nenhuma medalha conquistada ainda. Complete missões para desbloquear!</p>
            )}
          </Card>
        </motion.div>

        {/* Controls & Options */}
        <div className="space-y-2 pt-4">
          <Button
            variant="outline"
            full
            onClick={handleResetProfile}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-950/20 text-xs font-bold"
          >
            <Settings size={14} className="mr-2" />
            Configurar / Refazer Onboarding
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PerfilPage;
