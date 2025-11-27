// components/RoasForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { PeriodType, RoasInput, ScenarioType } from '@/lib/roas';
import { NicheId, getAllNiches, getNicheById } from '@/lib/niches';

interface RoasFormProps {
  onCalculate: (data: RoasInput) => void;
  defaultValues?: {
    investment?: number;
    ticket?: number;
    cpl?: number;
    conversionRate?: number;
    period?: PeriodType;
    niche?: NicheId;
    contractMonths?: number;
    growthRate?: number;
    scenario?: ScenarioType;
  };
}

export default function RoasForm({ onCalculate, defaultValues }: RoasFormProps) {
  const [niche, setNiche] = useState<NicheId>(defaultValues?.niche || 'custom');
  const [investment, setInvestment] = useState(defaultValues?.investment?.toString() || '1000');
  const [ticket, setTicket] = useState(defaultValues?.ticket?.toString() || '800');
  const [cpl, setCpl] = useState(defaultValues?.cpl?.toString() || '21.44');
  const [conversionRate, setConversionRate] = useState(defaultValues?.conversionRate?.toString() || '5');
  const [period, setPeriod] = useState<PeriodType>(defaultValues?.period || 'monthly');
  const [contractMonths, setContractMonths] = useState(defaultValues?.contractMonths?.toString() || '');
  const [growthRate, setGrowthRate] = useState(defaultValues?.growthRate?.toString() || '0');
  const [scenario, setScenario] = useState<ScenarioType>(defaultValues?.scenario || 'realistic');

  // Auto-preenchimento quando nicho muda
  useEffect(() => {
    if (niche !== 'custom') {
      const nicheData = getNicheById(niche);
      setTicket(nicheData.avgTicket.toString());
      setCpl(nicheData.avgCpl.toString());
      setConversionRate(nicheData.avgConversionRate.toString());
    }
  }, [niche]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: RoasInput = {
      investment: parseFloat(investment.replace(',', '.')) || 0,
      ticket: parseFloat(ticket.replace(',', '.')) || 0,
      cpl: parseFloat(cpl.replace(',', '.')) || 0,
      conversionRate: parseFloat(conversionRate.replace(',', '.')) || 0,
      period,
      niche,
      contractMonths: contractMonths ? parseFloat(contractMonths.replace(',', '.')) : undefined,
      growthRate: growthRate ? parseFloat(growthRate.replace(',', '.')) : undefined,
      scenario,
    };
    onCalculate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dropdown de Nicho */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecione o nicho
        </label>
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value as NicheId)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          {getAllNiches().map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} {n.id !== 'custom' && `(${n.description})`}
            </option>
          ))}
        </select>
        {niche !== 'custom' && (
          <p className="text-xs text-slate-500 mt-1">
            Valores pré-preenchidos com médias do mercado para {getNicheById(niche).name}
          </p>
        )}
      </div>

      <fieldset className="space-y-3 border border-slate-200 rounded-xl p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Dados de entrada
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Investimento mensal em tráfego (R$)
            </label>
            <input
              type="text"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Ticket médio (R$)
            </label>
            <input
              type="text"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Custo por lead (R$)
            </label>
            <input
              type="text"
              value={cpl}
              onChange={(e) => setCpl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Taxa de conversão (%)
            </label>
            <input
              type="text"
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Campos de Projeção de Contrato */}
      <fieldset className="space-y-3 border border-slate-200 rounded-xl p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Projeção de Contrato (Opcional)
        </legend>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Duração do contrato (meses)
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={contractMonths}
            onChange={(e) => setContractMonths(e.target.value)}
            placeholder="Ex: 6"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Deixe vazio para cálculo mensal simples
          </p>
        </div>
        {contractMonths && parseInt(contractMonths) > 1 && (
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Taxa de crescimento mensal (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              placeholder="Ex: 5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Crescimento esperado no investimento mês a mês (0% = sem crescimento)
            </p>
          </div>
        )}
      </fieldset>

      {/* Toggle de Cenários */}
      <div className="border border-slate-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Cenário de Projeção
        </label>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs w-full">
          <button
            type="button"
            onClick={() => setScenario('pessimistic')}
            className={`flex-1 px-3 py-2 rounded-full transition-colors ${
              scenario === 'pessimistic'
                ? 'bg-red-500 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pessimista
          </button>
          <button
            type="button"
            onClick={() => setScenario('realistic')}
            className={`flex-1 px-3 py-2 rounded-full transition-colors ${
              scenario === 'realistic'
                ? 'bg-sky-500 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Realista
          </button>
          <button
            type="button"
            onClick={() => setScenario('optimistic')}
            className={`flex-1 px-3 py-2 rounded-full transition-colors ${
              scenario === 'optimistic'
                ? 'bg-green-500 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Otimista
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {scenario === 'optimistic' && 'Ajusta métricas para +20% ticket, -15% CPL, +30% conversão'}
          {scenario === 'realistic' && 'Usa os valores informados sem ajustes'}
          {scenario === 'pessimistic' && 'Ajusta métricas para -15% ticket, +20% CPL, -25% conversão'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 rounded-full ${
              period === 'monthly'
                ? 'bg-sky-500 text-white'
                : 'text-slate-600'
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1 rounded-full ${
              period === 'daily'
                ? 'bg-sky-500 text-white'
                : 'text-slate-600'
            }`}
          >
            Diário
          </button>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
        >
          Calcular
        </button>
      </div>
    </form>
  );
}

