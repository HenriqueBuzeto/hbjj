'use client';

import React, { ReactNode, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home as HomeIcon, 
  BookOpen, 
  BarChart2, 
  Dumbbell, 
  User as UserIcon,
  Trophy,
  Activity,
  MessageSquare
} from 'lucide-react';
import NavButton from '@/components/common/NavButton';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppContext();
  const hideNav = pathname === '/camera' || pathname === '/pro' || pathname === '/signup' || pathname === '/onboarding';

  const navItems = [
    { path: '/home', icon: <HomeIcon size={20} />, label: 'Início', ariaLabel: 'Ir para início' },
    { path: '/treinos', icon: <Dumbbell size={20} />, label: 'Camp', ariaLabel: 'Ir para treinos' },
    { path: '/coach', icon: <MessageSquare size={20} />, label: 'Coach IA', ariaLabel: 'Falar com Coach IA' },
    { path: '/alimentacao', icon: <BookOpen size={20} />, label: 'Nutrição', ariaLabel: 'Ir para alimentação' },
    { path: '/evolucao', icon: <BarChart2 size={20} />, label: 'Evolução', ariaLabel: 'Ir para evolução' },
  ];

  // Calculate remaining weight and days
  const compInfo = useMemo(() => {
    if (!user.competitionName || !user.competitionDate) return null;
    const compDate = new Date(user.competitionDate);
    const today = new Date();
    const diffTime = compDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const weightDiff = (user.weight || 0) - (user.competitionWeightLimit || 0);
    return {
      daysRemaining: diffDays > 0 ? diffDays : 0,
      weightDiff: Number(weightDiff.toFixed(1))
    };
  }, [user.competitionDate, user.weight, user.competitionWeightLimit]);

  return (
    <div className="max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden font-sans bg-zinc-900 text-zinc-100 transition-colors duration-300">
      
      {/* MODO CAMP: Unified Top Dashboard Cockpit Banner */}
      {user.competitionName && compInfo && !hideNav && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push('/evolucao')}
          className="bg-gradient-to-r from-purple-950/80 to-zinc-950 border-b border-purple-500/30 p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-zinc-900/60 transition-all z-50 sticky top-0 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-widest text-purple-400 flex items-center gap-1 uppercase">
              <Trophy size={11} className="text-purple-450 animate-bounce" />
              Camp Ativo: {user.competitionName}
            </span>
            <span className="text-[10px] font-black text-pink-400 bg-pink-950/50 px-2 py-0.5 rounded-full border border-pink-500/20">
              {compInfo.daysRemaining} dias restantes
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Peso:</span>
              <span className="font-extrabold text-white">{user.weight} kg</span>
              <span className="text-zinc-500">→</span>
              <span className="text-purple-300 font-extrabold">{user.competitionWeightLimit} kg</span>
            </div>
            
            <div className="text-[10.5px] font-black">
              {compInfo.weightDiff > 0 ? (
                <span className="text-amber-450">Faltam cortar {compInfo.weightDiff} kg</span>
              ) : (
                <span className="text-emerald-450">No peso da categoria!</span>
              )}
            </div>
          </div>
          
          {/* Subtle weight reduction progress bar */}
          {compInfo.weightDiff > 0 && (
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500" 
                style={{ width: `${Math.max(10, Math.min(100, (1 - compInfo.weightDiff / 10) * 100))}%` }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <div className="h-full overflow-y-auto custom-scrollbar scroll-smooth pb-24">
        {children}
      </div>

      {/* Bottom Navigation */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="
            fixed bottom-0 left-0 right-0 mx-auto
            w-full max-w-md
            bg-zinc-950/95 backdrop-blur-md
            border-t border-purple-500/20
            px-2 py-2 
            flex justify-around items-center 
            z-40 
            pb-5 
            shadow-[0_-5px_25px_rgba(0,0,0,0.6)]
          "
        >
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              active={pathname === item.path || pathname.startsWith(item.path + '/')}
              onClick={() => {
                router.push(item.path);
              }}
              icon={item.icon}
              label={item.label}
              aria-label={item.ariaLabel}
            />
          ))}
        </motion.nav>
      )}
    </div>
  );
};

export default MainLayout;
