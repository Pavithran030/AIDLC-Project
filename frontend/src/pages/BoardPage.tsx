import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boardsApi } from '../api/boards.api'
import { useBoardStore } from '../stores/boardStore'
import { useActivityStore } from '../stores/activityStore'
import { usePresenceStore } from '../stores/presenceStore'
import { useAuthStore } from '../stores/authStore'
import { connectRealtime, disconnectRealtime } from '../services/realtime.service'
import { Navbar } from '../components/layout/Navbar'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { ActivityFeedPanel } from '../components/activity/ActivityFeedPanel'
import { PresenceBar } from '../components/layout/PresenceBar'
import toast from 'react-hot-toast'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setBoard, clearBoard } = useBoardStore()
  const { setMessages, clear: clearActivity } = useActivityStore()
  const { clear: clearPresence } = usePresenceStore()
  const [loading, setLoading] = useState(true)
  const [showActivity, setShowActivity] = useState(false)

  useEffect(() => {
    if (!boardId || !user) return
    const load = async () => {
      try {
        const [board, activity] = await Promise.all([
          boardsApi.get(boardId, user.id),
          boardsApi.getActivity(boardId),
        ])
        setBoard(board)
        setMessages(activity)
      } catch {
        toast.error('Board not found or access denied')
        navigate('/boards')
        return
      } finally {
        setLoading(false)
      }
      connectRealtime(boardId, user.id, user.display_name)
    }
    load()
    return () => {
      disconnectRealtime()
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
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-paper-border bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button className="text-ink-muted hover:text-ink text-sm shrink-0" onClick={() => navigate('/boards')}>
            ← <span className="hidden sm:inline">Boards</span>
          </button>
          <span className="text-paper-border hidden sm:inline">|</span>
          <h2 className="font-serif text-base sm:text-lg text-ink truncate">
            {useBoardStore.getState().board?.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PresenceBar />
          <button className="sm:hidden btn-ghost text-xs py-1 px-2" onClick={() => setShowActivity((v) => !v)} aria-label="Toggle activity feed">
            {showActivity ? '✕' : '📋'}
          </button>
        </div>
      </div>
      {showActivity && (
        <div className="sm:hidden border-b border-paper-border max-h-48 overflow-y-auto">
          <ActivityFeedPanel />
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <KanbanBoard />
        <div className="hidden sm:flex">
          <ActivityFeedPanel />
        </div>
      </div>
    </div>
  )
}
