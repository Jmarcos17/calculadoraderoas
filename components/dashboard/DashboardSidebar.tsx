// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Branding', href: '/dashboard/branding', icon: '🎨' },
  { name: 'Métricas', href: '/dashboard/metrics', icon: '📈' },
  { name: 'Simulações', href: '/dashboard/simulations', icon: '📋' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Calculadora ROAS
          </h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 ${
                          isActive
                            ? 'bg-sky-50 text-sky-600'
                            : 'text-slate-700 hover:text-sky-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-slate-700 hover:bg-slate-50 hover:text-sky-600"
              >
                <span className="text-lg">🚪</span>
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

