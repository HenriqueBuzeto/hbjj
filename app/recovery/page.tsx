'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, CheckCircle, Activity, Sparkles, Smile, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';

const metrics = [
  { key: 'sleepScore', label: 'Qualidade do Sono', desc: 'Como avalia o descanso da última noite? (10 = excelente)', minLabel: 'Péssimo', maxLabel: 'Excelente' },
  { key: 'muscleSoreness', label: 'Dor Muscular', desc: 'Nível de dor pós-treino acumulada (10 = dor extrema)', minLabel: 'Sem dor', maxLabel: 'Dor extrema' },
  { key: 'fatigueLevel', label: 'Fadiga / Cansaço Geral', desc: 'Sensação de cansaço ou exaustão corporal (10 = exausto)', minLabel: 'Disposto', maxLabel: 'Exausto' },
  { key: 'stressLevel', label: 'Nível de Estresse', desc: 'Estresse psicológico ou cobrança mental (10 = muito estressado)', minLabel: 'Calmo', maxLabel: 'Muito estressado' },
  { key: 'energyLevel', label: 'Nível de Energia', desc: 'Disposição para treinos fortes e sparring (10 = energia no máximo)', minLabel: 'Sem energia', maxLabel: 'Energia máxima' },
  { key: 'injuryLevel', label: 'Presença de Lesões / Incômodo', desc: 'Dores articulares limitantes de tatame (10 = muito limitado)', minLabel: '100% saudável', maxLabel: 'Lesionado' },
  { key: 'moodScore', label: 'Humor / Foco', desc: 'Estado de espírito e motivação (10 = foco blindado)', minLabel: 'Desmotivado', maxLabel: 'Foco blindado' },
];

const RecoveryPage = () => {
  const { user, updateRecoveryLog } = useAppContext();
  
  const [log, setLog] = useState({
    sleepScore: user?.recoveryLog?.sleepScore || 8,
    muscleSoreness: user?.recoveryLog?.muscleSoreness || 3,
    fatigueLevel: user?.recoveryLog?.fatigueLevel || 4,
    stressLevel: user?.recoveryLog?.stressLevel || 2,
    energyLevel: user?.recoveryLog?.energyLevel || 8,
    injuryLevel: user?.recoveryLog?.injuryLevel || 1,
    moodScore: user?.recoveryLog?.moodScore || 9,
  });

  const handleSliderChange = (key: string, val: number) => {
    setLog(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    updateRecoveryLog(log);
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
            <HeartPulse className="text-purple-500" />
            Recovery Center
          </h1>
          <p className="text-zinc-400 text-xs">
            Avaliação diária de prontidão fisiológica e fadiga do atleta
          </p>
        </motion.div>

        {/* Readiness Circular Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-indigo-950 to-zinc-950 border border-purple-500/20 p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Prontidão de Luta</span>
              <h2 className="text-3xl font-black text-white">{user?.recoveryScore || 82}%</h2>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px]">
                {user?.recoveryScore && user.recoveryScore >= 80 
                  ? "Seu corpo está pronto para o combate. Sparring e volume alto permitidos." 
                  : "Fadiga moderada detectada. Monitore a intensidade do rola."}
              </p>
            </div>
            
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle cx="48" cy="48" r="40" stroke="#1f2937" strokeWidth="6" fill="none" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="#8b5cf6" strokeWidth="6" fill="none"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - ((user?.recoveryScore || 82) / 100) * 251.2}
                  strokeLinecap="round"
                  className="transition-all duration-500 shadow-[0_0_10px_#8b5cf6]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Activity size={20} className="text-purple-400 animate-pulse" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">Fisiológico</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Questionnaire */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={14} className="text-purple-500" />
            Check-In Diário: Como você acordou hoje?
          </h3>
          
          <Card className="bg-zinc-950 border border-zinc-800 p-4 space-y-5">
            {metrics.map((m) => {
              const val = log[m.key as keyof typeof log];
              return (
                <div key={m.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-200">{m.label}</span>
                    <span className="font-extrabold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/15">{val}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-none">{m.desc}</p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={val}
                    onChange={(e) => handleSliderChange(m.key, parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-900 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-semibold">
                    <span>{m.minLabel}</span>
                    <span>{m.maxLabel}</span>
                  </div>
                </div>
              );
            })}
            
            <Button
              variant="primary"
              full
              onClick={handleSave}
              className="bg-purple-650 hover:bg-purple-750 text-white font-extrabold shadow-lg shadow-purple-650/15 mt-4"
            >
              Registrar Prontidão Diária
            </Button>
          </Card>
        </div>

        {/* Recovery Tips Block */}
        <Card className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
          <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smile size={14} />
            Dicas Recomendadas pela IA baseadas nas Dores:
          </h4>
          <ul className="text-xs space-y-2 text-zinc-350">
            {log.muscleSoreness >= 6 && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                <span>**Dor Muscular Elevada:** Priorize compressas, 500mg adicionais de Magnésio e realize rolas mais técnicos, evitando explosões.</span>
              </li>
            )}
            {log.sleepScore <= 5 && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5" />
                <span>**Privação de Sono:** Evite cafeína após as 16h hoje. O cortisol elevado prejudica a perda de peso para a categoria.</span>
              </li>
            )}
            {log.injuryLevel >= 4 && (
              <li className="flex items-start gap-2 text-pink-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <span>**Incômodo Articular:** Avise seu professor para treinar focado em posições de segurança (meia-guarda por baixo/guardas fechadas).</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
              <span>Realizar 15 minutos de mobilidade de quadril após o Sparring para aliviar a tensão lombar.</span>
            </li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecoveryPage;
