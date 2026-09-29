'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  showSystem?: boolean;
}

export function ThemeToggle({
  className,
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  showSystem = true,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter l'hydratation mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={cn('gap-2', className)}>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = resolvedTheme || 'system';

  const getIcon = () => {
    if (currentTheme === 'dark') return <Moon className="h-4 w-4" />;
    if (currentTheme === 'light') return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (currentTheme === 'dark') return 'Sombre';
    if (currentTheme === 'light') return 'Clair';
    return 'Système';
  };

  const isThemeActive = (themeName: string) => {
    if (themeName === 'system') return theme === 'system';
    return theme === themeName;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2 transition-colors duration-200',
            currentTheme === 'dark' && 'hover:bg-primary/10',
            currentTheme === 'light' && 'hover:bg-secondary/10',
            className
          )}
          aria-label="Changer le thème"
        >
          {getIcon()}
          {showLabel && (
            <span className="hidden sm:inline text-sm">{getLabel()}</span>
          )}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] p-1">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Thème
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'gap-3 cursor-pointer rounded-md px-3 py-2.5 transition-colors',
            theme === 'light' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Clair</span>
          {theme === 'light' && <Check className="ml-auto h-4 w-4 text-secondary" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'gap-3 cursor-pointer rounded-md px-3 py-2.5 transition-colors',
            theme === 'dark' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Sombre</span>
          {theme === 'dark' && <Check className="ml-auto h-4 w-4 text-secondary" />}
        </DropdownMenuItem>
        
        {showSystem && (
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={cn(
              'gap-3 cursor-pointer rounded-md px-3 py-2.5 transition-colors',
              theme === 'system' && 'bg-secondary/10 text-secondary'
            )}
          >
            <Monitor className="h-4 w-4" />
            <span>Système</span>
            {theme === 'system' && <Check className="ml-auto h-4 w-4 text-secondary" />}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}