import axios from 'axios';

const PRODUCTION_API_BASE_URL = 'https://emergent-api-vaiv.onrender.com/api';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : '/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    const details = data?.error?.details as
      | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
      | undefined;
    if (details?.fieldErrors) {
      const firstFieldError = Object.values(details.fieldErrors).flat()[0];
      if (firstFieldError) return firstFieldError;
    }
    return data?.error?.message || fallback;
  }
  return fallback;
}

export default api;
