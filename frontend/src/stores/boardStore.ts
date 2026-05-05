import { create } from 'zustand'

export interface CardRow {
  id: string
  column_id: string
  title: string
  description: string | null
  assigned_user_id: string | null
  deadline: string | null
  created_at: string
  updated_at: string
  // joined from profiles
  assigned_user?: { id: string; display_name: string; email: string } | null
}

export interface ColumnRow {
  id: string
  board_id: string
  name: string
  position: number
  created_at: string
  cards: CardRow[]
}

export interface BoardDetail {
  id: string
  name: string
  join_code: string
  owner_id: string
  deadline_alert_hours: number
  created_at: string
  columns: ColumnRow[]
  members: { id: string; display_name: string; email: string }[]
}

interface BoardState {
  board: BoardDetail | null
  setBoard: (board: BoardDetail) => void
  clearBoard: () => void
  addCard: (card: CardRow) => void
  updateCard: (card: CardRow) => void
  deleteCard: (cardId: string, columnId: string) => void
  moveCard: (card: CardRow, oldColumnId: string, newColumnId: string) => void
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
        if (col.id === oldColumnId) return { ...col, cards: col.cards.filter((c) => c.id !== card.id) }
        if (col.id === newColumnId) return { ...col, cards: [...col.cards, card] }
        return col
      })
      return { board: { ...state.board, columns } }
    }),
}))
