// components/ScenariosComparison.tsx
"use client";

import { RoasOutput } from '@/lib/roas';

interface ScenariosComparisonProps {
  scenarios: {
    optimistic: RoasOutput;
    realistic: RoasOutput;
    pessimistic: RoasOutput;
  };
}

export default function ScenariosComparison({
  scenarios,
}: ScenariosComparisonProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Comparação de Cenários
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Cenário Pessimista */}
        <div className="border border-red-200 rounded-xl p-4 bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-red-700">Pessimista</h4>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              -15% ticket, +20% CPL, -25% conversão
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-600 mb-1">ROAS</p>
              <p className="text-xl font-bold text-red-600">
                {scenarios.pessimistic.roas.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Faturamento</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(scenarios.pessimistic.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Vendas</p>
              <p className="text-sm font-medium text-slate-900">
                {Math.round(scenarios.pessimistic.sales)}
              </p>
            </div>
          </div>
        </div>

        {/* Cenário Realista */}
        <div className="border border-sky-200 rounded-xl p-4 bg-sky-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sky-700">Realista</h4>
            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">
              Valores informados
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-600 mb-1">ROAS</p>
              <p className="text-xl font-bold text-sky-600">
                {scenarios.realistic.roas.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Faturamento</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(scenarios.realistic.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Vendas</p>
              <p className="text-sm font-medium text-slate-900">
                {Math.round(scenarios.realistic.sales)}
              </p>
            </div>
          </div>
        </div>

        {/* Cenário Otimista */}
        <div className="border border-green-200 rounded-xl p-4 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-700">Otimista</h4>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              +20% ticket, -15% CPL, +30% conversão
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-600 mb-1">ROAS</p>
              <p className="text-xl font-bold text-green-600">
                {scenarios.optimistic.roas.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Faturamento</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(scenarios.optimistic.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Vendas</p>
              <p className="text-sm font-medium text-slate-900">
                {Math.round(scenarios.optimistic.sales)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

