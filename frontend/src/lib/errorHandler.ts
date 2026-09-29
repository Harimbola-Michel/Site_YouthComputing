import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  status?: number;
}

export function handleApiError(error: any): ApiError {
  if (error instanceof AxiosError) {
    const response = error.response;
    const data = response?.data;

    return {
      message: data?.message || error.message || 'Une erreur est survenue',
      code: data?.code || error.code,
      details: data?.details,
      status: response?.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
    };
  }

  return {
    message: 'Une erreur inattendue est survenue',
  };
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

export function isNetworkError(error: any): boolean {
  if (error instanceof AxiosError) {
    return !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
  }
  return false;
}

export function isUnauthorizedError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

export function isForbiddenError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 403;
  }
  return false;
}

export function isNotFoundError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 404;
  }
  return false;
}

export function isValidationError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422;
  }
  return false;
}

export function isConflictError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 409;
  }
  return false;
}