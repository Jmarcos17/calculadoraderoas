// app/api/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const metricsSchema = z.object({
  nicheId: z.string().optional().nullable(),
  avgTicket: z.number().min(0),
  avgCpl: z.number().min(0),
  avgConversionRate: z.number().min(0).max(100),
  goodRoas: z.number().min(0),
  excellentRoas: z.number().min(0),
  avgRoas: z.number().min(0),
});

// GET - Buscar métricas ativas da organização
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

    const metrics = await prisma.organizationMetric.findFirst({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!metrics) {
      return NextResponse.json({ error: 'No metrics found' }, { status: 404 });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar métricas
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
    const data = metricsSchema.parse(body);

    // Desativar métricas antigas
    await prisma.organizationMetric.updateMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Criar nova métrica ativa
    const metrics = await prisma.organizationMetric.create({
      data: {
        organizationId: user.organizationId,
        nicheId: data.nicheId || null,
        avgTicket: data.avgTicket,
        avgCpl: data.avgCpl,
        avgConversionRate: data.avgConversionRate,
        goodRoas: data.goodRoas,
        excellentRoas: data.excellentRoas,
        avgRoas: data.avgRoas,
        isActive: true,
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: error.issues,
          message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    console.error('Error saving metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error instanceof Error ? error.stack : undefined 
        })
      },
      { status: 500 }
    );
  }
}

