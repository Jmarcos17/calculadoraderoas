// app/api/simulations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';

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

// GET - Listar simulações da organização
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const simulations = await prisma.simulation.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a 50 últimas simulações
    });

    return NextResponse.json(simulations);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Criar nova simulação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = simulationSchema.parse(body);

    const simulation = await prisma.simulation.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        inputData: data.inputData,
        results: data.results,
        projectionData: data.projectionData || undefined,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

