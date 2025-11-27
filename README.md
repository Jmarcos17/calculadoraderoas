# Calculadora de ROAS

Aplicação Next.js para cálculo de ROAS (Return on Ad Spend) com projeção de faturamento, leads, vendas e custo por venda.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura

```
├─ app/
│  ├─ layout.tsx          # Layout base
│  ├─ page.tsx             # Página principal
│  └─ globals.css          # Estilos globais
├─ components/
│  ├─ RoasForm.tsx         # Formulário de entrada
│  └─ RoasResults.tsx      # Cards com resultados
└─ lib/
   └─ roas.ts              # Lógica de cálculo
```

## 🎯 Funcionalidades

- Cálculo de ROAS baseado em investimento, ticket médio, CPL e taxa de conversão
- Suporte a período mensal ou diário
- Exibição de resultados em cards destacados
- Interface responsiva e moderna

## 🔮 Próximas Funcionalidades

- API route para salvar simulações
- Geração de PDF
- Envio por e-mail/WhatsApp
- Modo apresentação para reuniões

