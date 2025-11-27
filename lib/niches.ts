// lib/niches.ts

export type NicheId = 'advocacia' | 'negocio-local' | 'saude' | 'educacao' | 'ecommerce' | 'imobiliaria' | 'custom';

export interface NicheBenchmark {
  id: NicheId;
  name: string;
  description: string;
  // Valores médios do mercado
  avgTicket: number;
  avgCpl: number;
  avgConversionRate: number;
  // Benchmarks de performance
  goodRoas: number;        // ROAS considerado bom para o nicho
  excellentRoas: number;   // ROAS considerado excelente
  avgRoas: number;         // ROAS médio do mercado
}

export const niches: Record<NicheId, NicheBenchmark> = {
  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Escritórios de advocacia e serviços jurídicos',
    avgTicket: 2500,
    avgCpl: 85,
    avgConversionRate: 8,
    goodRoas: 3.5,
    excellentRoas: 5.0,
    avgRoas: 2.8,
  },
  'negocio-local': {
    id: 'negocio-local',
    name: 'Negócio Local',
    description: 'Restaurantes, salões, clínicas locais',
    avgTicket: 150,
    avgCpl: 12,
    avgConversionRate: 15,
    goodRoas: 4.0,
    excellentRoas: 6.0,
    avgRoas: 3.2,
  },
  saude: {
    id: 'saude',
    name: 'Saúde',
    description: 'Clínicas, consultórios médicos, estética',
    avgTicket: 800,
    avgCpl: 45,
    avgConversionRate: 12,
    goodRoas: 3.8,
    excellentRoas: 5.5,
    avgRoas: 3.0,
  },
  educacao: {
    id: 'educacao',
    name: 'Educação',
    description: 'Cursos, escolas, treinamentos',
    avgTicket: 500,
    avgCpl: 25,
    avgConversionRate: 10,
    goodRoas: 3.5,
    excellentRoas: 5.0,
    avgRoas: 2.9,
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Lojas online e vendas digitais',
    avgTicket: 200,
    avgCpl: 8,
    avgConversionRate: 3,
    goodRoas: 4.5,
    excellentRoas: 7.0,
    avgRoas: 3.5,
  },
  imobiliaria: {
    id: 'imobiliaria',
    name: 'Imobiliária',
    description: 'Corretores e imobiliárias',
    avgTicket: 15000,
    avgCpl: 120,
    avgConversionRate: 5,
    goodRoas: 3.0,
    excellentRoas: 4.5,
    avgRoas: 2.5,
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    description: 'Configure suas próprias métricas',
    avgTicket: 0,
    avgCpl: 0,
    avgConversionRate: 0,
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

