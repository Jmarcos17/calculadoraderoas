// Tipos base

import { NicheId, getNicheById } from './niches';

export type PeriodType = 'monthly' | 'daily';
export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

export interface RoasInput {
  investment: number;      // Investimento mensal em tráfego (R$)
  targetRoas?: number;     // ROAS desejado (input principal para cálculo reverso)
  ticket?: number;         // Ticket médio (R$) - calculado ou manual
  cpl?: number;            // Custo por lead (R$) - calculado ou manual
  conversionRate?: number; // Taxa de conversão (%) - calculada ou manual
  period: PeriodType;      // Mensal ou diário
  agencyFee?: number;      // Mensalidade da Agência Genérica (R$)
  userAgencyFee?: number;  // Mensalidade da Agência do Usuário (R$)
  targetRevenue?: number;  // Meta de faturamento para cálculo reverso (R$)
  niche?: NicheId;         // Nicho selecionado (usado para métricas de referência)
  contractMonths?: number; // Duração do contrato em meses (opcional)
  growthRate?: number;     // Taxa de crescimento mensal do investimento (%) (opcional)
  scenario?: ScenarioType; // Cenário (otimista/realista/pessimista) (opcional)
}

export interface RoasOutput {
  leads: number;
  sales: number;
  revenue: number;        // Receita (faturamento bruto)
  grossRevenue: number;   // Receita bruta (mesmo que revenue agora)
  commission: number;     // Sempre 0 (removido)
  roas: number;
  roi: number;            // ROI (%) = (Receita - Investimento) / Investimento * 100
  costPerSale: number;
  suggestedInvestment?: number;
  agencyRoi?: number;
  userAgencyRoi?: number;
  // Métricas calculadas (para exibição)
  calculatedCpl?: number;
  calculatedTicket?: number;
  calculatedConversionRate?: number;
}

