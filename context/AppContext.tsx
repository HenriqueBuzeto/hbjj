'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, DailyData, RecoveryLog, ChatMessage } from '@/types';
import { DAILY_QUESTS_MOCK } from '@/data/mockData';

interface AppContextType {
  user: User;
  dailyData: DailyData;
  darkMode: boolean;
  notification: { msg: string; type: 'success' | 'error' } | null;
  setUser: (user: User | ((prev: User) => User)) => void;
  setDailyData: (data: DailyData | ((prev: DailyData) => DailyData)) => void;
  setDarkMode: (dark: boolean) => void;
  addXP: (amount: number) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
  updateMeal: (mealType: string, items: any[]) => void;
  updateWater: (amount: number) => void;
  updateCalories: (amount: number) => void;
  
  // Premium Features
  updateRecoveryLog: (log: RecoveryLog) => void;
  addChatMessage: (text: string, sender: 'user' | 'coach') => void;
  addEvolutionPhoto: (type: 'front' | 'side' | 'back', url: string, week: number) => void;
  unlockBadge: (badgeId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUser: User = {
  name: "Felipe",
  gender: "male",
  age: 28,
  weight: 88,
  height: 180,
  neck: 37,
  waist: 88,
  hip: 102,
  activity: "camp",
  goal: "lose",
  level: 2,
  xp: 40,
  nextLevelXp: 200,
  streak: 5,
  caloriesGoal: 2200,
  
  // Jiu-Jitsu Profile pre-filled for elite SaaS feel
  belt: 'blue',
  trainingTime: '3 anos',
  trainsGi: true,
  trainsNoGi: true,
  weeklyFrequency: 5,
  trainingHours: '12:00',
  team: 'Alliance SP',
  professor: 'Fábio Gurgel',
  weightClass: 'Meio-Pesado',
  isCompetitor: true,
  athleteGoal: ['competition', 'lose', 'cardio'],
  intensityProfile: 'competitor',
  city: 'São Paulo',
  desiredWeight: 82,

  // Target Competition Details pre-filled for elite SaaS feel
  competitionName: "IBJJF São Paulo Open 2026",
  competitionDate: "2026-07-15",
  competitionModalities: ['Gi', 'No-Gi'],
  competitionWeightLimit: 82.3,
  competitionPriority: 'high',
  weeksRemaining: 6,

  // SaaS premium pre-filled data
  recoveryScore: 82,
  recoveryLog: {
    sleepScore: 8,
    muscleSoreness: 3, // low pain
    stressLevel: 2,    // low stress
    fatigueLevel: 4,
    injuryLevel: 1,
    moodScore: 9,
    energyLevel: 8,
    lastUpdated: "Hoje"
  },
  chatHistory: [
    { id: '1', sender: 'coach', text: 'Oss! Bem-vindo ao seu painel de preparação. Como está se sentindo hoje para os treinos de Sparring?', timestamp: '09:00' }
  ],
  badges: ['consistent', 'weight-focus', 'open-match'],
  photos: [
    {
      week: 1,
      front: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80",
      side: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&q=80",
      back: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=200&q=80"
    }
  ]
};

const defaultDailyData: DailyData = {
  water: 1750,
  calories: 1650,
  protein: 110,
  carbs: 180,
  fat: 55,
  sleep: 7.5,
  meals: {
    breakfast: [
      { name: "Tapioca com 3 Ovos Mexidos", cal: 380, p: 24, c: 28, f: 18, serving: "1 prato" },
      { name: "Café Preto sem Açúcar", cal: 2, p: 0, c: 0.5, f: 0, serving: "1 xícara" }
    ],
    lunch: [
      { name: "Peito de Frango Grelhado", cal: 330, p: 62, c: 0, f: 7, serving: "200g" },
      { name: "Arroz Integral Cozido", cal: 220, p: 5, c: 46, f: 2, serving: "200g" },
      { name: "Feijão Carioca Cozido", cal: 114, p: 7, c: 20, f: 1, serving: "1.5 concha" },
      { name: "Salada Mix Verde", cal: 15, p: 1, c: 3, f: 0, serving: "Prato cheio" }
    ],
    snack: [
      { name: "Banana com Aveia e Mel", cal: 280, p: 6, c: 55, f: 4, serving: "1 prato" },
      { name: "Whey Protein Isolado (Dose)", cal: 120, p: 24, c: 2, f: 1.5, serving: "30g" }
    ],
    dinner: [
      { name: "Omelete de Claras com Espinafre", cal: 180, p: 26, c: 4, f: 6, serving: "3 ovos" },
      { name: "Batata Doce Cozida", cal: 168, p: 3, c: 38, f: 0, serving: "150g" }
    ],
  },
  quests: [
    { 
      id: 1, 
      title: "Beber 3L de água (Camp)", 
      target: 3000, 
      current: 1750, 
      type: 'water', 
      xp: 50, 
      icon: null
    },
    { 
      id: 2, 
      title: "Consumir 140g de Proteína", 
      target: 140, 
      current: 110, 
      type: 'food', 
      xp: 40, 
      icon: null
    },
    { 
      id: 3, 
      title: "Completar Treino Semanal do Camp", 
      target: 1, 
      current: 0, 
      type: 'exercise', 
      xp: 120, 
      icon: null
    }
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [dailyData, setDailyData] = useState<DailyData>(defaultDailyData);
  const [darkMode, setDarkMode] = useState(true); // Default dark mode for HBJJ
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const addXP = useCallback((amount: number) => {
    setUser((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXP = prev.nextLevelXp;

      while (newXP >= newNextXP) {
        newXP -= newNextXP;
        newLevel += 1;
        newNextXP = Math.round(newNextXP * 1.25);
        setTimeout(() => {
          showNotification(`Graduou! Você subiu para o Nível ${newLevel}!`, 'success');
        }, 100);
      }

      return { ...prev, xp: newXP, level: newLevel, nextLevelXp: newNextXP };
    });
  }, []);

  const showNotification = useCallback((msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const updateMeal = useCallback((mealType: string, items: any[]) => {
    setDailyData((prev) => {
      const updatedMeals = {
        ...prev.meals,
        [mealType]: items,
      };

      const totalCal = Object.values(updatedMeals)
        .flat()
        .reduce((sum, item) => sum + (item.cal || 0), 0);

      const totalProt = Object.values(updatedMeals)
        .flat()
        .reduce((sum, item) => sum + (item.p || 0), 0);

      const totalCarbs = Object.values(updatedMeals)
        .flat()
        .reduce((sum, item) => sum + (item.c || 0), 0);

      const totalFat = Object.values(updatedMeals)
        .flat()
        .reduce((sum, item) => sum + (item.f || 0), 0);

      // update protein quest progress
      const updatedQuests = prev.quests.map(q => {
        if (q.type === 'food') {
          return { ...q, current: totalProt };
        }
        return q;
      });

      return {
        ...prev,
        meals: updatedMeals,
        calories: totalCal,
        protein: totalProt,
        carbs: totalCarbs,
        fat: totalFat,
        quests: updatedQuests
      };
    });
  }, []);

  const updateWater = useCallback((amount: number) => {
    setDailyData((prev) => {
      const newWater = Math.max(0, prev.water + amount);
      const updatedQuests = prev.quests.map(q => {
        if (q.type === 'water') {
          return { ...q, current: newWater };
        }
        return q;
      });
      return {
        ...prev,
        water: newWater,
        quests: updatedQuests
      };
    });
  }, []);

  const updateCalories = useCallback((amount: number) => {
    setDailyData((prev) => ({
      ...prev,
      calories: Math.max(0, prev.calories + amount),
    }));
  }, []);

  // Premium Methods
  const updateRecoveryLog = useCallback((log: RecoveryLog) => {
    setUser((prev) => {
      // Calculate readiness score: higher sleep score, lower soreness, lower stress/fatigue increases score
      const base = 100;
      const sleepPenalty = (10 - log.sleepScore) * 5;
      const sorenessPenalty = (log.muscleSoreness - 1) * 3;
      const stressPenalty = (log.stressLevel - 1) * 3;
      const fatiguePenalty = (log.fatigueLevel - 1) * 4;
      
      const score = Math.max(10, Math.min(100, Math.round(base - sleepPenalty - sorenessPenalty - stressPenalty - fatiguePenalty)));
      
      return {
        ...prev,
        recoveryScore: score,
        recoveryLog: {
          ...log,
          lastUpdated: "Hoje"
        }
      };
    });
    showNotification("Score de prontidão atualizado! Oss.", "success");
    addXP(30);
  }, [addXP, showNotification]);

  const addChatMessage = useCallback((text: string, sender: 'user' | 'coach') => {
    setUser((prev) => {
      const chatHistory = prev.chatHistory || [];
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      return {
        ...prev,
        chatHistory: [...chatHistory, newMsg]
      };
    });
  }, []);

  const addEvolutionPhoto = useCallback((type: 'front' | 'side' | 'back', url: string, week: number) => {
    setUser((prev) => {
      const photos = prev.photos || [];
      const existingWeekIdx = photos.findIndex(p => p.week === week);
      
      let updatedPhotos = [...photos];
      if (existingWeekIdx >= 0) {
        updatedPhotos[existingWeekIdx] = {
          ...updatedPhotos[existingWeekIdx],
          [type]: url
        };
      } else {
        updatedPhotos.push({
          week,
          [type]: url
        });
      }
      return {
        ...prev,
        photos: updatedPhotos
      };
    });
    showNotification("Foto de evolução registrada com sucesso!", "success");
    addXP(40);
  }, [addXP, showNotification]);

  const unlockBadge = useCallback((badgeId: string) => {
    setUser((prev) => {
      const badges = prev.badges || [];
      if (badges.includes(badgeId)) return prev;
      return {
        ...prev,
        badges: [...badges, badgeId]
      };
    });
    showNotification("Nova conquista desbloqueada! Veja no seu perfil.", "success");
    addXP(100);
  }, [addXP, showNotification]);

  return (
    <AppContext.Provider
      value={{
        user,
        dailyData,
        darkMode,
        notification,
        setUser,
        setDailyData,
        setDarkMode,
        addXP,
        showNotification,
        updateMeal,
        updateWater,
        updateCalories,
        
        // Premium additions
        updateRecoveryLog,
        addChatMessage,
        addEvolutionPhoto,
        unlockBadge
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
