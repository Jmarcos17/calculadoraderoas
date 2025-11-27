// components/dashboard/OrganizationDetails.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

interface OrganizationDetailsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    branding: {
      logoUrl: string | null;
      primaryColor: string;
      companyName: string | null;
    } | null;
    metrics: Array<{
      avgTicket: number;
      avgCpl: number;
      avgConversionRate: number;
    }>;
    _count: {
      users: number;
      simulations: number;
    };
  };
}

export default function OrganizationDetails({ organization }: OrganizationDetailsProps) {
  const [copied, setCopied] = useState(false);

  const calculatorUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${organization.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calculatorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Card de Informações Gerais */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Informações Gerais
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500 mb-1">Nome</p>
            <p className="text-sm font-medium text-slate-900">{organization.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Slug</p>
            <p className="text-sm font-medium text-slate-900">/{organization.slug}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Plano</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
              organization.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
              organization.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {organization.plan}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Estatísticas</p>
            <p className="text-sm font-medium text-slate-900">
              {organization._count.simulations} simulações • {organization._count.users} usuários
            </p>
          </div>
        </div>
      </div>

      {/* Card de URL da Calculadora */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          URL da Calculadora
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={calculatorUrl}
            readOnly
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
          />
          <button
            onClick={copyToClipboard}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Compartilhe esta URL para que seus clientes acessem a calculadora personalizada
        </p>
      </div>

      {/* Métricas Configuradas */}
      {organization.metrics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Métricas Configuradas
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Ticket Médio</p>
              <p className="text-sm font-medium text-slate-900">
                {organization.metrics[0].avgTicket.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">CPL</p>
              <p className="text-sm font-medium text-slate-900">
                {organization.metrics[0].avgCpl.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Taxa de Conversão</p>
              <p className="text-sm font-medium text-slate-900">
                {organization.metrics[0].avgConversionRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/branding"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-sky-300 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Configurar Branding
          </h3>
          <p className="text-xs text-slate-500">
            Personalize cores e logo
          </p>
        </Link>

        <Link
          href="/dashboard/metrics"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-sky-300 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">📈</div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Configurar Métricas
          </h3>
          <p className="text-xs text-slate-500">
            Defina métricas reais
          </p>
        </Link>

        <Link
          href="/dashboard/simulations"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-sky-300 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Ver Simulações
          </h3>
          <p className="text-xs text-slate-500">
            Histórico completo
          </p>
        </Link>
      </div>
    </div>
  );
}

