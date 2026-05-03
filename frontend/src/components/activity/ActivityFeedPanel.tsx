import { useActivityStore } from '../../stores/activityStore'
import { formatDistanceToNow } from 'date-fns'

export function ActivityFeedPanel() {
  const { messages } = useActivityStore()

  return (
    <aside className="w-64 shrink-0 bg-paper border-l border-paper-border flex flex-col">
      <div className="px-4 py-3 border-b border-paper-border">
        <h3 className="font-serif text-sm font-semibold text-ink-light uppercase tracking-wide">
          Activity
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <p className="text-xs text-ink-muted italic mt-4">No activity yet.</p>
        ) : (
          [...messages].reverse().map((m) => (
            <div key={m.id} className="activity-item">
              <p>{m.message}</p>
              <span className="text-xs opacity-60">
                {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
