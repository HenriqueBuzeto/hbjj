'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  };

  const styles = {
    success: 'bg-gray-800 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            fixed top-6 left-1/2 transform -translate-x-1/2
            ${styles[type]}
            px-6 py-3 
            rounded-full 
            shadow-xl 
            z-[60] 
            flex items-center gap-2
            min-w-[200px]
            max-w-[90vw]
          `}
          role="alert"
          aria-live="assertive"
        >
          <Icon size={18} aria-hidden="true" />
          <span className="text-sm font-semibold flex-1">{message}</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Fechar notificação"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
