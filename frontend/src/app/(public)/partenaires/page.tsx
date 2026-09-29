'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { PartnerRequestModal } from '@/components/public/PartnerRequestModal';
import { partners } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Link2, Users, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicPartnersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await partners.getActive();
      const list = response?.data?.data ?? response?.data ?? [];
      setData(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Erreur chargement partenaires:', error);
      toast.error('Impossible de charger les partenaires');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleRefresh = async () => {
    await fetchPartners();
    toast.success('Liste actualisée ✅');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-8 text-center">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto mt-2" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* ─── En-tête ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Nos <span className="text-secondary">Partenaires</span>
          </h1>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block h-1.5 w-16 rounded-full bg-secondary" />
            <span className="inline-block h-1.5 w-8 rounded-full bg-primary/30" />
          </div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les organisations qui nous accompagnent dans notre mission de promotion des NTIC à Madagascar.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-secondary to-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Devenir partenaire
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Rafraîchir
            </Button>
          </div>
        </motion.div>

        {/* ─── Liste des partenaires ───────────────────────────── */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 font-ubuntu text-xl font-semibold">Aucun partenaire</h3>
            <p className="text-muted-foreground">Revenez plus tard pour découvrir nos partenaires.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 border-2 hover:border-secondary/30">
                  <CardContent className="p-6 flex flex-col items-center flex-1">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/20 p-2">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                          <Building2 className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-ubuntu text-lg font-semibold line-clamp-1">
                      {partner.name}
                    </h3>
                    {partner.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {partner.description}
                      </p>
                    )}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Site web
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ─── Modal de demande ───────────────────────────────── */}
        <PartnerRequestModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </PageTransition>
  );
}