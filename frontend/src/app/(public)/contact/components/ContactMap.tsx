'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function ContactMap() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg overflow-hidden border shadow-sm"
    >
      <div className="relative aspect-video w-full bg-muted/20">
        <iframe
          src={siteConfig.contact.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.0!2d47.0!3d-21.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzAwLjAiUyA0N8KwMDAnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1234567890'}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Carte interactive Youth Computing"
          className="absolute inset-0"
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MapPin className="h-8 w-8 animate-pulse" />
              <p className="text-sm">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>📍 {siteConfig.contact.address}</span>
        <a
          href={siteConfig.contact.mapLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:underline"
        >
          Voir sur Google Maps
        </a>
      </div>
    </motion.div>
  );
}