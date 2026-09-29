// src/app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(request: NextRequest): string | null {
  return (
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/notifications/${params.id}/read`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[read] Erreur:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}