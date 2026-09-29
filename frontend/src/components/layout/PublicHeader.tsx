'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { publicNavigation } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LiveNotificationsBell } from '@/components/admin/LiveNotificationsBell';

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-primary">Youth</span>
            <span className="text-secondary">Computing</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicNavigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-secondary',
                  isActive ? 'text-secondary' : 'text-foreground/80'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="ghost" size="icon" />
          {isAuthenticated ? (
            <>
              <LiveNotificationsBell />
              <Button asChild variant="default" size="sm">
                <Link href="/admin/dashboard">Tableau de bord</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="hidden sm:flex">
                <Link href="/inscription">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}