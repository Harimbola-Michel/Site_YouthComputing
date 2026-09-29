// src/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook personnalisé pour accéder au contexte d'authentification.
 * Doit être utilisé à l'intérieur d'un `AuthProvider`.
 * 
 * @returns {AuthContextType} Le contexte d'authentification complet.
 * @throws {Error} Si utilisé en dehors d'un AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export par défaut pour faciliter l'importation
export default useAuth;