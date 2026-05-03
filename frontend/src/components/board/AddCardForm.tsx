import { useState } from 'react'
import { cardsApi } from '../../api/cards.api'
import toast from 'react-hot-toast'

interface Props {
  columnId: string
}

export function AddCardForm({ columnId }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await cardsApi.create(columnId, { title: title.trim() })
      setTitle('')
      setOpen(false)
    } catch {
      toast.error('Failed to create card')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        className="w-full text-left text-sm text-ink-muted hover:text-ink py-1 px-2 rounded hover:bg-paper-dark transition-colors"
        onClick={() => setOpen(true)}
        data-testid="add-card-button"
      >
        + Add card
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="mt-2">
      <input
        className="notebook-input text-sm mb-2"
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        data-testid="add-card-input"
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-ink text-sm py-1 px-3" disabled={loading} data-testid="add-card-submit">
          Add
        </button>
        <button type="button" className="btn-ghost text-sm py-1 px-3" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
