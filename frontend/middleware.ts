// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes publiques
const publicRoutes = [
  '/',
  '/a-propos',
  '/formations',
  '/communaute-y2c',
  '/projets',
  '/blog',
  '/contact',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/politique-de-confidentialite',
  '/mentions-legales',
  '/acces-refuse',
];

// Routes admin
const adminRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/formations',
  '/admin/inscriptions',
  '/admin/y2c',
  '/admin/articles',
  '/admin/projets',
  '/admin/utilisateurs',
  '/admin/messages',
  '/admin/parametres',
  '/admin/roles',
  '/admin/equipe',
  '/admin/partenaires',
];

// Rôles autorisés pour les routes admin
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'EDITOR']; // selon votre besoin

async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Récupérer le token
  let token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Route admin
  if (isAdminRoute) {
    if (!token) {
      const url = new URL('/connexion', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);
    if (!payload || !ADMIN_ROLES.includes(payload.role)) {
      return NextResponse.redirect(new URL('/acces-refuse', request.url));
    }
  }

  // Si déjà connecté et sur une page d'authentification
  if (['/connexion', '/inscription'].includes(pathname)) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload && ADMIN_ROLES.includes(payload.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api|fonts).*)',
  ],
};