// app/dashboard/organizations/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import OrganizationDetails from '@/components/dashboard/OrganizationDetails';

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const organization = await prisma.organization.findFirst({
    where: {
      id,
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
    notFound();
  }

  // Serializar dados do Prisma para JSON (converter Decimal para number)
  const serializedOrg = {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    plan: organization.plan,
    branding: organization.branding ? {
      logoUrl: organization.branding.logoUrl,
      primaryColor: organization.branding.primaryColor,
      companyName: organization.branding.companyName,
    } : null,
    metrics: organization.metrics.map(m => ({
      avgTicket: Number(m.avgTicket),
      avgCpl: Number(m.avgCpl),
      avgConversionRate: Number(m.avgConversionRate),
    })),
    _count: organization._count,
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block"
        >
          ← Voltar ao dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          {organization.name}
        </h1>
        <p className="text-slate-500 mt-1">
          Gerencie sua calculadora de ROAS
        </p>
      </div>

      <OrganizationDetails organization={serializedOrg} />
    </div>
  );
}

