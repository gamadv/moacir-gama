import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Courier_Prime, Inter } from 'next/font/google';

import { AuthProvider } from '@/shared/lib/auth/AuthProvider';
import { Header } from '@/widgets/header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const courierPrime = Courier_Prime({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-courier-prime',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#111111',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://moacirgama.com'),
  title: {
    default: 'Moacir Gama - Portfolio & Tools',
    template: '%s | Moacir Gama',
  },
  description:
    'Portfolio pessoal e ferramentas úteis de Moacir Gama. Desenvolvedor de software com experiência em tecnologias modernas. Inclui DailyKalk para cálculo de horas trabalhadas.',
  keywords: [
    'Moacir Gama',
    'Moacir G',
    'desenvolvedor',
    'software',
    'portfolio',
    'DailyKalk',
    'calculadora de horas',
    'horas trabalhadas',
    'ferramentas',
    'tools',
    'web developer',
    'frontend',
    'React',
    'Next.js',
  ],
  authors: [{ name: 'Moacir Gama' }],
  creator: 'Moacir Gama',
  publisher: 'Moacir Gama',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#111111' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Moacir G',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Moacir Gama',
    title: 'Moacir Gama - Portfolio & Tools',
    description:
      'Portfolio pessoal e ferramentas úteis de Moacir Gama. Desenvolvedor de software com experiência em tecnologias modernas.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Moacir Gama - Portfolio & Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moacir Gama - Portfolio & Tools',
    description: 'Portfolio pessoal e ferramentas úteis de Moacir Gama. Desenvolvedor de software.',
    images: ['/og-image.png'],
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Moacir G" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#111111" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.variable} ${courierPrime.variable}`}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
