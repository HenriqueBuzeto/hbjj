'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Droplets, Wind, Sun, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de API call
    const timer = setTimeout(() => {
      setWeather({
        temp: 29,
        city: "Bebedouro, SP",
        condition: "Ensolarado",
        humidity: 45,
        wind: 10,
        isGoodForRun: true,
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-white/20 w-24 h-24 rounded-full blur-xl" aria-hidden="true" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-xs font-bold mb-1">
              <MapPin size={12} aria-hidden="true" /> 
              <span>{weather.city}</span>
            </div>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold">{weather.temp}°</h2>
              <span className="text-sm font-medium mb-1">{weather.condition}</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-blue-100">
              <span className="flex items-center gap-1">
                <Droplets size={12} aria-hidden="true" /> 
                {weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind size={12} aria-hidden="true" /> 
                {weather.wind}km/h
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Sun size={32} className="text-yellow-300 animate-pulse" aria-hidden="true" />
            {weather.isGoodForRun && (
              <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                <TrendingUp size={10} aria-hidden="true" /> 
                Bom para correr
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
