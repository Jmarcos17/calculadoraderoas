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
  commissionRate?: number; // Taxa de comissão (%) - opcional, descontada da receita
  agencyFee?: number;      // Mensalidade da Agência Genérica (R$)
  userAgencyFee?: number;  // Mensalidade da Agência do Usuário (R$)
  targetRoas?: number;     // ROAS alvo para cálculo reverso de investimento
  targetRevenue?: number;  // Meta de faturamento para cálculo reverso (R$)
  niche?: NicheId;         // Nicho selecionado (opcional)
  contractMonths?: number; // Duração do contrato em meses (opcional)
  growthRate?: number;     // Taxa de crescimento mensal do investimento (%) (opcional)
  scenario?: ScenarioType; // Cenário (otimista/realista/pessimista) (opcional)
}

export interface RoasOutput {
  leads: number;
  sales: number;
  revenue: number;        // Receita líquida (após descontar comissão, se houver)
  grossRevenue: number;   // Receita bruta (antes de descontar comissão)
  commission: number;     // Valor total da comissão (R$)
  roas: number;           // ROAS calculado com receita líquida
  roi: number;            // ROI (%) = (Receita Líquida - Investimento) / Investimento * 100
  costPerSale: number;
  suggestedInvestment?: number; // Investimento sugerido para atingir o ROAS alvo
  agencyRoi?: number;     // ROI considerando a taxa da agência genérica
  userAgencyRoi?: number; // ROI considerando a taxa da agência do usuário
}

