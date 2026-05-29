'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Lock, ShieldCheck, Flame, Compass } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';

interface BJJBadge {
  id: string;
  title: string;
  icon: string;
  desc: string;
  req: string;
}

const BADGES_LIST: BJJBadge[] = [
  { id: 'consistent', title: 'Atleta Consistente', icon: '🥋', desc: 'Mantenha a frequência no tatame por 4 semanas seguidas.', req: '30 treinos concluídos' },
  { id: 'weight-focus', title: 'Foco no Peso', icon: '⚖️', desc: 'Mantenha o registro de peso semanal sem furos para a categoria.', req: 'Peso na meta da semana' },
  { id: 'open-match', title: 'Rei do Open Match', icon: '🔥', desc: 'Participe e finalize um rola longo situacional no sábado.', req: 'Sparring específico concluído' },
  { id: 'mind-blinded', title: 'Mente Blindada', icon: '🧠', desc: 'Complete 7 dias consecutivos de check-in fisiológico de recovery.', req: 'Check-in diário no Recovery' },
  { id: 'gas-comp', title: 'Gás de Competidor', icon: '⚡', desc: 'Complete os sprints de HIIT cardio lático na semana do pico.', req: 'Tiro de corrida lático x10' },
  { id: 'elite', title: 'Elite da Categoria', icon: '👑', desc: 'Chegue ao peso limite do campeonato e complete os treinos táticos.', req: 'Campeonato finalizado no peso' },
];

const LEVEL_NAMES = [
  { lvl: 1, name: 'Praticante Recreativo' },
  { lvl: 2, name: 'Competidor Regional' },
  { lvl: 3, name: 'Competidor Estadual' },
  { lvl: 4, name: 'Competidor Nacional' },
  { lvl: 5, name: 'Elite do Tatame' },
];

const GamificacaoPage = () => {
  const { user } = useAppContext();

  const currentLevelName = LEVEL_NAMES.find(l => l.lvl === user.level)?.name || 'Competidor';
  const progressPercent = (user.xp / user.nextLevelXp) * 100;

  return (
    <MainLayout>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="text-purple-500" />
            Graduação & Gamificação
          </h1>
          <p className="text-zinc-400 text-xs">
            Suba de nível e colecione conquistas durante a sua preparação
          </p>
        </motion.div>

        {/* Level Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-950 to-zinc-950 border border-purple-500/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Seu Rank Atual</p>
                <h2 className="text-xl font-black text-white mt-1">{currentLevelName}</h2>
                <p className="text-zinc-400 text-[10px] mt-0.5">Nível {user.level} Ativo</p>
              </div>
              <div className="w-12 h-12 bg-purple-900/60 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center font-black text-lg">
                L{user.level}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-550 font-bold uppercase">
                <span>Progresso XP</span>
                <span>{user.xp} / {user.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Badge Listing */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Award size={16} className="text-purple-500" />
            Suas Medalhas / Badges
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {BADGES_LIST.map((b, index) => {
              const isUnlocked = user.badges?.includes(b.id);

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Card className={`p-4 border flex items-center gap-4 transition-all ${
                    isUnlocked 
                      ? 'bg-zinc-950 border-purple-500/20' 
                      : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                  }`}>
                    {/* Badge Icon circle */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative ${
                      isUnlocked 
                        ? 'bg-purple-950/40 border border-purple-500/20 text-purple-400 shadow-md shadow-purple-550/10' 
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-650'
                    }`}>
                      {b.icon}
                      {!isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 bg-zinc-950 p-0.5 rounded-full border border-zinc-800 text-zinc-650">
                          <Lock size={10} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-white">{b.title}</h4>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isUnlocked 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-650'
                        }`}>
                          {isUnlocked ? 'Desbloqueada' : 'Bloqueada'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-450 mt-1 leading-relaxed">{b.desc}</p>
                      <p className="text-[9px] text-zinc-550 font-bold mt-1.5 uppercase">Requisito: {b.req}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GamificacaoPage;
