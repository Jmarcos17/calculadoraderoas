// components/ContractProjection.tsx
"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ContractProjection, RoasInput } from '@/lib/roas';
import { exportProjectionToPDF } from '@/lib/pdf-export';
import { exportCommercialProposal } from '@/lib/pdf-commercial-proposal';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StrategicCTA from './StrategicCTA';

interface ContractProjectionProps {
  projection: ContractProjection;
  input?: RoasInput;
  organizationName?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
  onScheduleCall?: () => void;
}

export default function ContractProjectionView({
  projection,
  input,
  organizationName,
  branding,
  onScheduleCall,
}: ContractProjectionProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [presentationMode, setPresentationMode] = useState(false);

  const handleExportPDF = () => {
    if (input) {
      exportProjectionToPDF(projection, input, organizationName);
    }
  };

  const handleExportCommercialProposal = () => {
    if (input) {
      exportCommercialProposal({
        projection,
        input,
        organizationName,
        validityDays: 7,
        includeGuarantees: true,
        includeTimeline: true,
      });
      toast.success('Proposta comercial gerada com sucesso!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    if (!presentationMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleShare = () => {
    // Gerar link compartilhável (poderia ser um hash único salvo no banco)
    if (!input) {
      toast.error('Não é possível compartilhar sem dados de entrada');
      return;
    }

    try {
      const shareData = {
        projection: projection,
        input: input,
        timestamp: Date.now(),
      };
      const jsonString = JSON.stringify(shareData);
      // Codificar para base64 e depois para URL-safe
      const base64 = btoa(jsonString);
      const urlSafeEncoded = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const link = `${window.location.origin}/share/${urlSafeEncoded}`;
      setShareLink(link);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Erro ao gerar link de compartilhamento');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copiado para a área de transferência!');
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Confira esta projeção de ROAS: ${shareLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Projeção de ROAS');
    const body = encodeURIComponent(
      `Confira esta projeção de ROAS:\n\n${shareLink}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const exportToCSV = () => {
    const csvRows = [];
    // Header
    csvRows.push([
      'Mês',
      'Investimento',
      'Leads',
      'Vendas',
      'Faturamento',
      'ROAS',
      'Faturamento Acumulado',
    ].join(','));

    // Data rows
    projection.monthly.forEach((month) => {
      csvRows.push([
        month.month,
        month.investment.toFixed(2),
        Math.round(month.leads),
        Math.round(month.sales),
        month.grossRevenue.toFixed(2), // Use Gross Revenue
        month.roas.toFixed(2),
        month.cumulativeRevenue.toFixed(2),
      ].join(','));
    });

    // Totais
    csvRows.push(['']);
    csvRows.push(['TOTAL', '', '', '', '', '', '']);
    csvRows.push([
      '',
      projection.total.totalInvestment.toFixed(2),
      Math.round(projection.total.totalLeads),
      Math.round(projection.total.totalSales),
      projection.total.totalRevenue.toFixed(2),
      projection.total.averageRoas.toFixed(2),
      '',
    ].join(','));

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `projecao-roas-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Validar se projection tem os dados necessários
  if (!projection || !projection.monthly || !projection.total) {
    console.error('ContractProjection: dados inválidos', { projection });
    return null;
  }

  const totalNetRevenue = projection.monthly.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <div className={`space-y-6 mt-6 ${presentationMode ? 'presentation-mode' : ''}`}>
      {/* Botões de Ação - sempre exibir se houver projeção */}
      <div className="flex flex-wrap justify-end gap-2 no-print">
        <button
          onClick={handleExportCommercialProposal}
          disabled={!input}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          <span>📋</span>
          Gerar Proposta Comercial
        </button>
        <button
          onClick={handleExportPDF}
          disabled={!input}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>📄</span>
          PDF Simples
        </button>
        <button
          onClick={exportToCSV}
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 flex items-center gap-2"
        >
          <span>📊</span>
          Exportar CSV
        </button>
        <button
          onClick={handlePrint}
          className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-600 flex items-center gap-2"
        >
          <span>🖨️</span>
          Imprimir
        </button>
        <button
          onClick={handleShare}
          disabled={!input}
          className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🔗</span>
          Compartilhar
        </button>
        <button
          onClick={togglePresentationMode}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 flex items-center gap-2"
        >
          <span>{presentationMode ? '📺' : '🖥️'}</span>
          {presentationMode ? 'Sair' : 'Apresentação'}
        </button>
      </div>

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Compartilhar Projeção
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link para compartilhar
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  WhatsApp
                </button>
                <button
                  onClick={shareViaEmail}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <span>📧</span>
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Resumo Total */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Projeção Total do Contrato
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-600 mb-1">Investimento Total</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(projection.total.totalInvestment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Faturamento Total</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(projection.total.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">ROAS Médio</p>
            <p className="text-xl font-bold text-sky-600">
              {projection.total.averageRoas.toFixed(2)}x
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-sky-200 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-600 mb-1">Total de Leads</p>
            <p className="text-sm font-semibold text-slate-900">
              {Math.round(projection.total.totalLeads)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Total de Vendas</p>
            <p className="text-sm font-semibold text-slate-900">
              {Math.round(projection.total.totalSales)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-sky-200">
          <p className="text-sm text-slate-700">
            <strong>Lucro líquido:</strong>{' '}
            <span className="text-green-600 font-semibold">
              {formatCurrency(
                totalNetRevenue - projection.total.totalInvestment
              )}
            </span>
          </p>
        </div>
      </div>

      {/* Gráfico de Evolução do Faturamento */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Evolução do Faturamento
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projection.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              label={{ value: 'Mês', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `${label}° mês`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0ea5e9"
              strokeWidth={2}
              name="Faturamento Mensal"
            />
            <Line
              type="monotone"
              dataKey="cumulativeRevenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Faturamento Acumulado"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de ROAS por Mês */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          ROAS Mensal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projection.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}x`}
              labelFormatter={(label) => `${label}° mês`}
            />
            <Bar dataKey="roas" fill="#0ea5e9" name="ROAS" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Comparação de Lucro Líquido (Se houver mensalidades) */}
      {(input?.agencyFee || input?.userAgencyFee) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Comparação de Lucro Líquido por Mês
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Comparação do lucro real após descontar investimento e mensalidade da agência
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={projection.monthly.map((month) => ({
                month: month.month,
                semAgencia: month.revenue - month.investment,
                ...(input.agencyFee && {
                  agenciaConcorrente: month.revenue - month.investment - input.agencyFee,
                }),
                ...(input.userAgencyFee && {
                  suaAgencia: month.revenue - month.investment - input.userAgencyFee,
                }),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: 'Mês', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `${label}° mês`}
              />
              <Legend />
              <Bar
                dataKey="semAgencia"
                fill="#94a3b8"
                name="Sem Agência"
              />
              {input.agencyFee && (
                <Bar
                  dataKey="agenciaConcorrente"
                  fill="#ef4444"
                  name="Com Agência Concorrente"
                />
              )}
              {input.userAgencyFee && (
                <Bar
                  dataKey="suaAgencia"
                  fill="#22c55e"
                  name="Com Sua Agência"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
          {input.agencyFee && input.userAgencyFee && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800">
                💰 Vantagem Competitiva: {formatCurrency((input.agencyFee - input.userAgencyFee) * projection.monthly.length)} ao longo do contrato
              </p>
              <p className="text-xs text-green-700 mt-1">
                Sua mensalidade gera {formatCurrency(input.agencyFee - input.userAgencyFee)} a mais de lucro por mês
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTA após comparação de lucro mostrando economia significativa */}
      {input?.agencyFee && input?.userAgencyFee && input.agencyFee > input.userAgencyFee && onScheduleCall && (
        <StrategicCTA
          variant="primary"
          title={`Economize ${formatCurrency((input.agencyFee - input.userAgencyFee) * projection.monthly.length)} em ${projection.monthly.length} Meses!`}
          description="Nossa mensalidade mais competitiva significa mais dinheiro no seu bolso todo mês. Veja como podemos aplicar essa mesma estratégia ao seu negócio."
          buttonText="Quero Começar Agora"
          onAction={onScheduleCall}
          urgencyText="🔥 Promoção válida apenas para os próximos 5 clientes"
          icon="sparkles"
          branding={branding}
        />
      )}

      {/* Tabela Detalhada Mês a Mês */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Detalhamento Mensal
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3">Mês</th>
                <th className="text-right py-2 px-3">Investimento</th>
                <th className="text-right py-2 px-3">Leads</th>
                <th className="text-right py-2 px-3">Vendas</th>
                <th className="text-right py-2 px-3">Faturamento</th>
                <th className="text-right py-2 px-3">ROAS</th>
                <th className="text-right py-2 px-3">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {projection.monthly.map((month) => (
                <tr
                  key={month.month}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 px-3 font-medium">{month.month}°</td>
                  <td className="py-2 px-3 text-right">
                    {formatCurrency(month.investment)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {month.leads < 100 ? month.leads.toFixed(1).replace('.', ',') : Math.round(month.leads)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {month.sales < 100 ? month.sales.toFixed(1).replace('.', ',') : Math.round(month.sales)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(month.grossRevenue)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {month.roas.toFixed(2)}x
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {formatCurrency(month.cumulativeRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Insights e Observações
        </h3>
        <ul className="space-y-2">
          {projection.insights.map((insight, index) => (
            <li key={index} className="text-sm text-slate-700 flex items-start">
              <span className="mr-2">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Final: Conversão após visualização completa */}
      {onScheduleCall && (
        <StrategicCTA
          variant="primary"
          title="Pronto para Transformar Esses Números em Realidade?"
          description={`Esta projeção mostra um potencial de ${formatCurrency(projection.total.totalRevenue - projection.total.totalInvestment)} em lucro líquido. Agende uma reunião estratégica gratuita de 30 minutos e descubra como alcançar esses resultados.`}
          buttonText="Agendar Reunião Estratégica Gratuita"
          onAction={onScheduleCall}
          urgencyText="📅 Apenas 2 horários disponíveis esta semana"
          icon="calendar"
          branding={branding}
        />
      )}
    </div>
  );
}

