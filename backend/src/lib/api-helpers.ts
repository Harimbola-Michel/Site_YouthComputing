// src/lib/api-helpers.ts
export function extractDataArray<T = any>(response: any, fallback: T[] = []): T[] {
  if (!response) return fallback;
  if (Array.isArray(response)) return response;
  if (typeof response === 'object' && response !== null) {
    const commonKeys = ['data', 'items', 'results', 'list', 'recruitments', 'candidatures'];
    for (const key of commonKeys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }
    for (const key of Object.keys(response)) {
      const value = response[key];
      if (Array.isArray(value)) return value;
      if (typeof value === 'object' && value !== null) {
        const found = extractDataArray(value, null);
        if (found) return found;
      }
    }
  }
  return fallback;
}