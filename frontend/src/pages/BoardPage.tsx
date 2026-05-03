import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boardsApi } from '../api/boards.api'
import { useBoardStore } from '../stores/boardStore'
import { useActivityStore } from '../stores/activityStore'
import { usePresenceStore } from '../stores/presenceStore'
import { useAuthStore } from '../stores/authStore'
import { connectSocket, disconnectSocket } from '../services/socket.service'
import { Navbar } from '../components/layout/Navbar'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { ActivityFeedPanel } from '../components/activity/ActivityFeedPanel'
import { PresenceBar } from '../components/layout/PresenceBar'
import type { ActivityEntry } from '../types'
import toast from 'react-hot-toast'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setBoard, clearBoard } = useBoardStore()
  const { setMessages, clear: clearActivity } = useActivityStore()
  const { clear: clearPresence } = usePresenceStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId || !user) return

    const load = async () => {
      try {
        const [boardRes, activityRes] = await Promise.all([
          boardsApi.get(boardId),
          boardsApi.getActivity(boardId),
        ])
        setBoard(boardRes.data)
        setMessages(activityRes.data as ActivityEntry[])
      } catch {
        toast.error('Board not found or access denied')
        navigate('/boards')
        return
      } finally {
        setLoading(false)
      }

      connectSocket(boardId, user.id, user.display_name)
    }

    load()

    return () => {
      disconnectSocket(boardId)
      clearBoard()
      clearActivity()
      clearPresence()
    }
  }, [boardId, user])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink-muted font-serif text-lg">Loading board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      {/* Board header */}
      <div className="px-6 py-3 border-b border-paper-border bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="text-ink-muted hover:text-ink text-sm"
            onClick={() => navigate('/boards')}
          >
            ← Boards
          </button>
          <span className="text-paper-border">|</span>
          <h2 className="font-serif text-lg text-ink">
            {useBoardStore.getState().board?.name}
          </h2>
        </div>
        <PresenceBar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <KanbanBoard />
        <ActivityFeedPanel />
      </div>
    </div>
  )
}
