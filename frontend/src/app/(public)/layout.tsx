import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}