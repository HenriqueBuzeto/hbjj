'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ReportsPage = () => {
  const { dailyData, user } = useAppContext();

  // Mock data for charts (in production, this would come from API)
  const weeklyData = [
    { day: 'Seg', calories: 1800, water: 2000 },
    { day: 'Ter', calories: 2100, water: 2200 },
    { day: 'Qua', calories: 1950, water: 1800 },
    { day: 'Qui', calories: 2200, water: 2400 },
    { day: 'Sex', calories: 1900, water: 2000 },
    { day: 'Sáb', calories: 2300, water: 2500 },
    { day: 'Dom', calories: dailyData?.calories || 0, water: dailyData?.water || 0 },
  ];

  const macroData = [
    { name: 'Proteína', value: dailyData?.protein || 0, color: '#4FC3F7' },
    { name: 'Carboidratos', value: dailyData?.carbs || 0, color: '#FFB84D' },
    { name: 'Gorduras', value: dailyData?.fat || 0, color: '#FF6B6B' },
  ];

  const totalMacros = (dailyData?.protein || 0) + (dailyData?.carbs || 0) + (dailyData?.fat || 0);
  const macroPercentages = {
    protein: totalMacros > 0 ? ((dailyData?.protein || 0) / totalMacros) * 100 : 0,
    carbs: totalMacros > 0 ? ((dailyData?.carbs || 0) / totalMacros) * 100 : 0,
    fat: totalMacros > 0 ? ((dailyData?.fat || 0) / totalMacros) * 100 : 0,
  };

  const avgCalories = useMemo(() => {
    return Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length);
  }, []);

  const avgWater = useMemo(() => {
    return Math.round(weeklyData.reduce((sum, d) => sum + d.water, 0) / weeklyData.length);
  }, []);

  const calTrend = (dailyData?.calories || 0) > avgCalories ? 'up' : (dailyData?.calories || 0) < avgCalories ? 'down' : 'neutral';
  const waterTrend = (dailyData?.water || 0) > avgWater ? 'up' : (dailyData?.water || 0) < avgWater ? 'down' : 'neutral';

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Relatórios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Acompanhe seu progresso e estatísticas
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Calorias Hoje
                </span>
                {calTrend === 'up' && <TrendingUp size={16} className="text-green-500" aria-hidden="true" />}
                {calTrend === 'down' && <TrendingDown size={16} className="text-red-500" aria-hidden="true" />}
                {calTrend === 'neutral' && <Minus size={16} className="text-gray-400" aria-hidden="true" />}
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {dailyData?.calories || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Média: {avgCalories} kcal
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Água Hoje
                </span>
                {waterTrend === 'up' && <TrendingUp size={16} className="text-blue-500" aria-hidden="true" />}
                {waterTrend === 'down' && <TrendingDown size={16} className="text-red-500" aria-hidden="true" />}
                {waterTrend === 'neutral' && <Minus size={16} className="text-gray-400" aria-hidden="true" />}
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {dailyData?.water || 0}ml
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Média: {avgWater}ml
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Calories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-vbGreen" aria-hidden="true" />
              Calorias Semanais
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#7ED957"
                  strokeWidth={2}
                  dot={{ fill: '#7ED957', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Weekly Water Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">
              Consumo de Água Semanal
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="water" fill="#4FC3F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Macros Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">
              Distribuição de Macronutrientes
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-4 h-4 bg-[#4FC3F7] rounded-full mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {Math.round(macroPercentages.protein)}%
                </p>
                <p className="text-[10px] text-gray-500">Proteína</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-[#FFB84D] rounded-full mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {Math.round(macroPercentages.carbs)}%
                </p>
                <p className="text-[10px] text-gray-500">Carbs</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-[#FF6B6B] rounded-full mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {Math.round(macroPercentages.fat)}%
                </p>
                <p className="text-[10px] text-gray-500">Gorduras</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sleep Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">
              Sono
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {dailyData?.sleep || 0}h
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Meta: 8h por noite
                </p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#7ED957"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - ((dailyData?.sleep || 0) / 8) * 251.2}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {Math.round(((dailyData?.sleep || 0) / 8) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
