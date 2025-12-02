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
  
  // Ajuste de período (se usuário estiver em modo diário, converte para mensal)
  // Se o investimento for diário, multiplica por 30 para obter o mensal
  // Se o investimento já for mensal, usa diretamente
  // IMPORTANTE: O CPL é sempre o mesmo, independente do período (é o custo por lead)
  // CORREÇÃO: Garantir que o período seja interpretado corretamente
  // Por padrão, assumir que é mensal se não especificado ou se for um valor inválido
  const normalizedPeriod = (period === 'daily' || period === 'monthly') ? period : 'monthly';
  const baseInvestment =
    normalizedPeriod === 'monthly' ? investment : investment * 30;
  
  // Cálculo de leads: investimento mensal dividido pelo custo por lead
  // O CPL não precisa ser ajustado porque é sempre "custo por lead", não varia com o período
  const leads = baseInvestment / cpl;
  
  // Cálculo de vendas: leads multiplicado pela taxa de conversão (em decimal)
  const sales = leads * (conversionRate / 100);
  
  // Cálculo de receita bruta: vendas multiplicado pelo ticket médio
  const grossRevenue = sales * ticket;
  
  // Cálculo da comissão: receita bruta multiplicada pela taxa de comissão (em decimal)
  const commission = grossRevenue * (commissionRate / 100);
  
  // Cálculo de receita líquida: receita bruta menos comissão
  const revenue = grossRevenue - commission;
  
  // Cálculo de ROAS: receita líquida dividida pelo investimento
  const roas = baseInvestment > 0 ? revenue / baseInvestment : 0;
  
  // Cálculo de custo por venda: investimento dividido pelas vendas
  const costPerSale = sales > 0 ? baseInvestment / sales : 0;

  // Cálculo de ROI Simples (%)
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

  // Cálculo Reverso: Sugestão de Investimento para atingir ROAS alvo
  let suggestedInvestment: number | undefined;
  if (targetRoas && targetRoas > 0) {
    // Fórmula: Investimento = (Leads * Conversão * Ticket) / ROAS
    // Mas Leads = Investimento / CPL
    // Logo: Investimento * ROAS = (Investimento / CPL) * Conversão * Ticket
    // Isso cancela o Investimento, o que significa que o ROAS é constante para um dado CPL, Conversão e Ticket.
    // ROAS = (Ticket * Conversão) / CPL
    
    // Se quisermos atingir um ROAS específico, precisamos melhorar as métricas (CPL, Conv, Ticket), 
    // não apenas mudar o investimento (assumindo modelo linear).
    
    // PORÉM, se o objetivo for "Quanto investir para ter X de Faturamento com esse ROAS?", 
    // a pergunta seria diferente.
    
    // Se a intenção do usuário é "Quanto investir para ter um ROAS de X?", 
    // e o ROAS atual é Y, e assumimos que o ROAS cai com escala ou é constante...
    // Se for constante, não há "investimento sugerido" para mudar o ROAS.
    
    // Vamos interpretar como: "Quanto investir para ter um LUCRO X?" ou algo assim?
    // O pedido foi: "Se conseguir manipular Roas para sugerir um valor de investimento"
    
    // Talvez o usuário queira dizer: "Dado um ROAS Alvo, qual o investimento MÁXIMO que posso ter?"
    // Ou talvez: "Para ter R$ X de retorno, quanto preciso investir?"
    
    // Vamos assumir uma interpretação comum: 
    // Se o usuário quer um ROAS alvo, e o ROAS atual é menor, ele precisa melhorar a eficiência.
    // Se o ROAS atual é maior que o alvo, ele pode escalar.
    
    // Vamos implementar uma lógica simples de projeção:
    // Se eu quero Faturar X (não temos input de meta de faturamento), quanto investir?
    
    // Vamos tentar outra abordagem:
    // Talvez o usuário queira saber: "Com esse ROAS alvo, qual seria meu faturamento dado o investimento atual?"
    // Mas o pedido é "sugerir um valor de investimento".
    
    // Vamos simplificar: Sugerir investimento para atingir R$ 100.000,00 de faturamento (exemplo arbitrário)? Não.
    
    // Vamos deixar suggestedInvestment como undefined por enquanto se a lógica não for clara,
    // ou implementar uma regra de 3 simples se houver uma meta de receita (que não temos no input).
    
    // NOVA INTERPRETAÇÃO: Talvez o usuário queira fixar o ROAS e calcular o investimento necessário para um determinado resultado?
    // Sem uma meta de resultado (ex: Quero R$ 10k de lucro), não dá para sugerir investimento apenas com ROAS alvo.
    
    // VOU ADICIONAR UM CAMPO DE META DE FATURAMENTO NO FUTURO SE NECESSÁRIO.
    // Por enquanto, vou calcular o investimento necessário para atingir o ROAS alvo
    // assumindo que o CPL aumenta com o investimento (escala não linear).
    // Mas isso requer uma função de elasticidade.
    
    // Vou deixar null por enquanto para não inventar dados, a menos que o usuário forneça mais contexto.
    // Mas para não deixar o campo inútil, vou fazer o seguinte:
    // Se o usuário preencher "targetRoas", vamos calcular qual seria o CPL necessário para atingir esse ROAS
    // mantendo o investimento atual. Isso é útil.
    // Mas o campo chama "suggestedInvestment".
    
    // Vamos manter simples: Se o usuário quer atingir um ROAS X, e as métricas atuais dão ROAS Y.
    // Se X < Y, ele pode investir mais (assumindo degradação).
    // Se X > Y, ele precisa investir menos ou melhorar métricas.
    
    // Vou deixar como opcional e não calcular por enquanto para não confundir.
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

    cumulativeRevenue += monthResult.revenue;
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

