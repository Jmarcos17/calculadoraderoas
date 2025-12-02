// app/api/simulations/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const inputDataSchema = z.object({
  investment: z.number(),
  targetRoas: z.number().optional(),
  ticket: z.number().optional(),
  cpl: z.number().optional(),
  conversionRate: z.number().optional(),
  period: z.enum(['monthly', 'daily']),
  niche: z.string().optional(),
  contractMonths: z.number().optional(),
  growthRate: z.number().optional(),
});

const simulationSchema = z.object({
  inputData: inputDataSchema,
  results: z.object({
    leads: z.number(),
    sales: z.number(),
    revenue: z.number(),
    grossRevenue: z.number(),
    commission: z.number(),
    roas: z.number(),
    costPerSale: z.number(),
  }),
  projectionData: z.object({
    monthly: z.array(z.any()),
    total: z.object({
      totalInvestment: z.number(),
      totalRevenue: z.number(),
      totalLeads: z.number(),
      totalSales: z.number(),
      averageRoas: z.number(),
      finalRoas: z.number(),
    }),
    insights: z.array(z.string()),
  }).optional(),
});

// POST - Criar simulação pública (sem autenticação)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Verificar se a organização existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = simulationSchema.parse(body);

    // Criar simulação sem userId (pública)
    const simulation = await prisma.simulation.create({
      data: {
        organizationId,
        userId: null, // Simulação pública, sem usuário associado
        inputData: data.inputData,
        results: data.results,
        projectionData: data.projectionData || undefined,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating public simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

