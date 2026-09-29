// app/acces-refuse/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccessRefuse() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Accès refusé
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Retour
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}