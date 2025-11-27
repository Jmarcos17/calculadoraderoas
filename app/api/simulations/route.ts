// app/api/simulations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const simulationSchema = z.object({
  inputData: z.object({
    investment: z.number(),
    ticket: z.number(),
    cpl: z.number(),
    conversionRate: z.number(),
    period: z.enum(['monthly', 'daily']),
    niche: z.string().optional(),
    contractMonths: z.number().optional(),
    growthRate: z.number().optional(),
  }),
  results: z.object({
    leads: z.number(),
    sales: z.number(),
    revenue: z.number(),
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
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

