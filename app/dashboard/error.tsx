'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          Algo deu errado no Dashboard
        </h2>
        <p className="text-sm text-red-600 mb-4">
          {error.message || 'Ocorreu um erro inesperado ao carregar o painel.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}
