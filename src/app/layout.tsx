import './globals.css';

import type { Metadata } from 'next';
import { Courier_Prime, Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const courierPrime = Courier_Prime({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-courier-prime',
});

export const metadata: Metadata = {
  title: 'Moacir Gama',
  description: 'Em construção...',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${courierPrime.variable}`}>{children}</body>
    </html>
  );
}