export interface MonthlyProjection {
  month: number;
  investment: number;
  leads: number;
  sales: number;
  revenue: number;        // Receita líquida
  grossRevenue: number;  // Receita bruta
  commission: number;    // Comissão do mês
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
  commissionRate = 0,
  agencyFee,
  userAgencyFee,
  targetRoas,
  targetRevenue,
}: RoasInput): RoasOutput {
  // Validação: garantir que CPL seja maior que zero
  if (cpl <= 0) {
    throw new Error('Custo por lead deve ser maior que zero');
  }
  
  // Validação: garantir que investimento seja maior que zero
  if (investment <= 0) {
    throw new Error('Investimento deve ser maior que zero');
  }
  
  // Validação: garantir que taxa de comissão seja entre 0 e 100
  if (commissionRate < 0 || commissionRate > 100) {
    throw new Error('Taxa de comissão deve estar entre 0% e 100%');
  }
  
  // ============================================================================
  // IMPORTANTE: LÓGICA DE CÁLCULO MENSAL
  // ============================================================================
  // Todos os cálculos são feitos para 1 MÊS (30 dias).
  // O investimento informado pelo usuário é SEMPRE mensal.
  // 
  // Se period = 'daily':
  //   - O usuário informou investimento DIÁRIO
  //   - Multiplicamos por 30 para obter o investimento MENSAL
  //   - Todos os resultados (leads, vendas, revenue, ROAS) são MENSAIS
  //
  // Se period = 'monthly' (padrão):
  //   - O usuário informou investimento MENSAL
  //   - Usamos diretamente
  //   - Todos os resultados são MENSAIS
  //
  // O tempo de contrato (contractMonths) é usado APENAS para:
  //   ✅ Projeções mês a mês (gráficos e tabelas)
  //   ✅ Visualização de crescimento
  //   ❌ NÃO é usado para calcular os resultados principais
  // ============================================================================
  
  const normalizedPeriod = (period === 'daily' || period === 'monthly') ? period : 'monthly';
  const baseInvestment =
    normalizedPeriod === 'monthly' ? investment : investment * 30;
  
  // 1. LEADS MENSAIS = Investimento Mensal / CPL
  // Exemplo: R$ 3.000 / R$ 50 = 60 leads/mês
  const leads = baseInvestment / cpl;
  
  // 2. VENDAS MENSAIS = Leads Mensais × Taxa de Conversão
  // Exemplo: 60 × 3% = 1.8 vendas/mês
  const sales = leads * (conversionRate / 100);
  
  // 3. FATURAMENTO BRUTO MENSAL = Vendas Mensais × Ticket Médio
  // Exemplo: 1.8 × R$ 200 = R$ 360/mês
  const grossRevenue = sales * ticket;
  
  // 4. COMISSÃO MENSAL = Faturamento Bruto Mensal × Taxa de Comissão
  // Exemplo: R$ 360 × 0% = R$ 0/mês
  const commission = grossRevenue * (commissionRate / 100);
  
  // 5. RECEITA LÍQUIDA MENSAL = Faturamento Bruto - Comissão
  // Exemplo: R$ 360 - R$ 0 = R$ 360/mês
  const revenue = grossRevenue - commission;
  
  // 6. ROAS MENSAL = Faturamento Bruto Mensal / Investimento Mensal
  // Exemplo: R$ 360 / R$ 3.000 = 0.12x
  // Significa: Para cada R$1 investido, voltam R$0.12 por mês
  const roas = baseInvestment > 0 ? grossRevenue / baseInvestment : 0;
  
  // 7. CPA (Custo Por Aquisição) = Investimento Mensal / Vendas Mensais
  // Exemplo: R$ 3.000 / 1.8 = R$ 1.666,67 por venda
  const costPerSale = sales > 0 ? baseInvestment / sales : 0;

  // 8. ROI MENSAL (%) = ((Receita Líquida - Investimento) / Investimento) × 100
  // Exemplo: ((R$ 360 - R$ 3.000) / R$ 3.000) × 100 = -88%
  // ROI considera o retorno líquido (após comissão)
  const roi = baseInvestment > 0 ? ((revenue - baseInvestment) / baseInvestment) * 100 : 0;

  // Cálculo de ROI com taxas de agência (se fornecidas)
  let agencyRoi: number | undefined;
  let userAgencyRoi: number | undefined;

  if (agencyFee !== undefined) {
    const totalCost = baseInvestment + agencyFee;
    agencyRoi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
  }

  if (userAgencyFee !== undefined) {
    const totalCost = baseInvestment + userAgencyFee;
    userAgencyRoi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
  }

  // Cálculo Reverso: Sugestão de Investimento
  let suggestedInvestment: number | undefined;

  // Opção 1: Se o usuário forneceu uma meta de faturamento
  if (targetRevenue && targetRevenue > 0) {
    // Fórmula inversa:
    // GrossRevenue = (Investment / CPL) * (conversionRate / 100) * ticket
    // Logo: Investment = (targetRevenue * CPL * 100) / (conversionRate * ticket)

    const conversionDecimal = conversionRate / 100;
    if (conversionDecimal > 0 && ticket > 0) {
      const grossInvestmentNeeded = (targetRevenue * cpl * 100) / (conversionRate * ticket);
      suggestedInvestment = grossInvestmentNeeded > 0 ? grossInvestmentNeeded : undefined;
    }
  }
  // Opção 2: Se o usuário forneceu um ROAS alvo (mas sem meta de receita)
  else if (targetRoas && targetRoas > 0 && baseInvestment > 0) {
    // Com ROAS alvo, podemos calcular a receita esperada com o investimento atual
    // e depois sugerir quanto investir para dobrar, triplicar, etc.
    // Mas sem uma meta clara, vamos calcular o investimento que manteria o mesmo ROAS
    // mas com uma receita específica (ex: 2x a receita atual)

    // Por exemplo: Se o ROAS alvo é maior que o ROAS atual,
    // significa que o usuário precisa melhorar eficiência, não escalar investimento.
    // Se o ROAS alvo é menor, pode escalar.

    // Vamos calcular: "Quanto investir para ter o dobro de receita mantendo o ROAS atual?"
    const targetRevenueFor2x = grossRevenue * 2;
    const conversionDecimal = conversionRate / 100;
    if (conversionDecimal > 0 && ticket > 0) {
      suggestedInvestment = (targetRevenueFor2x * cpl * 100) / (conversionRate * ticket);
    }
  }

  return {
    leads,
    sales,
    revenue,
    grossRevenue,
    commission,
    roas,
    roi,
    costPerSale,
    agencyRoi,
    userAgencyRoi,
    suggestedInvestment,
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
    // IMPORTANTE: O investimento aqui já deve estar no formato correto (mensal ou diário)
    // conforme o período especificado no input
    const monthInvestment = input.investment * Math.pow(1 + growthRate / 100, month - 1);
    const monthResult = calculateRoas({
      ...input,
      investment: monthInvestment,
      // Garantir que o período seja preservado corretamente
      period: input.period || 'monthly',
    });

    cumulativeRevenue += monthResult.grossRevenue; // Acumular Receita Bruta ou Líquida? Geralmente Bruta para faturamento.
    cumulativeInvestment += monthInvestment;

    monthly.push({
      month,
      investment: monthInvestment,
      leads: monthResult.leads,
      sales: monthResult.sales,
      revenue: monthResult.revenue,
      grossRevenue: monthResult.grossRevenue,
      commission: monthResult.commission,
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
    const revenueGrowth = ((lastMonth.grossRevenue / firstMonth.grossRevenue - 1) * 100).toFixed(1);
    insights.push(`Crescimento de ${revenueGrowth}% no faturamento do primeiro ao último mês`);
  }

  // Insight sobre ROI
  // ROI usa receita líquida
  const totalNetRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);
  const roi = ((totalNetRevenue - total.totalInvestment) / total.totalInvestment * 100).toFixed(1);
  insights.push(`ROI total de ${roi}% sobre o investimento de ${months} meses`);

  // Insight sobre média mensal
  const avgMonthlyRevenue = (total.totalRevenue / months).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  insights.push(`Faturamento médio mensal de ${avgMonthlyRevenue}`);

  // Insight sobre melhor mês
  const bestMonth = monthly.reduce((best, current) =>
    current.grossRevenue > best.grossRevenue ? current : best
  );
  insights.push(`Melhor mês: ${bestMonth.month}° mês com ${bestMonth.grossRevenue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`);

  // Insight sobre pior mês
  const worstMonth = monthly.reduce((worst, current) =>
    current.grossRevenue < worst.grossRevenue ? current : worst
  );
  if (worstMonth.month !== bestMonth.month) {
    insights.push(`Mês mais desafiador: ${worstMonth.month}° mês com ${worstMonth.grossRevenue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}`);
  }

  // Insight sobre lucro líquido
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
  
  switch (scenario) {
    case 'optimistic':
      // Cenário otimista: -15% CPL, +30% conversão (Ticket mantido)
      return {
        ...baseInput,
        cpl: baseInput.cpl * 0.85,
        conversionRate: baseInput.conversionRate * 1.3,
      };
    
    case 'pessimistic':
      // Cenário pessimista: +20% CPL, -25% conversão (Ticket mantido)
      return {
        ...baseInput,
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

