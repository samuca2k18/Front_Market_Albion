import { api, parseApiError } from './client';
import type { AuthCredentials, AuthResponse, SignupPayload, User } from './types';

export async function loginRequest(credentials: AuthCredentials): Promise<AuthResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const { data } = await api.post<AuthResponse>('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function signupRequest(payload: SignupPayload): Promise<User> {
  try {
    const { data } = await api.post<User>('/signup', payload);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function meRequest(): Promise<User> {
  try {
    const { data } = await api.get<User>('/me');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

