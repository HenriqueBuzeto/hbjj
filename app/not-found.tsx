import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-vbGreen/10 to-vbBlue/10">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Página não encontrada
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          A página que você está procurando não existe.
        </p>
        <Link href="/home">
          <Button variant="primary">
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  );
}
