'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || 'system') : 'system';
  const isDark = currentTheme === 'dark';
  const isLight = currentTheme === 'light';
  const isSystem = theme === 'system';

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    currentTheme,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    mounted,
  };
}