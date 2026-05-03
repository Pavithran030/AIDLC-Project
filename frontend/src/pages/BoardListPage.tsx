import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardsApi } from '../api/boards.api'
import { Navbar } from '../components/layout/Navbar'
import type { Board } from '../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [newBoardName, setNewBoardName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    boardsApi.list().then(({ data }) => setBoards(data)).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    setCreating(true)
    try {
      const { data } = await boardsApi.create(newBoardName.trim())
      setBoards((prev) => [data, ...prev])
      setNewBoardName('')
      toast.success('Board created!')
    } catch {
      toast.error('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      const { data } = await boardsApi.join(joinCode.trim().toUpperCase())
      setBoards((prev) => prev.find((b) => b.id === data.id) ? prev : [data, ...prev])
      setJoinCode('')
      toast.success('Joined board!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Board not found')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <h1 className="font-serif text-3xl text-ink mb-8">Your Boards</h1>

        {/* Create + Join row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <form onSubmit={handleCreate} className="bg-white border border-paper-border rounded-lg p-5 shadow-paper">
            <h2 className="font-serif text-lg text-ink mb-3">New Board</h2>
            <input
              className="notebook-input mb-3"
              placeholder="Board name..."
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              data-testid="create-board-input"
            />
            <button className="btn-ink w-full" disabled={creating} data-testid="create-board-button">
              {creating ? 'Creating...' : 'Create Board'}
            </button>
          </form>

          <form onSubmit={handleJoin} className="bg-white border border-paper-border rounded-lg p-5 shadow-paper">
            <h2 className="font-serif text-lg text-ink mb-3">Join a Board</h2>
            <input
              className="notebook-input mb-3 uppercase tracking-widest"
              placeholder="Enter join code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={8}
              data-testid="join-board-input"
            />
            <button className="btn-ink w-full" disabled={joining} data-testid="join-board-button">
              {joining ? 'Joining...' : 'Join Board'}
            </button>
          </form>
        </div>

        {/* Board list */}
        {loading ? (
          <p className="text-ink-muted text-sm">Loading boards...</p>
        ) : boards.length === 0 ? (
          <p className="text-ink-muted text-sm italic">No boards yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => (
              <button
                key={board.id}
                className="text-left bg-white border border-paper-border rounded-lg p-5 shadow-paper hover:shadow-paper-lift transition-shadow group"
                onClick={() => navigate(`/boards/${board.id}`)}
                data-testid={`board-card-${board.id}`}
              >
                <h3 className="font-serif text-lg text-ink group-hover:text-ink-light transition-colors mb-1">
                  {board.name}
                </h3>
                <p className="text-xs text-ink-muted mb-3">
                  Created {format(new Date(board.created_at), 'MMM d, yyyy')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono bg-paper-dark text-ink-muted px-2 py-0.5 rounded tracking-widest">
                    {board.join_code}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
