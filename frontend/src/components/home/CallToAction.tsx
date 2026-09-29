'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLottieAnimation } from '@/hooks/Uselottieanimation';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function CallToAction() {
  const prefersReducedMotion = useReducedMotion();
  const { data: ctaAnimation, status } = useLottieAnimation('/animations/cta.json');

  return (
    <section className="relative overflow-hidden bg-primary py-20">
      {status === 'ready' && ctaAnimation && (
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <Lottie animationData={ctaAnimation} loop autoplay={!prefersReducedMotion} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary/20 to-primary opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container relative z-10 mx-auto px-4 text-center"
      >
        <h2 className="font-ubuntu text-3xl font-bold text-white md:text-4xl">
          Prêt à rejoindre l&apos;aventure ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
          Rejoignez la communauté Youth Computing et participez à la transformation numérique de Madagascar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/communaute-y2c">
              <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90">
                Devenir membre
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Nous contacter
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
