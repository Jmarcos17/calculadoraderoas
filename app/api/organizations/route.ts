// app/api/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@/lib/api-error';

const createOrganizationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

// GET - Listar organizações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        users: {
          some: {
            email: session.user.email,
          },
        },
      },
      include: {
        branding: true,
        _count: {
          select: {
            users: true,
            simulations: true,
          },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Criar nova organização
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrganizationSchema.parse(body);

    // Verificar se slug já existe
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar organização e usuário
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        users: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: 'owner',
          },
        },
        branding: {
          create: {
            companyName: data.name,
          },
        },
      },
      include: {
        branding: true,
        users: true,
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

