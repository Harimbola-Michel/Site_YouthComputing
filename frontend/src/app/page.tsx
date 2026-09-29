'use client';

import { motion } from 'framer-motion';
import { HeroSlider } from '@/components/home/HeroSlider';
import { StatsCounter } from '@/components/home/StatsCounter';
import { FeatureCards } from '@/components/home/FeatureCards';
import { LatestNews } from '@/components/home/LatestNews';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { CallToAction } from '@/components/home/CallToAction';
import { PageTransition } from '@/components/shared/PageTransition';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useSocket } from '@/contexts/SocketContext'; // si vous voulez afficher le statut

export default function HomePage() {
  const { isConnected } = useSocket(); // optionnel

  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="pt-16">
          {/* Indicateur de connexion en temps réel (optionnel) */}
          {isConnected && (
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-green-500/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-200"></span>
              </span>
              En direct
            </div>
          )}
          <HeroSlider />
          <StatsCounter />
          <FeatureCards />
          <LatestNews />
          <UpcomingEvents />
          <CallToAction />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}