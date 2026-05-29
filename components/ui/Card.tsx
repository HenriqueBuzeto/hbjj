'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = "", 
  onClick,
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const Component = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    whileHover: hover ? { y: -2, transition: { duration: 0.2 } } : {},
    whileTap: onClick ? { scale: 0.98 } : {},
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        rounded-2xl 
        shadow-sm border border-gray-100 dark:border-gray-700 
        ${paddingClasses[padding]}
        transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Card;
