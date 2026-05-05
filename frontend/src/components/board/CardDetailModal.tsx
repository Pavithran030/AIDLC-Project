import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { cardsApi } from '../../api/cards.api'
import { useAuthStore } from '../../stores/authStore'
import type { CardRow } from '../../stores/boardStore'
import toast from 'react-hot-toast'

interface Member {
  id: string
  display_name: string
  email: string
}

interface Props {
  card: CardRow
  members: Member[]
  onClose: () => void
}

export function CardDetailModal({ card, members, onClose }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [assignedUserId, setAssignedUserId] = useState(card.assigned_user_id || '')
  const [deadline, setDeadline] = useState(card.deadline ? card.deadline.slice(0, 16) : '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { user } = useAuthStore()

  const handleSave = async () => {
    if (!title.trim() || !user) { toast.error('Card title cannot be empty'); return }
    setSaving(true)
    try {
      await cardsApi.update(card.id, {
        title: title.trim(),
        description: description || null,
        assigned_user_id: assignedUserId || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      }, user.id, user.display_name)
      toast.success('Card updated')
      onClose()
    } catch {
      toast.error('Failed to update card')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await cardsApi.delete(card.id, user.id, user.display_name)
      toast.success(`Card "${card.title}" deleted`)
      onClose()
    } catch {
      toast.error('Failed to delete card')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Card Details">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Title</label>
          <input className="notebook-input" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="card-title-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Description</label>
          <textarea className="notebook-input resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." data-testid="card-description-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Assign to</label>
          <select className="notebook-input" value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} data-testid="card-assignee-select">
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Deadline</label>
          <input type="datetime-local" className="notebook-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} data-testid="card-deadline-input" />
        </div>
        {confirmDelete ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 space-y-2">
            <p className="text-sm text-red-700 font-medium">Delete "{card.title}"? This cannot be undone.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded px-3 py-1.5 transition-colors" onClick={handleDeleteConfirmed} disabled={deleting} data-testid="card-delete-confirm-button">
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button className="flex-1 btn-ghost text-sm" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between pt-2 border-t border-paper-border">
            <button className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors" onClick={() => setConfirmDelete(true)} data-testid="card-delete-button">Delete card</button>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={onClose}>Cancel</button>
              <button className="btn-ink text-sm" onClick={handleSave} disabled={saving} data-testid="card-save-button">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
