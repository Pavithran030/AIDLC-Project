import { create } from 'zustand'
import type { User } from '../types'
import { authApi } from '../api/auth.api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<string>
  logout: () => void
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login(email, password)
      localStorage.setItem('token', data.access_token)
      set({ user: data.user, token: data.access_token, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  // Returns the success message from the server — does NOT log the user in
  register: async (email, password, displayName) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.register(email, password, displayName)
      set({ isLoading: false })
      return data.message
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await authApi.me()
      set({ user: data, token })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },
}))
