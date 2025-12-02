import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Percent,
  Briefcase
} from 'lucide-react';

import { RoasOutput, RoasInput } from '@/lib/roas';
import { getNicheById } from '@/lib/niches';
import StrategicCTA from './StrategicCTA';

interface RoasResultsProps {
  results: RoasOutput | null;
  input?: RoasInput;
  benchmarks?: {
    goodRoas: number;
    excellentRoas: number;
    avgRoas: number;
  };
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
  onScheduleCall?: () => void;
  onExportProposal?: () => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });

export default function RoasResults({ results, input, benchmarks, branding, onScheduleCall, onExportProposal }: RoasResultsProps) {
  if (!results || !input) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-center font-medium">Preencha os dados ao lado para gerar sua projeção personalizada.</p>
      </div>
    );
  }

  const { revenue, leads, sales, roas, costPerSale } = results;
  const grossRevenue = results.grossRevenue ?? revenue;
  const commission = results.commission ?? 0;
  const niche = input.niche ? getNicheById(input.niche) : null;
  const hasCommission = (input.commissionRate || 0) > 0 || commission > 0;
  
  const effectiveBenchmarks = benchmarks || (niche && niche.id !== 'custom' ? {
    goodRoas: niche.goodRoas,
    excellentRoas: niche.excellentRoas,
    avgRoas: niche.avgRoas,
  } : null);
  
  let performance: 'excellent' | 'good' | 'average' | 'below-average' = 'average';
  let marketComparison = '';
  
  if (effectiveBenchmarks) {
    if (roas >= effectiveBenchmarks.excellentRoas) {
      performance = 'excellent';
      marketComparison = `+${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    } else if (roas >= effectiveBenchmarks.goodRoas) {
      performance = 'good';
      marketComparison = `+${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    } else if (roas >= effectiveBenchmarks.avgRoas) {
      performance = 'average';
      marketComparison = 'Na média do mercado';
    } else {
      performance = 'below-average';
      marketComparison = `${((roas / effectiveBenchmarks.avgRoas - 1) * 100).toFixed(0)}% vs mercado`;
    }
  }

  const primaryColor = branding?.primaryColor || '#0ea5e9';
  const secondaryColor = branding?.secondaryColor || '#64748b';

  // Helper para formatar números decimais de forma limpa
  const formatDecimal = (val: number) => {
    // Se for inteiro, não mostra decimal. Se for pequeno (<100), mostra 1 decimal.
    if (val % 1 === 0) return val.toString();
    if (val < 100) return val.toFixed(1).replace('.', ',');
    return Math.round(val).toString();
  };

  return (
    <section className="space-y-8">
      {/* 1. Destaque Principal (Revenue & ROAS) */}
      <div className="grid gap-4 md:grid-cols-2">
        <div 
          className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-[1.02]"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${branding?.accentColor || secondaryColor})` 
          }}
        >
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Faturamento Bruto Projetado</p>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
              {formatCurrency(grossRevenue)}
            </h3>
            {hasCommission && (
              <p className="text-white/90 text-sm mt-2 font-medium">
                Líquido: {formatCurrency(revenue)}
              </p>
            )}
          </div>
          <DollarSign className="absolute right-4 bottom-4 w-24 h-24 text-white/10 rotate-[-15deg]" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">ROAS (Retorno Bruto)</p>
              {effectiveBenchmarks && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  performance === 'excellent' ? 'bg-green-100 text-green-700' :
                  performance === 'good' ? 'bg-blue-100 text-blue-700' :
                  performance === 'average' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {marketComparison}
                </span>
              )}
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              {roas.toFixed(2)}x
            </h3>
            <p className="text-slate-400 text-xs mt-2">
              Para cada R$1 investido, voltam R${roas.toFixed(2)}
            </p>
          </div>
          <TrendingUp 
            className="absolute right-4 bottom-4 w-20 h-20 text-slate-50 group-hover:text-slate-100 transition-colors" 
            style={{ color: `${primaryColor}10` }}
          />
        </div>
      </div>

      {/* CTA estratégico após resultados positivos */}
      {(performance === 'excellent' || performance === 'good') && onScheduleCall && (
        <StrategicCTA
          variant="primary"
          title="Resultados Impressionantes! Vamos Potencializar Ainda Mais?"
          description="Esses números são excelentes! Em uma consultoria gratuita de 30 minutos, podemos mostrar estratégias personalizadas para aumentar seu ROAS em até 40%."
          buttonText="Agendar Consultoria Gratuita"
          onAction={onScheduleCall}
          urgencyText="⚡ Apenas 3 vagas disponíveis esta semana"
          icon="sparkles"
          branding={branding}
        />
      )}

      {/* 2. Métricas de Eficiência (Grid 3 colunas) */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-400" />
          Eficiência do Funil
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard 
            label="Leads Estimados" 
            value={formatDecimal(leads)} 
            icon={Users}
            subtext="Potenciais clientes"
          />
          <MetricCard 
            label="Vendas Projetadas" 
            value={formatDecimal(sales)} 
            icon={ShoppingCart}
            subtext={`Conv. ${input.conversionRate}%`}
          />
          <MetricCard 
            label="Custo por Venda" 
            value={formatCurrency(costPerSale)} 
            icon={DollarSign}
            subtext="CPA Médio"
          />
        </div>
      </div>

      {/* 3. Detalhamento Financeiro (Se houver comissão ou ROI alto) */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400" />
          Análise Financeira
        </h4>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Investimento</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(input.investment)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">ROI (Retorno Líquido)</p>
            <p className={`text-lg font-bold ${results.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.roi.toFixed(1)}%
            </p>
          </div>
          {hasCommission && (
            <>
              <div>
                <p className="text-xs text-slate-500 mb-1">Faturamento Bruto</p>
                <p className="text-lg font-semibold text-slate-700">{formatCurrency(grossRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Comissão Agência</p>
                <p className="text-lg font-semibold text-slate-700">{formatCurrency(commission)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Investimento Sugerido (Se disponível) */}
      {results.suggestedInvestment && results.suggestedInvestment > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-900 mb-1">
                💡 Sugestão de Investimento
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                {input.targetRevenue
                  ? `Para atingir sua meta de faturamento de ${formatCurrency(input.targetRevenue)}, recomendamos:`
                  : 'Para dobrar seu faturamento mantendo as mesmas métricas, recomendamos:'
                }
              </p>
              <div className="inline-flex items-baseline gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-purple-100">
                <span className="text-sm text-slate-600">Investir</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatCurrency(results.suggestedInvestment)}
                </span>
                <span className="text-sm text-slate-500">
                  por mês
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA após sugestão de investimento */}
      {results.suggestedInvestment && results.suggestedInvestment > 0 && onExportProposal && (
        <StrategicCTA
          variant="secondary"
          title="Gostou da projeção? Baixe uma proposta comercial completa"
          description="Receba um PDF profissional com toda a análise, cronograma e garantias."
          buttonText="Baixar Proposta em PDF"
          onAction={onExportProposal}
          icon="arrow"
          branding={branding}
        />
      )}

      {/* 5. Comparativo de Agências (Se disponível) */}
      {(results.agencyRoi !== undefined || results.userAgencyRoi !== undefined) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Por que escolher nossa agência?
            </h3>
            <div className="grid gap-4 md:grid-cols-2 items-center">
              {results.agencyRoi !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-70">
                  <p className="text-xs text-slate-500 mb-1">Agência Comum</p>
                  <p className="text-xl font-bold text-slate-600">
                    {results.agencyRoi.toFixed(1)}% ROI
                  </p>
                </div>
              )}
              {results.userAgencyRoi !== undefined && (
                <div 
                  className="p-4 rounded-xl border-2 bg-white shadow-sm transform scale-105"
                  style={{ borderColor: primaryColor }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: primaryColor }}>COM NOSSA ESTRATÉGIA</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {results.userAgencyRoi.toFixed(1)}% ROI
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    +{((results.userAgencyRoi - (results.agencyRoi || 0))).toFixed(1)}% de lucro extra
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA urgente após comparação de agências com vantagem clara */}
      {results.userAgencyRoi !== undefined && results.agencyRoi !== undefined &&
       results.userAgencyRoi > results.agencyRoi && onScheduleCall && (
        <StrategicCTA
          variant="urgency"
          title="Você está perdendo dinheiro com a agência atual!"
          description={`Nossa estratégia entrega ${((results.userAgencyRoi - results.agencyRoi)).toFixed(1)}% mais lucro. Isso representa milhares de reais deixados na mesa todo mês.`}
          buttonText="Quero Migrar Agora"
          onAction={onScheduleCall}
          urgencyText="⏰ Oferta válida apenas até o final desta semana"
          branding={branding}
        />
      )}

      {/* CTA minimal no final para quem ainda não agiu */}
      {!results.suggestedInvestment && onScheduleCall && (
        <StrategicCTA
          variant="minimal"
          title="Quer descobrir quanto investir para alcançar sua meta de faturamento?"
          buttonText="Falar com Especialista"
          onAction={onScheduleCall}
          branding={branding}
        />
      )}
    </section>
  );
}

function MetricCard({ label, value, icon: Icon, subtext }: { label: string, value: string, icon: any, subtext?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        {subtext && <p className="text-[10px] text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

