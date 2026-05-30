'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Flame, ShieldAlert, HeartPulse, Sparkles, BookOpen, Film, Trophy } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface TechnicalVideo {
  id: string;
  title: string;
  category: 'Passagem' | 'Quedas' | 'Guarda' | 'Fisiologia/Gás';
  instructor: string;
  youtubeId: string;
}

const VIDEOS_DB: TechnicalVideo[] = [
  { id: '1', title: 'Passagem Leg Drag Moderna - Detalhes e Ajustes', category: 'Passagem', instructor: 'Leandro Lo Study', youtubeId: 'dQw4w9WgXcQ' },
  { id: '2', title: 'Double Leg Perfeito no Jiu-Jitsu / No-Gi', category: 'Quedas', instructor: 'Mendes Bros Classic', youtubeId: 'dQw4w9WgXcQ' },
  { id: '3', title: 'Respiração e Controle Fisiológico de Gás na Luta', category: 'Fisiologia/Gás', instructor: 'Dr. Andrew Huberman BJJ', youtubeId: 'dQw4w9WgXcQ' },
  { id: '4', title: 'Manutenção de Guarda De la Riva e Transição de Raspagem', category: 'Guarda', instructor: 'Miyao Bros Technical', youtubeId: 'dQw4w9WgXcQ' },
];

const TreinosPage = () => {
  const router = useRouter();
  
  const { addXP, showNotification } = useAppContext();
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Buscar camp ativo
  const { data: campData, isLoading: isLoadingCamp } = useQuery({
    queryKey: ['camp', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/camp/active');
      if (!res.ok) throw new Error('Failed to fetch camp');
      return res.json();
    },
    
  });

  // Buscar sessões de treino
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: async () => {
      const campId = campData?.camp?.id;
      const url = campId ? `/api/training-sessions?campId=${campId}` : '/api/training-sessions';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    
  });

  // Completar sessão de treino
  const completeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/training-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caloriesBurned: 500 }),
      });
      if (!res.ok) throw new Error('Failed to complete session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      showNotification('Sessão concluída com sucesso! +100 XP. Oss!', 'success');
      setActiveSession(null);
    },
  });

  // Gerar novo camp
  const generateCamp = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/camp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: null, startDate: new Date().toISOString(), totalWeeks: 8 }),
      });
      if (!res.ok) throw new Error('Failed to generate camp');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camp', 'active'] });
      showNotification('Camp gerado com sucesso!', 'success');
    },
  });

  
    
    
  }

  const camp = campData?.camp;
  const sessions = sessionsData?.sessions || [];

  const handleStartWorkout = (title: string) => {
    setActiveSession(title);
    showNotification(`Sessão de treino "${title}" iniciada! Foco total no tatame.`, 'success');
  };

  const handleFinishWorkout = (sessionId?: string) => {
    if (activeSession && sessionId) {
      completeSession.mutate(sessionId);
    } else if (activeSession) {
      addXP(75);
      showNotification(`Sessão concluída com sucesso! +75 XP. Oss!`, 'success');
      setActiveSession(null);
    }
  };

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
            Camp Planejado BJJ
          </h1>
          <p className="text-zinc-400 text-xs">
            Cronograma tático semanal planejado para sua preparação física e técnica
          </p>
        </motion.div>

        {/* Active Session Log */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl p-5 border border-purple-500/30 text-white shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest block">EM COMBATE / EM ANDAMENTO</span>
                <h3 className="text-base font-extrabold">{activeSession}</h3>
              </div>
              <HeartPulse className="text-pink-400 animate-pulse" size={24} />
            </div>
            
            <p className="text-xs text-zinc-350">
              Mantenha o foco na técnica, respiração controlada e pegadas seguras. Hidrate-se bem.
            </p>

            <Button
              variant="primary"
              full
              onClick={() => handleFinishWorkout()}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2.5"
            >
              Registrar Conclusão (Oss!)
            </Button>
          </motion.div>
        )}

        {/* Weekly Camp Cronograma */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Clock size={15} className="text-purple-500" />
            Cronograma da Semana (Pico de Sparring)
          </h3>

          <div className="space-y-2.5">
            {[
              { day: 'Segunda', am: '12h: Jiu-Jitsu Gi (Sparring 5x6 min)', pm: 'Musculação: Força Máxima & Cadeia Posterior', active: true },
              { day: 'Terça', am: '12h: Jiu-Jitsu Gi (Drills de Toreada)', pm: 'Cardio: 10 Tiros de Sprint de 30s na Esteira', active: true },
              { day: 'Quarta', am: '12h: Jiu-Jitsu Gi (Defesa de Meia-Guarda)', pm: 'Sessão: 20 minutos de Mobilidade de Quadril', active: false },
              { day: 'Quinta', am: '12h: Jiu-Jitsu Gi (Passagem Leg Drag)', pm: 'Musculação: Potência de Pernas & Core Grip', active: true },
              { day: 'Sexta', am: '12h: Jiu-Jitsu No-Gi (Quedas & Wrestling)', pm: 'Recovery: Liberação miofascial e banheira', active: true },
              { day: 'Sábado', am: '10h: Open Match Forte (Rola livre 6x8 min)', pm: 'Post-Treino: Alongamento passivo', active: true },
              { day: 'Domingo', am: 'Descanso Ativo (Caminhada leve)', pm: 'Planejamento Nutricional da Semana', active: false },
            ].map((d, idx) => (
              <Card 
                key={idx}
                className="bg-zinc-950 border border-zinc-800 p-3.5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{d.day}</span>
                    {d.active && <Badge variant="error" size="sm" className="text-[8px] px-1 py-0 shadow-sm uppercase font-black">Luta</Badge>}
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{d.am}</p>
                  <p className="text-[10px] text-zinc-500">{d.pm}</p>
                </div>
                <button
                  onClick={() => handleStartWorkout(`${d.day}: ${d.am}`)}
                  className="bg-zinc-900 border border-zinc-800 text-[10px] font-black px-3 py-2 rounded-xl text-zinc-300 hover:border-purple-500/25 hover:text-purple-400 transition-all uppercase tracking-wider"
                >
                  Iniciar
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Technical Studies */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Film size={15} className="text-purple-500" />
            Vídeos de Estudo Técnico Recomendados
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {VIDEOS_DB.map((v) => (
              <Card 
                key={v.id} 
                className="bg-zinc-950 border border-zinc-800 p-3 flex flex-col justify-between space-y-3 hover:border-purple-500/15 cursor-pointer transition-all"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${v.youtubeId}`, '_blank')}
              >
                <div className="space-y-1">
                  <Badge variant="info" className="bg-purple-950/40 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase">{v.category}</Badge>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mt-1 leading-tight">{v.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-wider pt-2 border-t border-zinc-900">
                  <span>{v.instructor}</span>
                  <Play size={10} className="fill-purple-400 text-purple-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TreinosPage;
