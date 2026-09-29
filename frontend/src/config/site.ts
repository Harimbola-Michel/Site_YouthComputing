/**
 * Configuration principale du site Youth Computing
 * Centralise toutes les variables globales : identité, marque, thème, API, fonctionnalités
 */

export const siteConfig = {
  // ========================================
  // IDENTITÉ DU SITE
  // ========================================
  name: 'Youth Computing',
  shortName: 'Youth Comp',
  description:
    'Association pour la promotion des NTIC à Madagascar - Formations, communauté Y2C et projets innovants',
  tagline: 'La culture numérique pour tous',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/images/brand/og-image.jpg',
  locale: 'fr_FR',

  // ========================================
  // MARQUE ET CHARTE GRAPHIQUE
  // ========================================
  brand: {
    name: 'Youth Computing',
    logo: {
      light: '/images/brand/logo.svg',
      dark: '/images/brand/logo-dark.svg',
      white: '/images/brand/logo-white.svg',
    },
    icon: '/images/brand/icon-192x192.png',
    favicon: '/favicon.ico',
  },

  // ========================================
  // COULEURS (Charte graphique)
  // ========================================
  colors: {
    primary: {
      DEFAULT: '#010B40',
      foreground: '#FFFFFF',
      50: '#E6E8F0',
      100: '#CDD1E0',
      200: '#9BA3C1',
      300: '#6975A3',
      400: '#374784',
      500: '#010B40',
      600: '#010933',
      700: '#010726',
      800: '#000419',
      900: '#00020D',
    },
    secondary: {
      DEFAULT: '#F13544',
      foreground: '#FFFFFF',
      50: '#FDE6E8',
      100: '#FCCDD1',
      200: '#F99BA3',
      300: '#F66974',
      400: '#F43746',
      500: '#F13544',
      600: '#C12A36',
      700: '#912029',
      800: '#61151B',
      900: '#300B0E',
    },
    accent: {
      DEFAULT: '#F13544',
      foreground: '#FFFFFF',
    },
    neutral: {
      background: '#FFFFFF',
      foreground: '#010B40',
      muted: '#F3F4F6',
      mutedForeground: '#6B7280',
    },
  },

  // ========================================
  // THÈME
  // ========================================
  theme: {
    defaultTheme: 'light',
    themes: ['light', 'dark', 'system'] as const,
    storageKey: 'youthcomputing-theme',
    transitionDuration: '300ms',
  },

  // ========================================
  // TYPOGRAPHIE
  // ========================================
  fonts: {
    primary: 'Century Gothic',
    heading: 'Ubuntu',
    accent: 'Dry Brush',
    fallback: 'sans-serif',
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  // ========================================
  // MISE EN PAGE
  // ========================================
  layout: {
    containerWidth: '1280px',
    headerHeight: '4rem',
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
    },
    spacing: {
      section: {
        mobile: '3rem',
        tablet: '4rem',
        desktop: '6rem',
      },
      component: {
        mobile: '1.5rem',
        desktop: '2rem',
      },
      element: '0.75rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // ========================================
  // RÉSEAUX SOCIAUX
  // ========================================
  social: {
    facebook: {
      url: 'https://facebook.com/youthcomputing',
      label: 'Facebook',
      icon: 'facebook',
    },
    instagram: {
      url: 'https://instagram.com/youthcomputing',
      label: 'Instagram',
      icon: 'instagram',
    },
    linkedin: {
      url: 'https://linkedin.com/company/youthcomputing',
      label: 'LinkedIn',
      icon: 'linkedin',
    },
    whatsapp: {
      url: 'https://wa.me/261341234567',
      label: 'WhatsApp',
      icon: 'whatsapp',
    },
    twitter: {
      url: 'https://twitter.com/youthcomputing',
      label: 'Twitter',
      icon: 'twitter',
    },
    youtube: {
      url: 'https://youtube.com/@youthcomputing',
      label: 'YouTube',
      icon: 'youtube',
    },
  },

  // ========================================
  // CONTACT
  // ========================================
  contact: {
    email: 'contact@youthcomputing.mg',
    phone: '+261 34 12 34 567',
    phoneDisplay: '034 12 34 567',
    address: 'Fianarantsoa, Madagascar',
    addressFull: 'BP 123, Fianarantsoa 301, Madagascar',
    hours: 'Lun - Ven: 8h - 17h',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.0!2d47.0!3d-21.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzAwLjAiUyA0N8KwMDAnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1234567890',
  },

  // ========================================
  // API & SERVICES
  // ========================================
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000',
    timeout: 30000,
  },

  // ========================================
  // FONCTIONNALITÉS
  // ========================================
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableSocket: process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true',
    enableChat: true,
    enableNotifications: true,
    enableMaintenance: false,
    enableDebug: process.env.NODE_ENV === 'development',
  },

  // ========================================
  // SEO & MÉTADONNÉES
  // ========================================
  seo: {
    title: 'Youth Computing - Association NTIC Madagascar',
    description:
      'Promotion des NTIC et de l\'inclusion numérique à Madagascar. Formations, communauté Y2C et projets innovants.',
    keywords: [
      'Youth Computing',
      'NTIC Madagascar',
      'Formation Informatique',
      'Communauté Y2C',
      'Innovation Madagascar',
      'Association',
      'Technologie',
      'Programmation',
      'Développement Web',
      'Intelligence Artificielle',
    ],
    author: 'Youth Computing Association',
    robots: 'index, follow',
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },

  // ========================================
  // LIENS UTILES
  // ========================================
  links: {
    privacy: '/politique-confidentialite',
    terms: '/conditions-generales',
    cookies: '/cookies',
    legal: '/mentions-legales',
    help: '/aide',
    support: '/contact',
  },
} as const;

// Type dérivé pour une meilleure autocomplétion
export type SiteConfig = typeof siteConfig;

export default siteConfig;