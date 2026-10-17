export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_login?: string;
  is_admin?: boolean;
}

export const ADMIN_EMAIL = 'abel@kalayil.com';

export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.is_admin || user.email?.trim().toLowerCase() === ADMIN_EMAIL);
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}
