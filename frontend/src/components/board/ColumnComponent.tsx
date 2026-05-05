import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnRow } from '../../stores/boardStore'
import { CardComponent } from './CardComponent'
import { AddCardForm } from './AddCardForm'

const COLUMN_STYLES: Record<number, { header: string; colClass: string; cardClass: string }> = {
  1: { header: 'text-todo', colClass: 'col-todo', cardClass: 'card-todo' },
  2: { header: 'text-progress', colClass: 'col-progress', cardClass: 'card-progress' },
  3: { header: 'text-done', colClass: 'col-done', cardClass: 'card-done' },
}

interface Member {
  id: string
  display_name: string
  email: string
}

interface Props {
  column: ColumnRow
  members: Member[]
}

export function ColumnComponent({ column, members }: Props) {
  const style = COLUMN_STYLES[column.position] || COLUMN_STYLES[1]
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className={`notebook-column ${style.colClass} flex flex-col w-[80vw] sm:w-72 shrink-0 transition-colors ${isOver ? 'bg-paper-dark' : ''}`} data-testid={`column-${column.id}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-serif text-xs font-bold uppercase tracking-widest ${style.header}`}>{column.name}</h3>
        <span className="text-xs text-ink-muted bg-paper-dark rounded-full px-2 py-0.5">{column.cards.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 min-h-[80px]">
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <CardComponent key={card.id} card={card} columnClass={style.cardClass} members={members} />
          ))}
        </SortableContext>
      </div>
      <div className="mt-2 pt-2 border-t border-paper-border">
        <AddCardForm columnId={column.id} />
      </div>
    </div>
  )
}
