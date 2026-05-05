import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useBoardStore } from '../../stores/boardStore'
import { useAuthStore } from '../../stores/authStore'
import { ColumnComponent } from './ColumnComponent'
import { CardComponent } from './CardComponent'
import { cardsApi } from '../../api/cards.api'
import type { CardRow } from '../../stores/boardStore'
import toast from 'react-hot-toast'

export function KanbanBoard() {
  const { board } = useBoardStore()
  const { user } = useAuthStore()
  const [activeCard, setActiveCard] = useState<CardRow | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  if (!board || !user) return null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCard((event.active.data.current?.card as CardRow) || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return
    const cardId = active.id as string
    const overId = over.id as string
    const sourceColumn = board.columns.find((col) => col.cards.some((c) => c.id === cardId))
    if (!sourceColumn) return
    const targetColumn = board.columns.find((col) => col.id === overId) || board.columns.find((col) => col.cards.some((c) => c.id === overId))
    if (!targetColumn || sourceColumn.id === targetColumn.id) return
    const card = sourceColumn.cards.find((c) => c.id === cardId)!
    useBoardStore.getState().moveCard({ ...card, column_id: targetColumn.id }, sourceColumn.id, targetColumn.id)
    try {
      await cardsApi.move(cardId, targetColumn.id, user.id, user.display_name)
    } catch {
      useBoardStore.getState().moveCard({ ...card, column_id: sourceColumn.id }, targetColumn.id, sourceColumn.id)
      toast.error('Failed to move card')
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 sm:gap-5 p-3 sm:p-6 overflow-x-auto flex-1 pb-6 kanban-scroll">
        {board.columns.map((col) => (
          <ColumnComponent key={col.id} column={col} members={board.members} />
        ))}
      </div>
      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 opacity-90">
            <CardComponent card={activeCard} columnClass="card-todo" members={board.members} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
