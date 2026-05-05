import { usePresenceStore } from '../../stores/presenceStore'
import { Avatar } from '../ui/Avatar'

export function PresenceBar() {
  const { users } = usePresenceStore()

  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-1" aria-label="Active users">
      <span className="text-xs text-ink-muted mr-1 hidden sm:inline">Online:</span>
      <div className="flex -space-x-2">
        {/* Show max 4 avatars on mobile to save space */}
        {users.slice(0, 4).map((u) => (
          <Avatar key={u.user_id} name={u.display_name} size="sm" title={u.display_name} />
        ))}
        {users.length > 4 && (
          <span className="text-xs text-ink-muted ml-2">+{users.length - 4}</span>
        )}
      </div>
    </div>
  )
}
