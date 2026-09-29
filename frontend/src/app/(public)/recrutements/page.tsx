'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { recruitments } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  Building,
  Calendar,
  ArrowRight,
  Search,
  X,
  AlertCircle,
  Clock,
  Users,
  Filter,
  Sparkles,
  TrendingUp,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Recruitment } from '@/types/recruitment.types';
import debounce from 'lodash.debounce';

// ─── Helper de date relative (local) ──────────────────────────
function formatRelativeTime(date: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function PublicRecruitmentsPage() {
  const [data, setData] = useState<Recruitment[]>([]);
  const [filteredData, setFilteredData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [departments, setDepartments] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Chargement ───────────────────────────────────────────────
  const fetchRecruitments = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recruitments.getActive();
      const list = response?.data?.data ?? response?.data ?? [];
      const normalized = Array.isArray(list) ? list : [];
      setData(normalized);
      const depts = [...new Set(normalized.map((r: Recruitment) => r.department).filter(Boolean))];
      setDepartments(depts);
      if (showToast) toast.success('Offres actualisées ✅');
    } catch (error: any) {
      console.error('Erreur chargement recrutements:', error);
      const msg = error?.response?.data?.message || 'Impossible de charger les offres';
      setError(msg);
      if (!showToast) toast.error(msg);
      setData([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // ─── Debounce de recherche ──────────────────────────────────
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // ─── Filtrage et tri ──────────────────────────────────────
  useEffect(() => {
    let filtered = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.position.toLowerCase().includes(term) ||
          r.department.toLowerCase().includes(term)
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((r) => r.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((r) => r.isActive === isActive);
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      default:
        break;
    }

    setFilteredData(filtered);
  }, [data, searchTerm, departmentFilter, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecruitments(true);
  };

  // ─── États ──────────────────────────────────────────────────
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="mb-10 text-center space-y-3">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 max-w-6xl text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <h2 className="mt-6 font-ubuntu text-2xl font-bold">Oups, une erreur est survenue</h2>
            <p className="mt-2 text-muted-foreground max-w-md">{error}</p>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const activeCount = data.filter((r) => r.isActive).length;
  const hasFilters = searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* ─── En-tête ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-4">
            <Sparkles className="h-4 w-4" />
            Opportunités
          </div>
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
            Offres d'<span className="text-secondary">emploi</span>
          </h1>
          <div className="mt-3 flex justify-center gap-2">
            <span className="inline-block h-1.5 w-16 rounded-full bg-secondary" />
            <span className="inline-block h-1.5 w-8 rounded-full bg-primary/30" />
          </div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez l'équipe de Youth Computing et participez à la transformation numérique à Madagascar.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {activeCount} offre{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{data.length} au total</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* ─── Filtres ──────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-center gap-3 bg-muted/30 p-4 rounded-2xl backdrop-blur-sm border border-border/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Rechercher par titre, poste, département..."
              onChange={handleSearchChange}
              className="pl-10 rounded-xl border-2 focus:border-secondary transition-colors bg-background/50"
              aria-label="Rechercher une offre"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[170px] rounded-xl border-2 bg-background/50">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl border-2 bg-background/50">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Fermées</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] rounded-xl border-2 bg-background/50">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récentes</SelectItem>
              <SelectItem value="oldest">Plus anciennes</SelectItem>
              <SelectItem value="deadline">Date limite</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 rounded-xl">
              <X className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* ─── Résultats ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filteredData.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="rounded-full bg-muted/30 p-6">
                <Briefcase className="h-14 w-14 text-muted-foreground/30" />
              </div>
              <h3 className="mt-4 font-ubuntu text-xl font-semibold">Aucune offre ne correspond</h3>
              <p className="text-muted-foreground max-w-sm mt-1">
                Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
              </p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={resetFilters}>
                Afficher toutes les offres
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {filteredData.map((recruitment, index) => {
                const isExpired = recruitment.deadline && new Date(recruitment.deadline) < new Date();
                const isActive = recruitment.isActive && !isExpired;
                const isUrgent = recruitment.deadline && new Date(recruitment.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const candidatureCount = recruitment.candidatures?.length || 0;

                return (
                  <motion.div
                    key={recruitment.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-secondary/30 bg-background/60 backdrop-blur-sm overflow-hidden group">
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-0 text-xs">
                                {recruitment.department}
                              </Badge>
                              {isUrgent && isActive && (
                                <Badge variant="default" className="bg-red-500 text-white border-0 text-xs animate-pulse">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                              {candidatureCount > 10 && (
                                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Populaire
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="font-ubuntu text-xl line-clamp-1 group-hover:text-secondary transition-colors">
                              {recruitment.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{recruitment.position}</span>
                            </div>
                          </div>
                          <Badge
                            variant={isActive ? 'default' : 'secondary'}
                            className={cn(
                              'shrink-0 text-xs px-2.5 py-1',
                              isActive && 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                            )}
                          >
                            {isActive ? 'Active' : isExpired ? 'Expirée' : 'Fermée'}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {recruitment.description}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {recruitment.deadline && (
                            <span className={cn(
                              'flex items-center gap-1',
                              isExpired && 'text-destructive'
                            )}>
                              <Calendar className="h-3.5 w-3.5" />
                              {isExpired ? (
                                <>Expiré le {formatDate(recruitment.deadline)}</>
                              ) : (
                                <>Jusqu'au {formatDate(recruitment.deadline)}</>
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatRelativeTime(recruitment.createdAt)}
                          </span>
                          {candidatureCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {candidatureCount} candidature{candidatureCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-2 flex gap-2">
                        <Button asChild variant="default" className="flex-1 gap-2 group rounded-xl">
                          <Link href={`/recrutements/${recruitment.slug}`}>
                            Voir l'offre
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                        {isActive && (
                          <Button asChild variant="outline" className="gap-1 rounded-xl hover:bg-secondary/10">
                            <Link href={`/recrutements/${recruitment.slug}#postuler`}>
                              Postuler
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Pied de page ────────────────────────────────────── */}
        {filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center text-sm text-muted-foreground"
          >
            <p>{filteredData.length} offre{filteredData.length > 1 ? 's' : ''} affichée{filteredData.length > 1 ? 's' : ''}</p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
