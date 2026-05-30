'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, DailyData, RecoveryLog, ChatMessage } from '@/types';

interface AppContextType {
  user: User | null;
  dailyData: DailyData | null;
  darkMode: boolean;
  notification: { msg: string; type: 'success' | 'error' } | null;
  setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
  setDailyData: (data: DailyData | null | ((prev: DailyData | null) => DailyData | null)) => void;
  setDarkMode: (dark: boolean) => void;
  addXP: (amount: number) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
  updateMeal: (mealType: string, items: any[]) => void;
  updateWater: (amount: number) => void;
  updateCalories: (amount: number) => void;
  logout: () => void;
  
  // Premium Features
  updateRecoveryLog: (log: RecoveryLog) => void;
  addChatMessage: (text: string, sender: 'user' | 'coach') => void;
  addEvolutionPhoto: (type: 'front' | 'side' | 'back', url: string, week: number) => void;
  unlockBadge: (badgeId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [darkMode, setDarkMode] = useState(true); // Default dark mode for HBJJ
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from API on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            console.log('[AppContext] Loading user data from API:', data.user);
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('[AppContext] Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, []); // Empty dependency array - only run on mount

  const showNotification = useCallback((msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addXP = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      
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
  }, [showNotification]);

  const updateMeal = useCallback((mealType: string, items: any[]) => {
    setDailyData((prev) => {
      if (!prev) return null;
      
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
        water: prev.water || 0,
        sleep: prev.sleep || 0,
        quests: updatedQuests
      };
    });
  }, []);

  const updateWater = useCallback((amount: number) => {
    setDailyData((prev) => {
      if (!prev) return null;
      
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
        quests: updatedQuests,
        calories: prev.calories || 0,
        protein: prev.protein || 0,
        carbs: prev.carbs || 0,
        fat: prev.fat || 0,
        sleep: prev.sleep || 0,
        meals: prev.meals || { breakfast: [], lunch: [], snack: [], dinner: [] }
      };
    });
  }, []);

  const updateCalories = useCallback((amount: number) => {
    setDailyData((prev) => {
      if (!prev) return null;
      
      return {
        ...prev,
        calories: Math.max(0, (prev.calories || 0) + amount),
      };
    });
  }, []);

  // Premium Methods
  const updateRecoveryLog = useCallback((log: RecoveryLog) => {
    setUser((prev) => {
      if (!prev) return null;
      
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
      if (!prev) return null;
      
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
      if (!prev) return null;
      
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
      if (!prev) return null;
      
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

  const logout = useCallback(() => {
    setUser(null);
    setDailyData(null);
  }, []);

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
        logout,
        
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
