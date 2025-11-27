// Tipos base

import { NicheId } from './niches';

export type PeriodType = 'monthly' | 'daily';
export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

export interface RoasInput {
  investment: number;      // Investimento mensal em tráfego (R$)
  ticket: number;          // Ticket médio (R$)
  cpl: number;             // Custo por lead (R$)
  conversionRate: number;  // Taxa de conversão (%) de lead para venda
  period: PeriodType;      // Mensal ou diário
  niche?: NicheId;         // Nicho selecionado (opcional)
  contractMonths?: number; // Duração do contrato em meses (opcional)
  growthRate?: number;     // Taxa de crescimento mensal do investimento (%) (opcional)
  scenario?: ScenarioType; // Cenário (otimista/realista/pessimista) (opcional)
}

export interface RoasOutput {
  leads: number;
  sales: number;
  revenue: number;
  roas: number;
  costPerSale: number;
}

export interface MonthlyProjection {
  month: number;
  investment: number;
  leads: number;
  sales: number;
  revenue: number;
  roas: number;
  cumulativeRevenue: number;
  cumulativeInvestment: number;
}

export interface ContractProjection {
  monthly: MonthlyProjection[];
  total: {
    totalInvestment: number;
    totalRevenue: number;
    totalLeads: number;
    totalSales: number;
    averageRoas: number;
    finalRoas: number;
  };
  insights: string[];
}

// Funções de cálculo

export function calculateRoas({
  investment,
  ticket,
  cpl,
  conversionRate,
  period,
}: RoasInput): RoasOutput {
  // Ajuste de período (se usuário estiver em modo diário)
  const baseInvestment =
    period === 'monthly' ? investment : investment * 30;
  const leads = baseInvestment / cpl;
  const sales = leads * (conversionRate / 100);
  const revenue = sales * ticket;
  const roas = baseInvestment > 0 ? revenue / baseInvestment : 0;
  const costPerSale = sales > 0 ? baseInvestment / sales : 0;

  return {
    leads,
    sales,
    revenue,
    roas,
    costPerSale,
  };
}

// Função para calcular projeção de contrato multi-mês
export function calculateContractProjection(
  input: RoasInput,
  contractMonths: number,
  growthRate: number = 0
): ContractProjection {
  const monthly: MonthlyProjection[] = [];
  let cumulativeRevenue = 0;
  let cumulativeInvestment = 0;

  for (let month = 1; month <= contractMonths; month++) {
    // Aplicar crescimento composto no investimento
    const monthInvestment = input.investment * Math.pow(1 + growthRate / 100, month - 1);
    const monthResult = calculateRoas({
      ...input,
      investment: monthInvestment,
    });

    cumulativeRevenue += monthResult.revenue;
    cumulativeInvestment += monthInvestment;

    monthly.push({
      month,
      investment: monthInvestment,
      leads: monthResult.leads,
      sales: monthResult.sales,
      revenue: monthResult.revenue,
      roas: monthResult.roas,
      cumulativeRevenue,
      cumulativeInvestment,
    });
  }

  const total = {
    totalInvestment: cumulativeInvestment,
    totalRevenue: cumulativeRevenue,
    totalLeads: monthly.reduce((sum, m) => sum + m.leads, 0),
    totalSales: monthly.reduce((sum, m) => sum + m.sales, 0),
    averageRoas: cumulativeInvestment > 0 ? cumulativeRevenue / cumulativeInvestment : 0,
    finalRoas: monthly[monthly.length - 1]?.roas || 0,
  };

  // Gerar insights
  const insights = generateInsights(monthly, total, contractMonths);

  return { monthly, total, insights };
}

// Função para gerar insights automáticos
function generateInsights(
  monthly: MonthlyProjection[],
  total: ContractProjection['total'],
  months: number
): string[] {
  const insights: string[] = [];

  // Insight sobre crescimento
  if (monthly.length > 1) {
    const firstMonth = monthly[0];
    const lastMonth = monthly[monthly.length - 1];
    const revenueGrowth = ((lastMonth.revenue / firstMonth.revenue - 1) * 100).toFixed(1);
    insights.push(`Crescimento de ${revenueGrowth}% no faturamento do primeiro ao último mês`);
  }

  // Insight sobre ROI
  const roi = ((total.totalRevenue - total.totalInvestment) / total.totalInvestment * 100).toFixed(1);
  insights.push(`ROI total de ${roi}% sobre o investimento de ${months} meses`);

  // Insight sobre média mensal
  const avgMonthlyRevenue = (total.totalRevenue / months).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  insights.push(`Faturamento médio mensal de ${avgMonthlyRevenue}`);

  // Insight sobre melhor mês
  const bestMonth = monthly.reduce((best, current) =>
    current.revenue > best.revenue ? current : best
  );
  insights.push(`Melhor mês: ${bestMonth.month}° mês com ${bestMonth.revenue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`);

  // Insight sobre pior mês
  const worstMonth = monthly.reduce((worst, current) =>
    current.revenue < worst.revenue ? current : worst
  );
  if (worstMonth.month !== bestMonth.month) {
    insights.push(`Mês mais desafiador: ${worstMonth.month}° mês com ${worstMonth.revenue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}`);
  }

  // Insight sobre lucro líquido
  const netProfit = total.totalRevenue - total.totalInvestment;
  if (netProfit > 0) {
    insights.push(`Lucro líquido total de ${netProfit.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })} ao longo do contrato`);
  }

  return insights;
}

// Função para ajustar métricas baseado no cenário
export function applyScenario(
  input: RoasInput,
  scenario: ScenarioType
): RoasInput {
  const baseInput = { ...input };
  
  switch (scenario) {
    case 'optimistic':
      // Cenário otimista: +20% ticket, -15% CPL, +30% conversão
      return {
        ...baseInput,
        ticket: baseInput.ticket * 1.2,
        cpl: baseInput.cpl * 0.85,
        conversionRate: baseInput.conversionRate * 1.3,
      };
    
    case 'pessimistic':
      // Cenário pessimista: -15% ticket, +20% CPL, -25% conversão
      return {
        ...baseInput,
        ticket: baseInput.ticket * 0.85,
        cpl: baseInput.cpl * 1.2,
        conversionRate: baseInput.conversionRate * 0.75,
      };
    
    case 'realistic':
    default:
      // Cenário realista: usa os valores originais
      return baseInput;
  }
}

// Função para calcular múltiplos cenários
export function calculateScenarios(
  baseInput: RoasInput
): {
  optimistic: RoasOutput;
  realistic: RoasOutput;
  pessimistic: RoasOutput;
} {
  const optimisticInput = applyScenario(baseInput, 'optimistic');
  const realisticInput = applyScenario(baseInput, 'realistic');
  const pessimisticInput = applyScenario(baseInput, 'pessimistic');

  return {
    optimistic: calculateRoas(optimisticInput),
    realistic: calculateRoas(realisticInput),
    pessimistic: calculateRoas(pessimisticInput),
  };
}

