// components/dashboard/DashboardSidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Palette, 
  BarChart3, 
  Calculator, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Branding', href: '/dashboard/branding', icon: Palette },
  { name: 'Métricas', href: '/dashboard/metrics', icon: BarChart3 },
  { name: 'Simulações', href: '/dashboard/simulations', icon: Calculator },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-16">
        <h1 className="text-lg font-semibold text-slate-900">Calculadora ROAS</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col
        lg:translate-x-0 lg:fixed lg:inset-y-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden lg:flex h-16 shrink-0 items-center px-6 border-b border-slate-200 lg:border-none">
          <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Calculadora ROAS
          </h1>
        </div>
        
        <nav className="flex flex-1 flex-col px-6 pb-4 pt-4 lg:pt-0 overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors ${
                          isActive
                            ? 'bg-sky-50 text-sky-600'
                            : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon 
                          className={`h-5 w-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-sky-600'}`} 
                          aria-hidden="true" 
                        />
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
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-slate-600 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors"
              >
                <LogOut 
                  className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600" 
                  aria-hidden="true" 
                />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

