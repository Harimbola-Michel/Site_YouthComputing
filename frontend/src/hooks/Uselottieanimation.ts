'use client';

import { useEffect, useState } from 'react';

// Module-level cache so the same animation is only fetched once per session,
// no matter how many components mount it (hero, CTA, etc.).
const cache = new Map<string, Promise<unknown>>();

/**
 * Loads a Lottie JSON file that lives under /public (e.g. "/animations/hero.json").
 * Returns null while loading or if the fetch fails, so callers can render a
 * static fallback instead of crashing the section.
 */
export function useLottieAnimation(src: string) {
  const [data, setData] = useState<unknown | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    if (!cache.has(src)) {
      cache.set(
        src,
        fetch(src).then((res) => {
          if (!res.ok) throw new Error(`Failed to load animation: ${src}`);
          return res.json();
        })
      );
    }

    cache
      .get(src)!
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return { data, status };
}