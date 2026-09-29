'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { partners as partnersApi } from '@/lib/api';
import { buildImageUrl } from '@/lib/imageUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

export function HomePartners() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['homePartners'],
    queryFn: async () => {
      const res = await partnersApi.getActive();
      const list = res.data?.data ?? res.data ?? [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const partners = (data ?? []).slice(0, 8);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container-custom">
          <Skeleton className="mx-auto mb-8 h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || partners.length === 0) return null;

  return (
    <section className="py-16 bg-muted/20" aria-labelledby="partners-title">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 id="partners-title" className="font-ubuntu text-2xl font-bold md:text-3xl">
            Ils nous font <span className="text-secondary">confiance</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {partners.map((partner: any) => {
            const logoUrl = partner.logo ? buildImageUrl(partner.logo, true) : null;
            const content = (
              <div className="flex h-24 items-center justify-center rounded-xl border bg-background/80 p-4 shadow-sm transition hover:shadow-md">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={partner.name}
                    width={120}
                    height={48}
                    className="max-h-12 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {partner.name}
                  </div>
                )}
              </div>
            );

            return partner.website ? (
              <a key={partner.id} href={partner.website} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={partner.id}>{content}</div>
            );
          })}
        </div>

        <p className="mt-8 text-center">
          <Link href="/partenaires" className="text-sm font-medium text-secondary hover:underline">
            Voir tous les partenaires
          </Link>
        </p>
      </div>
    </section>
  );
}
