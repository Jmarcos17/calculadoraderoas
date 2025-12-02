# Calculadora de ROAS - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Dados de Entrada](#dados-de-entrada)
3. [Lógica de Cálculo](#lógica-de-cálculo)
4. [Cálculos Mensais (30 dias)](#cálculos-mensais-30-dias)
5. [Projeções para o Contrato](#projeções-para-o-contrato)
6. [Investimento Necessário](#investimento-necessário)
7. [Estrutura da Interface](#estrutura-da-interface)
8. [Exemplos de Cálculo](#exemplos-de-cálculo)

---

## 🎯 Visão Geral

A calculadora de ROAS deve funcionar com a seguinte lógica:

- **Investimento informado** = valor **MENSAL** (para 30 dias)
- **Resultados exibidos** = baseados em **1 MÊS**
- **Tempo de contrato** = usado APENAS para projeções mês a mês (gráficos e tabelas)
- **Projeção anual** = resultado mensal × número de meses

---

## 📊 Dados de Entrada

### Parâmetros Principais
```javascript
investimentoMensal = 3000     // R$ 3.000 por mês
ticketMedio = 200             // R$ 200 por venda
custoPorLead = 50             // R$ 50 por lead (CPL)
taxaConversao = 3             // 3% (percentual)
comissaoAgencia = 0           // 0% (percentual)
tempoContrato = 12            // 12 meses (apenas para projeções)
metaFaturamento = 50000       // R$ 50.000 por mês
```

### Parâmetros Opcionais
```javascript
mensalidadeAgenciaConcorrente = 3000  // Para comparação
suaMensalidade = 2000                 // Para comparação de ROI
```

---

## 🧮 Lógica de Cálculo

### Princípio Fundamental
**IMPORTANTE:** O tempo de contrato (12 meses) é usado APENAS para:
- ✅ Projeções mês a mês (gráficos)
- ✅ Tabelas de evolução
- ✅ Visualização de crescimento ao longo do tempo

**NÃO** deve ser usado para:
- ❌ Multiplicar o investimento inicial
- ❌ Calcular ROAS total
- ❌ Alterar os resultados principais exibidos

---

## 📅 Cálculos Mensais (30 dias)

Todos os cálculos principais são feitos para **1 MÊS**:

### 1. Leads Estimados (Mensal)
```javascript
leadsEstimadosMensal = investimentoMensal / custoPorLead
```
**Exemplo:**
```
3000 / 50 = 60 leads/mês
```

### 2. Vendas Projetadas (Mensal)
```javascript
vendasProjetadasMensal = leadsEstimadosMensal × (taxaConversao / 100)
vendasArredondadasMensal = Math.round(vendasProjetadasMensal)
```
**Exemplo:**
```
60 × 0.03 = 1.8 vendas/mês
Arredondado = 2 vendas/mês
```

### 3. Faturamento Bruto (Mensal)
```javascript
faturamentoBrutoMensal = vendasArredondadasMensal × ticketMedio
```
**Exemplo:**
```
2 × 200 = R$ 400,00/mês
```

### 4. ROAS (Mensal)
```javascript
roasMensal = faturamentoBrutoMensal / investimentoMensal
```
**Exemplo:**
```
400 / 3000 = 0.133
Resultado: 0.13x
```

### 5. Comissão e Custos (Mensal)
```javascript
comissaoValorMensal = faturamentoBrutoMensal × (comissaoAgencia / 100)
custoTotalMensal = investimentoMensal + comissaoValorMensal
```
**Exemplo:**
```
Comissão: 400 × 0 = R$ 0,00
Custo Total: 3000 + 0 = R$ 3.000,00
```

### 6. Lucro e ROI (Mensal)
```javascript
lucroLiquidoMensal = faturamentoBrutoMensal - custoTotalMensal
roiMensal = (lucroLiquidoMensal / custoTotalMensal) × 100
```
**Exemplo:**
```
Lucro: 400 - 3000 = -R$ 2.600,00
ROI: (-2600 / 3000) × 100 = -86.67%
```

### 7. CPA - Custo Por Aquisição (Mensal)
```javascript
cpaMensal = investimentoMensal / vendasArredondadasMensal
```
**Exemplo:**
```
3000 / 2 = R$ 1.500,00
```

---

## 📈 Projeções para o Contrato

Apenas para visualização em gráficos e tabelas:

### Investimento Total
```javascript
investimentoTotal = investimentoMensal × tempoContrato
```
**Exemplo:**
```
3000 × 12 = R$ 36.000,00
```

### Leads Total
```javascript
leadsTotal = leadsEstimadosMensal × tempoContrato
```
**Exemplo:**
```
60 × 12 = 720 leads
```

### Vendas Total
```javascript
vendasTotal = vendasArredondadasMensal × tempoContrato
```
**Exemplo:**
```
2 × 12 = 24 vendas
```

### Faturamento Total
```javascript
faturamentoTotal = faturamentoBrutoMensal × tempoContrato
```
**Exemplo:**
```
400 × 12 = R$ 4.800,00
```

### Lucro Total
```javascript
lucroTotal = lucroLiquidoMensal × tempoContrato
```
**Exemplo:**
```
-2600 × 12 = -R$ 31.200,00
```

---

## 💡 Investimento Necessário

Para atingir a meta de faturamento **MENSAL**:

### Vendas Necessárias
```javascript
vendasNecessariasMensal = metaFaturamento / ticketMedio
```
**Exemplo:**
```
50000 / 200 = 250 vendas/mês
```

### Leads Necessários
```javascript
leadsNecessariosMensal = vendasNecessariasMensal / (taxaConversao / 100)
```
**Exemplo:**
```
250 / 0.03 = 8.333,33 leads/mês
```

### Investimento Necessário Mensal
```javascript
investimentoNecessarioMensal = leadsNecessariosMensal × custoPorLead
```
**Exemplo:**
```
8333.33 × 50 = R$ 416.666,67/mês
```

### Investimento Necessário Total
```javascript
investimentoNecessarioTotal = investimentoNecessarioMensal × tempoContrato
```
**Exemplo:**
```
416666.67 × 12 = R$ 5.000.000,00 (em 12 meses)
```

---

## 🖥️ Estrutura da Interface

### Seção 1: Resultados Projetados (MENSAL - 30 DIAS)
Exibir os principais resultados baseados em **1 mês**:
- **Faturamento Projetado:** R$ 400,00/mês
- **ROAS:** 0.13x
- **Comparação com mercado:** -45% vs mercado (se ROAS mercado = 2.0x)

### Seção 2: Eficiência do Funil (MENSAL)
- **Leads Estimados:** 60/mês
- **Vendas Projetadas:** 2/mês
- **CPA Médio:** R$ 1.500,00

### Seção 3: Análise Financeira (MENSAL)
- **Investimento:** R$ 3.000,00/mês
- **ROI Líquido:** -86.67%
- **Faturamento Bruto:** R$ 400,00/mês
- **Comissão Agência:** R$ 0,00/mês

### Seção 4: Sugestão de Investimento
Para atingir a meta de **R$ 50.000,00/mês**:
- **Investir:** R$ 416.666,67/mês
- **Ou:** R$ 5.000.000,00 total em 12 meses

### Seção 5: Projeção para o Contrato (12 meses)
Tabela mês a mês mostrando:
- Mês 1: Investimento R$ 3.000 → Faturamento R$ 400 → Vendas 2 → ROAS 0.13x
- Mês 2: Investimento R$ 6.000 → Faturamento R$ 800 → Vendas 4 → ROAS 0.13x
- Mês 3: Investimento R$ 9.000 → Faturamento R$ 1.200 → Vendas 6 → ROAS 0.13x
- ...
- Mês 12: Investimento R$ 36.000 → Faturamento R$ 4.800 → Vendas 24 → ROAS 0.13x

### Seção 6: Gráficos
- **Evolução do Faturamento:** Gráfico de linha mostrando crescimento mês a mês
- **ROAS Mensal:** Gráfico de barras (constante em 0.13x)
- **Comparação de Custos:** Custo vs Faturamento ao longo dos meses

---

## 📝 Exemplos de Cálculo

### Exemplo 1: Cenário Atual
**Inputs:**
- Investimento: R$ 3.000/mês
- Ticket Médio: R$ 200
- CPL: R$ 50
- Taxa de Conversão: 3%
- Comissão: 0%

**Resultados (Mensais):**
```
Leads: 60/mês
Vendas: 2/mês
Faturamento: R$ 400,00/mês
ROAS: 0.13x
ROI: -86.67%
CPA: R$ 1.500,00
```

**Projeção 12 meses:**
```
Investimento Total: R$ 36.000,00
Faturamento Total: R$ 4.800,00
Prejuízo Total: -R$ 31.200,00
```

### Exemplo 2: Para Atingir Meta de R$ 50.000/mês
**Cálculo:**
```
Vendas necessárias: 50000 / 200 = 250 vendas/mês
Leads necessários: 250 / 0.03 = 8.333 leads/mês
Investimento necessário: 8333 × 50 = R$ 416.666,67/mês
```

**Resultado:**
- É necessário investir **R$ 416.666,67 por mês**
- Ou **R$ 5.000.000,00 em 12 meses**
- Para gerar 250 vendas/mês
- E atingir R$ 50.000/mês de faturamento

---

## ⚠️ Alertas e Validações

### Alertas de Performance
```javascript
if (roas < 1.0) {
  alert("Você está tendo prejuízo! Cada R$1 investido retorna menos de R$1");
}

if (roas < 2.0) {
  alert("ROAS abaixo da média do mercado (-X% vs mercado)");
  color = "red";
} else if (roas >= 2.0 && roas < 3.0) {
  alert("ROAS na média do mercado");
  color = "yellow";
} else {
  alert("ROAS acima da média do mercado");
  color = "green";
}
```

### Validações de Input
```javascript
// Validar se investimento > 0
if (investimento <= 0) {
  alert("Investimento deve ser maior que zero");
}

// Validar se CPL > 0
if (custoPorLead <= 0) {
  alert("Custo por Lead deve ser maior que zero");
}

// Validar se taxa de conversão está entre 0 e 100
if (taxaConversao <= 0 || taxaConversao > 100) {
  alert("Taxa de conversão deve estar entre 0% e 100%");
}

// Alertar sobre divisão por zero
if (vendasProjetadas === 0) {
  alert("Com estes parâmetros, você não terá vendas. Ajuste seu investimento ou melhore sua taxa de conversão.");
}
```

---

## 🔄 Comparação: Antes vs Depois

### ❌ LÓGICA ERRADA (Antiga)
```javascript
// ERRADO: Multiplicava tudo pelos 12 meses logo no início
const investimentoTotal = investimento × 12;
const leadsTotal = investimentoTotal / custoPorLead;
const vendasTotal = leadsTotal × (taxaConversao / 100);
const faturamentoTotal = vendasTotal × ticketMedio;
const roas = faturamentoTotal / investimentoTotal;

// Resultado: Mostrava valores anuais como se fossem mensais
```

### ✅ LÓGICA CORRETA (Nova)
```javascript
// CORRETO: Calcula mensalmente primeiro
const leadsEstimadosMensal = investimento / custoPorLead;
const vendasProjetadasMensal = leadsEstimadosMensal × (taxaConversao / 100);
const faturamentoBrutoMensal = vendasProjetadasMensal × ticketMedio;
const roasMensal = faturamentoBrutoMensal / investimento;

// Depois projeta para 12 meses (apenas para visualizações)
const projecao12Meses = {
  investimento: investimento × 12,
  faturamento: faturamentoBrutoMensal × 12,
  leads: leadsEstimadosMensal × 12,
  vendas: vendasProjetadasMensal × 12
};

// Resultado: Mostra valores mensais corretamente
```

---

## 📚 Glossário

- **ROAS (Return on Ad Spend):** Retorno sobre investimento em anúncios. Quanto você fatura para cada R$1 investido.
- **ROI (Return on Investment):** Retorno sobre investimento total (incluindo comissões). Percentual de lucro ou prejuízo.
- **CPL (Custo por Lead):** Quanto custa para gerar um lead.
- **CPA (Custo por Aquisição):** Quanto custa para gerar uma venda.
- **Taxa de Conversão:** Percentual de leads que se tornam vendas.
- **Ticket Médio:** Valor médio de cada venda.

---

## ✨ Resumo Executivo

**Regra de Ouro:**
1. O investimento informado é **MENSAL**
2. Todos os resultados exibidos são **MENSAIS**
3. O tempo de contrato é usado **APENAS** para projeções e gráficos
4. Calcule tudo para 1 mês primeiro, depois multiplique pelos meses

**Fórmulas Essenciais:**
```
ROAS = Faturamento Mensal / Investimento Mensal
ROI = ((Faturamento - Custos) / Custos) × 100
CPA = Investimento / Vendas
Leads = Investimento / CPL
Vendas = Leads × Taxa de Conversão
```

---

**Documento criado em:** 02/12/2025  
**Versão:** 1.0  
**Status:** ✅ Validado e Pronto para Implementação