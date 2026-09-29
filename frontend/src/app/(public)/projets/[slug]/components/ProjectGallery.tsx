// app/(public)/projets/[slug]/components/ProjectGallery.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted cursor-pointer group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => openModal(currentIndex)}
          loading="lazy"
        />
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all hover:scale-105',
                idx === currentIndex ? 'border-secondary' : 'border-transparent'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Miniature ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              className="absolute right-4 top-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex]}
                alt={`${title} - vue agrandie`}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-sm text-white">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}