// lib/pdf-commercial-proposal.ts
/**
 * Gerador de Proposta Comercial Profissional em PDF
 *
 * Este módulo cria PDFs com estrutura de proposta comercial completa:
 * 1. Capa profissional
 * 2. Apresentação da agência
 * 3. Análise do cenário atual
 * 4. Projeção de resultados
 * 5. Comparação com mercado
 * 6. Cronograma de implementação
 * 7. Garantias e termos
 * 8. Call-to-action e próximos passos
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ContractProjection, RoasInput, RoasOutput } from './roas';

interface CommercialProposalOptions {
  projection: ContractProjection;
  input: RoasInput;
  results?: RoasOutput;
  organizationName?: string;
  clientName?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  validityDays?: number;
  includeGuarantees?: boolean;
  includeTimeline?: boolean;
}

type RGB = [number, number, number];

export function exportCommercialProposal(options: CommercialProposalOptions) {
  const {
    projection,
    input,
    results,
    organizationName = 'Sua Agência Digital',
    clientName = 'Cliente',
    branding,
    validityDays = 7,
    includeGuarantees = true,
    includeTimeline = true,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cores
  const primaryColor: RGB = branding?.primaryColor
    ? hexToRGB(branding.primaryColor)
    : [14, 165, 233];
  const greenColor: RGB = [16, 185, 129];
  const grayColor: RGB = [71, 85, 105];
  const lightGray: RGB = [148, 163, 184];

  // ========== PÁGINA 1: CAPA ==========
  addCoverPage(doc, {
    organizationName,
    clientName,
    primaryColor,
    validityDays,
    pageWidth,
    pageHeight,
  });

  // ========== PÁGINA 2: SUMÁRIO EXECUTIVO ==========
  doc.addPage();
  addExecutiveSummary(doc, {
    projection,
    input,
    results,
    primaryColor,
    grayColor,
    pageWidth,
  });

  // ========== PÁGINA 3: ANÁLISE DO CENÁRIO ATUAL ==========
  doc.addPage();
  addCurrentAnalysis(doc, {
    input,
    results,
    primaryColor,
    grayColor,
    greenColor,
    pageWidth,
  });

  // ========== PÁGINA 4: PROJEÇÃO DE RESULTADOS ==========
  doc.addPage();
  addProjectionResults(doc, {
    projection,
    input,
    primaryColor,
    greenColor,
    grayColor,
    pageWidth,
    pageHeight,
  });

  // ========== PÁGINA 5: COMPARAÇÃO COM MERCADO ==========
  if (input.agencyFee || input.userAgencyFee) {
    doc.addPage();
    addMarketComparison(doc, {
      projection,
      input,
      primaryColor,
      greenColor,
      grayColor,
      lightGray,
      pageWidth,
    });
  }

  // ========== PÁGINA 6: CRONOGRAMA ==========
  if (includeTimeline) {
    doc.addPage();
    addImplementationTimeline(doc, {
      projection,
      primaryColor,
      grayColor,
      pageWidth,
    });
  }

  // ========== PÁGINA 7: GARANTIAS E RISCOS ==========
  if (includeGuarantees) {
    doc.addPage();
    addGuarantees(doc, {
      projection,
      input,
      primaryColor,
      greenColor,
      grayColor,
      pageWidth,
    });
  }

  // ========== ÚLTIMA PÁGINA: CALL-TO-ACTION ==========
  doc.addPage();
  addCallToAction(doc, {
    organizationName,
    primaryColor,
    grayColor,
    pageWidth,
    pageHeight,
    validityDays,
  });

  // ========== FOOTER EM TODAS AS PÁGINAS ==========
  addFootersToAllPages(doc, {
    grayColor,
    pageWidth,
    pageHeight,
  });

  // Salvar
  const fileName = `proposta-comercial-${clientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ========== FUNÇÕES AUXILIARES ==========

function addCoverPage(
  doc: jsPDF,
  options: {
    organizationName: string;
    clientName: string;
    primaryColor: RGB;
    validityDays: number;
    pageWidth: number;
    pageHeight: number;
  }
) {
  const {
    organizationName,
    clientName,
    primaryColor,
    validityDays,
    pageWidth,
    pageHeight,
  } = options;

  // Retângulo decorativo no topo
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSTA COMERCIAL', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Marketing Digital & Performance', pageWidth / 2, 45, {
    align: 'center',
  });

  // Nome da agência
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(organizationName, pageWidth / 2, 100, { align: 'center' });

  // "Apresenta para"
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Apresenta uma projeção personalizada para:', pageWidth / 2, 125, {
    align: 'center',
  });

  // Nome do cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, pageWidth / 2, 145, { align: 'center' });

  // Informações adicionais
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('pt-BR');
  const validUntil = new Date(
    Date.now() + validityDays * 24 * 60 * 60 * 1000
  ).toLocaleDateString('pt-BR');

  doc.text(`Data: ${today}`, pageWidth / 2, pageHeight - 60, {
    align: 'center',
  });
  doc.text(`Validade: ${validUntil} (${validityDays} dias)`, pageWidth / 2, pageHeight - 50, {
    align: 'center',
  });

  // Box com destaque
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, pageHeight - 90, pageWidth - 40, 25);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Esta proposta foi gerada especialmente para você com base em dados',
    pageWidth / 2,
    pageHeight - 77,
    { align: 'center' }
  );
  doc.text(
    'reais de mercado e projeções personalizadas do seu negócio.',
    pageWidth / 2,
    pageHeight - 70,
    { align: 'center' }
  );
}

function addExecutiveSummary(
  doc: jsPDF,
  options: {
    projection: ContractProjection;
    input: RoasInput;
    results?: RoasOutput;
    primaryColor: RGB;
    grayColor: RGB;
    pageWidth: number;
  }
) {
  const { projection, input, results, primaryColor, grayColor, pageWidth } =
    options;
  let y = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumário Executivo', 14, y);
  y += 15;

  // Introdução
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const intro = `Esta proposta apresenta uma análise detalhada do potencial de crescimento do seu negócio através de estratégias de marketing digital baseadas em performance e dados.`;
  const introLines = doc.splitTextToSize(intro, pageWidth - 28);
  doc.text(introLines, 14, y);
  y += introLines.length * 6 + 8;

  // Box de destaques
  doc.setFillColor(250, 250, 250);
  doc.rect(14, y, pageWidth - 28, 80, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.rect(14, y, pageWidth - 28, 80);
  y += 10;

  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Destaques da Projeção:', 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  const highlights = [
    `💰 Faturamento Total: ${formatCurrency(projection.total.totalRevenue)}`,
    `📈 ROAS Médio: ${projection.total.averageRoas.toFixed(2)}x (${((projection.total.averageRoas - 1) * 100).toFixed(0)}% de retorno)`,
    `🎯 ${Math.round(projection.total.totalSales)} vendas em ${projection.monthly.length} meses`,
    `💎 Lucro Líquido: ${formatCurrency(projection.total.totalRevenue - projection.total.totalInvestment)}`,
  ];

  highlights.forEach((highlight) => {
    doc.text(highlight, 20, y);
    y += 8;
  });

  y += 15;

  // Proposta de valor
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Nossa Proposta de Valor', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  const valueProps = [
    '✓ Estratégias baseadas em dados e performance comprovada',
    '✓ Transparência total: relatórios semanais detalhados',
    '✓ Otimização contínua para maximizar seu ROI',
    '✓ Equipe especializada no seu nicho de mercado',
    '✓ Garantia de resultados ou seu investimento de volta',
  ];

  valueProps.forEach((prop) => {
    doc.text(prop, 14, y);
    y += 6;
  });
}

function addCurrentAnalysis(
  doc: jsPDF,
  options: {
    input: RoasInput;
    results?: RoasOutput;
    primaryColor: RGB;
    grayColor: RGB;
    greenColor: RGB;
    pageWidth: number;
  }
) {
  const { input, results, primaryColor, grayColor, pageWidth } = options;
  let y = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise do Cenário Atual', 14, y);
  y += 15;

  // Subtítulo
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Com base nas informações fornecidas, identificamos as seguintes métricas:',
    14,
    y
  );
  y += 10;

  // Tabela de inputs
  const inputData = [
    ['Investimento', formatCurrency(input.investment)],
    ['Ticket Médio', formatCurrency(input.ticket || 0)],
    ['CPL', formatCurrency(input.cpl || 0)],
    ['Taxa de Conversão', `${input.conversionRate || 0}%`],
    ...(input.targetRoas ? [['ROAS Desejado', `${input.targetRoas.toFixed(2)}x`]] : []),
  ];

  autoTable(doc, {
    startY: y,
    head: [['Métrica', 'Valor Atual']],
    body: inputData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Oportunidades identificadas
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('🎯 Oportunidades Identificadas', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  const opportunities = [
    'Otimização de campanhas para redução do CPL em até 30%',
    'Melhoria da taxa de conversão através de testes A/B contínuos',
    'Implementação de funis de vendas otimizados',
    'Segmentação avançada de audiência para maior qualidade',
    'Remarketing estratégico para recuperar leads perdidos',
  ];

  opportunities.forEach((opp) => {
    doc.text(`• ${opp}`, 14, y);
    y += 6;
  });
}

function addProjectionResults(
  doc: jsPDF,
  options: {
    projection: ContractProjection;
    input: RoasInput;
    primaryColor: RGB;
    greenColor: RGB;
    grayColor: RGB;
    pageWidth: number;
    pageHeight: number;
  }
) {
  const { projection, primaryColor, greenColor, grayColor, pageWidth } =
    options;
  let y = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Projeção de Resultados', 14, y);
  y += 15;

  // Resumo consolidado
  const summaryData = [
    ['Investimento Total', formatCurrency(projection.total.totalInvestment)],
    ['Faturamento Total', formatCurrency(projection.total.totalRevenue)],
    [
      'Lucro Líquido',
      formatCurrency(
        projection.total.totalRevenue - projection.total.totalInvestment
      ),
    ],
    ['ROAS Médio', `${projection.total.averageRoas.toFixed(2)}x`],
    ['Total de Leads', Math.round(projection.total.totalLeads).toString()],
    ['Total de Vendas', Math.round(projection.total.totalSales).toString()],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Métrica', 'Valor Projetado']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { fontStyle: 'bold', halign: 'right', textColor: greenColor },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Detalhamento mensal
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução Mensal', 14, y);
  y += 8;

  const monthlyData = projection.monthly.map((month) => [
    `${month.month}°`,
    formatCurrency(month.investment),
    Math.round(month.leads).toString(),
    Math.round(month.sales).toString(),
    formatCurrency(month.revenue),
    `${month.roas.toFixed(2)}x`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Mês', 'Invest.', 'Leads', 'Vendas', 'Faturamento', 'ROAS']],
    body: monthlyData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', textColor: greenColor, fontStyle: 'bold' },
      5: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });
}

function addMarketComparison(
  doc: jsPDF,
  options: {
    projection: ContractProjection;
    input: RoasInput;
    primaryColor: RGB;
    greenColor: RGB;
    grayColor: RGB;
    lightGray: RGB;
    pageWidth: number;
  }
) {
  const { projection, input, primaryColor, greenColor, grayColor, pageWidth } =
    options;
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Por Que Escolher Nossa Agência?', 14, y);
  y += 15;

  if (input.agencyFee && input.userAgencyFee) {
    const monthlyDiff = input.agencyFee - input.userAgencyFee;
    const totalDiff = monthlyDiff * projection.monthly.length;

    // Box destacado
    doc.setFillColor(240, 253, 244);
    doc.rect(14, y, pageWidth - 28, 50, 'F');
    doc.setDrawColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.setLineWidth(1.5);
    doc.rect(14, y, pageWidth - 28, 50);
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 Vantagem Competitiva', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Nossa mensalidade é R$ ${monthlyDiff.toFixed(2)} menor por mês`,
      20,
      y
    );
    y += 8;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text(
      `Economia total: ${formatCurrency(totalDiff)} em ${projection.monthly.length} meses`,
      20,
      y
    );
    y += 15;

    // Comparação em tabela
    y += 10;
    const comparisonData = [
      [
        'Agência Concorrente',
        formatCurrency(input.agencyFee),
        formatCurrency(input.agencyFee * projection.monthly.length),
      ],
      [
        'Nossa Agência',
        formatCurrency(input.userAgencyFee),
        formatCurrency(input.userAgencyFee * projection.monthly.length),
      ],
      [
        'Sua Economia',
        formatCurrency(monthlyDiff),
        formatCurrency(totalDiff),
      ],
    ];

    autoTable(doc, {
      startY: y,
      head: [['', 'Mensalidade', `Total (${projection.monthly.length} meses)`]],
      body: comparisonData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = [240, 253, 244];
          data.cell.styles.textColor = greenColor;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 14, right: 14 },
    });
  }
}

function addImplementationTimeline(
  doc: jsPDF,
  options: {
    projection: ContractProjection;
    primaryColor: RGB;
    grayColor: RGB;
    pageWidth: number;
  }
) {
  const { projection, primaryColor, grayColor, pageWidth } = options;
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma de Implementação', 14, y);
  y += 15;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Veja o que acontecerá em cada fase do projeto:',
    14,
    y
  );
  y += 12;

  const timeline = [
    {
      phase: 'Semana 1-2',
      title: 'Setup e Planejamento Estratégico',
      tasks: [
        'Reunião de kick-off e alinhamento de expectativas',
        'Análise profunda do negócio e concorrência',
        'Definição de personas e jornada do cliente',
        'Criação de estratégia de conteúdo e criativos',
      ],
    },
    {
      phase: 'Semana 3-4',
      title: 'Implementação e Lançamento',
      tasks: [
        'Configuração de campanhas e tracking',
        'Criação de landing pages otimizadas',
        'Setup de CRM e automações',
        'Lançamento das primeiras campanhas',
      ],
    },
    {
      phase: 'Mês 2-3',
      title: 'Otimização e Escala',
      tasks: [
        'Análise de performance e ajustes',
        'Testes A/B de criativos e copys',
        'Expansão de audiências e canais',
        'Implementação de remarketing',
      ],
    },
    {
      phase: `Mês 4-${projection.monthly.length}`,
      title: 'Crescimento e Maximização',
      tasks: [
        'Escala de investimento gradual',
        'Otimização contínua de conversões',
        'Relatórios mensais de performance',
        'Ajustes estratégicos baseados em dados',
      ],
    },
  ];

  timeline.forEach((item, index) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Box da fase
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(14, y, pageWidth - 28, 8, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(item.phase, 18, y + 5.5);

    doc.setTextColor(0, 0, 0);
    doc.text(item.title, 50, y + 5.5);
    y += 12;

    // Tarefas
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    item.tasks.forEach((task) => {
      doc.text(`  ✓ ${task}`, 18, y);
      y += 5;
    });

    y += 6;
  });
}

function addGuarantees(
  doc: jsPDF,
  options: {
    projection: ContractProjection;
    input: RoasInput;
    primaryColor: RGB;
    greenColor: RGB;
    grayColor: RGB;
    pageWidth: number;
  }
) {
  const { projection, primaryColor, greenColor, grayColor, pageWidth } = options;
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Garantias e Mitigação de Riscos', 14, y);
  y += 15;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const intro = 'Entendemos que investir em marketing é uma decisão importante. Por isso, oferecemos as seguintes garantias:';
  doc.text(intro, 14, y);
  y += 12;

  // Garantias
  const guarantees = [
    {
      icon: '🛡️',
      title: 'Garantia de Resultados',
      description:
        'Se não atingirmos pelo menos 80% da projeção realista em 3 meses, você pode cancelar sem multa.',
    },
    {
      icon: '📊',
      title: 'Transparência Total',
      description:
        'Acesso completo a dashboards em tempo real e relatórios semanais detalhados.',
    },
    {
      icon: '💰',
      title: 'Break-Even Garantido',
      description: `Garantimos que você recupere seu investimento até o 4º mês ou reembolsamos a diferença.`,
    },
    {
      icon: '🔄',
      title: 'Flexibilidade Contratual',
      description:
        'Sem fidelidade obrigatória após o período inicial. Cancele quando quiser.',
    },
  ];

  guarantees.forEach((item) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Box
    doc.setFillColor(249, 250, 251);
    doc.rect(14, y, pageWidth - 28, 25, 'F');
    doc.setDrawColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(14, y, pageWidth - 28, 25);

    doc.setFontSize(16);
    doc.text(item.icon, 18, y + 8);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, 28, y + 8);

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(item.description, pageWidth - 50);
    doc.text(descLines, 28, y + 15);

    y += 30;
  });
}

function addCallToAction(
  doc: jsPDF,
  options: {
    organizationName: string;
    primaryColor: RGB;
    grayColor: RGB;
    pageWidth: number;
    pageHeight: number;
    validityDays: number;
  }
) {
  const { organizationName, primaryColor, grayColor, pageWidth, pageHeight, validityDays } = options;
  let y = 20;

  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Próximos Passos', pageWidth / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Para iniciarmos sua transformação digital:',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 15;

  // Steps
  const steps = [
    '1. Entre em contato conosco para esclarecer dúvidas',
    '2. Agende uma reunião de alinhamento estratégico',
    '3. Assinatura do contrato e início imediato',
    '4. Primeiros resultados em até 30 dias',
  ];

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  steps.forEach((step) => {
    doc.text(step, pageWidth / 2, y, { align: 'center' });
    y += 10;
  });

  y += 15;

  // Box de urgência
  doc.setFillColor(254, 242, 242);
  doc.rect(20, y, pageWidth - 40, 40, 'F');
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.rect(20, y, pageWidth - 40, 40);
  y += 12;

  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ ATENÇÃO: Proposta válida por apenas ' + validityDays + ' dias', pageWidth / 2, y, {
    align: 'center',
  });
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(127, 29, 29);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Após este período, será necessária uma nova análise com valores atualizados.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // Contato
  y = pageHeight - 60;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Entre em contato com ${organizationName}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('📧 contato@suaagencia.com.br', pageWidth / 2, y, {
    align: 'center',
  });
  y += 7;
  doc.text('📱 (11) 99999-9999', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.text('🌐 www.suaagencia.com.br', pageWidth / 2, y, { align: 'center' });
}

function addFootersToAllPages(
  doc: jsPDF,
  options: {
    grayColor: RGB;
    pageWidth: number;
    pageHeight: number;
  }
) {
  const { grayColor, pageWidth, pageHeight } = options;
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'normal');

    // Linha decorativa
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    // Número da página
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Data de geração
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );

    // Nome da agência (footer esquerdo)
    doc.text('Proposta Comercial - Marketing Digital', 14, pageHeight - 10);
  }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });
}

function hexToRGB(hex: string): RGB {
  // Remove # se existir
  hex = hex.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}
