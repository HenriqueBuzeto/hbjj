'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import ToastContainer from '@/components/common/ToastContainer';
import SessionProvider from '@/components/providers/SessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        {children}
        <ToastContainer />
      </AppProvider>
    </SessionProvider>
  );
}
