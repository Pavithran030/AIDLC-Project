import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useBoardStore } from '../stores/boardStore'
import { useActivityStore } from '../stores/activityStore'
import { usePresenceStore } from '../stores/presenceStore'
import type { Card, ActivityEntry, PresenceUser } from '../types'

let socket: Socket | null = null

export function connectSocket(boardId: string, userId: string, displayName: string) {
  if (socket?.connected) return

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
    path: '/socket.io',          // must match the mount path in main.py
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    socket!.emit('join_board', { board_id: boardId, user_id: userId, display_name: displayName })
  })

  socket.on('card_created', ({ card }: { card: Card }) => {
    useBoardStore.getState().addCard(card)
  })

  socket.on('card_updated', ({ card }: { card: Card }) => {
    useBoardStore.getState().updateCard(card)
  })

  socket.on('card_deleted', ({ card_id, column_id }: { card_id: string; column_id: string }) => {
    useBoardStore.getState().deleteCard(card_id, column_id)
  })

  socket.on('card_moved', ({ card, old_column_id, new_column_id }: { card: Card; old_column_id: string; new_column_id: string }) => {
    useBoardStore.getState().moveCard(card, old_column_id, new_column_id)
  })

  socket.on('activity', (entry: ActivityEntry) => {
    useActivityStore.getState().addMessage(entry)
  })

  socket.on('presence_update', ({ users }: { users: PresenceUser[] }) => {
    usePresenceStore.getState().setUsers(users)
  })

  socket.on('deadline_alert', ({ cards }: { cards: { card_id: string; card_title: string; deadline: string }[] }) => {
    cards.forEach((c) => {
      toast(`⏰ Deadline approaching: "${c.card_title}"`, {
        duration: 6000,
        style: { background: '#fef9e7', color: '#b7860b', border: '1px solid #b7860b' },
      })
    })
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message)
  })
}

export function disconnectSocket(boardId: string) {
  if (socket) {
    socket.emit('leave_board', { board_id: boardId })
    socket.disconnect()
    socket = null
  }
}
