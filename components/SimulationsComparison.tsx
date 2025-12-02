"use client";

import { RoasOutput } from '@/lib/roas';

interface Simulation {
  id: string;
  inputData: any;
  results: {
    leads: number;
    sales: number;
    revenue: number;
    grossRevenue: number;
    commission: number;
    roas: number;
    roi: number;
    costPerSale: number;
    suggestedInvestment?: number;
    agencyRoi?: number;
    userAgencyRoi?: number;
  };
  createdAt: string;
}

interface SimulationsComparisonProps {
  simulations: Simulation[];
  onClose: () => void;
}

export default function SimulationsComparison({ simulations, onClose }: SimulationsComparisonProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">
            Comparação de Simulações
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-sm font-medium text-slate-500 border-b border-slate-200 bg-slate-50 w-48">
                  Métrica
                </th>
                {simulations.map((sim, index) => (
                  <th key={sim.id} className="p-4 text-sm font-semibold text-slate-900 border-b border-slate-200 min-w-[200px]">
                    <div className="flex flex-col gap-1">
                      <span>Simulação {index + 1}</span>
                      <span className="text-xs font-normal text-slate-500">
                        {new Date(sim.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Entradas */}
              <tr className="bg-slate-50/50">
                <td colSpan={simulations.length + 1} className="p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Entradas
                </td>
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Investimento</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.investment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Ticket Médio</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.ticket)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">CPL</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {formatCurrency(sim.inputData.cpl)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Taxa de Conversão</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {sim.inputData.conversionRate}%
                  </td>
                ))}
              </tr>

              {/* Resultados */}
              <tr className="bg-slate-50/50">
                <td colSpan={simulations.length + 1} className="p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Resultados
                </td>
              </tr>
              <tr className="bg-sky-50/30">
                <td className="p-4 text-sm font-semibold text-slate-900">ROAS</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-bold text-sky-600">
                    {sim.results.roas.toFixed(2)}x
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Faturamento Bruto</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-semibold text-green-600">
                    {formatCurrency(sim.results.grossRevenue ?? sim.results.revenue)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Retorno Líquido</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {formatCurrency(sim.results.revenue - sim.inputData.investment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Leads</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {sim.results.leads < 100 ? sim.results.leads.toFixed(1).replace('.', ',') : Math.round(sim.results.leads)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Vendas</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {sim.results.sales < 100 ? sim.results.sales.toFixed(1).replace('.', ',') : Math.round(sim.results.sales)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm text-slate-600">Custo por Venda</td>
                {simulations.map((sim) => (
                  <td key={sim.id} className="p-4 text-sm font-medium text-slate-900">
                    {formatCurrency(sim.results.costPerSale)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
