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
      investment: 3000,
      targetRoas: 3.0,
      period: 'monthly',
      niche: 'beleza',
      scenario: 'realistic',
      ...defaultValues,
    },
  });

  const selectedNiche = watch('niche') as NicheId;
  const selectedPeriod = watch('period');
  const selectedScenario = watch('scenario');
  const contractMonths = watch('contractMonths');
  const targetRoas = watch('targetRoas');
  const investment = watch('investment');

  // Auto-preenchimento quando nicho ou ROAS muda
  useEffect(() => {
    if (selectedNiche && selectedNiche !== 'custom' && targetRoas && investment) {
      const nicheData = getNicheById(selectedNiche);
      
      // Cálculo reverso automático
      const revenue = investment * targetRoas;
      const cpl = nicheData.avgCpl;
      const ticket = nicheData.avgTicket;
      const leads = investment / cpl;
      const sales = revenue / ticket;
      const conversionRate = leads > 0 ? (sales / leads) * 100 : 0;
      
      // Preencher campos calculados
      setValue('cpl', Number(cpl.toFixed(2)));
      setValue('ticket', Number(ticket.toFixed(2)));
      setValue('conversionRate', Number(conversionRate.toFixed(2)));
    }
  }, [selectedNiche, targetRoas, investment, setValue]);

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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nicho de Mercado
          </label>
          <select
            {...register('niche')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {getAllNiches().map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name}
              </option>
            ))}
          </select>
        </div>

        {/* INPUTS PRINCIPAIS: Investimento e ROAS */}
        <div className="grid gap-4 md:grid-cols-2 bg-sky-50 p-4 rounded-lg border border-sky-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              💰 Investimento Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('investment', { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: 3000"
            />
            {errors.investment && (
              <p className="text-xs text-red-500 mt-1">{errors.investment.message}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Quanto você investe por mês</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              🎯 ROAS Desejado
            </label>
            <input
              type="number"
              step="0.1"
              {...register('targetRoas', { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: 3.0"
            />
            {errors.targetRoas && (
              <p className="text-xs text-red-500 mt-1">{errors.targetRoas.message}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Retorno esperado (ex: 3.0x = R$3 para cada R$1)</p>
          </div>
        </div>

        {/* MÉTRICAS CALCULADAS (editáveis) */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-blue-500">📊</span>
            Métricas Calculadas (editáveis)
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Estes valores são calculados automaticamente baseados no nicho e ROAS. Você pode ajustá-los manualmente.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {selectedNiche && selectedNiche !== 'custom' 
                  ? (getNicheById(selectedNiche).cplLabel || 'CPL - Custo por Lead (R$)')
                  : 'CPL - Custo por Lead (R$)'}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cpl', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
              {errors.cpl && (
                <p className="text-xs text-red-500 mt-1">{errors.cpl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ticket Médio (R$)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ticket', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
              {errors.ticket && (
                <p className="text-xs text-red-500 mt-1">{errors.ticket.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {selectedNiche && selectedNiche !== 'custom' 
                  ? (getNicheById(selectedNiche).conversionLabel || 'Taxa de Conversão (%)')
                  : 'Taxa de Conversão (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                {...register('conversionRate', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
              {errors.conversionRate && (
                <p className="text-xs text-red-500 mt-1">{errors.conversionRate.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tempo de Contrato (Meses)
            </label>
            <input
              type="number"
              {...register('contractMonths')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: 12"
            />
            {errors.contractMonths && (
              <p className="text-xs text-red-500 mt-1">{errors.contractMonths.message}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Opcional: para ver projeção mês a mês</p>
          </div>
        </div>

        {/* Comparação de Mensalidades */}
        <div className="border-t border-slate-200 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Comparação de Mensalidades (Opcional)
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mensalidade Agência Concorrente (R$)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('agencyFee')}
                placeholder="Ex: 3000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mensalidade de outra agência para comparação
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sua Mensalidade (R$)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('userAgencyFee')}
                placeholder="Ex: 2500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Sua mensalidade para comparação de ROI
              </p>
            </div>
          </div>
        </div>

        {/* Meta de Faturamento */}
        <div className="border-t border-slate-200 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Cálculo Reverso (Opcional)
          </h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meta de Faturamento Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('targetRevenue')}
              placeholder="Ex: 50000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Quanto você quer faturar por mês? Calcularemos o investimento necessário.
            </p>
          </div>
        </div>
      </div>

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
