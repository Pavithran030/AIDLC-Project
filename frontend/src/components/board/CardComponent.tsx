import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, User } from '../../types'
import { Avatar } from '../ui/Avatar'
import { CardDetailModal } from './CardDetailModal'
import { format, isPast, differenceInHours } from 'date-fns'

interface Props {
  card: Card
  columnClass: string
  members: User[]
}

function isDeadlineNear(deadline: string | null): boolean {
  if (!deadline) return false
  const d = new Date(deadline)
  const hoursLeft = differenceInHours(d, new Date())
  return hoursLeft >= 0 && hoursLeft <= 24
}

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false
  return isPast(new Date(deadline))
}

export function CardComponent({ card, columnClass, members }: Props) {
  const [showModal, setShowModal] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const near = isDeadlineNear(card.deadline)
  const overdue = isOverdue(card.deadline)

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`notebook-card ${columnClass} mb-2 cursor-grab active:cursor-grabbing ${isDragging ? 'dragging' : ''} ${near || overdue ? 'deadline-near' : ''}`}
        onClick={() => setShowModal(true)}
        data-testid={`card-${card.id}`}
        role="button"
        aria-label={`Card: ${card.title}`}
      >
        <p className="font-serif text-sm font-medium text-ink leading-snug mb-1">{card.title}</p>

        {card.description && (
          <p className="text-xs text-ink-muted line-clamp-2 mb-2">{card.description}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          {card.deadline && (
            <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-ink-muted'}`}>
              📅 {format(new Date(card.deadline), 'MMM d')}
            </span>
          )}
          {card.assigned_user && (
            <div className="ml-auto">
              <Avatar name={card.assigned_user.display_name} size="sm" />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CardDetailModal card={card} members={members} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
