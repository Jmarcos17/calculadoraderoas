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
  // Valores médios do mercado (métricas saudáveis)
  avgTicket: number;
  avgCpl: number;
  avgConversionRate: number;
  // Benchmarks de performance
  goodRoas: number;        // ROAS considerado bom para o nicho
  excellentRoas: number;   // ROAS considerado excelente
  avgRoas: number;         // ROAS médio do mercado
}

export const niches: Record<NicheId, NicheBenchmark> = {
  moda: {
    id: 'moda',
    name: 'Moda (E-commerce)',
    description: 'E-commerce de vestuário, acessórios e calçados',
    avgTicket: 450,          // Ticket otimizado (com kits/cross-sell)
    avgCpl: 12,              // CPL saudável
    avgConversionRate: 4,    // Conversão otimizada
    goodRoas: 1.4,
    excellentRoas: 2.0,
    avgRoas: 1.5,
  },
  beleza: {
    id: 'beleza',
    name: 'Beleza & Estética',
    description: 'Clínicas, salões, depilação, skincare',
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
    avgTicket: 180,          // Ticket mensal (3 pedidos/mês)
    avgCpl: 8,
    avgConversionRate: 6,
    goodRoas: 1.2,
    excellentRoas: 1.8,
    avgRoas: 1.32,
  },
  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Escritórios de advocacia (família, trabalhista, empresarial)',
    avgTicket: 3500,
    avgCpl: 40,
    avgConversionRate: 2,
    goodRoas: 2.0,
    excellentRoas: 4.0,
    avgRoas: 2.33,
  },
  'servicos-premium': {
    id: 'servicos-premium',
    name: 'Serviços Premium',
    description: 'Odontologia, estética avançada, consultoria, cursos',
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
