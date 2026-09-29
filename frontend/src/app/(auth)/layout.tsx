// app/(auth)/layout.tsx
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Fonds décoratifs animés */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-secondary/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Contenu de la page (gère sa propre mise en page) */}
      {children}
    </div>
  );
}