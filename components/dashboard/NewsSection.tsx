'use client';

import React, { useState } from 'react';
import { Newspaper, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_NEWS_MOCK } from '@/data/mockData';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';

const NewsSection = () => {
  const [selectedNews, setSelectedNews] = useState<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper size={18} className="text-purple-500" aria-hidden="true" /> 
          VivaBem News
        </h3>
        <span className="text-xs text-gray-400">Atualizado hoje</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
        {HEALTH_NEWS_MOCK.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setSelectedNews(news)}
            className="min-w-[220px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedNews(news);
              }
            }}
            aria-label={`Ler notícia: ${news.title}`}
          >
            <div className="h-28 relative">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
                sizes="220px"
              />
              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                {news.category}
              </span>
            </div>
            <div className="p-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1 line-clamp-2">
                {news.title}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={10} aria-hidden="true" /> 
                {news.readTime} de leitura
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        size="md"
      >
        {selectedNews && (
          <div className="p-6">
            <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
              <Image
                src={selectedNews.image}
                alt={selectedNews.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <span className="text-xs font-bold text-vbGreen uppercase tracking-wider">
              {selectedNews.category}
            </span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-1 mb-4">
              {selectedNews.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              {selectedNews.content}
              <br /><br />
              Conteúdo completo da notícia aqui...
            </p>
            <Button full onClick={() => setSelectedNews(null)}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default NewsSection;
