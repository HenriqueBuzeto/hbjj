'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'pro';
  className?: string;
  full?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    className = "", 
    full = false, 
    disabled = false,
    loading = false,
    ...props 
  }, ref) => {
    const base = "py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]";
    
    const variants = {
      primary: `bg-vbGreen text-white shadow-md hover:brightness-110 focus:ring-vbGreen`,
      secondary: `bg-vbBlue text-white shadow-md hover:brightness-110 focus:ring-vbBlue`,
      outline: `border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500`,
      ghost: `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500`,
      danger: `bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:ring-red-500`,
      dark: `bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600 focus:ring-gray-500`,
      pro: `bg-gradient-to-r from-vbGreen to-vbBlue text-white shadow-lg hover:shadow-xl focus:ring-vbGreen`
    };
    
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        onClick={props.onClick}
        className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        transition={{ duration: 0.2 }}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            />
            <span className="sr-only">Carregando...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
