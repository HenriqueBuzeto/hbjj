'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Sparkles, User, Dumbbell } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppContext } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';

const QUICK_PROMPTS = [
  "Estou muito cansado hoje",
  "Dica para perder peso rápido",
  "Como melhorar a resistência no rola?",
  "Dica de passagem de guarda hoje"
];

const CoachPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { user, addChatMessage } = useAppContext();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Enviar mensagem para API de IA
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: (data) => {
      addChatMessage(data.response, 'coach');
      setIsLoading(false);
    },
    onError: () => {
      addChatMessage('Desculpe, tive um problema ao processar sua mensagem. Tente novamente.', 'coach');
      setIsLoading(false);
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [user.chatHistory]);

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Adicionar mensagem do usuário
    addChatMessage(textToSend, 'user');
    setInputText('');
    setIsLoading(true);

    // Enviar para API de IA
    sendMessage.mutate(textToSend);
  };

  return (
    <MainLayout>
      <div className="p-5 flex flex-col h-[calc(100vh-100px)] justify-between space-y-4">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="text-purple-500" />
            HBJJ Coach
          </h1>
          <p className="text-zinc-400 text-xs">
            Inteligência de tatame para planejar sua semana e recuperação
          </p>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 bg-zinc-950/40 border border-zinc-800 p-3.5 rounded-2xl">
          {user.chatHistory?.length === 0 ? (
            <EmptyState type="chat" />
          ) : (
            <>
              {user.chatHistory?.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar circle */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400' 
                      : 'bg-purple-950/80 border-purple-500/30 text-purple-400'
                  }`}>
                    {msg.sender === 'user' ? <User size={13} /> : <Sparkles size={13} className="animate-pulse" />}
                  </div>
                  
                  {/* Text bubble */}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-650 text-white rounded-tr-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                    <div className="text-[8px] text-zinc-500 text-right mt-1.5 font-bold uppercase">{msg.timestamp}</div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Text Input Footer */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder="Pergunte sobre peso, fadiga ou drills..."
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder-zinc-550"
            />
            <button
              onClick={() => handleSend(inputText)}
              className="w-11 h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-purple-500/10"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CoachPage;
