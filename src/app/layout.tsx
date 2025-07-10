import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'mosescafe - Café Premium de Côte d\'Ivoire',
  description: 'Découvrez notre sélection de cafés Robusta premium torréfiés artisanalement en Côte d\'Ivoire. Capsules, grains et café moulu d\'exception.',
  keywords: 'café, robusta, côte d\'ivoire, capsules, grains, espresso, mosescafe',
  authors: [{ name: 'mosescafe' }],
  openGraph: {
    title: 'mosescafe - Café Premium de Côte d\'Ivoire',
    description: 'Café Robusta premium torréfié artisanalement',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo-mosescafe.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Favicon fallback SVG */}
        <link 
          rel="icon" 
          type="image/svg+xml" 
          href="data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='16' rx='12' ry='14' fill='url(%23coffeeGradient)' /><path d='M 8 16 Q 16 12, 24 16 Q 16 20, 8 16' fill='none' stroke='%23fff' stroke-width='1.5' /><path d='M 20 8 Q 22 6, 24 8 Q 22 4, 20 6 Q 18 4, 20 8' fill='url(%23flameGradient)' /><defs><linearGradient id='coffeeGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23dc2626' /><stop offset='50%25' stop-color='%2316a34a' /><stop offset='100%25' stop-color='%238B4513' /></linearGradient><linearGradient id='flameGradient' x1='0%25' y1='100%25' x2='0%25' y2='0%25'><stop offset='0%25' stop-color='%23ea580c' /><stop offset='50%25' stop-color='%23f59e0b' /><stop offset='100%25' stop-color='%23ef4444' /></linearGradient></defs></svg>" 
        />
        {/* Meta couleurs pour mobile */}
        <meta name="msapplication-TileColor" content="#dc2626" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}