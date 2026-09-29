'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { PartnerForm } from '../components/PartnerForm';
import { partners } from '@/lib/api';
import { Partner } from '@/types/partner.types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPartnerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await partners.getById(id);
        setPartner(response.data.data);
      } catch (error) {
        console.error('Erreur chargement partenaire:', error);
        toast.error('Impossible de charger le partenaire');
        router.push('/admin/partenaires');
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      await partners.update(id, data);
      toast.success('Partenaire mis à jour ✅');
      router.push('/admin/partenaires');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (!partner) return null;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-ubuntu text-2xl font-bold">Modifier le partenaire</h1>
            <p className="text-muted-foreground">Modifiez les informations du partenaire</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <PartnerForm
            initialData={partner}
            onSubmit={handleSubmit}
            submitLabel="Mettre à jour"
          />
        </div>
      </div>
    </PageTransition>
  );
}