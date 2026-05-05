// Re-export from stores for convenience
export type { AuthUser as User } from '../stores/authStore'
export type { CardRow as Card, ColumnRow as Column, BoardDetail } from '../stores/boardStore'
export type { ActivityEntry } from '../stores/activityStore'
export type { PresenceUser } from '../stores/presenceStore'

export interface Board {
  id: string
  name: string
  join_code: string
  owner_id: string
  deadline_alert_hours: number
  created_at: string
}
