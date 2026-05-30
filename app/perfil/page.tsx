'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, LogOut, Settings, Award, Edit2, Save, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PerfilPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Buscar dados do usuário
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });

  const userId = userData?.user?.id;
  const user = userData?.user;

  // Mutation para atualizar usuário
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao atualizar perfil: ' + error.message);
    },
  });

  const handleEdit = () => {
    if (!user) return;
    
    setEditData({
      name: user.name,
      email: user.email,
      belt: user.jiuJitsuProfile?.belt,
      team: user.jiuJitsuProfile?.team,
      professor: user.jiuJitsuProfile?.professor,
      weeklyFrequency: user.jiuJitsuProfile?.weeklyFrequency,
      weightClass: user.jiuJitsuProfile?.weightClass,
      city: user.athleteProfile?.city,
      desiredWeight: user.athleteProfile?.targetWeightKg,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      name: editData.name,
      email: editData.email,
      athleteProfile: {
        city: editData.city,
        targetWeightKg: editData.desiredWeight,
      },
      jiuJitsuProfile: {
        belt: editData.belt,
        team: editData.team,
        professor: editData.professor,
        weeklyFrequency: editData.weeklyFrequency,
        weightClass: editData.weightClass,
      },
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    
    // Clear all TanStack Query cache to prevent data mixing between users
    queryClient.clear();
    
    // Clear localStorage and sessionStorage for HBJJ keys
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('hbjj') || key.toLowerCase().includes('user') || key.toLowerCase().includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('hbjj') || key.toLowerCase().includes('user') || key.toLowerCase().includes('auth')) {
        sessionStorage.removeItem(key);
      }
    });
    
    router.push('/login');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-5 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="p-5 text-center">
          <p className="text-zinc-400">Usuário não encontrado</p>
        </div>
      </MainLayout>
    );
  }

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
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-950/20 text-xs font-bold"
            >
              <Edit2 size={14} className="mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-zinc-500/30 text-zinc-400 hover:bg-zinc-950/20 text-xs font-bold"
              >
                <X size={14} className="mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                <Save size={14} className="mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
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
                Lvl {user.gamificationProfile?.level || 1}
              </div>
            </div>
            
            <div>
              {isEditing && user ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-center font-bold"
                />
              ) : (
                <h2 className="text-lg font-black text-white">{user?.name}</h2>
              )}
              {isEditing && user ? (
                <Input
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="text-center text-xs mt-2"
                />
              ) : (
                <p className="text-zinc-500 text-xs mt-0.5">{user?.email}</p>
              )}
            </div>

            {isEditing && user ? (
              <select
                value={editData.belt}
                onChange={(e) => setEditData({ ...editData, belt: e.target.value })}
                className="px-4 py-1 text-xs font-black rounded-full border uppercase bg-zinc-900 text-white border-zinc-700"
              >
                <option value="white">Branca</option>
                <option value="blue">Azul</option>
                <option value="purple">Roxa</option>
                <option value="brown">Marrom</option>
                <option value="black">Preta</option>
              </select>
            ) : user?.jiuJitsuProfile?.belt && (
              <span className={`px-4 py-1 text-xs font-black rounded-full border uppercase ${
                user?.jiuJitsuProfile?.belt === 'white' ? 'bg-white text-black border-zinc-300' :
                user?.jiuJitsuProfile?.belt === 'blue' ? 'bg-blue-600 text-white border-blue-400' :
                user?.jiuJitsuProfile?.belt === 'purple' ? 'bg-purple-600 text-white border-purple-400' :
                user?.jiuJitsuProfile?.belt === 'brown' ? 'bg-amber-800 text-white border-amber-600' :
                'bg-red-600 text-white border-red-500'
              }`}>
                Faixa {user?.jiuJitsuProfile?.belt === 'white' ? 'Branca' : user?.jiuJitsuProfile?.belt === 'blue' ? 'Azul' : user?.jiuJitsuProfile?.belt === 'purple' ? 'Roxa' : user?.jiuJitsuProfile?.belt === 'brown' ? 'Marrom' : 'Preta'}
              </span>
            )}
          </Card>
        </motion.div>

        {/* Editable Fields */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="bg-zinc-950 border border-purple-500/30 p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">Informações Pessoais</h3>
              
              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Cidade</label>
                <Input
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Peso Desejado (kg)</label>
                <Input
                  type="number"
                  value={editData.desiredWeight}
                  onChange={(e) => setEditData({ ...editData, desiredWeight: parseFloat(e.target.value) })}
                />
              </div>
            </Card>

            <Card className="bg-zinc-950 border border-purple-500/30 p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">Informações do Tatame</h3>
              
              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Equipe / Academia</label>
                <Input
                  value={editData.team}
                  onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                />
              </div>

              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Professor</label>
                <Input
                  value={editData.professor}
                  onChange={(e) => setEditData({ ...editData, professor: e.target.value })}
                />
              </div>

              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Frequência Semanal</label>
                <select
                  value={editData.weeklyFrequency}
                  onChange={(e) => setEditData({ ...editData, weeklyFrequency: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-700 bg-zinc-900 text-white"
                >
                  <option value={1}>1x por semana</option>
                  <option value={2}>2x por semana</option>
                  <option value={3}>3x por semana</option>
                  <option value={4}>4x por semana</option>
                  <option value={5}>5x por semana</option>
                  <option value={6}>6x por semana</option>
                  <option value={7}>7x por semana</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 text-xs font-bold block mb-1">Categoria de Peso</label>
                <select
                  value={editData.weightClass}
                  onChange={(e) => setEditData({ ...editData, weightClass: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-700 bg-zinc-900 text-white"
                >
                  <option value="">Selecione</option>
                  <option value="Pena">Pena</option>
                  <option value="Leve">Leve</option>
                  <option value="Médio">Médio</option>
                  <option value="Meio-Pesado">Meio-Pesado</option>
                  <option value="Pesado">Pesado</option>
                  <option value="Super-Pesado">Super-Pesado</option>
                  <option value="Absoluto">Absoluto</option>
                </select>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Jiu-Jitsu Info Grid */}
        {!isEditing && (
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
                <span className="text-white font-extrabold">{user.jiuJitsuProfile?.team || '--'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
                <span className="text-zinc-500 font-bold">Professor</span>
                <span className="text-white font-extrabold">{user.jiuJitsuProfile?.professor || '--'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
                <span className="text-zinc-500 font-bold">Frequência Semanal</span>
                <span className="text-white font-extrabold">{user.jiuJitsuProfile?.weeklyFrequency ? `${user.jiuJitsuProfile.weeklyFrequency}x por semana` : '--'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
                <span className="text-zinc-500 font-bold">Categoria de Peso</span>
                <span className="text-white font-extrabold">{user.jiuJitsuProfile?.weightClass || '--'}</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-zinc-500 font-bold">Treinos Específicos</span>
                <span className="text-white font-extrabold">
                  {user.jiuJitsuProfile?.trainsGi ? 'Gi (Kimono)' : ''} {user.jiuJitsuProfile?.trainsNoGi ? 'No-Gi (Sem Kimono)' : ''}
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Goals & Targets Info */}
        {!isEditing && (
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
                <span className="text-white font-extrabold">{user.athleteProfile?.weightKg} kg</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
                <span className="text-zinc-500 font-bold">Peso Desejado (Foco)</span>
                <span className="text-white font-extrabold">{user.athleteProfile?.targetWeightKg ? `${user.athleteProfile.targetWeightKg} kg` : '--'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-zinc-900">
                <span className="text-zinc-500 font-bold">Cidade</span>
                <span className="text-white font-extrabold">{user.athleteProfile?.city || '--'}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Controls & Options */}
        <div className="space-y-2 pt-4">
          <Button
            variant="outline"
            full
            onClick={() => {
              // Emergency clear session and cache
              Object.keys(localStorage).forEach(key => {
                if (key.toLowerCase().includes('hbjj') || key.toLowerCase().includes('user') || key.toLowerCase().includes('auth')) {
                  localStorage.removeItem(key);
                }
              });
              Object.keys(sessionStorage).forEach(key => {
                if (key.toLowerCase().includes('hbjj') || key.toLowerCase().includes('user') || key.toLowerCase().includes('auth')) {
                  sessionStorage.removeItem(key);
                }
              });
              queryClient.clear();
              handleLogout();
            }}
            className="border-orange-500/30 text-orange-400 hover:bg-orange-950/20 text-xs font-bold"
          >
            <Settings size={14} className="mr-2" />
            Limpar Sessão e Entrar Novamente
          </Button>
          <Button
            variant="outline"
            full
            onClick={handleLogout}
            className="border-red-500/30 text-red-400 hover:bg-red-950/20 text-xs font-bold"
          >
            <LogOut size={14} className="mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PerfilPage;
