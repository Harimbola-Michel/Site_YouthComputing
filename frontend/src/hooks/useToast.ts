'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: string;
}

export function useToast() {
  const success = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
      icon: options?.icon || 'ℹ️',
    });
  }, []);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: options?.icon || '⚠️',
    });
  }, []);

  const promise = useCallback(
    <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ): Promise<T> => {
      return toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      });
    },
    []
  );

  return {
    success,
    error,
    info,
    warning,
    promise,
  };
}