import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { clearSession, setSession } from '@/store/sessionSlice';
import type { FormSchema, Submission, TokenPair } from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKENDURL ?? 'http://localhost:8000';

/**
 * Without a timeout a backend that accepts the TCP connection but never
 * answers — a spun-down Render instance, for one — leaves every request
 * pending forever, and the UI sits on a spinner with nothing to report.
 * Uploads get their own, longer budget below.
 */
const REQUEST_TIMEOUT_MS = 20_000;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

client.interceptors.request.use((config) => {
  const { accessToken } = store.getState().session;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Access tokens last two hours, so a reviewer who leaves a tab open comes back
 * to a dead token. On the first 401 we spend the refresh token and replay the
 * request; if that fails too, the session is cleared and the login dialog
 * reappears. `refreshing` de-duplicates concurrent refreshes.
 */
let refreshing: Promise<TokenPair> | null = null;

const refreshTokens = async (): Promise<TokenPair> => {
  const { refreshToken } = store.getState().session;
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post<TokenPair>(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  return data;
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as AxiosRequestConfig & { _retried?: boolean };

    if (error.response?.status !== 401 || !request || request._retried) {
      return Promise.reject(error);
    }

    request._retried = true;

    try {
      refreshing = refreshing ?? refreshTokens();
      const tokens = await refreshing;
      store.dispatch(setSession(tokens));
      return client(request);
    } catch (refreshError) {
      store.dispatch(clearSession());
      return Promise.reject(refreshError);
    } finally {
      refreshing = null;
    }
  },
);

/** Extracts the server's error message, falling back to something readable. */
export const errorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message)) return message.join(' • ');
    if (message) return message;

    if (error.code === 'ECONNABORTED') {
      return `เซิร์ฟเวอร์ไม่ตอบสนอง (${API_BASE_URL}) — ตรวจสอบว่า API ทำงานอยู่และ NEXT_PUBLIC_BACKENDURL ถูกต้อง`;
    }
    if (!error.response) {
      return `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (${API_BASE_URL})`;
    }
  }
  return fallback;
};

export const api = {
  async login(username: string, password: string): Promise<TokenPair> {
    const { data } = await client.post<TokenPair>('/auth/login', {
      username,
      password,
    });
    return data;
  },

  async getFormSchema(): Promise<FormSchema> {
    const { data } = await client.get<FormSchema>('/submissions/form-schema');
    return data;
  },

  async createSubmission(
    formData: FormData,
    onProgress?: (percent: number) => void,
  ): Promise<{ id: string; status: string }> {
    const { data } = await client.post('/submissions', formData, {
      // A report PDF over a slow uplink can legitimately take minutes.
      timeout: 10 * 60_000,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  },

  async listSubmissions(year: number): Promise<Submission[]> {
    const { data } = await client.get<Submission[]>('/submissions', {
      params: { year },
    });
    return data;
  },

  async retrySubmission(id: string): Promise<void> {
    await client.post(`/submissions/${id}/retry`);
  },
};

export default client;
