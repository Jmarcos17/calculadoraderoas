// components/RoasResults.tsx
"use client";

import { RoasOutput, RoasInput } from '@/lib/roas';
import { getNicheById } from '@/lib/niches';

interface RoasResultsProps {
  results: RoasOutput | null;
  input?: RoasInput;
  benchmarks?: {
    goodRoas: number;
    excellentRoas: number;
    avgRoas: number;
  };
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });

export default function RoasResults({ results, input, benchmarks }: RoasResultsProps) {
  if (!results || !input) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
        Preencha os dados e clique em &quot;Calcular&quot; para ver a projeção.
      </div>
    );
  }

  const { revenue, leads, sales, roas, costPerSale } = results;
  const niche = input.niche ? getNicheById(input.niche) : null;
  
  // Usar benchmarks customizados se fornecidos, senão usar do nicho
  const effectiveBenchmarks = benchmarks || (niche && niche.id !== 'custom' ? {
    goodRoas: niche.goodRoas,
    excellentRoas: niche.excellentRoas,
    avgRoas: niche.avgRoas,
  } : null);
  
  // Determinar performance
  let performance: 'excellent' | 'good' | 'average' | 'below-average' = 'average';
  let vsMarket: 'above' | 'below' | 'average' = 'average';
  let marketComparison = '';
  
  if (effectiveBenchmarks) {
    if (roas >= effectiveBenchmarks.excellentRoas) {
      performance = 'excellent';
      vsMarket = 'above';
      marketComparison = `+${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    } else if (roas >= effectiveBenchmarks.goodRoas) {
      performance = 'good';
      vsMarket = 'above';
      marketComparison = `+${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    } else if (roas >= effectiveBenchmarks.avgRoas) {
      performance = 'average';
      vsMarket = 'average';
      marketComparison = 'Na média do mercado';
    } else {
      performance = 'below-average';
      vsMarket = 'below';
      marketComparison = `${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    }
  }

  return (
    <section className="space-y-3">
      {/* Card de Performance vs Mercado */}
      {effectiveBenchmarks && (
        <div className={`rounded-xl border p-4 ${
          performance === 'excellent' ? 'border-green-200 bg-green-50' :
          performance === 'good' ? 'border-blue-200 bg-blue-50' :
          performance === 'average' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <p className="text-xs text-slate-600 mb-1">
            Performance vs Mercado {niche && niche.id !== 'custom' ? `(${niche.name})` : ''}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {performance === 'excellent' && '⭐ Excelente'}
            {performance === 'good' && '✓ Bom'}
            {performance === 'average' && '→ Na média'}
            {performance === 'below-average' && '⚠ Abaixo da média'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ROAS médio do mercado: {effectiveBenchmarks.avgRoas.toFixed(2)}x | 
            Seu ROAS: {roas.toFixed(2)}x
          </p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <ResultCard
          label="Faturamento estimado"
          value={formatCurrency(revenue)}
          highlight
        />
        <ResultCard
          label="ROAS"
          value={`${roas.toFixed(2)}x`}
          highlight
          badge={effectiveBenchmarks ? {
            text: marketComparison,
            type: performance
          } : undefined}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <ResultCard label="Leads estimados" value={Math.round(leads).toString()} />
        <ResultCard label="Vendas estimadas" value={Math.round(sales).toString()} />
        <ResultCard
          label="Custo por venda"
          value={formatCurrency(costPerSale)}
        />
      </div>
      {/* Aqui depois você pode colocar cenários (pessimista/realista/otimista) */}
    </section>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: {
    text: string;
    type: 'excellent' | 'good' | 'average' | 'below-average';
  };
}

function ResultCard({ label, value, highlight, badge }: ResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-3 md:p-4 ${
        highlight ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg md:text-xl font-semibold text-slate-900">
        {value}
      </p>
      {badge && (
        <p className={`text-xs mt-1 ${
          badge.type === 'excellent' ? 'text-green-600' :
          badge.type === 'good' ? 'text-blue-600' :
          badge.type === 'average' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {badge.text}
        </p>
      )}
    </div>
  );
}