export interface MonthlyProjection {
  month: number;
  investment: number;
  leads: number;
  sales: number;
  revenue: number;
  grossRevenue: number;
  commission: number;
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

// ============================================================================
// FUNÇÃO PRINCIPAL: CÁLCULO REVERSO DE ROAS
// ============================================================================
// Nova lógica: Usuário informa Investimento + ROAS desejado
// Sistema calcula as métricas necessárias baseado no nicho
// ============================================================================

export function calculateRoas(input: RoasInput): RoasOutput {
  const {
    investment,
    targetRoas,
    ticket,
    cpl,
    conversionRate,
    period,
    agencyFee,
    userAgencyFee,
    targetRevenue,
    niche,
  } = input;

  // Validação: garantir que investimento seja maior que zero
  if (investment <= 0) {
    throw new Error('Investimento deve ser maior que zero');
  }

  // Normalizar período
  const normalizedPeriod = (period === 'daily' || period === 'monthly') ? period : 'monthly';
  const baseInvestment = normalizedPeriod === 'monthly' ? investment : investment * 30;

  // ============================================================================
  // CÁLCULO REVERSO: A partir de Investimento + ROAS
  // ============================================================================
  
  let finalRoas: number;
  let finalRevenue: number;
  let finalCpl: number;
  let finalTicket: number;
  let finalConversionRate: number;
  let finalLeads: number;
  let finalSales: number;

  // Obter métricas de referência do nicho (se disponível)
  const nicheBenchmark = niche ? getNicheById(niche) : null;

  if (targetRoas && targetRoas > 0) {
    // ========================================================================
    // MODO 1: CÁLCULO REVERSO A PARTIR DO ROAS DESEJADO
    // ========================================================================
    // Usuário informou: Investimento + ROAS desejado
    // Calculamos: Faturamento e métricas baseadas no nicho
    // ========================================================================
    
    finalRoas = targetRoas;
    finalRevenue = baseInvestment * targetRoas;

    // Usar métricas do nicho como base (ou valores fornecidos manualmente)
    finalCpl = cpl ?? nicheBenchmark?.avgCpl ?? 20;
    finalTicket = ticket ?? nicheBenchmark?.avgTicket ?? 500;
    
    // Calcular leads a partir do investimento e CPL
    finalLeads = baseInvestment / finalCpl;
    
    // Calcular vendas a partir do faturamento e ticket
    finalSales = finalRevenue / finalTicket;
    
    // Calcular taxa de conversão real necessária
    finalConversionRate = finalLeads > 0 ? (finalSales / finalLeads) * 100 : 0;
    
  } else if (ticket && cpl && conversionRate) {
    // ========================================================================
    // MODO 2: CÁLCULO TRADICIONAL (se métricas foram fornecidas manualmente)
    // ========================================================================
    
    finalCpl = cpl;
    finalTicket = ticket;
    finalConversionRate = conversionRate;
    
    // Validações
    if (finalCpl <= 0) {
      throw new Error('Custo por lead deve ser maior que zero');
    }
    
    if (finalConversionRate <= 0 || finalConversionRate > 100) {
      throw new Error('Taxa de conversão deve estar entre 0% e 100%');
    }
    
    // Cálculos tradicionais
    finalLeads = baseInvestment / finalCpl;
    finalSales = finalLeads * (finalConversionRate / 100);
    finalRevenue = finalSales * finalTicket;
    finalRoas = baseInvestment > 0 ? finalRevenue / baseInvestment : 0;
    
  } else {
    // ========================================================================
    // MODO 3: USAR APENAS MÉTRICAS DO NICHO (fallback)
    // ========================================================================
    
    if (!nicheBenchmark) {
      throw new Error('Informe o ROAS desejado ou as métricas (CPL, Ticket, Conversão)');
    }
    
    finalCpl = nicheBenchmark.avgCpl;
    finalTicket = nicheBenchmark.avgTicket;
    finalConversionRate = nicheBenchmark.avgConversionRate;
    
    finalLeads = baseInvestment / finalCpl;
    finalSales = finalLeads * (finalConversionRate / 100);
    finalRevenue = finalSales * finalTicket;
    finalRoas = baseInvestment > 0 ? finalRevenue / baseInvestment : 0;
  }

  // Cálculos derivados
  const costPerSale = finalSales > 0 ? baseInvestment / finalSales : 0;
  const roi = baseInvestment > 0 ? ((finalRevenue - baseInvestment) / baseInvestment) * 100 : 0;

  // ROI com taxas de agência
  let agencyRoi: number | undefined;
  let userAgencyRoi: number | undefined;

  if (agencyFee !== undefined) {
    const totalCost = baseInvestment + agencyFee;
    agencyRoi = totalCost > 0 ? ((finalRevenue - totalCost) / totalCost) * 100 : 0;
  }

  if (userAgencyFee !== undefined) {
    const totalCost = baseInvestment + userAgencyFee;
    userAgencyRoi = totalCost > 0 ? ((finalRevenue - totalCost) / totalCost) * 100 : 0;
  }

  // Cálculo de investimento sugerido (se meta de faturamento foi informada)
  let suggestedInvestment: number | undefined;

  if (targetRevenue && targetRevenue > 0 && finalRoas > 0) {
    suggestedInvestment = targetRevenue / finalRoas;
  }

  return {
    leads: finalLeads,
    sales: finalSales,
    revenue: finalRevenue,
    grossRevenue: finalRevenue,
    commission: 0, // Removido
    roas: finalRoas,
    roi,
    costPerSale,
    agencyRoi,
    userAgencyRoi,
    suggestedInvestment,
    calculatedCpl: finalCpl,
    calculatedTicket: finalTicket,
    calculatedConversionRate: finalConversionRate,
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
    const monthInvestment = input.investment * Math.pow(1 + growthRate / 100, month - 1);
    const monthResult = calculateRoas({
      ...input,
      investment: monthInvestment,
      period: input.period || 'monthly',
    });

    cumulativeRevenue += monthResult.grossRevenue;
    cumulativeInvestment += monthInvestment;

    monthly.push({
      month,
      investment: monthInvestment,
      leads: monthResult.leads,
      sales: monthResult.sales,
      revenue: monthResult.revenue,
      grossRevenue: monthResult.grossRevenue,
      commission: 0,
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

  const insights = generateInsights(monthly, total, contractMonths);

  return { monthly, total, insights };
}

function generateInsights(
  monthly: MonthlyProjection[],
  total: ContractProjection['total'],
  months: number
): string[] {
  const insights: string[] = [];

  if (monthly.length > 1) {
    const firstMonth = monthly[0];
    const lastMonth = monthly[monthly.length - 1];
    const revenueGrowth = ((lastMonth.grossRevenue / firstMonth.grossRevenue - 1) * 100).toFixed(1);
    insights.push(`Crescimento de ${revenueGrowth}% no faturamento do primeiro ao último mês`);
  }

  const totalNetRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);
  const roi = ((totalNetRevenue - total.totalInvestment) / total.totalInvestment * 100).toFixed(1);
  insights.push(`ROI total de ${roi}% sobre o investimento de ${months} meses`);

  const avgMonthlyRevenue = (total.totalRevenue / months).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  insights.push(`Faturamento médio mensal de ${avgMonthlyRevenue}`);

  const bestMonth = monthly.reduce((best, current) =>
    current.grossRevenue > best.grossRevenue ? current : best
  );
  insights.push(`Melhor mês: ${bestMonth.month}° mês com ${bestMonth.grossRevenue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`);

  const worstMonth = monthly.reduce((worst, current) =>
    current.grossRevenue < worst.grossRevenue ? current : worst
  );
  if (worstMonth.month !== bestMonth.month) {
    insights.push(`Mês mais desafiador: ${worstMonth.month}° mês com ${worstMonth.grossRevenue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}`);
  }

  const netProfit = totalNetRevenue - total.totalInvestment;
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
  
  // Se estiver usando ROAS como input, ajustar o ROAS
  if (baseInput.targetRoas) {
    switch (scenario) {
      case 'optimistic':
        return {
          ...baseInput,
          targetRoas: baseInput.targetRoas * 1.3, // +30% ROAS
        };
      case 'pessimistic':
        return {
          ...baseInput,
          targetRoas: baseInput.targetRoas * 0.75, // -25% ROAS
        };
      case 'realistic':
      default:
        return baseInput;
    }
  }
  
  // Se estiver usando métricas tradicionais, ajustar CPL e conversão
  switch (scenario) {
    case 'optimistic':
      return {
        ...baseInput,
        cpl: baseInput.cpl ? baseInput.cpl * 0.85 : undefined,
        conversionRate: baseInput.conversionRate ? baseInput.conversionRate * 1.3 : undefined,
      };
    case 'pessimistic':
      return {
        ...baseInput,
        cpl: baseInput.cpl ? baseInput.cpl * 1.2 : undefined,
        conversionRate: baseInput.conversionRate ? baseInput.conversionRate * 0.75 : undefined,
      };
    case 'realistic':
    default:
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
