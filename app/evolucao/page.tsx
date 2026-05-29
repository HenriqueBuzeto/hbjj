'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Activity, Camera, ChevronRight, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';

const EvolucaoPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { dailyData, user, addEvolutionPhoto, showNotification } = useAppContext();
  const queryClient = useQueryClient();
  
  const [selectedPhotoWeek, setSelectedPhotoWeek] = useState(1);
  const [activePhotoType, setActivePhotoType] = useState<'front' | 'side' | 'back'>('front');

  // Buscar dados de progresso
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const res = await fetch('/api/progress?days=30');
      if (!res.ok) throw new Error('Failed to fetch progress');
      return res.json();
    },
    enabled: !!session,
  });

  // Upload de foto
  const uploadPhoto = useMutation({
    mutationFn: async (data: { file: File; photoType: string; progressLogId: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('photoType', data.photoType);
      formData.append('progressLogId', data.progressLogId);

      const res = await fetch('/api/progress/photos', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload photo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      showNotification('Foto adicionada com sucesso!', 'success');
    },
  });

  if (!session) {
    router.push('/login');
    return null;
  }

  const progressLogs = progressData?.progressLogs || [];

  // Athlete weight progression mock
  const weeklyData = [
    { day: 'Seg', weight: 81.2 },
    { day: 'Ter', weight: 80.9 },
    { day: 'Qua', weight: 80.8 },
    { day: 'Qui', weight: 80.5 },
    { day: 'Sex', weight: 80.2 },
    { day: 'Sáb', weight: 80.1 },
    { day: 'Dom', weight: user.weight },
  ];

  const handleSimulatePhotoUpload = (type: 'front' | 'side' | 'back') => {
    // Simulate real local upload of photos
    const urls = {
      front: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80",
      side: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&q=80",
      back: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=300&q=80"
    };
    addEvolutionPhoto(type, urls[type], 2); // Save to Week 2
  };

  const currentPhotos = useMemo(() => {
    return user.photos?.find(p => p.week === selectedPhotoWeek) || { week: selectedPhotoWeek };
  }, [user.photos, selectedPhotoWeek]);

  const basePhotos = useMemo(() => {
    return user.photos?.find(p => p.week === 1) || { week: 1 };
  }, [user.photos]);

  return (
    <MainLayout>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="text-purple-500" />
            Evolução Física
          </h1>
          <p className="text-zinc-400 text-xs">
            Controle métrico de peso e histórico visual de corte de gordura para o campeonato
          </p>
        </motion.div>

        {/* Weight Tracker Header Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-zinc-950 border border-zinc-800 p-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Peso Atual</p>
            <p className="text-2xl font-black text-white mt-1">
              {user.weight} <span className="text-xs font-semibold text-zinc-500">kg</span>
            </p>
            <p className="text-[10px] text-purple-400 font-bold mt-1 uppercase tracking-wider">
              Categoria: {user.competitionWeightLimit} kg
            </p>
          </Card>
          
          <Card className="bg-zinc-950 border border-zinc-800 p-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Falta Cortar</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {Number((user.weight - (user.competitionWeightLimit || 0)).toFixed(1))} <span className="text-xs font-semibold text-zinc-500">kg</span>
            </p>
            <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Meta: {user.desiredWeight} kg</p>
          </Card>
        </div>

        {/* Weekly Weight Line Chart */}
        {progressLogs.length === 0 ? (
          <EmptyState
            type="evolution"
            action={() => {/* TODO: Adicionar modal para registrar peso */}}
            actionLabel="Registrar peso da semana"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-zinc-950 border border-zinc-800 p-4">
              <h3 className="font-bold text-xs text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Target size={14} className="text-purple-500" />
                Evolução do Peso (Semana do Camp)
              </h3>
              <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#374151', color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
        )}

        {/* SaaS Premium Feature: Weekly BJJ Photo Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Camera size={15} className="text-purple-500" />
            Registro Visual do Camp (Foto Comparação)
          </h3>

          <Card className="bg-zinc-950 border border-zinc-800 p-4 space-y-4">
            {/* View Selector Controls */}
            <div className="flex gap-1.5 border-b border-zinc-900 pb-2">
              {(['front', 'side', 'back'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActivePhotoType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                    activePhotoType === t
                      ? 'bg-purple-950/60 border-purple-500/30 text-purple-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {t === 'front' ? 'Frente' : t === 'side' ? 'Lado' : 'Costas'}
                </button>
              ))}
            </div>

            {/* Photo comparator frame */}
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Semana 1 (Base) */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase">Semana 1 (Base)</span>
                <div className="relative h-44 rounded-xl border border-zinc-900 overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {basePhotos[activePhotoType] ? (
                    <img src={basePhotos[activePhotoType]} alt="Semana 1" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-650">Nenhuma foto</span>
                  )}
                </div>
              </div>

              {/* Semana Atual (Pico) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase">Semana 2 (Pico)</span>
                  <button 
                    onClick={() => handleSimulatePhotoUpload(activePhotoType)}
                    className="text-[8px] font-black uppercase text-purple-400 hover:text-purple-300"
                  >
                    Upload
                  </button>
                </div>
                <div className="relative h-44 rounded-xl border border-zinc-900 overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {currentPhotos[activePhotoType] ? (
                    <img src={currentPhotos[activePhotoType]} alt="Semana Atual" className="w-full h-full object-cover" />
                  ) : (
                    <button 
                      onClick={() => handleSimulatePhotoUpload(activePhotoType)}
                      className="text-zinc-600 hover:text-purple-450 flex flex-col items-center gap-1.5 transition-all focus:outline-none"
                    >
                      <Camera size={24} />
                      <span className="text-[9px] font-black uppercase">Registrar Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-550 leading-relaxed text-center">
              Recomendado tirar fotos de jejum toda sexta de manhã sob a mesma iluminação do tatame.
            </p>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default EvolucaoPage;
