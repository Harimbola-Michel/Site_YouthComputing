'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, isMobile } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] border-r bg-card transition-transform duration-300 ease-in-out',
          isMobile && !sidebarOpen && '-translate-x-full',
          !isMobile && !sidebarOpen && 'w-[72px]'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            {sidebarOpen && (
              <span className="font-ubuntu text-xl font-bold text-primary">
                Youth Admin
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <AdminSidebar collapsed={!sidebarOpen} />
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-[280px]' : 'ml-[72px]'
        )}
      >
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}