import api from './axios'
import type { User } from '../types'

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface MessageResponse {
  message: string
}

export const authApi = {
  register: (email: string, password: string, display_name: string) =>
    api.post<MessageResponse>('/auth/register', { email, password, display_name }),

  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post<MessageResponse>('/auth/reset-password', { token, new_password }),
}
