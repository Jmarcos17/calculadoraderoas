// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
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
          simulations: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Gerencie suas calculadoras de ROAS
        </p>
      </div>

      {organizations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-4">
            Você ainda não tem nenhuma organização cadastrada.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
          >
            Criar primeira organização
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/dashboard/organizations/${org.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {org.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Slug: /{org.slug}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {org._count.simulations} simulações
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  org.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                  org.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {org.plan}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

