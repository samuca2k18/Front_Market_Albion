// src/api/auth.ts
import { api } from './client';
import type { AuthCredentials, AuthResponse, SignupPayload, User } from './types';

export async function loginRequest(credentials: AuthCredentials): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const { data } = await api.post<AuthResponse>('/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
}

export async function signupRequest(payload: SignupPayload): Promise<User> {
  const { data } = await api.post<User>('/signup', payload);
  return data;
}

export async function meRequest(): Promise<User> {
  const { data } = await api.get<User>('/me');
  return data;
}
