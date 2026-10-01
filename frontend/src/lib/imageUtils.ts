// lib/imageUtils.ts
import { BACKEND_URL } from './env';

const API_BASE_URL = BACKEND_URL;

// Placeholder SVG
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3C/svg%3E';

export function buildImageUrl(imageUrl?: string | null, useFallback: boolean = true): string {
  if (!imageUrl) {
    return useFallback ? PLACEHOLDER_IMAGE : '';
  }

  // URL absolue
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Les fichiers envoyés par l'API doivent être chargés depuis le backend,
  // pas depuis l'origine Next.js (port 3100).
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_BASE_URL}${path}`;
  }

  // Chemin /images/ (public)
  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }

  // Chemin relatif vers un fichier d'upload
  if (!imageUrl.startsWith('/')) {
    return `${API_BASE_URL}/uploads/${imageUrl}`;
  }

  return imageUrl;
}