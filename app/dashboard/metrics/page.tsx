// app/dashboard/metrics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function MetricsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [metrics, setMetrics] = useState({
    nicheId: '',
    avgTicket: '',
    avgCpl: '',
    avgConversionRate: '',
    goodRoas: '',
    excellentRoas: '',
    avgRoas: '',
  });

  useEffect(() => {
    // Buscar métricas ativas
    fetch('/api/metrics')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            // Não há métricas ainda, isso é ok
            setLoading(false);
            return null;
          }
          throw new Error('Erro ao buscar métricas');
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setMetrics({
            nicheId: data.nicheId || '',
            avgTicket: data.avgTicket?.toString() || '',
            avgCpl: data.avgCpl?.toString() || '',
            avgConversionRate: data.avgConversionRate?.toString() || '',
            goodRoas: data.goodRoas?.toString() || '',
            excellentRoas: data.excellentRoas?.toString() || '',
            avgRoas: data.avgRoas?.toString() || '',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading metrics:', err);
        setError('Erro ao carregar métricas');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const payload = {
        nicheId: metrics.nicheId || null,
        avgTicket: parseFloat(metrics.avgTicket.replace(',', '.')) || 0,
        avgCpl: parseFloat(metrics.avgCpl.replace(',', '.')) || 0,
        avgConversionRate: parseFloat(metrics.avgConversionRate.replace(',', '.')) || 0,
        goodRoas: parseFloat(metrics.goodRoas.replace(',', '.')) || 0,
        excellentRoas: parseFloat(metrics.excellentRoas.replace(',', '.')) || 0,
        avgRoas: parseFloat(metrics.avgRoas.replace(',', '.')) || 0,
      };

      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao salvar métricas');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar métricas';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Métricas Reais
        </h1>
        <p className="text-slate-500 mt-1">
          Configure as métricas reais do seu negócio para cálculos mais precisos
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          Métricas salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nicho (opcional)
          </label>
          <input
            type="text"
            value={metrics.nicheId}
            onChange={(e) => setMetrics({ ...metrics, nicheId: e.target.value })}
            placeholder="Ex: advocacia, saude, ecommerce"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ticket Médio (R$)
            </label>
            <input
              type="text"
              value={metrics.avgTicket}
              onChange={(e) => setMetrics({ ...metrics, avgTicket: e.target.value })}
              placeholder="800"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Custo por Lead - CPL (R$)
            </label>
            <input
              type="text"
              value={metrics.avgCpl}
              onChange={(e) => setMetrics({ ...metrics, avgCpl: e.target.value })}
              placeholder="21.44"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Taxa de Conversão (%)
          </label>
          <input
            type="text"
            value={metrics.avgConversionRate}
            onChange={(e) => setMetrics({ ...metrics, avgConversionRate: e.target.value })}
            placeholder="5"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ROAS Bom
            </label>
            <input
              type="text"
              value={metrics.goodRoas}
              onChange={(e) => setMetrics({ ...metrics, goodRoas: e.target.value })}
              placeholder="3.5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ROAS Excelente
            </label>
            <input
              type="text"
              value={metrics.excellentRoas}
              onChange={(e) => setMetrics({ ...metrics, excellentRoas: e.target.value })}
              placeholder="5.0"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ROAS Médio do Mercado
            </label>
            <input
              type="text"
              value={metrics.avgRoas}
              onChange={(e) => setMetrics({ ...metrics, avgRoas: e.target.value })}
              placeholder="2.8"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Métricas'}
          </button>
        </div>
      </form>
    </div>
  );
}

