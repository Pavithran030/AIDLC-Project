import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useBoardStore } from '../../stores/boardStore'
import { ColumnComponent } from './ColumnComponent'
import { CardComponent } from './CardComponent'
import { cardsApi } from '../../api/cards.api'
import type { Card } from '../../types'
import toast from 'react-hot-toast'

export function KanbanBoard() {
  const { board } = useBoardStore()
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Touch support for mobile drag-and-drop
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  if (!board) return null

  const members = board.members

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as Card
    setActiveCard(card || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const cardId = active.id as string
    const overId = over.id as string

    const sourceColumn = board.columns.find((col) => col.cards.some((c) => c.id === cardId))
    if (!sourceColumn) return

    const targetColumn =
      board.columns.find((col) => col.id === overId) ||
      board.columns.find((col) => col.cards.some((c) => c.id === overId))

    if (!targetColumn || sourceColumn.id === targetColumn.id) return

    const card = sourceColumn.cards.find((c) => c.id === cardId)!
    useBoardStore.getState().moveCard({ ...card, column_id: targetColumn.id }, sourceColumn.id, targetColumn.id)

    try {
      await cardsApi.move(cardId, targetColumn.id)
    } catch {
      useBoardStore.getState().moveCard({ ...card, column_id: sourceColumn.id }, targetColumn.id, sourceColumn.id)
      toast.error('Failed to move card')
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Horizontal scroll on mobile, flex on desktop */}
      <div className="flex gap-3 sm:gap-5 p-3 sm:p-6 overflow-x-auto flex-1 pb-6 kanban-scroll">
        {board.columns.map((col) => (
          <ColumnComponent key={col.id} column={col} members={members} />
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 opacity-90">
            <CardComponent
              card={activeCard}
              columnClass="card-todo"
              members={members}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
