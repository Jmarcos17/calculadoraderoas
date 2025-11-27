// app/share/[encoded]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ContractProjectionView from '@/components/ContractProjection';
import { ContractProjection, RoasInput } from '@/lib/roas';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SharePage() {
  const params = useParams();
  const [projection, setProjection] = useState<ContractProjection | null>(null);
  const [input, setInput] = useState<RoasInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const encoded = params.encoded as string;
      // Decodificar base64 URL-safe de volta para base64 normal
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      // Adicionar padding se necessário
      while (base64.length % 4) {
        base64 += '=';
      }
      // Decodificar base64
      const decoded = atob(base64);
      const data = JSON.parse(decoded);
      
      // Validar dados
      if (!data.projection || !data.input) {
        throw new Error('Dados incompletos');
      }
      
      setProjection(data.projection);
      setInput(data.input);
      setLoading(false);
    } catch (err) {
      console.error('Error decoding share link:', err);
      setError('Link inválido ou expirado');
      setLoading(false);
    }
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando projeção..." />
      </div>
    );
  }

  if (error || !projection || !input) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Projeção não encontrada
          </h1>
          <p className="text-slate-500">
            {error || 'Esta projeção não está mais disponível.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="w-full max-w-[1400px] mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Projeção de ROAS Compartilhada
          </h1>
          <p className="text-slate-500 mt-1">
            Projeção compartilhada
          </p>
        </header>
        <ContractProjectionView
          projection={projection}
          input={input}
        />
      </div>
    </main>
  );
}

