import { create } from 'zustand'

export interface PresenceUser {
  user_id: string
  display_name: string
}

interface PresenceState {
  users: PresenceUser[]
  setUsers: (users: PresenceUser[]) => void
  clear: () => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  clear: () => set({ users: [] }),
}))
