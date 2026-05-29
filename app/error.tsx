'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F9FA] dark:bg-[#121212]">
      <div className="max-w-md w-full">
        <Alert type="error" title="Algo deu errado">
          {error.message || 'Ocorreu um erro inesperado'}
        </Alert>
        <div className="mt-4 flex gap-3">
          <Button variant="primary" full onClick={reset}>
            Tentar novamente
          </Button>
          <Button variant="outline" full onClick={() => window.location.href = '/home'}>
            Voltar para início
          </Button>
        </div>
      </div>
    </div>
  );
}
