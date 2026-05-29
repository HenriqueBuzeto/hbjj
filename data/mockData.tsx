'use client';

import React from 'react';
import { Droplets, Utensils, Dumbbell } from 'lucide-react';
import { Quest, Workout, News, FoodItem, ActivityLevel } from '@/types';

export const DAILY_QUESTS_MOCK: Quest[] = [
  { 
    id: 1, 
    title: "Beber 2L de água", 
    target: 2000, 
    current: 0, 
    type: 'water', 
    xp: 50, 
    icon: <Droplets size={16} className="text-blue-500" aria-hidden="true" />
  },
  { 
    id: 2, 
    title: "Comer 3 frutas", 
    target: 3, 
    current: 0, 
    type: 'food', 
    xp: 30, 
    icon: <Utensils size={16} className="text-green-500" aria-hidden="true" />
  },
  { 
    id: 3, 
    title: "Movimento 30min", 
    target: 30, 
    current: 0, 
    type: 'exercise', 
    xp: 100, 
    icon: <Dumbbell size={16} className="text-purple-500" aria-hidden="true" />
  }
];

export const WORKOUTS_DB: Workout[] = [
  { 
    id: 1, 
    title: "Hipertrofia Peitoral", 
    duration: "45 min", 
    level: "Intermediário", 
    kcal: 320, 
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", 
    category: "Força", 
    description: "Foco em supino e exercícios isolados para peito." 
  },
  { 
    id: 2, 
    title: "HIIT Queima Gordura", 
    duration: "20 min", 
    level: "Difícil", 
    kcal: 250, 
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&q=80", 
    category: "Cardio", 
    description: "Alta intensidade para acelerar o metabolismo." 
  },
  { 
    id: 3, 
    title: "Alongamento Matinal", 
    duration: "15 min", 
    level: "Fácil", 
    kcal: 80, 
    image: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=400&q=80", 
    category: "Flex", 
    description: "Comece o dia com mobilidade total." 
  },
  { 
    id: 4, 
    title: "Pernas de Aço", 
    duration: "50 min", 
    level: "Difícil", 
    kcal: 400, 
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80", 
    category: "Força", 
    description: "Agachamentos e leg press intensos." 
  },
  { 
    id: 5, 
    title: "Yoga Flow", 
    duration: "30 min", 
    level: "Médio", 
    kcal: 150, 
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&q=80", 
    category: "Yoga", 
    description: "Conexão mente e corpo." 
  },
  { 
    id: 6, 
    title: "Corrida Indoor", 
    duration: "25 min", 
    level: "Médio", 
    kcal: 280, 
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=400&q=80", 
    category: "Cardio", 
    description: "Treino intervalado na esteira." 
  },
];

export const HEALTH_NEWS_MOCK: News[] = [
  { 
    id: 1, 
    category: "Nutrição", 
    title: "5 Superalimentos para Energia", 
    readTime: "3 min", 
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80", 
    content: "Descubra como a banana, aveia e o açaí podem impulsionar seu treino..." 
  },
  { 
    id: 2, 
    category: "Ciência", 
    title: "O Impacto do Sono na Memória", 
    readTime: "5 min", 
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=300&q=80", 
    content: "Estudos mostram que dormir menos de 6 horas afeta a consolidação da memória..." 
  },
  { 
    id: 3, 
    category: "Treino", 
    title: "HIIT vs Cardio Contínuo", 
    readTime: "4 min", 
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80", 
    content: "Qual a melhor estratégia para queima de gordura? Analisamos os dados..." 
  }
];

export const NUTRITION_DB: FoodItem[] = [
  { id: 1, name: "Ovo Cozido (Unidade)", cal: 70, p: 6, c: 0.5, f: 5, serving: "1 un" },
  { id: 2, name: "Banana Prata", cal: 98, p: 1.3, c: 26, f: 0.1, serving: "1 média" },
  { id: 3, name: "Peito de Frango Grelhado", cal: 165, p: 31, c: 0, f: 3.6, serving: "100g" },
  { id: 4, name: "Arroz Integral Cozido", cal: 110, p: 2.6, c: 23, f: 0.9, serving: "100g" },
  { id: 5, name: "Feijão Carioca (Concha)", cal: 76, p: 4.8, c: 13.6, f: 0.5, serving: "1 concha" },
  { id: 6, name: "Aveia em Flocos", cal: 115, p: 4.3, c: 17, f: 2.2, serving: "30g" },
  { id: 7, name: "Iogurte Natural Desnatado", cal: 85, p: 8, c: 12, f: 0, serving: "1 potinho" },
  { id: 8, name: "Abacate", cal: 160, p: 2, c: 9, f: 15, serving: "100g" },
  { id: 9, name: "Pão Integral", cal: 60, p: 3, c: 11, f: 1, serving: "1 fatia" },
  { id: 10, name: "Queijo Minas Frescal", cal: 264, p: 17, c: 3, f: 20, serving: "100g" },
  { id: 11, name: "Salada Mix Folhas", cal: 15, p: 1, c: 3, f: 0, serving: "Prato cheio" },
  { id: 12, name: "Whey Protein (Dose)", cal: 120, p: 24, c: 3, f: 1.5, serving: "30g" },
];

export const ACTIVITY_LEVELS: Record<string, ActivityLevel> = {
  sedentary: { label: "Sedentário", factor: 1.2 },
  light: { label: "Levemente Ativo", factor: 1.375 },
  moderate: { label: "Moderado", factor: 1.55 },
  heavy: { label: "Muito Ativo", factor: 1.725 }
};

export const NUTRI_TIPS: Record<string, string[]> = {
  lose: [
    "Para perder peso, priorize proteínas magras e fibras no café da manhã.",
    "Tente substituir o lanche da tarde por uma fruta com aveia.",
    "Beba 500ml de água 30min antes das refeições para aumentar a saciedade."
  ],
  gain: [
    "Para ganho de massa, aumente a ingestão de carboidratos complexos no pré-treino.",
    "Não pule refeições! Tente comer a cada 3 horas.",
    "Inclua gorduras boas (abacate, castanhas) para aumentar as calorias de forma saudável."
  ]
};

export const MOCK_PLAYLIST = [
  { title: "Eye of the Tiger", artist: "Survivor" },
  { title: "Stronger", artist: "Kanye West" },
  { title: "Can't Stop", artist: "Red Hot Chili Peppers" },
  { title: "Till I Collapse", artist: "Eminem" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Believer", artist: "Imagine Dragons" },
  { title: "Numb", artist: "Linkin Park" },
  { title: "Humble", artist: "Kendrick Lamar" }
];
