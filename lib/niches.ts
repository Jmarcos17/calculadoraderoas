// lib/niches.ts
// Métricas baseadas em dados reais de mercado (Métricas_de_mercado.md)

export type NicheId = 
  | 'moda' 
  | 'beleza' 
  | 'delivery' 
  | 'advocacia' 
  | 'servicos-premium' 
  | 'loja-fisica' 
  | 'cosmeticos'
  | 'custom';

export interface NicheBenchmark {
  id: NicheId;
  name: string;
  description: string;
  // Configuração de métricas específicas do nicho
  metricType: 'standard' | 'delivery' | 'contracts';
  // Valores médios do mercado (métricas saudáveis)
  avgTicket: number;
  avgCpl: number;              // Para delivery, representa CPA (Custo por Aquisição)
  avgConversionRate: number;   // Para advocacia, representa número médio de contratos
  // Benchmarks de performance
  goodRoas: number;        // ROAS considerado bom para o nicho
  excellentRoas: number;   // ROAS considerado excelente
  avgRoas: number;         // ROAS médio do mercado
  // Labels customizados
  cplLabel?: string;           // Label customizado para CPL/CPA
  conversionLabel?: string;    // Label customizado para conversão/contratos
}

export const niches: Record<NicheId, NicheBenchmark> = {
  moda: {
    id: 'moda',
    name: 'Moda (E-commerce)',
    description: 'E-commerce de vestuário, acessórios e calçados',
    metricType: 'standard',
    avgTicket: 450,
    avgCpl: 12,
    avgConversionRate: 4,
    goodRoas: 1.4,
    excellentRoas: 2.0,
    avgRoas: 1.5,
  },
  beleza: {
    id: 'beleza',
    name: 'Beleza & Estética',
    description: 'Clínicas, salões, depilação, skincare',
    metricType: 'standard',
    avgTicket: 350,
    avgCpl: 10,
    avgConversionRate: 7,
    goodRoas: 2.0,
    excellentRoas: 3.5,
    avgRoas: 2.45,
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery (Food)',
    description: 'Restaurantes, bares, lanches - com recorrência',
    metricType: 'delivery',
    avgTicket: 180,
    avgCpl: 8,  // CPA - Custo por Aquisição (compra)
    avgConversionRate: 6,
    goodRoas: 1.2,
    excellentRoas: 1.8,
    avgRoas: 1.32,
    cplLabel: 'CPA - Custo por Compra (R$)',
    conversionLabel: 'Taxa de Conversão (%)',
  },
  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Escritórios de advocacia (família, trabalhista, empresarial)',
    metricType: 'contracts',
    avgTicket: 3500,
    avgCpl: 40,
    avgConversionRate: 2,  // Número médio de contratos gerados
    goodRoas: 2.0,
    excellentRoas: 4.0,
    avgRoas: 2.33,
    cplLabel: 'CPL - Custo por Lead (R$)',
    conversionLabel: 'Contratos Gerados (quantidade)',
  },
  'servicos-premium': {
    id: 'servicos-premium',
    name: 'Serviços Premium',
    description: 'Odontologia, estética avançada, consultoria, cursos',
    metricType: 'standard',
    avgTicket: 1800,
    avgCpl: 15,
    avgConversionRate: 8,
    goodRoas: 6.0,
    excellentRoas: 10.0,
    avgRoas: 9.6,
  },
  'loja-fisica': {
    id: 'loja-fisica',
    name: 'Loja Física Local',
    description: 'Varejo local (não e-commerce)',
    metricType: 'standard',
    avgTicket: 230,
    avgCpl: 12,
    avgConversionRate: 10,
    goodRoas: 1.8,
    excellentRoas: 3.0,
    avgRoas: 1.91,
  },
  cosmeticos: {
    id: 'cosmeticos',
    name: 'Cosméticos & Skincare',
    description: 'Produtos físicos de beleza (ticket otimizado)',
    metricType: 'standard',
    avgTicket: 190,
    avgCpl: 8,
    avgConversionRate: 8,
    goodRoas: 1.5,
    excellentRoas: 2.5,
    avgRoas: 1.9,
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    description: 'Configure suas próprias métricas',
    metricType: 'standard',
    avgTicket: 800,
    avgCpl: 21.44,
    avgConversionRate: 5,
    goodRoas: 3.0,
    excellentRoas: 5.0,
    avgRoas: 2.5,
  },
};

export function getNicheById(id: NicheId): NicheBenchmark {
  return niches[id];
}

export function getAllNiches(): NicheBenchmark[] {
  return Object.values(niches);
}
