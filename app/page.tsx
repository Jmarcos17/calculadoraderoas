// app/page.tsx
"use client";

import RoasForm from '@/components/RoasForm';
import RoasResults from '@/components/RoasResults';
import ContractProjectionView from '@/components/ContractProjection';
import ScenariosComparison from '@/components/ScenariosComparison';
import { useState, useEffect } from 'react';
import {
  RoasOutput,
  RoasInput,
  calculateRoas,
  ContractProjection,
  calculateContractProjection,
  applyScenario,
  calculateScenarios,
} from '@/lib/roas';

export default function HomePage() {
  const [results, setResults] = useState<RoasOutput | null>(null);
  const [input, setInput] = useState<RoasInput | null>(null);
  const [projection, setProjection] = useState<ContractProjection | null>(null);
  const [reopenData, setReopenData] = useState<RoasInput | null>(null);
  const [scenarios, setScenarios] = useState<{
    optimistic: RoasOutput;
    realistic: RoasOutput;
    pessimistic: RoasOutput;
  } | null>(null);

  // Verificar se há simulação para reabrir
  useEffect(() => {
    const saved = localStorage.getItem('reopenSimulation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setReopenData(data);
        localStorage.removeItem('reopenSimulation');
        
        // Calcular automaticamente
        const res = calculateRoas(data);
        setResults(res);
        setInput(data);

        // Calcular projeção se houver
        if (data.contractMonths && data.contractMonths > 1 && data.projectionData) {
          setProjection(data.projectionData);
        } else if (data.contractMonths && data.contractMonths > 1) {
          const contractProjection = calculateContractProjection(
            data,
            data.contractMonths,
            data.growthRate || 0
          );
          setProjection(contractProjection);
        }
      } catch (error) {
        console.error('Error reopening simulation:', error);
      }
    }
  }, []);

  const handleCalculate = (data: RoasInput) => {
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
    // IMPORTANTE: usar data.contractMonths (original) e não inputWithScenario.contractMonths
    // porque o contractMonths não muda com o cenário
    if (data.contractMonths && data.contractMonths > 1) {
      const contractProjection = calculateContractProjection(
        inputWithScenario,
        data.contractMonths,
        data.growthRate || 0
      );
      setProjection(contractProjection);
    } else {
      setProjection(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[1400px] bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Calculadora de ROAS
          </h1>
          <p className="text-slate-500 mt-1">
            Descubra quanto você pode faturar com seu investimento em tráfego.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          <RoasForm 
            onCalculate={handleCalculate}
            defaultValues={reopenData ? {
              investment: reopenData.investment,
              ticket: reopenData.ticket,
              cpl: reopenData.cpl,
              conversionRate: reopenData.conversionRate,
              period: reopenData.period,
              niche: reopenData.niche,
              contractMonths: reopenData.contractMonths,
              growthRate: reopenData.growthRate,
              scenario: reopenData.scenario,
            } : undefined}
          />
          <RoasResults results={results} input={input || undefined} />
        </div>

        {/* Comparação de Cenários */}
        {scenarios && (
          <ScenariosComparison scenarios={scenarios} />
        )}

        {/* Projeção de Contrato */}
        {projection && (
          <ContractProjectionView
            projection={projection}
            input={input || undefined}
          />
        )}
      </div>
    </main>
  );
}

