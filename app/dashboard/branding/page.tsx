// app/dashboard/branding/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function BrandingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    accentColor: '#06b6d4',
    companyName: '',
    companyDescription: '',
  });

  useEffect(() => {
    // Buscar branding atual
    fetch('/api/branding')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBranding({
            logoUrl: data.logoUrl || '',
            primaryColor: data.primaryColor || '#0ea5e9',
            secondaryColor: data.secondaryColor || '#64748b',
            accentColor: data.accentColor || '#06b6d4',
            companyName: data.companyName || '',
            companyDescription: data.companyDescription || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || 'Erro ao salvar branding';
        throw new Error(errorMsg);
      }

      alert('Branding salvo com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao salvar branding';
      alert(errorMsg);
      console.error('Branding error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Branding
        </h1>
        <p className="text-slate-500 mt-1">
          Personalize a aparência da sua calculadora
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nome da empresa
          </label>
          <input
            type="text"
            value={branding.companyName}
            onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descrição
          </label>
          <textarea
            value={branding.companyDescription}
            onChange={(e) => setBranding({ ...branding, companyDescription: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            URL do Logo
          </label>
          <input
            type="url"
            value={branding.logoUrl}
            onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
            placeholder="https://exemplo.com/logo.png"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor Primária
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-slate-300"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor Secundária
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-slate-300"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor de Destaque
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="h-10 w-20 rounded border border-slate-300"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Branding'}
          </button>
        </div>
      </form>
    </div>
  );
}

