/* ZT-009 — ZapTrail Aplicação Web Mobile-First
 * Ponytail: Next.js App Router + shadcn/ui, English identifiers only, Tailwind mobile-first
 */

import "./globals.css";

export const metadata = {
  title: "ZapTrail — Transform conversations into trackable management objects",
  description:
    "Convert WhatsApp conversations into tasks, decisions, opportunities, commitments and alerts with evidence and confidence scores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}