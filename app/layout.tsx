import './globals.css';
import type { Metadata } from 'next';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Calculadora de ROAS',
  description: 'Ferramenta de projeção de faturamento e ROAS para reuniões comerciais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-100">
        <SessionProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}

