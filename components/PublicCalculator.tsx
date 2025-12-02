// components/PublicCalculator.tsx
"use client";

import { useState, useEffect } from 'react';
import RoasForm from '@/components/RoasForm';
import RoasResults from '@/components/RoasResults';
import ContractProjectionView from '@/components/ContractProjection';
import {
  RoasOutput,
  RoasInput,
  calculateRoas,
  ContractProjection,
  calculateContractProjection,
  applyScenario,
  calculateScenarios,
} from '@/lib/roas';
import ScenariosComparison from '@/components/ScenariosComparison';

interface PublicCalculatorProps {
  organizationId: string;
  organizationName: string;
  branding: {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    companyName: string | null;
    companyDescription: string | null;
  } | null;
  metrics: {
    avgTicket: number;
    avgCpl: number;
    avgConversionRate: number;
    goodRoas: number;
    excellentRoas: number;
    avgRoas: number;
  } | null;
}

export default function PublicCalculator({
  organizationId,
  organizationName,
  branding,
  metrics,
}: PublicCalculatorProps) {
  const [results, setResults] = useState<RoasOutput | null>(null);
  const [input, setInput] = useState<RoasInput | null>(null);
  const [projection, setProjection] = useState<ContractProjection | null>(null);
  const [saving, setSaving] = useState(false);
  const [scenarios, setScenarios] = useState<{
    optimistic: RoasOutput;
    realistic: RoasOutput;
    pessimistic: RoasOutput;
  } | null>(null);

  const primaryColor = branding?.primaryColor || '#0ea5e9';
  const secondaryColor = branding?.secondaryColor || '#64748b';
  const accentColor = branding?.accentColor || '#06b6d4';

  // Aplicar branding via CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--accent-color', accentColor);
    // Criar variações de opacidade para fundos
    root.style.setProperty('--primary-color-10', `${primaryColor}1a`); // 10% opacity
    root.style.setProperty('--primary-color-20', `${primaryColor}33`); // 20% opacity
  }, [primaryColor, secondaryColor, accentColor]);

  const handleCalculate = async (data: RoasInput) => {
    // Aplicar cenário se selecionado
    const inputWithScenario = data.scenario 
      ? applyScenario(data, data.scenario)
      : data;
    
    const res = calculateRoas(inputWithScenario);
    setResults(res);
    setInput(inputWithScenario);

    // Calcular todos os cenários para comparação
    const allScenarios = calculateScenarios(data);
    setScenarios(allScenarios);

    // Calcular projeção se contractMonths foi informado
    let contractProjection: ContractProjection | null = null;
    if (data.contractMonths && data.contractMonths > 1) {
      contractProjection = calculateContractProjection(
        data,
        data.contractMonths,
        data.growthRate || 0
      );
      setProjection(contractProjection);
    } else {
      setProjection(null);
    }

    // Salvar simulação (opcional, não bloqueia se falhar)
    try {
      setSaving(true);
      await fetch(`/api/simulations/public?organizationId=${organizationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputData: {
            investment: data.investment,
            ticket: data.ticket,
            cpl: data.cpl,
            conversionRate: data.conversionRate,
            period: data.period,
            commissionRate: data.commissionRate,
            niche: data.niche,
            contractMonths: data.contractMonths,
            growthRate: data.growthRate,
          },
          results: {
            leads: res.leads,
            sales: res.sales,
            revenue: res.revenue,
            grossRevenue: res.grossRevenue,
            commission: res.commission,
            roas: res.roas,
            costPerSale: res.costPerSale,
          },
          projectionData: contractProjection || undefined,
        }),
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
      // Não mostrar erro para o usuário, apenas logar
    } finally {
      setSaving(false);
    }
  };

  const displayName = branding?.companyName || organizationName;
  const displayDescription = branding?.companyDescription || 
    'Descubra quanto você pode faturar com seu investimento em tráfego.';

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}0d 0%, #ffffff 100%)`
      }}
    >
      {/* Background Decorativo */}
      <div 
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="w-full max-w-[1400px] bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 p-6 md:p-10 relative z-10">
        <header className="mb-10 text-center md:text-left border-b border-slate-100 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {branding?.logoUrl ? (
              <div className="relative h-20 w-auto min-w-[150px] flex items-center justify-center md:justify-start">
                <img
                  src={branding.logoUrl}
                  alt={displayName}
                  className="h-full w-auto object-contain max-w-[200px]"
                />
              </div>
            ) : (
              <div 
                className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h1 
                className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
                style={{ color: primaryColor }}
              >
                {displayName}
              </h1>
              <p className="text-slate-600 mt-2 text-lg leading-relaxed max-w-2xl">
                {displayDescription}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }}></span>
              Parâmetros da Simulação
            </h2>
            <RoasForm 
              onCalculate={handleCalculate}
              defaultValues={metrics ? {
                ticket: metrics.avgTicket,
                cpl: metrics.avgCpl,
                conversionRate: metrics.avgConversionRate,
              } : undefined}
              branding={branding}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full" style={{ backgroundColor: secondaryColor }}></span>
                Resultados Projetados
              </h2>
              <RoasResults 
                results={results} 
                input={input || undefined}
                benchmarks={metrics ? {
                  goodRoas: metrics.goodRoas,
                  excellentRoas: metrics.excellentRoas,
                  avgRoas: metrics.avgRoas,
                } : undefined}
                branding={branding}
              />
            </div>

            {/* Comparação de Cenários */}
            {scenarios && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <ScenariosComparison scenarios={scenarios} />
              </div>
            )}

            {/* Projeção de Contrato */}
            {projection && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <ContractProjectionView
                  projection={projection}
                  input={input || undefined}
                  organizationName={displayName}
                />
              </div>
            )}
          </div>
        </div>

        {saving && (
          <div className="mt-6 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Salvando simulação...
          </div>
        )}
        
        <footer className="mt-12 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Powered by Calculadora ROAS &bull; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}

