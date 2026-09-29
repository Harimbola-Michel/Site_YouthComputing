// src/components/auth/SessionTimeout.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onSessionExtend?: () => void;
  onSessionEnd?: () => void;
}

export function SessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 2,
  onSessionExtend,
  onSessionEnd,
}: SessionTimeoutProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(warningMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endSession = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowWarning(false);
    isActiveRef.current = false;
    await logout();
    onSessionEnd?.();
    router.push('/connexion?session=expired');
  }, [logout, router, onSessionEnd]);

  const extendSession = useCallback(() => {
    // Réinitialiser le timer
    setShowWarning(false);
    setTimeRemaining(warningMinutes * 60);
    isActiveRef.current = true;
    onSessionExtend?.();

    // Redémarrer le compte à rebours
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startTimer();
  }, [warningMinutes, onSessionExtend, timeoutMinutes]);

  // Fonction pour démarrer le timer
  const startTimer = useCallback(() => {
    let remaining = timeoutMinutes * 60;
    let warningShown = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      remaining--;

      if (remaining <= warningMinutes * 60 && !warningShown) {
        setShowWarning(true);
        warningShown = true;
        setTimeRemaining(warningMinutes * 60);
      }

      if (showWarning) {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        endSession();
      }
    }, 1000);
  }, [timeoutMinutes, warningMinutes, showWarning, endSession]);

  // Gestion des événements d'activité utilisateur
  useEffect(() => {
    const handleActivity = () => {
      if (!isActiveRef.current) return;
      // Réinitialiser le timer complet
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowWarning(false);
      setTimeRemaining(warningMinutes * 60);
      isActiveRef.current = true;
      startTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Démarrer le timer au montage
    startTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [startTimer, warningMinutes]);

  // Gestion de la fenêtre de dialogue
  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-ubuntu">
            ⏰ Session bientôt expirée
          </DialogTitle>
          <DialogDescription>
            Votre session expirera dans{' '}
            <span className="font-bold text-secondary">
              {formatTime(timeRemaining)}
            </span>
            . Souhaitez-vous prolonger votre session ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={endSession}>
            Se déconnecter
          </Button>
          <Button onClick={extendSession}>Prolonger la session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}