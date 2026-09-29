import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Youth Computing',
    'NTIC Madagascar',
    'Formation Informatique',
    'Communauté Y2C',
    'Innovation Madagascar',
    'Association',
    'Technologie',
  ],
  authors: [{ name: 'Youth Computing Association' }],
  creator: 'Youth Computing',
  publisher: 'Youth Computing',
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
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/images/brand/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/brand/og-image.jpg`],
    creator: '@youthcomputing',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/brand/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/images/brand/icon-192x192.png', sizes: '192x192' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName || siteConfig.name,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#010B40' },
    { media: '(prefers-color-scheme: dark)', color: '#010B40' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`
          font-ubuntu
          antialiased
          bg-background
          text-foreground
          min-h-screen
          flex
          flex-col
        `}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
