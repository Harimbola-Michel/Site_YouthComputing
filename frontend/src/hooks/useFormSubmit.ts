'use client';

import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface UseFormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormSubmit<T = any>(options: UseFormSubmitOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { success, error: toastError } = useToast();

  const submit = useCallback(
    async (fn: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();
        setData(result);
        if (options.successMessage) {
          success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        const message = options.errorMessage || errorObj.message || 'Une erreur est survenue';
        toastError(message);
        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [options, success, toastError]
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    submit,
    isLoading,
    error,
    data,
    reset,
  };
}