'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Droplets, Trophy, Apple, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import MacroCircle from '@/components/common/MacroCircle';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Café da Manhã', icon: '🌅' },
  { key: 'lunch', label: 'Almoço', icon: '🍽️' },
  { key: 'snack', label: 'Lanche / Pré-Treino', icon: '⚡' },
  { key: 'dinner', label: 'Jantar', icon: '🌙' },
];

const AlimentacaoPage = () => {
  const router = useRouter();
  
  const { dailyData, updateMeal, updateWater, showNotification } = useAppContext();
  const queryClient = useQueryClient();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar dados de nutrição de hoje
  const { data: nutritionData, isLoading } = useQuery({
    queryKey: ['nutrition', 'today'],
    queryFn: async () => {
      const res = await fetch('/api/nutrition/today');
      if (!res.ok) throw new Error('Failed to fetch nutrition');
      return res.json();
    },
  });

  // Adicionar refeição
  const addMeal = useMutation({
    mutationFn: async (mealData: any) => {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });
      if (!res.ok) throw new Error('Failed to add meal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] });
      showNotification('Refeição adicionada com sucesso!', 'success');
    },
  });

  // Adicionar hidratação
  const addHydration = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch('/api/hydration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to add hydration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] });
    },
  });

  const [foods, setFoods] = useState<any[]>([]);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: any) => {
    if (selectedMeal && dailyData) {
      const currentMeals = dailyData.meals[selectedMeal as keyof typeof dailyData.meals] || [];
      updateMeal(selectedMeal, [...currentMeals, food]);
      setIsFoodModalOpen(false);
      setSelectedMeal(null);
      setSearchQuery('');
    }
  };

  const handleRemoveFood = (mealType: string, index: number) => {
    const currentMeals = dailyData.meals[mealType as keyof typeof dailyData.meals] || [];
    updateMeal(mealType, currentMeals.filter((_, i) => i !== index));
  };

  const totalMacros = {
    protein: Object.values(dailyData.meals).flat().reduce((sum, item) => sum + (item.p || 0), 0),
    carbs: Object.values(dailyData.meals).flat().reduce((sum, item) => sum + (item.c || 0), 0),
    fat: Object.values(dailyData.meals).flat().reduce((sum, item) => sum + (item.f || 0), 0),
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
            <Apple className="text-purple-500" />
            Plano Alimentar
          </h1>
          <p className="text-zinc-400 text-xs">
            Alimentação simples, brasileira e focada em performance
          </p>
        </motion.div>

        {/* Macros Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-950 to-zinc-950 text-white border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-purple-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  CALORIAS HOJE
                </p>
                <h2 className="text-3xl font-black text-white">
                  {dailyData.calories}
                  <span className="text-sm font-bold text-purple-400"> / 2200 kcal</span>
                </h2>
              </div>
            </div>
            <div className="flex justify-around pt-2 border-t border-zinc-900">
              <MacroCircle
                label="Proteína"
                val={totalMacros.protein}
                max={140}
                color="#a855f7"
              />
              <MacroCircle
                label="Carbs"
                val={totalMacros.carbs}
                max={220}
                color="#ec4899"
              />
              <MacroCircle
                label="Gordura"
                val={totalMacros.fat}
                max={70}
                color="#6366f1"
              />
            </div>
          </Card>
        </motion.div>

        {/* Water Intake */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-950/60 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  <Droplets size={20} className="text-purple-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Controle de Hidratação
                  </p>
                  <p className="text-sm font-black text-purple-300 mt-0.5">
                    {dailyData.water}ml <span className="text-xs font-medium text-zinc-500">/ 3000ml</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updateWater(-250)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  -250ml
                </button>
                <button
                  onClick={() => updateWater(250)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-500/10"
                >
                  +250ml
                </button>
              </div>
            </div>
            <div className="mt-3 w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((dailyData.water / 3000) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Meals List */}
        {Object.values(dailyData.meals).every(meals => meals.length === 0) ? (
          <EmptyState
            type="nutrition"
            action={() => {
              setSelectedMeal('breakfast');
              setIsFoodModalOpen(true);
            }}
            actionLabel="Registrar primeira refeição"
          />
        ) : (
          <div className="space-y-4">
            {MEAL_TYPES.map((meal, index) => {
            const mealItems = dailyData.meals[meal.key as keyof typeof dailyData.meals] || [];
            const mealCalories = mealItems.reduce((sum, item) => sum + (item.cal || 0), 0);

            return (
              <motion.div
                key={meal.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }}
              >
                <Card className="bg-zinc-950 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">{meal.icon}</span>
                      <h3 className="font-extrabold text-sm text-white">
                        {meal.label}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-purple-400">
                      {mealCalories} kcal
                    </span>
                  </div>

                  {mealItems.length === 0 ? (
                    <button
                      onClick={() => {
                        setSelectedMeal(meal.key);
                        setIsFoodModalOpen(true);
                      }}
                      className="w-full py-4 border border-dashed border-zinc-800 hover:border-purple-550/30 rounded-xl text-zinc-500 hover:text-purple-400 transition-all flex flex-col items-center justify-center"
                    >
                      <Plus size={18} className="mb-1" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Adicionar comida real</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {mealItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              {item.cal} kcal
                              {item.serving && ` • ${item.serving}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFood(meal.key, itemIndex)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg text-sm"
                            aria-label={`Remover ${item.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        full
                        onClick={() => {
                          setSelectedMeal(meal.key);
                          setIsFoodModalOpen(true);
                        }}
                        className="mt-2 text-xs font-bold hover:text-purple-400 text-zinc-400"
                      >
                        <Plus size={14} className="mr-1" />
                        Adicionar mais
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Food Selection Modal */}
        <Modal
          isOpen={isFoodModalOpen}
          onClose={() => {
            setIsFoodModalOpen(false);
            setSelectedMeal(null);
            setSearchQuery('');
          }}
          title="Adicionar Alimento"
          size="lg"
        >
          <div className="p-5 space-y-4 bg-zinc-950 text-white">
            <Input
              label="Buscar alimento"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: Frango, Ovo, Batata Doce..."
              autoFocus
            />
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredFoods.length === 0 ? (
                <p className="text-center text-zinc-500 text-xs py-8">
                  Nenhum alimento encontrado. Busque por arroz, feijão, frango, ovos...
                </p>
              ) : (
                filteredFoods.map((food) => (
                  <motion.button
                    key={food.id}
                    onClick={() => handleAddFood(food)}
                    className="w-full p-3.5 text-left bg-zinc-900 border border-zinc-800 hover:border-purple-500/20 rounded-xl transition-all flex items-center justify-between"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">
                        {food.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {food.serving} • {food.cal} kcal
                      </p>
                      <div className="flex gap-3 mt-2 text-[9px] font-bold text-zinc-500">
                        <span className="text-purple-400">P: {food.p}g</span>
                        <span className="text-pink-400">C: {food.c}g</span>
                        <span className="text-indigo-400">F: {food.f}g</span>
                      </div>
                    </div>
                    <Plus size={16} className="text-purple-400 ml-2" />
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default AlimentacaoPage;
