import { create } from 'zustand'
import type { ActivityEntry } from '../types'

const MAX_ENTRIES = 20

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
      messages: [...state.messages.slice(-(MAX_ENTRIES - 1)), entry],
    })),

  clear: () => set({ messages: [] }),
}))
