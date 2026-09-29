    // src/hooks/useRegistrationsData.ts
import { useState, useEffect } from 'react';
import { registrations } from '@/lib/api';

export interface RegistrationData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export function useRegistrationsData() {
  const [data, setData] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await registrations.getAll();
        setData(response.data?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
}