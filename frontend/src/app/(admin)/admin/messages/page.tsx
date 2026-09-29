'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { MessagesTable } from './components/MessagesTable';
import { MessageReply } from './components/MessageReply';
import { contact } from '@/lib/api';
import { extractDataArray } from '@/lib/api-helpers';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Mail, MailOpen, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import type { Message } from '@/types/message.types';

export default function AdminMessagesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Statistiques ──────────────────────────────────────────
  const total = data.length;
  const unread = data.filter((m) => !m.isRead).length;
  const replied = data.filter((m) => m.repliedAt).length;

  // ─── Chargement ──────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      const response = await contact.getAll();
      const list = extractDataArray<Message>(response?.data, []);
      setData(list);
    } catch (err: any) {
      console.error('❌ Erreur chargement messages:', err);
      const msg = err?.response?.data?.message || 'Impossible de charger les messages';
      setError(msg);
      toast.error(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchMessages();
  }, [authLoading, fetchMessages]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setIsReplyOpen(true);
  };

  const handleReplySuccess = () => {
    setIsReplyOpen(false);
    setSelectedMessage(null);
    fetchMessages();
    toast.success('Réponse envoyée ✅');
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Liste actualisée');
  };

  const handleMarkRead = async (id: string) => {
    try {
      await contact.markRead(id);
      fetchMessages();
      toast.success('Message marqué comme lu');
    } catch (error) {
      toast.error('Erreur lors du marquage');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contact.delete(id);
      fetchMessages();
      toast.success('Message supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
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

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Messages
            </h1>
            <p className="text-muted-foreground">
              Consultez et répondez aux messages reçus via le formulaire de contact.
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
              <RefreshCw className={cn('h-4 w-4', (loading || isRefreshing) && 'animate-spin')} />
              {isRefreshing ? 'Actualisation...' : 'Rafraîchir'}
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MailOpen className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Non lus</p>
                <p className="text-2xl font-bold text-amber-600">{unread}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MailCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Répondus</p>
                <p className="text-2xl font-bold text-green-600">{replied}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Erreur */}
        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMessages} className="ml-auto">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tableau */}
        <MessagesTable
          data={data}
          loading={loading}
          onReply={handleReply}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          onRefresh={fetchMessages}
        />

        {/* Modale de réponse */}
        <MessageReply
          open={isReplyOpen}
          onOpenChange={setIsReplyOpen}
          message={selectedMessage}
          onSuccess={handleReplySuccess}
        />
      </div>
    </PageTransition>
  );
}