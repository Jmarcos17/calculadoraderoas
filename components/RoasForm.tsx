"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PeriodType, RoasInput, ScenarioType } from '@/lib/roas';
import { NicheId, getAllNiches, getNicheById } from '@/lib/niches';
import { RoasFormData, roasFormSchema } from '@/lib/validations';
import LoadingSpinner from './LoadingSpinner';

interface RoasFormProps {
  onCalculate: (data: RoasInput) => void;
  defaultValues?: Partial<RoasFormData>;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
}

export default function RoasForm({ onCalculate, defaultValues, branding }: RoasFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoasFormData>({
    resolver: zodResolver(roasFormSchema) as any,
    mode: 'onChange',
    defaultValues: {
      investment: 1000,
      ticket: 800,
      cpl: 21.44,
      conversionRate: 5,
      period: 'monthly',
      commissionRate: 0,
      niche: 'custom',
      scenario: 'realistic',
      ...defaultValues,
    },
  });

  const selectedNiche = watch('niche') as NicheId;
  const selectedPeriod = watch('period');
  const selectedScenario = watch('scenario');
  const contractMonths = watch('contractMonths');

  // Auto-preenchimento quando nicho muda
  useEffect(() => {
    if (selectedNiche && selectedNiche !== 'custom') {
      const nicheData = getNicheById(selectedNiche);
      setValue('ticket', nicheData.avgTicket);
      setValue('cpl', nicheData.avgCpl);
      setValue('conversionRate', nicheData.avgConversionRate);
    }
  }, [selectedNiche, setValue]);

  const onSubmit = async (data: RoasFormData) => {
    setIsSubmitting(true);
    try {
      const payload: RoasInput = {
        ...data,
        niche: data.niche as NicheId,
        period: data.period as PeriodType,
        scenario: data.scenario as ScenarioType,
      };
      onCalculate(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = branding?.primaryColor || '#0ea5e9'; // Default sky-500

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ... existing fields ... */}

      {/* Toggle de Cenários */}
      <div className="border border-slate-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Cenário de Projeção
        </label>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs w-full">
          {(['pessimistic', 'realistic', 'optimistic'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue('scenario', s)}
              className={`flex-1 px-3 py-2 rounded-full transition-colors ${
                selectedScenario === s
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              style={selectedScenario === s ? { 
                backgroundColor: s === 'pessimistic' ? '#ef4444' : s === 'optimistic' ? '#22c55e' : primaryColor 
              } : {}}
            >
              {s === 'pessimistic' ? 'Pessimista' : s === 'realistic' ? 'Realista' : 'Otimista'}
            </button>
          ))}
        </div>
        {/* ... existing description ... */}
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setValue('period', 'monthly')}
            className={`px-3 py-1 rounded-full transition-colors ${
              selectedPeriod === 'monthly'
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            style={selectedPeriod === 'monthly' ? { backgroundColor: primaryColor } : {}}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setValue('period', 'daily')}
            className={`px-3 py-1 rounded-full transition-colors ${
              selectedPeriod === 'daily'
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            style={selectedPeriod === 'daily' ? { backgroundColor: primaryColor } : {}}
          >
            Diário
          </button>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Calculando...
            </>
          ) : (
            'Calcular Agora'
          )}
        </button>
      </div>
    </form>
  );
}
