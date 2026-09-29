'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PaymentsTable } from './components/PaymentsTable';
import { PaymentVerification } from './components/PaymentVerification';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wallet, Banknote, Clock, CheckCircle, XCircle, RotateCcw, TrendingUp, TrendingDown, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Composant de carte statistique ──────────────────────────
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string; // classe Tailwind pour le fond (ex: "bg-blue-50")
  textColor?: string;
  subtitle?: string;
  trend?: number; // positif = hausse, négatif = baisse
  formatValue?: (val: any) => string; // fonction de formatage personnalisée
}

function StatsCard({ label, value, icon: Icon, color, textColor = 'text-foreground', subtitle, trend, formatValue }: StatsCardProps) {
  const displayValue = formatValue ? formatValue(value) : value;
  return (
    <Card className={cn('border-l-4 overflow-hidden', color.replace('bg-', 'border-'))}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn('rounded-full p-2', color)}>
          <Icon className={cn('h-4 w-4', textColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold">{displayValue}</p>
          {trend !== undefined && (
            <span className={cn('text-xs font-medium flex items-center', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement ──────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        payments.getAll(),
        payments.getStats(),
      ]);
      const list = paymentsRes?.data?.data ?? paymentsRes?.data ?? [];
      setData(Array.isArray(list) ? list : []);
      setStats(statsRes?.data?.data ?? statsRes?.data ?? null);
    } catch (err: any) {
      console.error('Erreur chargement paiements:', err);
      toast.error('Impossible de charger les paiements');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchPayments();
  }, [authLoading, fetchPayments]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleVerify = (payment: any) => {
    setSelectedPayment(payment);
    setIsVerificationOpen(true);
  };

  const handleVerificationSuccess = () => {
    setIsVerificationOpen(false);
    setSelectedPayment(null);
    fetchPayments();
    toast.success('Paiement mis à jour ✅');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayments();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  // ─── États de chargement ──────────────────────────────────
  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Veuillez vous connecter.</p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  // ─── Construction des données statistiques ─────────────────
  // Calcul des totaux et pourcentages
  const total = stats?.total ?? 0;
  const totalAmount = stats?.totalAmount ?? 0;
  const pending = stats?.pending ?? 0;
  const paid = stats?.paid ?? 0;
  const failed = stats?.failed ?? 0;
  const refunded = stats?.refunded ?? 0;

  const pendingPercent = total > 0 ? ((pending / total) * 100).toFixed(0) : 0;
  const paidPercent = total > 0 ? ((paid / total) * 100).toFixed(0) : 0;
  const failedPercent = total > 0 ? ((failed / total) * 100).toFixed(0) : 0;
  const refundedPercent = total > 0 ? ((refunded / total) * 100).toFixed(0) : 0;

  const statsData = [
    {
      label: 'Total des paiements',
      value: total,
      icon: Wallet,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: 'Nombre total de transactions',
    },
    {
      label: 'Montant total',
      value: totalAmount,
      icon: CircleDollarSign,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      formatValue: (val: number) => `${val.toLocaleString()} Ar`,
      subtitle: 'Somme de tous les paiements',
    },
    {
      label: 'Payés',
      value: paid,
      icon: CheckCircle,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: `${paidPercent}% du total`,
    },
    {
      label: 'En attente',
      value: pending,
      icon: Clock,
      color: 'bg-amber-50',
      textColor: 'text-amber-600',
      subtitle: `${pendingPercent}% du total`,
    },
    {
      label: 'Échoués',
      value: failed,
      icon: XCircle,
      color: 'bg-red-50',
      textColor: 'text-red-600',
      subtitle: `${failedPercent}% du total`,
    },
    {
      label: 'Remboursés',
      value: refunded,
      icon: RotateCcw,
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: `${refundedPercent}% du total`,
    },
  ];

  // ─── Rendu ──────────────────────────────────────────────────
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Paiements
            </h1>
            <p className="text-muted-foreground">
              Gérez les paiements des inscriptions et adhésions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* ─── Statistiques ────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statsData.map((item, index) => (
              <StatsCard
                key={index}
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
                textColor={item.textColor}
                subtitle={item.subtitle}
                formatValue={item.formatValue}
              />
            ))}
          </div>
        ) : null}

        {/* ─── Tableau ──────────────────────────────────────────── */}
        <PaymentsTable
          data={data}
          loading={loading}
          onVerify={handleVerify}
          onRefresh={fetchPayments}
        />

        {/* ─── Modale de vérification ──────────────────────────── */}
        {selectedPayment && (
          <PaymentVerification
            open={isVerificationOpen}
            onOpenChange={setIsVerificationOpen}
            payment={selectedPayment}
            onSuccess={handleVerificationSuccess}
          />
        )}
      </div>
    </PageTransition>
  );
}