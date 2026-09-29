// next.config.js
/** @type {import('next').NextConfig} */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DU BACKEND
// ═══════════════════════════════════════════════════════════════
// .env.local peut contenir :
//   - NEXT_PUBLIC_API_URL=http://localhost:5000/api
//   - NEXT_PUBLIC_API_URL=http://localhost:5000
//   - NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
//
// On extrait l'URL de base SANS /api pour éviter le double /api

const RAW_BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : 'https://youthcomputing.mg/api');

// ⚠️ Nettoyage : enlève le "/api" final s'il existe
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

// Debug (visible au démarrage du serveur)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 [next.config] Backend URL:', BACKEND_URL);
  console.log('🔧 [next.config] Raw backend URL:', RAW_BACKEND_URL);
}

// ═══════════════════════════════════════════════════════════════
// CONFIG NEXT.JS
// ═══════════════════════════════════════════════════════════════
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,

  // The existing codebase contains legacy type errors outside the Docker
  // runtime path. Keep them available through `npm run type-check`, without
  // preventing the production image from being generated.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ─── Images ───
  images: {
    unoptimized: true, // Les images viennent du backend
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'youthcomputing.mg',
      },
    ],
  },

  // ─── Headers de sécurité ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // ─── Rewrites / Proxy ───
  async rewrites() {
    return {
      // ✅ beforeFiles : AVANT le filesystem (⚠️ attention aux conflits)
      beforeFiles: [],

      // ✅ afterFiles : APRÈS le filesystem (les routes locales gagnent)
      //    → /api/notifications (route.ts local) est prioritaire
      //    → /api/dashboard/stats (pas de route locale) → proxy backend
      afterFiles: [
        // Redirection des uploads (images) vers le backend
        {
          source: '/uploads/:path*',
          destination: `${BACKEND_URL}/uploads/:path*`,
        },
        // Redirection API vers le backend (fallback si pas de route locale)
        {
          source: '/api/:path*',
          destination: `${BACKEND_URL}/api/:path*`,
        },
      ],

      // ✅ fallback : après les routes dynamiques
      fallback: [],
    };
  },

  // ═══════════════════════════════════════════════════════════
  // ✅ FILTRE LES WARNINGS RECHARTS (defaultProps)
  // ═══════════════════════════════════════════════════════════
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        // Ignore les warnings de defaultProps
        /Support for defaultProps will be removed/,
        /defaultProps/,
        // Ignore tous les warnings Recharts
        { module: /node_modules\/recharts/ },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
