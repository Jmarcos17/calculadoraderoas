// app/dashboard/simulations/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ContractProjectionView from '@/components/ContractProjection';
import { ContractProjection, RoasInput } from '@/lib/roas';
import { calculateRoas } from '@/lib/roas';
import RoasResults from '@/components/RoasResults';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Simulation {
  id: string;
  inputData: {
    investment: number;
    ticket: number;
    cpl: number;
    conversionRate: number;
    period: 'monthly' | 'daily';
    niche?: string;
    commissionRate?: number;  // Opcional para compatibilidade com simulações antigas
    contractMonths?: number;
    growthRate?: number;
  };
  results: {
    leads: number;
    sales: number;
    revenue: number;
    grossRevenue?: number;  // Opcional para compatibilidade com simulações antigas
    commission?: number;    // Opcional para compatibilidade com simulações antigas
    roas: number;
    costPerSale: number;
  };
  projectionData?: ContractProjection;
  createdAt: string;
}

export default function SimulationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;

    fetch('/api/simulations')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar simulações');
        return res.json();
      })
      .then((data: Simulation[]) => {
        const sim = data.find((s) => s.id === params.id);
        if (!sim) {
          setError('Simulação não encontrada');
          setLoading(false);
          return;
        }
        setSimulation(sim);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading simulation:', err);
        setError('Erro ao carregar simulação');
        setLoading(false);
      });
  }, [params.id, session]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReopen = () => {
    if (!simulation) return;
    
    // Salvar dados no localStorage para reabrir na calculadora
    const dataToReopen = {
      ...simulation.inputData,
      results: simulation.results,
      projectionData: simulation.projectionData,
    };
    localStorage.setItem('reopenSimulation', JSON.stringify(dataToReopen));
    
    // Redirecionar para a calculadora pública ou home
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando simulação..." />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/simulations"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Voltar para Simulações
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Simulação não encontrada'}
        </div>
      </div>
    );
  }

  const inputData: RoasInput = {
    investment: simulation.inputData.investment,
    ticket: simulation.inputData.ticket,
    cpl: simulation.inputData.cpl,
    conversionRate: simulation.inputData.conversionRate,
    period: simulation.inputData.period,
    commissionRate: simulation.inputData.commissionRate,
    niche: simulation.inputData.niche as any,
    contractMonths: simulation.inputData.contractMonths,
    growthRate: simulation.inputData.growthRate,
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/simulations"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Voltar para Simulações
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Detalhes da Simulação
            </h1>
            <p className="text-slate-500 mt-1">
              {formatDate(simulation.createdAt)}
            </p>
          </div>
          <button
            onClick={handleReopen}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            🔄 Reabrir na Calculadora
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Resumo
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">ROAS</p>
            <p className="text-2xl font-bold text-sky-600">
              {simulation.results.roas.toFixed(2)}x
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Faturamento</p>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(simulation.results.revenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Investimento</p>
            <p className="text-lg font-medium text-slate-900">
              {formatCurrency(simulation.inputData.investment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Lucro Líquido</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(
                simulation.results.revenue - simulation.inputData.investment
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Parâmetros de Entrada */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Parâmetros de Entrada
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Investimento</p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(simulation.inputData.investment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Ticket Médio</p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(simulation.inputData.ticket)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">CPL</p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(simulation.inputData.cpl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Taxa de Conversão</p>
            <p className="text-sm font-medium text-slate-900">
              {simulation.inputData.conversionRate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Período</p>
            <p className="text-sm font-medium text-slate-900">
              {simulation.inputData.period === 'monthly' ? 'Mensal' : 'Diário'}
            </p>
          </div>
          {simulation.inputData.contractMonths && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Duração do Contrato</p>
              <p className="text-sm font-medium text-slate-900">
                {simulation.inputData.contractMonths} meses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Resultados
        </h2>
        <RoasResults
          results={{
            ...simulation.results,
            // Garantir que os novos campos existam (para compatibilidade com simulações antigas)
            grossRevenue: simulation.results.grossRevenue ?? simulation.results.revenue,
            commission: simulation.results.commission ?? 0,
          }}
          input={inputData}
        />
      </div>

      {/* Projeção de Contrato (se houver) */}
      {simulation.projectionData && (
        <div className="mb-6">
          <ContractProjectionView
            projection={simulation.projectionData}
            input={inputData}
          />
        </div>
      )}
    </div>
  );
}

