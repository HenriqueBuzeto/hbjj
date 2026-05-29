'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityChallengeProps {
  addXP: (amount: number) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const CommunityChallenge: React.FC<CommunityChallengeProps> = ({ addXP, showNotification }) => {
  const handleParticipate = () => {
    addXP(20);
    showNotification("Você participou! +20 XP", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl" aria-hidden="true" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Trophy size={14} className="text-yellow-300" aria-hidden="true" />
            <span className="text-xs font-bold text-indigo-100 uppercase">
              Desafio da Comunidade
            </span>
          </div>
          <h3 className="font-bold text-lg mb-1">Maratona de Passos</h3>
          <p className="text-xs text-indigo-100 mb-3">Meta global: 1 Milhão de passos</p>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-1">
            <motion.div
              className="bg-yellow-400 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <span className="text-[10px] opacity-80">750k / 1M completados</span>
        </div>
        <motion.button
          onClick={handleParticipate}
          className="bg-white text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
          whileTap={{ scale: 0.95 }}
          aria-label="Participar do desafio"
        >
          Participar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CommunityChallenge;
