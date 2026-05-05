import { supabase } from '../lib/supabase'
import type { BoardDetail, ColumnRow, CardRow } from '../stores/boardStore'
import type { ActivityEntry } from '../stores/activityStore'

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const boardsApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('board_members')
      .select('board_id, boards(id,name,join_code,owner_id,deadline_alert_hours,created_at)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
    if (error) throw error
    return (data || []).map((row: any) => row.boards).filter(Boolean)
  },

  create: async (name: string, userId: string) => {
    const join_code = generateJoinCode()

    // Insert board
    const { data: board, error } = await supabase
      .from('boards')
      .insert({ name, join_code, owner_id: userId })
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Add owner as member
    await supabase.from('board_members').insert({ board_id: board.id, user_id: userId })

    // Create default columns
    await supabase.from('columns').insert([
      { board_id: board.id, name: 'To Do', position: 1 },
      { board_id: board.id, name: 'In Progress', position: 2 },
      { board_id: board.id, name: 'Done', position: 3 },
    ])

    return board
  },

  join: async (joinCode: string, userId: string) => {
    // Look up board by join code — boards policy allows SELECT for all
    const { data: board, error } = await supabase
      .from('boards')
      .select('id, name, join_code, owner_id, deadline_alert_hours, created_at')
      .eq('join_code', joinCode.toUpperCase())
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!board) throw new Error('Board not found with that join code')

    // Check if already a member (user can only see their own rows)
    const { data: existing } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('board_id', board.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) {
      const { error: joinError } = await supabase
        .from('board_members')
        .insert({ board_id: board.id, user_id: userId })
      if (joinError) throw new Error(joinError.message)
    }

    return board
  },

  get: async (boardId: string, userId: string): Promise<BoardDetail> => {
    // Verify membership
    const { data: member } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .maybeSingle()
    if (!member) throw new Error('Not a board member')

    // Get board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single()
    if (boardError || !board) throw new Error('Board not found')

    // Get columns ordered by position
    const { data: columns } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position')

    // Get cards — join profiles via assigned_user_id
    // Note: cards.assigned_user_id references users table (VARCHAR id)
    // We join profiles separately using a manual lookup
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at')

    // Get all member profiles for this board
    const { data: memberRows } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', boardId)

    const memberIds = (memberRows || []).map((m: any) => m.user_id)

    // Fetch profiles for all members
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', memberIds.map((id: string) => {
        // profiles.id is UUID, board_members.user_id is text
        try { return id } catch { return id }
      }))

    const profileMap = new Map((profileRows || []).map((p: any) => [p.id, p]))
    const members = (profileRows || []) as { id: string; display_name: string; email: string }[]

    // Attach assigned_user to each card
    const cardsWithUser = (cards || []).map((card: any) => ({
      ...card,
      assigned_user: card.assigned_user_id
        ? profileMap.get(card.assigned_user_id) || null
        : null,
    }))

    const columnsWithCards: ColumnRow[] = (columns || []).map((col: any) => ({
      ...col,
      cards: cardsWithUser.filter((c: any) => c.column_id === col.id) as CardRow[],
    }))

    return { ...board, columns: columnsWithCards, members }
  },

  getActivity: async (boardId: string): Promise<ActivityEntry[]> => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch display names separately
    const userIds = [...new Set((data || []).map((r: any) => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.display_name]))

    return ((data || []).reverse()).map((row: any) => ({
      id: row.id,
      board_id: row.board_id,
      user_id: row.user_id,
      message: row.message,
      created_at: row.created_at,
      display_name: profileMap.get(row.user_id) || 'Unknown',
    }))
  },

  update: async (boardId: string, deadline_alert_hours: number) => {
    const { data, error } = await supabase
      .from('boards')
      .update({ deadline_alert_hours })
      .eq('id', boardId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
