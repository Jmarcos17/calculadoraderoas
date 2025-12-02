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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Configurações</h2>
          
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
            <p className="text-xs text-slate-500 mt-1">
              Recomendamos uma imagem com fundo transparente (PNG).
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cor Primária (Botões, Títulos)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-slate-300 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cor Secundária (Detalhes, Fundos)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-slate-300 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cor de Destaque (Ícones, Badges)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  className="h-10 w-14 rounded border border-slate-300 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Pré-visualização</h2>
          
          <div 
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor}0d 0%, #ffffff 100%)`
            }}
          >
            {/* Background Decorativo Preview */}
            <div 
              className="absolute top-0 left-0 w-full h-1 opacity-50"
              style={{ backgroundColor: branding.primaryColor }}
            />

            <div className="p-6 md:p-8 space-y-8">
              {/* Header Preview */}
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo Preview"
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
                  >
                    {branding.companyName ? branding.companyName.charAt(0).toUpperCase() : 'L'}
                  </div>
                )}
                <div>
                  <h3 
                    className="text-xl font-bold tracking-tight"
                    style={{ color: branding.primaryColor }}
                  >
                    {branding.companyName || 'Nome da Empresa'}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {branding.companyDescription || 'Descrição da sua empresa aqui...'}
                  </p>
                </div>
              </div>

              {/* Cards Preview */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ backgroundColor: branding.accentColor }}></span>
                    Exemplo de Input
                  </h4>
                  <div className="space-y-3">
                    <div className="h-2 w-24 bg-slate-100 rounded"></div>
                    <div className="h-10 w-full border border-slate-200 rounded-lg bg-slate-50"></div>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ backgroundColor: branding.secondaryColor }}></span>
                    Exemplo de Resultado
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-3 rounded-lg border bg-white"
                      style={{ 
                        borderColor: `${branding.primaryColor}40`,
                        backgroundColor: `${branding.primaryColor}10`
                      }}
                    >
                      <p className="text-xs text-slate-500 mb-1">ROAS</p>
                      <p className="text-lg font-bold text-slate-900">5.00x</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <p className="text-xs text-slate-500 mb-1">Leads</p>
                      <p className="text-lg font-bold text-slate-900">150</p>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white shadow-md transition-transform active:scale-95"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Botão de Ação Principal
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center">
            Esta é apenas uma prévia simplificada. A calculadora real terá mais detalhes.
          </p>
        </div>
      </div>
    </div>
  );
}

