import { create } from 'zustand'
import type { BoardDetail, Card, Column } from '../types'

interface BoardState {
  board: BoardDetail | null
  setBoard: (board: BoardDetail) => void
  clearBoard: () => void
  addCard: (card: Card) => void
  updateCard: (card: Card) => void
  deleteCard: (cardId: string, columnId: string) => void
  moveCard: (card: Card, oldColumnId: string, newColumnId: string) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,

  setBoard: (board) => set({ board }),

  clearBoard: () => set({ board: null }),

  addCard: (card) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) =>
        col.id === card.column_id ? { ...col, cards: [...col.cards, card] } : col
      )
      return { board: { ...state.board, columns } }
    }),

  updateCard: (card) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === card.id ? card : c)),
      }))
      return { board: { ...state.board, columns } }
    }),

  deleteCard: (cardId, columnId) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) =>
        col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      )
      return { board: { ...state.board, columns } }
    }),

  moveCard: (card, oldColumnId, newColumnId) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) => {
        if (col.id === oldColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== card.id) }
        }
        if (col.id === newColumnId) {
          return { ...col, cards: [...col.cards, card] }
        }
        return col
      })
      return { board: { ...state.board, columns } }
    }),
}))
