// lib/pdf-export.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ContractProjection, RoasInput } from './roas';

export function exportProjectionToPDF(
  projection: ContractProjection,
  input: RoasInput,
  organizationName?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores
  const primaryColor: [number, number, number] = [14, 165, 233]; // sky-500
  const greenColor: [number, number, number] = [16, 185, 129]; // green-500
  const grayColor: [number, number, number] = [71, 85, 105]; // slate-500

  // Header
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(organizationName || 'Projeção de ROAS', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(
    `Contrato de ${projection.monthly.length} meses`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 15;

  // Resumo Total
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumo Total do Contrato', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

  const summaryData = [
    [
      'Investimento Total',
      formatCurrency(projection.total.totalInvestment),
    ],
    ['Faturamento Total', formatCurrency(projection.total.totalRevenue)],
    ['ROAS Médio', `${projection.total.averageRoas.toFixed(2)}x`],
    ['Total de Leads', Math.round(projection.total.totalLeads).toString()],
    ['Total de Vendas', Math.round(projection.total.totalSales).toString()],
    [
      'Lucro Líquido',
      formatCurrency(
        projection.total.totalRevenue - projection.total.totalInvestment
      ),
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 15;

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Tabela Detalhada Mensal
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Detalhamento Mensal', 14, yPosition);
  yPosition += 8;

  const tableData = projection.monthly.map((month) => [
    `${month.month}°`,
    formatCurrency(month.investment),
    Math.round(month.leads).toString(),
    Math.round(month.sales).toString(),
    formatCurrency(month.revenue),
    `${month.roas.toFixed(2)}x`,
    formatCurrency(month.cumulativeRevenue),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        'Mês',
        'Investimento',
        'Leads',
        'Vendas',
        'Faturamento',
        'ROAS',
        'Acumulado',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', textColor: greenColor },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 15;

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // Insights
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Insights e Observações', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

  projection.insights.forEach((insight, index) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`• ${insight}`, 14, yPosition);
    yPosition += 7;
  });

  // Parâmetros de entrada
  yPosition += 10;
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Parâmetros de Entrada', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

  const inputData = [
    ['Investimento Mensal', formatCurrency(input.investment)],
    ['Ticket Médio', formatCurrency(input.ticket)],
    ['Custo por Lead', formatCurrency(input.cpl)],
    ['Taxa de Conversão', `${input.conversionRate}%`],
    ['Duração do Contrato', `${projection.monthly.length} meses`],
    [
      'Taxa de Crescimento',
      input.growthRate ? `${input.growthRate}%` : '0%',
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Parâmetro', 'Valor']],
    body: inputData,
    theme: 'grid',
    headStyles: {
      fillColor: grayColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Salvar PDF
  const fileName = `projecao-roas-${organizationName?.toLowerCase().replace(/\s+/g, '-') || 'calculadora'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });
}

