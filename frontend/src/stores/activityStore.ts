import { create } from 'zustand'

export interface ActivityEntry {
  id: string
  board_id: string
  user_id: string
  message: string
  created_at: string
  display_name?: string
}

const MAX = 20

interface ActivityState {
  messages: ActivityEntry[]
  setMessages: (messages: ActivityEntry[]) => void
  addMessage: (entry: ActivityEntry) => void
  clear: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (entry) =>
    set((state) => ({
      messages: [...state.messages.slice(-(MAX - 1)), entry],
    })),
  clear: () => set({ messages: [] }),
}))
