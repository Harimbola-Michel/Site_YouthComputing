// src/components/admin/RecentActivity.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboard } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
// ✅ Imports pour les avatars
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';

type ActivityItem = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string; // ✅ Ajout du champ avatar
  } | null;
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await dashboard.getActivities({ limit: 5 });
        const rawData = response?.data?.data || response?.data || [];
        const normalized = Array.isArray(rawData)
          ? rawData.map((item: any) => ({
              ...item,
              user: item.user || null,
            }))
          : [];
        setActivities(normalized);
      } catch (error) {
        console.error('Erreur chargement activités:', error);
        toast.error('Impossible de charger les activités');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getUserName = (user: ActivityItem['user']) => {
    if (!user) return 'Utilisateur inconnu';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || 'Utilisateur';
  };

  // ✅ Récupération des initiales
  const getInitials = (user: ActivityItem['user']) => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // ✅ Construction de l'URL de l'avatar
  const getAvatarUrl = (user: ActivityItem['user']) => {
    if (!user?.avatar) return null;
    return buildImageUrl(user.avatar);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg">Activités récentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Aucune activité récente</p>
        ) : (
          activities.map((activity, index) => {
            const user = activity.user;
            const avatarUrl = getAvatarUrl(user);
            const initials = getInitials(user);
            const userName = getUserName(user);

            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {/* ✅ Avatar ou icône par défaut */}
                {user ? (
                  <Avatar className="h-8 w-8 mt-0.5 ring-1 ring-border/50">
                    <AvatarImage src={avatarUrl || undefined} alt={userName} />
                    <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="mt-0.5 rounded-full bg-secondary/10 p-1.5 text-secondary">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm">
                    {user ? (
                      <>
                        <span className="font-medium">{userName}</span>
                        <span className="text-muted-foreground"> {activity.action || 'action'}</span>
                        <span className="font-medium"> {activity.resource || ''}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">{activity.action || 'Action'}</span>
                        <span className="font-medium"> {activity.resource || ''}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}