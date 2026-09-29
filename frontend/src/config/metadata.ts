// src/config/metadata.ts
import type { Metadata, Viewport } from 'next';
import { siteConfig } from './site';

// ─── Site de base ──────────────────────────────────────────
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,

  keywords: [
    'Youth Computing',
    'NTIC Madagascar',
    'Formation numérique',
    'Intelligence Artificielle',
    'Data Science',
    'Développement Web',
    'Communauté Y2C',
    'Hackathon',
    'Éducation technologique',
    'Innovation Madagascar',
    'Programmation',
    'Projets tech',
    'Recrutement IT',
    'Candidature numérique',
  ],

  authors: [
    {
      name: 'Youth Computing',
      url: siteConfig.url,
    },
  ],
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
    alternateLocale: ['en_US', 'mg_MG'],
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: '@youthcomputing',
    site: '@youthcomputing',
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      {
        url: '/images/brand/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/brand/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/images/brand/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/brand/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcut: ['/favicon.ico'],
  },

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: 'black-translucent',
  },

  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },

  alternates: {
    canonical: siteConfig.url,
    languages: {
      'fr-FR': `${siteConfig.url}/fr`,
      'en-US': `${siteConfig.url}/en`,
      'mg-MG': `${siteConfig.url}/mg`,
    },
  },

  category: 'Technology',
  classification: 'Éducation, Technologie, Association',

  // Ajout des verify pour les moteurs (si besoin)
  verification: {
    google: 'votre-code-google',
    yandex: 'votre-code-yandex',
    other: {
      'facebook-domain-verification': 'votre-code-facebook',
    },
  },
};

// ─── Viewport ──────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.colors.primary },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.colors.primary },
  ],
  colorScheme: 'dark light',
};

// ─── Métadonnées spécifiques par page ─────────────────────
export const pageMetadata = {
  // Pages principales
  home: {
    title: 'Accueil',
    description:
      'Youth Computing – Association pour la promotion des NTIC à Madagascar. Découvrez nos formations, notre communauté Y2C et nos projets innovants.',
  },
  about: {
    title: 'À propos',
    description:
      "Découvrez l'histoire, la mission, les valeurs et l'équipe de Youth Computing, acteur clé de la transformation numérique à Madagascar.",
  },
  formations: {
    title: 'Formations',
    description:
      'Formez-vous aux métiers du numérique avec Youth Computing : programmation, data science, IA, développement web, et bien plus.',
  },
  y2c: {
    title: 'Communauté Y2C',
    description:
      'Rejoignez la communauté Youth Computing Community (Y2C) : échangez, apprenez et collaborez avec des passionnés du numérique.',
  },
  projects: {
    title: 'Projets',
    description:
      'Découvrez les projets concrets menés par Youth Computing pour accélérer la transformation digitale à Madagascar.',
  },
  blog: {
    title: 'Blog & Actualités',
    description:
      'Suivez l’actualité de Youth Computing, nos événements, nos ressources éducatives et nos articles de fond sur les NTIC.',
  },
  contact: {
    title: 'Contact',
    description:
      'Contactez Youth Computing pour toute question, collaboration, partenariat ou demande d’information.',
  },

  // Pages d'authentification
  login: {
    title: 'Connexion',
    description: 'Connectez-vous à votre espace personnel Youth Computing pour accéder à vos formations et ressources.',
  },
  register: {
    title: 'Inscription',
    description: 'Créez votre compte Youth Computing et rejoignez notre communauté de passionnés du numérique.',
  },
  'forgot-password': {
    title: 'Mot de passe oublié',
    description: 'Réinitialisez votre mot de passe Youth Computing en toute sécurité.',
  },

  // Pages administration
  dashboard: {
    title: 'Tableau de bord',
    description: 'Gérez votre espace Youth Computing : formations, projets, membres et statistiques.',
  },

  // ⭐ NOUVELLES PAGES PUBLIQUES ⭐
  partners: {
    title: 'Nos Partenaires',
    description:
      'Découvrez les partenaires de Youth Computing qui soutiennent notre mission pour une éducation numérique inclusive à Madagascar.',
  },
  recruitments: {
    title: 'Recrutements',
    description:
      'Consultez les offres d’emploi et de stage de Youth Computing. Rejoignez une équipe dynamique au service de l’innovation.',
  },
  candidatures: {
    title: 'Candidatures',
    description:
      'Déposez votre candidature spontanée ou postulez aux opportunités proposées par Youth Computing.',
  },
};

// ─── Helper pour récupérer les métadonnées d'une page ────
export const getPageMetadata = (page: keyof typeof pageMetadata): Metadata => {
  const meta = pageMetadata[page];
  if (!meta) return defaultMetadata;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${siteConfig.url}/${page === 'home' ? '' : page}`,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}${siteConfig.ogImage}`,
          width: 1200,
          height: 630,
          alt: `${meta.title} | ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  };
};

export default defaultMetadata;