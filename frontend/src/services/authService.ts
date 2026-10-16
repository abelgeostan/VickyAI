import { apiFetch, setAuthToken, removeAuthToken } from './api';
import { User, Token, LoginRequest, RegisterRequest } from '../types/auth';

export const authService = {
  async register(req: RegisterRequest): Promise<Token> {
    const data = await apiFetch<Token>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async login(req: LoginRequest): Promise<Token> {
    const data = await apiFetch<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      removeAuthToken();
    }
  },

  async getMe(): Promise<User> {
    return apiFetch<User>('/auth/me');
  },
};
