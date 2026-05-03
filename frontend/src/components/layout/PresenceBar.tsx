import { usePresenceStore } from '../../stores/presenceStore'
import { Avatar } from '../ui/Avatar'

export function PresenceBar() {
  const { users } = usePresenceStore()

  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-1" aria-label="Active users">
      <span className="text-xs text-ink-muted mr-1">Online:</span>
      <div className="flex -space-x-2">
        {users.map((u) => (
          <Avatar key={u.user_id} name={u.display_name} size="sm" title={u.display_name} />
        ))}
      </div>
    </div>
  )
}
