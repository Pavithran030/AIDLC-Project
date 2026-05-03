import api from './axios'
import type { Card } from '../types'

export interface CreateCardData {
  title: string
  description?: string
  assigned_user_id?: string | null
  deadline?: string | null
}

export interface UpdateCardData {
  title?: string
  description?: string | null
  assigned_user_id?: string | null
  deadline?: string | null
}

export const cardsApi = {
  create: (columnId: string, data: CreateCardData) =>
    api.post<Card>(`/columns/${columnId}/cards`, data),

  update: (cardId: string, data: UpdateCardData) =>
    api.patch<Card>(`/cards/${cardId}`, data),

  delete: (cardId: string) =>
    api.delete<Card>(`/cards/${cardId}`),

  move: (cardId: string, column_id: string) =>
    api.patch<Card>(`/cards/${cardId}/move`, { column_id }),
}
