"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import SimulationsComparison from '@/components/SimulationsComparison';
import { RoasOutput } from '@/lib/roas';

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
  results: RoasOutput;
  projectionData?: any;
  createdAt: string;
}

export default function SimulationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [error, setError] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  // Comparação
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetch('/api/simulations')
      .then((res) => {
        if (!res.ok) {
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

  const filteredSimulations = useMemo(() => {
    return simulations.filter((sim) => {
      // Filtro de texto (busca por ID ou Nicho se houver)
      const matchesSearch = 
        sim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.inputData.niche && sim.inputData.niche.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de data
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const date = new Date(sim.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') matchesDate = diffDays <= 1;
        if (dateFilter === 'week') matchesDate = diffDays <= 7;
        if (dateFilter === 'month') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesDate;
    });
  }, [simulations, searchTerm, dateFilter]);

  const handleDuplicate = (sim: Simulation) => {
    // Salvar dados no localStorage para reabrir na home
    localStorage.setItem('reopenSimulation', JSON.stringify(sim.inputData));
    router.push('/');
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= 3) {
        alert('Você pode comparar no máximo 3 simulações por vez.');
        return;
      }
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Simulações
          </h1>
          <p className="text-slate-500 mt-1">
            Histórico de todas as simulações realizadas
          </p>
        </div>
        
        {selectedIds.size > 1 && (
          <button
            onClick={() => setShowComparison(true)}
            className="fixed bottom-6 right-6 z-40 md:static bg-sky-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-sky-700 transition-all flex items-center gap-2 font-medium animate-in fade-in slide-in-from-bottom-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Comparar ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por ID ou nicho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              dateFilter === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              dateFilter === 'today' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              dateFilter === 'week' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              dateFilter === 'month' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Último Mês
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {filteredSimulations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-2 font-medium">
            Nenhuma simulação encontrada
          </p>
          <p className="text-sm text-slate-500">
            Tente ajustar os filtros ou faça uma nova simulação.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSimulations.map((sim) => (
            <div
              key={sim.id}
              className={`bg-white rounded-xl border transition-all p-6 ${
                selectedIds.has(sim.id) 
                  ? 'border-sky-500 ring-1 ring-sky-500 shadow-md' 
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sim.id)}
                      onChange={() => toggleSelection(sim.id)}
                      className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      {formatDate(sim.createdAt)}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      Simulação #{sim.id.slice(0, 8)}
                      {sim.inputData.niche && (
                        <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                          {sim.inputData.niche}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">ROAS</p>
                  <p className="text-xl font-semibold text-sky-600">
                    {sim.results.roas.toFixed(2)}x
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4 pl-8">
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

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 pl-8">
                <Link
                  href={`/dashboard/simulations/${sim.id}`}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Ver Detalhes
                </Link>
                <button
                  onClick={() => handleDuplicate(sim)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicar e Editar
                </button>
                {sim.projectionData && (
                  <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    📊 Com Projeção
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showComparison && (
        <SimulationsComparison
          simulations={simulations.filter(s => selectedIds.has(s.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
