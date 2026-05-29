import React from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Utensils, TrendingUp, Camera, MessageSquare, User, Trophy, Plus } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  type: 'camp' | 'nutrition' | 'evolution' | 'photos' | 'chat' | 'profile' | 'competition'
  action?: () => void
  actionLabel?: string
}

const EmptyState = ({ type, action, actionLabel }: EmptyStateProps) => {
  const config = {
    camp: {
      icon: <Dumbbell className="text-purple-500" size={48} />,
      title: 'Nenhum Camp Ativo',
      description: 'Comece seu preparação para competição criando seu primeiro camp de treino.',
      defaultAction: 'Criar meu primeiro camp',
    },
    nutrition: {
      icon: <Utensils className="text-green-500" size={48} />,
      title: 'Nenhuma refeição registrada',
      description: 'Comece a acompanhar sua nutrição registrando sua primeira refeição do dia.',
      defaultAction: 'Registrar primeira refeição',
    },
    evolution: {
      icon: <TrendingUp className="text-blue-500" size={48} />,
      title: 'Nenhum registro de evolução',
      description: 'Acompanhe seu progresso registrando seu peso e medidas semanais.',
      defaultAction: 'Registrar peso da semana',
    },
    photos: {
      icon: <Camera className="text-pink-500" size={48} />,
      title: 'Nenhuma foto enviada',
      description: 'Documente sua evolução visual enviando fotos de frente, lado e costas.',
      defaultAction: 'Enviar fotos de evolução',
    },
    chat: {
      icon: <MessageSquare className="text-orange-500" size={48} />,
      title: 'Nenhuma conversa iniciada',
      description: 'Converse com o Coach HBJJ para dicas personalizadas de treino e nutrição.',
      defaultAction: 'Conversar com Coach HBJJ',
    },
    profile: {
      icon: <User className="text-zinc-500" size={48} />,
      title: 'Perfil incompleto',
      description: 'Complete seu perfil para receber recomendações personalizadas.',
      defaultAction: 'Completar perfil',
    },
    competition: {
      icon: <Trophy className="text-yellow-500" size={48} />,
      title: 'Nenhuma competição cadastrada',
      description: 'Cadastre sua próxima competição para criar um camp focado no evento.',
      defaultAction: 'Cadastrar competição',
    },
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-4 p-4 bg-zinc-900 rounded-full border border-zinc-800">
        {config.icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{config.title}</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-md">{config.description}</p>
      {action && (
        <Button
          onClick={action}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          <Plus size={16} className="mr-2" />
          {actionLabel || config.defaultAction}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState
