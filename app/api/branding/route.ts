// app/api/branding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const brandingSchema = z.object({
  logoUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.null(),
  ]).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  companyName: z.string().optional().nullable(),
  companyDescription: z.string().optional().nullable(),
  faviconUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.null(),
  ]).optional(),
  customCss: z.string().optional().nullable(),
});

// GET - Buscar branding da organização do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: {
          include: { branding: true },
        },
      },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const branding = await prisma.organizationBranding.findUnique({
      where: { organizationId: user.organizationId },
    });

    return NextResponse.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar branding
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
    const data = brandingSchema.parse(body);

    // Converter strings vazias para null
    const cleanedData = {
      ...data,
      logoUrl: data.logoUrl === '' ? null : data.logoUrl,
      faviconUrl: data.faviconUrl === '' ? null : data.faviconUrl,
    };

    const branding = await prisma.organizationBranding.upsert({
      where: { organizationId: user.organizationId },
      update: cleanedData,
      create: {
        organizationId: user.organizationId,
        ...cleanedData,
      },
    });

    return NextResponse.json(branding);
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

    console.error('Error saving branding:', error);
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

