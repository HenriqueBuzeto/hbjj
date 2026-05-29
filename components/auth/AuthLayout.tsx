'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface AuthLayoutProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  children: React.ReactNode
}

const GeometricPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.07] dark:opacity-[0.12] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="geo-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Row 1 */}
        <rect width="40" height="40" fill="currentColor" />
        <circle cx="40" cy="40" r="40" fill="currentColor" className="text-zinc-400" />
        <path d="M 40 40 L 80 40 L 80 80 Z" fill="currentColor" className="text-zinc-300" />
        
        {/* Row 2 */}
        <circle cx="80" cy="0" r="40" fill="currentColor" className="text-zinc-500" />
        <rect x="40" y="40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600" />
        <path d="M 0 80 Q 20 60, 40 80 Z" fill="currentColor" className="text-zinc-400" />
        
        {/* Cross hatches */}
        <line x1="0" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-zinc-700" />
        <line x1="80" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-zinc-700" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo-pattern)" />
  </svg>
)

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  children,
}) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient light blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      {/* Smartphone frame container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-white dark:bg-zinc-950 rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden border border-zinc-100 dark:border-zinc-900 flex flex-col min-h-[780px] relative z-10"
      >
        {/* Dark Top Header with Geometric Pattern */}
        <div className="h-[210px] bg-zinc-950 relative overflow-hidden flex flex-col justify-between p-6 pb-14">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 z-0" />
          
          {/* Tiled shapes */}
          <GeometricPattern />
          
          {/* Header Action Row */}
          <div className="relative z-10 flex items-center justify-between mt-2">
            {showBack ? (
              <button
                onClick={handleBack}
                type="button"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
            
            {/* Show title in header only if showBack (like in signup) */}
            {showBack && title && (
              <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
            )}
            
            <div className="w-10 h-10" />
          </div>

          {/* Central App Logo */}
          <div className="relative z-10 flex justify-center mb-1">
            <img src="/logo.png" alt="HBJJ Logo" className="w-32 h-32 object-contain" />
          </div>

          {/* Bottom S-Curve Mask */}
          <svg
            className="absolute bottom-0 left-0 w-full h-12 fill-white dark:fill-zinc-950 transition-colors duration-250 pointer-events-none"
            viewBox="0 0 375 48"
            preserveAspectRatio="none"
          >
            <path d="M0,16 C120,48 255,-16 375,16 L375,48 L0,48 Z" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="flex-1 bg-white dark:bg-zinc-950 px-6 pb-8 pt-2 flex flex-col justify-between transition-colors duration-250">
          <div className="flex-1 flex flex-col">
            {/* Title (if not showing back, title is printed inside card like standard login page) */}
            {!showBack && title && (
              <div className="text-center mb-6 mt-2">
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Children Elements */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthLayout
