export interface User {
  id: string
  email: string
  display_name: string
  created_at: string
}

export interface Board {
  id: string
  name: string
  join_code: string
  owner_id: string
  deadline_alert_hours: number
  created_at: string
}

export interface Column {
  id: string
  board_id: string
  name: string
  position: number
  created_at: string
  cards: Card[]
}

export interface Card {
  id: string
  column_id: string
  title: string
  description: string | null
  assigned_user_id: string | null
  assigned_user: User | null
  deadline: string | null
  created_at: string
  updated_at: string
}

export interface BoardDetail extends Board {
  columns: Column[]
  members: User[]
}

export interface ActivityEntry {
  id: string
  message: string
  user_id: string
  display_name: string
  created_at: string
}

export interface PresenceUser {
  user_id: string
  display_name: string
}
