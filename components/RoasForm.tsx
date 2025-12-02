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
}

export default function RoasForm({ onCalculate, defaultValues }: RoasFormProps) {
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
      // Simulate a small delay for better UX if needed, or just proceed
      // await new Promise(resolve => setTimeout(resolve, 500));
      
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Dropdown de Nicho */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecione o nicho
        </label>
        <select
          {...register('niche')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          {getAllNiches().map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} {n.id !== 'custom' && `(${n.description})`}
            </option>
          ))}
        </select>
        {selectedNiche !== 'custom' && (
          <p className="text-xs text-slate-500 mt-1">
            Valores pré-preenchidos com médias do mercado para {getNicheById(selectedNiche).name}
          </p>
        )}
      </div>

      <fieldset className="space-y-3 border border-slate-200 rounded-xl p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Dados de entrada
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Investimento mensal em tráfego (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('investment')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.investment ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.investment && (
              <p className="text-xs text-red-500 mt-1">{errors.investment.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Ticket médio (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('ticket')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.ticket ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.ticket && (
              <p className="text-xs text-red-500 mt-1">{errors.ticket.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Custo por lead (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cpl')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.cpl ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.cpl && (
              <p className="text-xs text-red-500 mt-1">{errors.cpl.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Taxa de conversão (%)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('conversionRate')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.conversionRate ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.conversionRate && (
              <p className="text-xs text-red-500 mt-1">{errors.conversionRate.message}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Taxa de comissão (%)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('commissionRate')}
            placeholder="Ex: 10 (para 10% de comissão)"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.commissionRate ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <p className="text-xs text-slate-500 mt-1">
            Percentual de comissão que será descontado da receita bruta (opcional, padrão: 0%)
          </p>
          {errors.commissionRate && (
            <p className="text-xs text-red-500 mt-1">{errors.commissionRate.message}</p>
          )}
        </div>
      </fieldset>

      {/* Comparação de Agências */}
      <fieldset className="space-y-3 border border-slate-200 rounded-xl p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Comparação de Agências (Opcional)
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Mensalidade Agência Genérica (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('agencyFee')}
              placeholder="Ex: 1500"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.agencyFee ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.agencyFee && (
              <p className="text-xs text-red-500 mt-1">{errors.agencyFee.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Mensalidade Sua Agência (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('userAgencyFee')}
              placeholder="Ex: 2500"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.userAgencyFee ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.userAgencyFee && (
              <p className="text-xs text-red-500 mt-1">{errors.userAgencyFee.message}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            ROAS Alvo (para sugestão de investimento)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('targetRoas')}
            placeholder="Ex: 5"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.targetRoas ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <p className="text-xs text-slate-500 mt-1">
            Informe o ROAS desejado para calcularmos o investimento ideal (em breve)
          </p>
          {errors.targetRoas && (
            <p className="text-xs text-red-500 mt-1">{errors.targetRoas.message}</p>
          )}
        </div>
      </fieldset>

      {/* Campos de Projeção de Contrato */}
      <fieldset className="space-y-3 border border-slate-200 rounded-xl p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Projeção de Contrato (Opcional)
        </legend>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Duração do contrato (meses)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            {...register('contractMonths')}
            placeholder="Ex: 6"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.contractMonths ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <p className="text-xs text-slate-500 mt-1">
            Deixe vazio para cálculo mensal simples
          </p>
          {errors.contractMonths && (
            <p className="text-xs text-red-500 mt-1">{errors.contractMonths.message}</p>
          )}
        </div>
        {contractMonths && contractMonths > 1 && (
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Taxa de crescimento mensal (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('growthRate')}
              placeholder="Ex: 5"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.growthRate ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            <p className="text-xs text-slate-500 mt-1">
              Crescimento esperado no investimento mês a mês (0% = sem crescimento)
            </p>
            {errors.growthRate && (
              <p className="text-xs text-red-500 mt-1">{errors.growthRate.message}</p>
            )}
          </div>
        )}
      </fieldset>

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
                  ? s === 'pessimistic' ? 'bg-red-500 text-white' : s === 'optimistic' ? 'bg-green-500 text-white' : 'bg-sky-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'pessimistic' ? 'Pessimista' : s === 'realistic' ? 'Realista' : 'Otimista'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {selectedScenario === 'optimistic' && 'Ajusta métricas para +20% ticket, -15% CPL, +30% conversão'}
          {selectedScenario === 'realistic' && 'Usa os valores informados sem ajustes'}
          {selectedScenario === 'pessimistic' && 'Ajusta métricas para -15% ticket, +20% CPL, -25% conversão'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setValue('period', 'monthly')}
            className={`px-3 py-1 rounded-full ${
              selectedPeriod === 'monthly'
                ? 'bg-sky-500 text-white'
                : 'text-slate-600'
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setValue('period', 'daily')}
            className={`px-3 py-1 rounded-full ${
              selectedPeriod === 'daily'
                ? 'bg-sky-500 text-white'
                : 'text-slate-600'
            }`}
          >
            Diário
          </button>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Calculando...
            </>
          ) : (
            'Calcular'
          )}
        </button>
      </div>
    </form>
  );
}
