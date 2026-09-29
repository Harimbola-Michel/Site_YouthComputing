'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from './components/GeneralSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { EmailSettings } from './components/EmailSettings';
import { SettingsProvider } from './components/SettingsProvider';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Paramètres
            </h1>
            <p className="text-muted-foreground">
              Configurez les paramètres de la plateforme
            </p>
          </div>
        </div>

        {/* ─── Onglets ────────────────────────────────────── */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              ⚙️ Général
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              🔒 Sécurité
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              ✉️ Email
            </TabsTrigger>
          </TabsList>

          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsProvider>
              <TabsContent value="general" className="mt-6">
                <GeneralSettings />
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <SecuritySettings />
              </TabsContent>

              <TabsContent value="email" className="mt-6">
                <EmailSettings />
              </TabsContent>
            </SettingsProvider>
          </Suspense>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[300px] w-full rounded-xl" />
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}