import {api} from './client';

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  oauth_provider: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export const authApi = {
  register(data: {email: string; password: string; display_name?: string}) {
    return api.post<TokenResponse>('/api/auth/register', data, false);
  },

  login(data: {email: string; password: string}) {
    return api.post<TokenResponse>('/api/auth/login', data, false);
  },

  googleAuth(credential: string) {
    return api.post<TokenResponse>(
      '/api/auth/google',
      {credential},
      false,
    );
  },

  getGoogleClientId() {
    return api.get<{client_id: string}>('/api/auth/google/client-id', false);
  },

  logout() {
    return api.post('/api/auth/logout');
  },

  forgotPassword(email: string) {
    return api.post('/api/auth/forgot-password', {email}, false);
  },

  resetPassword(token: string, password: string) {
    return api.post(
      '/api/auth/reset-password',
      {token, password},
      false,
    );
  },

  getMe() {
    return api.get<User>('/api/auth/me');
  },

  updateMe(data: {display_name: string}) {
    return api.put<User>('/api/auth/me', data);
  },

  getMyContributions() {
    return api.get<any[]>('/api/auth/me/contributions');
  },
};
