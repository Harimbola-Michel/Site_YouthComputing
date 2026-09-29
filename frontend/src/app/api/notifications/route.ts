// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(request: NextRequest): string | null {
  return (
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

// ✅ Normalise TOUJOURS en tableau
function normalizeToArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.notifications)) return raw.notifications;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.results)) return raw.results;
    if (raw.data && typeof raw.data === 'object') {
      if (Array.isArray(raw.data.notifications)) return raw.data.notifications;
      if (Array.isArray(raw.data.items)) return raw.data.items;
      if (Array.isArray(raw.data.results)) return raw.data.results;
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    console.warn('[api/notifications] ⚠️  Pas de token');
    return NextResponse.json([]);
  }

  try {
    console.log('[api/notifications] → Fetch backend...');
    const res = await fetch(
      `${BACKEND_URL}/notifications/my-notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    console.log('[api/notifications] ← Backend status:', res.status);

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const raw = await res.json();
    const data = normalizeToArray(raw);

    console.log('[api/notifications] ✅ Retour:', data.length, 'items');
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/notifications] ❌ Erreur:', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/notifications/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[api/notifications POST]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}