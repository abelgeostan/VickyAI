export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_login?: string;
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
