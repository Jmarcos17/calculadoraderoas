// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import PublicCalculator from '@/components/PublicCalculator';

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      branding: true,
      metrics: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!organization) {
    notFound();
  }

  // Serializar dados do Prisma
  const branding = organization.branding ? {
    logoUrl: organization.branding.logoUrl,
    primaryColor: organization.branding.primaryColor,
    secondaryColor: organization.branding.secondaryColor,
    accentColor: organization.branding.accentColor,
    companyName: organization.branding.companyName,
    companyDescription: organization.branding.companyDescription,
  } : null;

  const metrics = organization.metrics.length > 0 ? {
    avgTicket: Number(organization.metrics[0].avgTicket),
    avgCpl: Number(organization.metrics[0].avgCpl),
    avgConversionRate: Number(organization.metrics[0].avgConversionRate),
    goodRoas: Number(organization.metrics[0].goodRoas),
    excellentRoas: Number(organization.metrics[0].excellentRoas),
    avgRoas: Number(organization.metrics[0].avgRoas),
  } : null;

  return (
    <PublicCalculator
      organizationId={organization.id}
      organizationName={organization.name}
      branding={branding}
      metrics={metrics}
    />
  );
}

