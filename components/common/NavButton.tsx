'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  'aria-label': string;
}

const NavButton: React.FC<NavButtonProps> = ({ 
  active, 
  onClick, 
  icon, 
  label,
  'aria-label': ariaLabel 
}) => (
  <motion.button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center
      py-1.5 px-2
      transition-colors 
      w-16 h-12
      focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg
      ${active ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'}
    `}
    whileTap={{ scale: 0.95 }}
    aria-label={ariaLabel}
    aria-current={active ? 'page' : undefined}
  >
    <motion.div
      animate={{ y: active ? -1 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center"
    >
      {icon}
    </motion.div>
    <motion.span
      className="text-[9px] font-extrabold uppercase mt-1 tracking-wider block text-center"
      animate={{ opacity: active ? 1 : 0.65 }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.span>
  </motion.button>
);

export default NavButton;
