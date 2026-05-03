import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { cardsApi } from '../../api/cards.api'
import { useBoardStore } from '../../stores/boardStore'
import type { Card, User } from '../../types'
import { Avatar } from '../ui/Avatar'
import toast from 'react-hot-toast'

interface Props {
  card: Card
  members: User[]
  onClose: () => void
}

export function CardDetailModal({ card, members, onClose }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [assignedUserId, setAssignedUserId] = useState(card.assigned_user_id || '')
  const [deadline, setDeadline] = useState(
    card.deadline ? card.deadline.slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await cardsApi.update(card.id, {
        title: title.trim(),
        description: description || null,
        assigned_user_id: assignedUserId || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      })
      onClose()
    } catch {
      toast.error('Failed to update card')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete card "${card.title}"?`)) return
    setDeleting(true)
    try {
      await cardsApi.delete(card.id)
      onClose()
    } catch {
      toast.error('Failed to delete card')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Card Details">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Title</label>
          <input
            className="notebook-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="card-title-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Description</label>
          <textarea
            className="notebook-input resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            data-testid="card-description-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Assign to</label>
          <select
            className="notebook-input"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            data-testid="card-assignee-select"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Deadline</label>
          <input
            type="datetime-local"
            className="notebook-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            data-testid="card-deadline-input"
          />
        </div>

        <div className="flex justify-between pt-2 border-t border-paper-border">
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={handleDelete}
            disabled={deleting}
            data-testid="card-delete-button"
          >
            {deleting ? 'Deleting...' : 'Delete card'}
          </button>
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={onClose}>Cancel</button>
            <button className="btn-ink text-sm" onClick={handleSave} disabled={saving} data-testid="card-save-button">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
