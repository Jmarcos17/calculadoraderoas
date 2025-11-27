// app/api/organizations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  subdomain: z.string().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

// GET - Buscar organização específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: params.id,
        users: {
          some: {
            email: session.user.email,
          },
        },
      },
      include: {
        branding: true,
        metrics: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            simulations: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar organização
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se usuário pertence à organização
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        organizationId: params.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateOrganizationSchema.parse(body);

    // Se estiver atualizando slug, verificar se não existe
    if (data.slug) {
      const existing = await prisma.organization.findFirst({
        where: {
          slug: data.slug,
          id: { not: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data,
      include: {
        branding: true,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

