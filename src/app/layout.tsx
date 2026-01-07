// apps/bar-dashboard/src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthGuard } from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bar Dashboard - Blackout Project',
  description: 'Gestion des bars et validation des commandes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}