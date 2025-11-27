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

  // Aplicar branding via CSS variables
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', branding.primaryColor);
      root.style.setProperty('--secondary-color', branding.secondaryColor);
      root.style.setProperty('--accent-color', branding.accentColor);
    }
  }, [branding]);

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
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1400px] bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          {branding?.logoUrl && (
            <div className="mb-4">
              <img
                src={branding.logoUrl}
                alt={displayName}
                className="h-12 object-contain"
              />
            </div>
          )}
          <h1 
            className="text-2xl md:text-3xl font-semibold text-slate-900"
            style={branding ? { color: branding.primaryColor } : {}}
          >
            {displayName}
          </h1>
          <p className="text-slate-500 mt-1">
            {displayDescription}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          <RoasForm 
            onCalculate={handleCalculate}
            defaultValues={metrics ? {
              ticket: metrics.avgTicket,
              cpl: metrics.avgCpl,
              conversionRate: metrics.avgConversionRate,
            } : undefined}
          />
          <RoasResults 
            results={results} 
            input={input || undefined}
            benchmarks={metrics ? {
              goodRoas: metrics.goodRoas,
              excellentRoas: metrics.excellentRoas,
              avgRoas: metrics.avgRoas,
            } : undefined}
          />
        </div>
        {saving && (
          <div className="mt-4 text-xs text-slate-500 text-center">
            Salvando simulação...
          </div>
        )}

        {/* Comparação de Cenários */}
        {scenarios && (
          <ScenariosComparison scenarios={scenarios} />
        )}

        {/* Projeção de Contrato */}
        {projection && (
          <ContractProjectionView
            projection={projection}
            input={input || undefined}
            organizationName={displayName}
          />
        )}
      </div>
    </main>
  );
}

