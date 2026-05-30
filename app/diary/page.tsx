'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Droplets, Moon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import MacroCircle from '@/components/common/MacroCircle';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Café da Manhã', icon: '🌅' },
  { key: 'lunch', label: 'Almoço', icon: '🍽️' },
  { key: 'snack', label: 'Lanche', icon: '🍎' },
  { key: 'dinner', label: 'Jantar', icon: '🌙' },
];

const DiaryPage = () => {
  const { dailyData, updateMeal, updateWater } = useAppContext();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Diário Alimentar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Registre suas refeições e acompanhe seus macronutrientes
          </p>
        </motion.div>

        {/* Macros Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-vbGreen to-[#5cBf42] text-white border-none">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">
                  Calorias Hoje
                </p>
                <h2 className="text-3xl font-bold">
                  {dailyData.calories}
                  <span className="text-lg opacity-80"> kcal</span>
                </h2>
              </div>
            </div>
            <div className="flex justify-around">
              <MacroCircle
                label="Proteína"
                val={totalMacros.protein}
                max={150}
                color="#4FC3F7"
              />
              <MacroCircle
                label="Carbs"
                val={totalMacros.carbs}
                max={200}
                color="#FFB84D"
              />
              <MacroCircle
                label="Gordura"
                val={totalMacros.fat}
                max={65}
                color="#FF6B6B"
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
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Droplets size={24} className="text-blue-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Água
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dailyData.water}ml / 2500ml
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateWater(-250)}
                  className="px-3 py-1 text-xs"
                  aria-label="Remover 250ml de água"
                >
                  -250ml
                </Button>
                <Button
                  variant="primary"
                  onClick={() => updateWater(250)}
                  className="px-3 py-1 text-xs"
                  aria-label="Adicionar 250ml de água"
                >
                  +250ml
                </Button>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((dailyData.water / 2500) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Meals */}
        <div className="space-y-4">
          {MEAL_TYPES.map((meal, index) => {
            const mealItems = dailyData.meals[meal.key as keyof typeof dailyData.meals] || [];
            const mealCalories = mealItems.reduce((sum, item) => sum + (item.cal || 0), 0);

            return (
              <motion.div
                key={meal.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden="true">{meal.icon}</span>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {meal.label}
                      </h3>
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {mealCalories} kcal
                    </span>
                  </div>

                  {mealItems.length === 0 ? (
                    <button
                      onClick={() => {
                        setSelectedMeal(meal.key);
                        setIsFoodModalOpen(true);
                      }}
                      className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 hover:border-vbGreen hover:text-vbGreen transition-colors focus:outline-none focus:ring-2 focus:ring-vbGreen"
                      aria-label={`Adicionar alimento ao ${meal.label}`}
                    >
                      <Plus size={20} className="mx-auto mb-1" aria-hidden="true" />
                      <span className="text-sm font-medium">Adicionar alimento</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {mealItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.cal} kcal
                              {item.serving && ` • ${item.serving}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFood(meal.key, itemIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
                        className="mt-2"
                      >
                        <Plus size={16} aria-hidden="true" />
                        Adicionar mais
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

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
          <div className="p-6 space-y-4">
            <Input
              label="Buscar alimento"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome do alimento..."
              autoFocus
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredFoods.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Nenhum alimento encontrado
                </p>
              ) : (
                filteredFoods.map((food) => (
                  <motion.button
                    key={food.id}
                    onClick={() => handleAddFood(food)}
                    className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-vbGreen"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {food.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {food.serving} • {food.cal} kcal
                        </p>
                        <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                          <span>P: {food.p}g</span>
                          <span>C: {food.c}g</span>
                          <span>F: {food.f}g</span>
                        </div>
                      </div>
                      <Plus size={20} className="text-vbGreen ml-2" aria-hidden="true" />
                    </div>
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

export default DiaryPage;
