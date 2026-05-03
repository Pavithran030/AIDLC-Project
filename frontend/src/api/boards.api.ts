import api from './axios'
import type { Board, BoardDetail } from '../types'

export const boardsApi = {
  list: () => api.get<Board[]>('/boards'),

  create: (name: string) => api.post<Board>('/boards', { name }),

  join: (join_code: string) => api.post<Board>('/boards/join', { join_code }),

  get: (boardId: string) => api.get<BoardDetail>(`/boards/${boardId}`),

  update: (boardId: string, deadline_alert_hours: number) =>
    api.patch<Board>(`/boards/${boardId}`, { deadline_alert_hours }),

  getMembers: (boardId: string) => api.get(`/boards/${boardId}/members`),

  getActivity: (boardId: string) => api.get(`/boards/${boardId}/activity`),
}
