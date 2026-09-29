// src/app/api/notifications/[id]/route.ts
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/notifications/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[delete] Erreur:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}