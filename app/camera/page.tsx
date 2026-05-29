'use client';

import React from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const CameraPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <button
          onClick={() => router.push('/home')}
          className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fechar câmera"
        >
          <X size={24} aria-hidden="true" />
        </button>
        <h1 className="text-white font-bold">Escanear Alimento</h1>
        <div className="w-10" />
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <CameraIcon size={64} className="text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-400 mb-6">
              Funcionalidade de câmera em desenvolvimento
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/diary')}
            >
              Adicionar Manualmente
            </Button>
          </motion.div>
        </div>

        {/* Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-vbGreen rounded-xl" />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <Button
          full
          variant="primary"
          onClick={() => router.push('/diary')}
        >
          Adicionar Manualmente
        </Button>
      </div>
    </div>
  );
};

export default CameraPage;
