'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { publicNavigation } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { buildImageUrl } from '@/lib/imageUtils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : 'U';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-[300px] bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-ubuntu text-lg font-bold text-primary">
                Menu
              </span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Profil dans le menu mobile */}
            {isAuthenticated && user && (
              <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar ? buildImageUrl(user.avatar, false) : undefined} />
                  <AvatarFallback className="bg-secondary/10 text-secondary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    onClose();
                    window.location.href = '/admin/dashboard';
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Separator className="my-4" />

            <nav className="flex flex-col gap-1">
              {publicNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary/10 text-secondary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-4" />

            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onClose}
                  >
                    <Link href="/admin/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/connexion" onClick={onClose}>
                      <User className="mr-2 h-4 w-4" />
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full justify-start">
                    <Link href="/inscription" onClick={onClose}>
                      S'inscrire
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}