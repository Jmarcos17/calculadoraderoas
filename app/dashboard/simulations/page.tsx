// app/dashboard/simulations/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Simulation {
  id: string;
  inputData: {
    investment: number;
    ticket: number;
    cpl: number;
    conversionRate: number;
    period: string;
    niche?: string;
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
  projectionData?: {
    monthly: any[];
    total: {
      totalInvestment: number;
      totalRevenue: number;
      totalLeads: number;
      totalSales: number;
      averageRoas: number;
      finalRoas: number;
    };
    insights: string[];
  };
  createdAt: string;
}

export default function SimulationsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/simulations')
      .then((res) => {
        if (!res.ok) {
          // Se for 404 ou qualquer outro erro, apenas retornar array vazio
          if (res.status === 404 || res.status === 401) {
            setSimulations([]);
            setLoading(false);
            return null;
          }
          throw new Error('Erro ao buscar simulações');
        }
        return res.json();
      })
      .then((data) => {
        if (data !== null) {
          setSimulations(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading simulations:', err);
        setError('Erro ao carregar simulações');
        setSimulations([]);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando simulações..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Simulações
        </h1>
        <p className="text-slate-500 mt-1">
          Histórico de todas as simulações realizadas
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {simulations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-4">
            Você ainda não tem nenhuma simulação salva.
          </p>
          <p className="text-sm text-slate-500">
            As simulações serão salvas automaticamente quando você usar a calculadora.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    {formatDate(sim.createdAt)}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Simulação #{sim.id.slice(0, 8)}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">ROAS</p>
                  <p className="text-xl font-semibold text-sky-600">
                    {sim.results.roas.toFixed(2)}x
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Investimento</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.investment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ticket Médio</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.ticket)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">CPL</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.cpl)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Conversão</p>
                  <p className="text-sm font-medium text-slate-900">
                    {sim.inputData.conversionRate}%
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Faturamento</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(sim.results.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Leads</p>
                  <p className="text-sm font-medium text-slate-900">
                    {Math.round(sim.results.leads)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Vendas</p>
                  <p className="text-sm font-medium text-slate-900">
                    {Math.round(sim.results.sales)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Custo por Venda</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(sim.results.costPerSale)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                <Link
                  href={`/dashboard/simulations/${sim.id}`}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                >
                  Ver Detalhes
                </Link>
                {sim.projectionData && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    📊 Com Projeção
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

