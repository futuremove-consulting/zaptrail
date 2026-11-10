import './globals.css';
import { DomainProvider } from '@/context/domain-context';
import { AppShell } from '@/components/layout/app-shell';

export const metadata = {
  title: 'ZapTrail — Conversational Intelligence Engine',
  description:
    'Motor de inteligência conversacional desacoplado com Core Universal e Domain Packs plugáveis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <DomainProvider initialDomainKey="real_estate">
          <AppShell pendingReviewCount={0}>{children}</AppShell>
        </DomainProvider>
      </body>
    </html>
  );
}
