import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  display_name: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

async function fetchProfile(userId: string, email: string): Promise<AuthUser> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()   // returns null instead of error when no row found

  return {
    id: userId,
    email,
    display_name: data?.display_name || email.split('@')[0],
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const user = await fetchProfile(session.user.id, session.user.email!)
      set({ user, initialized: true })
    } else {
      set({ user: null, initialized: true })
    }

    // Keep in sync with Supabase auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await fetchProfile(session.user.id, session.user.email!)
        set({ user })
      } else {
        set({ user: null })
      }
    })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Skip email confirmation — user can log in immediately
          data: { display_name: displayName },
        },
      })
      if (error) throw new Error(error.message)

      if (data.user) {
        // Upsert profile so display_name is stored
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          display_name: displayName,
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
