'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Flame, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { WORKOUTS_DB } from '@/data/mockData';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';

const TrainPage = () => {
  const { addXP, showNotification } = useAppContext();
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  const categories = ['Todos', ...Array.from(new Set(WORKOUTS_DB.map(w => w.category)))];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredWorkouts = selectedCategory === 'Todos'
    ? WORKOUTS_DB
    : WORKOUTS_DB.filter(w => w.category === selectedCategory);

  const handleStartWorkout = (workout: any) => {
    setActiveSession(workout);
    setSelectedWorkout(null);
    showNotification(`Treino "${workout.title}" iniciado!`, 'success');
  };

  const handleFinishWorkout = () => {
    if (activeSession) {
      addXP(50);
      showNotification(`Treino concluído! +50 XP`, 'success');
      setActiveSession(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'fácil': return 'success';
      case 'médio': return 'info';
      case 'intermediário': return 'info';
      case 'difícil': return 'warning';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Treinos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Escolha seu treino e comece agora
          </p>
        </motion.div>

        {/* Active Session */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-vbGreen to-[#5cBf42] rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-xs font-bold uppercase mb-1">
                  Treino em Andamento
                </p>
                <h2 className="text-2xl font-bold">{activeSession.title}</h2>
              </div>
              <Flame size={32} className="text-yellow-300 animate-pulse" aria-hidden="true" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                <span className="text-sm">{activeSession.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={16} aria-hidden="true" />
                <span className="text-sm">{activeSession.kcal} kcal</span>
              </div>
            </div>
            <Button
              variant="dark"
              full
              onClick={handleFinishWorkout}
            >
              Finalizar Treino
            </Button>
          </motion.div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
                transition-colors focus:outline-none focus:ring-2 focus:ring-vbGreen
                ${selectedCategory === cat
                  ? 'bg-vbGreen text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                onClick={() => setSelectedWorkout(workout)}
                className="p-0 overflow-hidden"
              >
                <div className="relative h-40">
                  <Image
                    src={workout.image}
                    alt={workout.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={getLevelColor(workout.level)} size="sm">
                      {workout.level}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                    {workout.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {workout.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} aria-hidden="true" />
                        {workout.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={14} aria-hidden="true" />
                        {workout.kcal} kcal
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartWorkout(workout);
                      }}
                      className="px-4 py-2 text-sm"
                    >
                      <Play size={16} className="mr-1" aria-hidden="true" />
                      Iniciar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Workout Detail Modal */}
        <Modal
          isOpen={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          title={selectedWorkout?.title}
          size="lg"
        >
          {selectedWorkout && (
            <div className="p-6 space-y-4">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={selectedWorkout.image}
                  alt={selectedWorkout.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
              <div className="flex gap-4">
                <Badge variant={getLevelColor(selectedWorkout.level)}>
                  {selectedWorkout.level}
                </Badge>
                <Badge variant="info">{selectedWorkout.category}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedWorkout.description}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Clock size={24} className="mx-auto mb-2 text-gray-400" aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {selectedWorkout.duration}
                  </p>
                  <p className="text-xs text-gray-500">Duração</p>
                </div>
                <div className="text-center">
                  <Flame size={24} className="mx-auto mb-2 text-orange-400" aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {selectedWorkout.kcal}
                  </p>
                  <p className="text-xs text-gray-500">Calorias</p>
                </div>
                <div className="text-center">
                  <TrendingUp size={24} className="mx-auto mb-2 text-vbGreen" aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    +50 XP
                  </p>
                  <p className="text-xs text-gray-500">Experiência</p>
                </div>
              </div>
              <Button
                full
                onClick={() => {
                  handleStartWorkout(selectedWorkout);
                }}
              >
                <Play size={18} className="mr-2" aria-hidden="true" />
                Iniciar Treino
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TrainPage;
